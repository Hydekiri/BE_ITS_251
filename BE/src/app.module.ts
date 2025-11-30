import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { UsersModule } from './modules/users/users.module'; 

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig()),
    UsersModule, 
  ],
})
export class AppModule {}
