import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('User') 
export class User {
    @PrimaryGeneratedColumn({ name: 'user_id' })
    id: number;

    @Column({ name: 'name' })
    username: string;

    @Column()
    password: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    address: string;
}
