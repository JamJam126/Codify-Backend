import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Controller('assignments')
export class AssignmentController {
  constructor(private readonly service: AssignmentService) {}

  @Post()
  async create(@Body() dto: CreateAssignmentDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }
}
