import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  ParseIntPipe,
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
import { AddMemberDto } from './dto/add-member.dto';
import { ClassroomResponseDto } from './dto/classroom-response.dto';
import { Role } from '../domain/role.enum';
import { ClassroomMemberResponseDto } from './dto/classroom-member-response.dto';

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
  @Get(':classroomId')
  @ApiOperation({ summary: 'Get classroom by ID' })
  @ApiParam({ name: 'classroomId', example: 1 })
  @ApiOkResponse({
    description: 'Classroom found',
    type: ClassroomResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Classroom not found',
  })
  findOne(@Param('classroomId', ParseIntPipe) classroomId: number) {
    return this.service.findOne(classroomId);
  }

  // =============== UPDATE =================
  @Patch(':classroomId')
  @ApiOperation({ summary: 'Update a classroom' })
  @ApiParam({ name: 'classroomId', example: 1 })
  @ApiBody({ type: UpdateClassroomDto })
  @ApiOkResponse({
    description: 'Classroom updated successfully',
    type: ClassroomResponseDto,
  })
  @Patch(':classroomId')
  update(
    @Param('classroomId', ParseIntPipe) classroomId: number,
    @Body() dto: UpdateClassroomDto,
  ) {
    return this.service.update(classroomId, dto);
  }


  // =============== DELETE =================
  @Delete(':classroomId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a classroom' })
  @ApiParam({ name: 'classroomId', example: 1 })
  @ApiNoContentResponse({
    description: 'Classroom deleted successfully',
  })
  @ApiForbiddenResponse({
    description: 'Not allowed to delete this classroom',
  })
  async remove(@Param('classroomId', ParseIntPipe) id: number) {
    const userId = 1;
    await this.service.delete(id);
  }

  // =============== MEMBERS =================
  @Post(':classroomId/members')
  @ApiOperation({ summary: 'Add member to classroom' })
  @ApiParam({ name: 'classroomId', example: 1 })
  @ApiBody({ type: AddMemberDto })
  @ApiNoContentResponse({ description: 'Member added successfully' })
  @ApiForbiddenResponse({ description: 'Only admins can add members' })
  async addMember(
    @Param('classroomId', ParseIntPipe) classroomId: number,
    @Body() dto: AddMemberDto,
  ) {
    const requesterId = 1;
    await this.service.addMember(
      classroomId, 
      requesterId, 
      dto
    );
  }

  @Delete(':classroomId/members/:userId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove member from classroom' })
  @ApiParam({ name: 'classroomId', example: 1 })
  @ApiParam({ name: 'userId', example: 2 })
  @ApiNoContentResponse({ description: 'Member removed successfully' })
  @ApiForbiddenResponse({ description: 'Only admins can remove members' })
  async removeMember(
    @Param('classroomId', ParseIntPipe) classroomId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    const requesterId = 1;
    await this.service.removeMember(classroomId, requesterId, userId);
  }

  @Patch(':classroomId/members/:userId/role')
  @ApiOperation({ summary: 'Change member role' })
  @ApiParam({ name: 'classroomId', example: 1 })
  @ApiParam({ name: 'userId', example: 2 })
  @ApiBody({
    schema: {
      properties: {
        role: { example: 'ADMIN' },
      },
    },
  })
  async changeMemberRole(
    @Param('classroomId', ParseIntPipe) classroomId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: { role: Role },
  ) {
    const requesterId = 1;
    await this.service.changeMemberRole(
      classroomId,
      requesterId,
      userId,
      dto.role,
    )
  }

  @Get(':classroomId/members')
  @ApiOperation({ summary: 'List classroom members' })
  @ApiOkResponse({ description: 'List of classroom members', type: [ClassroomMemberResponseDto] })
  async listMembers(
    @Param('classroomId', ParseIntPipe) classroomId: number,
  ) {
    return this.service.listMembers(classroomId);
  }

  @Get(':classroomId/members/:userId')
  @ApiOperation({ summary: 'Get a specific classroom member' })
  @ApiParam({ name: 'classroomId', example: 1 })
  @ApiParam({ name: 'userId', example: 2 })
  @ApiOkResponse({ description: 'Member found', type: ClassroomMemberResponseDto })
  @ApiNotFoundResponse({ description: 'Member not found' })
  async getMember(
    @Param('classroomId', ParseIntPipe) classroomId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.service.getMember(classroomId, userId);
  }
}
