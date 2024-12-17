import { Controller, Post, Body, HttpCode, UseGuards } from '@nestjs/common';
import { RegisterService } from './register.service';
import { AddUserService } from './addUser.service';
import { Roles } from './roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('auth')
@UseGuards(AuthGuard('keycloak'), RolesGuard)
export class AuthController {
  constructor(private readonly registerService: RegisterService ,
    private readonly AddUserService:AddUserService
  ) {}

  @Post('register')
  @HttpCode(201) 
  @Roles('admin')
  async register(@Body() user: { username: string; email: string; password: string }) {
    return this.registerService.registerUser(user);
  }
  @Post('add')
  @HttpCode(201)
  @Roles('RH') 
  async add(@Body() user: { username: string; email: string; password: string }) {
    return this.AddUserService.addUser(user);
  }
}

