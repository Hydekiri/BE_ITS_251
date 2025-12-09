import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { UserSession } from '../models/user-session.entity';
import { ISessionManager, CreateSessionDto } from '../interfaces/i-session-manager.interface';

/**
 * SOLID Principles: Single Responsibility Principle (SRP)
 * 
 * SRP: This class has ONE responsibility - manage user sessions in the database.
 *      It handles CRUD operations for sessions only, nothing else.
 *      It doesn't know about tokens, passwords, or authentication logic.
 * 
 * This separation makes the code:
 * - Easier to test (can mock session storage)
 * - Easier to maintain (change session storage mechanism independently)
 * - Easier to understand (clear, focused purpose)
 */
@Injectable()
export class SessionManagerService implements ISessionManager {
    constructor(
        @InjectRepository(UserSession)
        private readonly sessionRepo: Repository<UserSession>,
    ) { }

    async createSession(sessionData: CreateSessionDto): Promise<UserSession> {
        const session = this.sessionRepo.create({
            userId: sessionData.userId,
            refreshToken: sessionData.refreshToken,
            expiresAt: sessionData.expiresAt,
            ipAddress: sessionData.ipAddress,
            userAgent: sessionData.userAgent,
            isActive: true,
        });
        return this.sessionRepo.save(session);
    }

    async findActiveSession(refreshToken: string): Promise<UserSession | null> {
        return this.sessionRepo.findOne({
            where: {
                refreshToken,
                isActive: true,
            },
        });
    }

    async invalidateSession(refreshToken: string): Promise<boolean> {
        const session = await this.findActiveSession(refreshToken);
        if (!session) {
            return false;
        }
        session.isActive = false;
        await this.sessionRepo.save(session);
        return true;
    }

    async cleanupExpiredSessions(): Promise<number> {
        const result = await this.sessionRepo.delete({
            expiresAt: LessThan(new Date()),
        });
        return result.affected || 0;
    }
}
