import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';  // Import AuthModule for authentication

@Module({
  imports: [AuthModule],  // Import AuthModule to make use of Passport and Keycloak
  controllers: [UserController],  // Register the UserController here
  providers: [UserService],  // Register the UserService to provide necessary logic
})
export class UserModule {}
