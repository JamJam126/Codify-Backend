import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
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
  ApiForbiddenResponse,
} from '@nestjs/swagger';

import { ClassroomService } from '../application/classroom.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { ClassroomResponseDto } from './dto/classroom-response.dto';

@ApiTags('classrooms')
@Controller('classrooms')
export class ClassroomsController {
  constructor(private readonly service: ClassroomService) {}

  // =============== CREATE =================
  @Post()
  @ApiOperation({ summary: 'Create a classroom' })
  @ApiBody({ type: CreateClassroomDto })
  @ApiCreatedResponse({
    description: 'Classroom created successfully',
    type: ClassroomResponseDto,
  })
  create(@Body() dto: CreateClassroomDto) {
    const userId = 1; // mock user
    return this.service.create(dto, userId);
  }

  // =============== FIND ALL =================
  @Get()
  @ApiOperation({ summary: 'Get all classrooms for current user' })
  @ApiOkResponse({
    description: 'List of classrooms',
    type: [ClassroomResponseDto],
  })
  findAll() {
    const userId = 1 ;
    return this.service.findAll(userId);
  }

  // =============== FIND BY CODE =================
  @Get('by-code/:classCode')
  @ApiOperation({ summary: 'Get classroom by class code' })
  @ApiParam({
    name: 'classCode',
    description: 'The invitation code to the classroom',
    example: 'AJ24-KL3P',
  })
  @ApiOkResponse({
    description: 'Classroom found',
    type: ClassroomResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Invalid classroom code',
  })
  findByClassCode(@Param('classCode') classCode: string) {
    return this.service.findByClassCode(classCode);
  }

  // =============== FIND ONE =================
  @Get(':id')
  @ApiOperation({ summary: 'Get classroom by ID' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({
    description: 'Classroom found',
    type: ClassroomResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Classroom not found',
  })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  // =============== UPDATE =================
  @Patch(':id')
  @ApiOperation({ summary: 'Update a classroom' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({ type: UpdateClassroomDto })
  @ApiOkResponse({
    description: 'Classroom updated successfully',
    type: ClassroomResponseDto,
  })
  update(@Param('id') id: string, @Body() dto: UpdateClassroomDto) {
    const userId = 1;
    return this.service.update(+id, dto);
  }

  // =============== DELETE =================
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a classroom' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiNoContentResponse({
    description: 'Classroom deleted successfully',
  })
  @ApiForbiddenResponse({
    description: 'Not allowed to delete this classroom',
  })
  async remove(@Param('id') id: string) {
    const userId = 1;
    await this.service.delete(+id);
  }
}
