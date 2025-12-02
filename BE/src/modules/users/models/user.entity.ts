import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id: string;

    @Column({ name: 'username', unique: true })
    username: string;

    // Map application property `password` to DB column `password_hash`
    @Column({ name: 'password_hash' })
    password: string;

    @Column({ unique: true })
    email: string;

    @Column({ name: 'full_name' })
    fullName: string;

    @Column({ name: 'phone_number', nullable: true })
    phone?: string;

    @Column({ nullable: true })
    address?: string;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
