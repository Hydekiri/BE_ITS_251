import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { User } from './models/user.entity';
import { PasswordResetToken } from './models/password-reset.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, PasswordResetToken])],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}
