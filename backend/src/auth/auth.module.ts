import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { KeycloakStrategy } from '../KeycloakStrategy/keycloak.strategy';
import { RegisterService } from './register.service';
import { AuthController } from './auth.controller';
import { AddUserService } from './addUser.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'keycloak' })],
  providers: [KeycloakStrategy,RegisterService,AddUserService],
  exports: [PassportModule],
  controllers: [AuthController],
})
export class AuthModule {}