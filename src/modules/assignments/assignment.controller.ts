import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AssignmentService } from './assignment.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AssignmentResponseDto } from './dto/assignment-response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@ApiTags('assignments')
@Controller('assignments')
export class AssignmentController {
  constructor(private readonly service: AssignmentService) {}

  // =============== CREATE =================
  @Post()
  @ApiOperation({ summary: 'Create a new assignment' })
  @ApiBody({ type: CreateAssignmentDto })
  @ApiCreatedResponse({
    description: 'Assignment created successfully',
    type: AssignmentResponseDto,
  })
  create(@Body() dto: CreateAssignmentDto) {
    return this.service.create(dto);
  }

  // =============== FIND ONE =================
  @Get(':id')
  @ApiOperation({ summary: 'Get an assignment by ID' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({
    description: 'Assignment found',
    type: AssignmentResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Assignment not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // // =============== FIND BY SECTION =================
  // @Get('section/:id')
  // @ApiOperation({ summary: 'Get all assignments by section ID' })
  // @ApiParam({ name: 'id', example: 3 })
  // @ApiOkResponse({
  //   description: 'List of assignments in the section',
  //   type: [AssignmentResponseDto],
  // })
  // findBySection(@Param('id', ParseIntPipe) id: number) {
  //   return this.service.findAllBySection(id);
  // }

  // =============== FIND BY CLASSROOM =================
  @Get('classroom/:id')
  @ApiOperation({ summary: 'Get all assignments by classroom ID' })
  @ApiParam({ name: 'id', example: 3 })
  @ApiOkResponse({
    description: 'List of assignments in the classroom',
    type: [AssignmentResponseDto],
  })
  findByClassroom(@Param('id', ParseIntPipe) id: number) {
    return this.service.findAllByClassroom(id);
  }

  // =============== UPDATE =================
  @Patch(':id')
  @ApiOperation({ summary: 'Update an assignment' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({ type: UpdateAssignmentDto })
  @ApiOkResponse({
    description: 'Assignment updated successfully',
    type: AssignmentResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAssignmentDto,
  ) {
    return this.service.update(id, dto);
  }

  // =============== PUBLISH =================
  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish an assignment' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({
    description: 'Assignment published successfully',
    type: AssignmentResponseDto,
  })
  publish(@Param('id', ParseIntPipe) id: number) {
    return this.service.publish(id);
  }

  // =============== DELETE =================
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an assignment' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiNoContentResponse({ description: 'Assignment deleted successfully' })
  @ApiNotFoundResponse({ description: 'Assignment not found' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
