import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PrismaExceptionFilter } from './common/filter/prisma-exception.filter';
import * as proxy from 'http-proxy-middleware';
import axios from 'axios';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // ----- Reverse proxy for evaluation service -----
  const evaluationServiceUrl = process.env.EVALUATION_SERVICE_URL || 'http://localhost:8000';
  app.use(
    '/evaluation',
    proxy.createProxyMiddleware({
      target: evaluationServiceUrl,
      changeOrigin: true,
      pathRewrite: { '^/evaluation': '' },
    }),
  );

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new PrismaExceptionFilter);

  // ----- Build backend OpenAPI document -----
  const config = new DocumentBuilder()
    .setTitle('the BEST API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const backendDocument = SwaggerModule.createDocument(app, config);

  // ----- Fetch and merge evaluation OpenAPI spec -----
  let mergedDocument = backendDocument;

  try {
    // Fetch directly from the evaluation service (external, before server starts)
    const evalSpecUrl = `${evaluationServiceUrl}/openapi.json`;
    console.log(`Fetching evaluation spec from ${evalSpecUrl}`);
    const response = await axios.get(evalSpecUrl);
    const evalSpec: any = response.data;

    // Transform paths: add '/evaluation' prefix
    const transformedPaths: Record<string, any> = {};
    if (evalSpec.paths) {
      for (const [path, pathItem] of Object.entries(evalSpec.paths)) {
        transformedPaths[`/evaluation${path}`] = pathItem;
      }
    }

    // Merge paths
    mergedDocument.paths = {
      ...backendDocument.paths,
      ...transformedPaths,
    };

    // Merge schemas – do NOT rename; risk of collision is low
    // and references inside the evaluation spec must stay intact.
    mergedDocument.components = {
      ...backendDocument.components,
      schemas: {
        ...backendDocument.components?.schemas,
        ...evalSpec.components?.schemas,
      },
    };

    console.log('✅ Evaluation spec merged successfully');
  } catch (error) {
    console.error('❌ Failed to fetch evaluation spec:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    console.warn('→ Serving only backend spec');
  }

  // ----- Serve merged Swagger UI -----
  SwaggerModule.setup('api', app, mergedDocument);

  const configService = app.get(ConfigService);
  await app.listen(configService.get('PORT') ?? 3000, '0.0.0.0');
}
bootstrap();