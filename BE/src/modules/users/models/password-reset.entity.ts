import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('password_reset_tokens')
export class PasswordResetToken {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ name: 'token', unique: true })
    token: string;

    @Column({ name: 'expires_at', type: 'timestamp' })
    expiresAt: Date;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
