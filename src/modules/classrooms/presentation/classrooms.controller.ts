import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ClassroomService } from '../application/classroom.service';
import { CreateClassroomDto } from '../application/dto/create-classroom.dto';
import { Classroom } from '../domain/classroom.entity';

@Controller('classrooms')
export class ClassroomsController {
  constructor(private readonly service: ClassroomService) {}

  @Post()
  create(@Body() dto: CreateClassroomDto): Promise<Classroom> {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Get('code/:classCode')
  findByClassCode(@Param('classCode') classCode: string) {
    return this.service.findByClassCode(classCode);
  }

  @Patch(':id/name')
  rename(
    @Param('id') id: string,
    @Body('name') name: string,
  ) {
    return this.service.rename(+id, name);
  }

  @Patch(':id/description') 
  updateDescription(
    @Param('id') id: string,
    @Body('description') description?: string,
  ) {
    return this.service.updateDescription(+id, description);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
