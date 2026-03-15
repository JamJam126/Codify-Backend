import { Controller, Get, Param, ParseIntPipe, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from 'src/storage/s3.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CurrentUserDto } from '../auth/dto/current-user.dto';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private service: UserService,
    private s3Service: S3Service,
  ) { }

  @Get()
  findOne(@Param('id', ParseIntPipe) id: number) {
    // return this.userService.findOne(id);
  }

  @Get("me")
  async getUserProfile(@CurrentUser() user: CurrentUserDto) {
    return this.service.findUser(user.id);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor("avatar"))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: CurrentUserDto
  ) {
    return await this.service.updateAvatar(user.id, file);
  }

  @Get(':email') 
  findByEmail(
    @Param('email') email: string
  ) {
    return this.service.searchByEmail(email);
  }
}
