import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InitSqlService } from './init-sql.service';

@Module({
    imports: [TypeOrmModule.forRoot()],
    providers: [InitSqlService],
    exports: [],
})
export class DatabaseModule {}
