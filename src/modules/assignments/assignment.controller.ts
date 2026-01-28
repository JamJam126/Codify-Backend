import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  HttpCode, 
  Param, 
  Patch, 
  Post, 
  ParseIntPipe 
} from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Controller('assignments')
export class AssignmentController {
  constructor(private readonly service: AssignmentService) {}

  @Post()
  async create(@Body() dto: CreateAssignmentDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get('section/:id')
  findBySection(@Param('id', ParseIntPipe) id: number) {
    return this.service.findAllBySection(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAssignmentDto
  ) {
    return this.service.update(id, dto);
  }

  @Patch(':id/publish')
  publish(@Param('id', ParseIntPipe) id: number) {
    return this.service.publish(id);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
