import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private service: UserService) {}

  @Get()
  findOne(@Param('id', ParseIntPipe) id: number) {
    // return this.userService.findOne(id);
  }

  @Get(':email') 
  findByEmail(
    @Param('email') email: string
  ) {
    return this.service.searchByEmail(email);
  }
}
