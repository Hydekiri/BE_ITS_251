import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class InitSqlService implements OnModuleInit {
    private readonly logger = new Logger(InitSqlService.name);
    private readonly sqlPath = path.join(process.cwd(), 'src', 'config', 'db.sql');

    constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

    async onModuleInit() {
        // Chờ DB sẵn sàng
        await this.waitForDb();

        // Thực thi SQL script nếu tồn tại
        if (fs.existsSync(this.sqlPath)) {
        try {
            const raw = fs.readFileSync(this.sqlPath, 'utf8');
            // Tách các câu lệnh theo dấu ;
            const commands = raw
            .split(/;\s*$/m)
            .map(s => s.trim())
            .filter(Boolean);

            for (const cmd of commands) {
            this.logger.log(`Executing SQL command: ${cmd.substring(0, 120)}...`);
            await this.dataSource.query(cmd);
            }
            this.logger.log('Database setup completed 🚀');
        } catch (err) {
            this.logger.error('Error executing SQL script', err);
        }
        } else {
        this.logger.log(`No SQL file found at ${this.sqlPath}, skipping init.`);
        }
    }

    private async waitForDb(retries = 20, delayMs = 2000) {
        for (let i = 0; i < retries; i++) {
        try {
            await this.dataSource.query('SELECT 1');
            this.logger.log('Database is ready 🎉');
            return;
        } catch (err) {
            this.logger.warn(`Database not ready yet (${i + 1}/${retries}) — retrying in ${delayMs}ms`);
            await this.sleep(delayMs);
        }
        }
        this.logger.error('Database did not become ready in time.');
        // tùy chọn: ném lỗi để app crash -> redeploy
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
