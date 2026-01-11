import { Body, Controller, Get, Post } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Controller('assignments')
export class AssignmentController {
  constructor(private readonly service: AssignmentService) {}

  @Post()
  async create(@Body() dto: CreateAssignmentDto) {
    return this.service.create(dto);
  }
}
