import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/models/user.entity';

@Entity('user_sessions')
export class UserSession {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id: string;

    @Column({ name: 'user_id' })
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'token', nullable: true })
    token?: string;

    @Column({ name: 'refresh_token', unique: true })
    refreshToken: string;

    @Column({ name: 'expires_at', type: 'timestamp' })
    expiresAt: Date;

    @Column({ name: 'ip_address', nullable: true })
    ipAddress?: string;

    @Column({ name: 'user_agent', type: 'text', nullable: true })
    userAgent?: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
