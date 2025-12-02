import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ModuleEntity } from './module.entity';

@Entity('lessons')
export class Lesson {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id: string;

    @Column()
    title: string;

    @Column({ name: 'lesson_type', nullable: true })
    lessonType?: string;

    @Column({ name: 'sequence_order', type: 'int', default: 1 })
    sequenceOrder: number;

    @Column({ name: 'estimated_duration_minutes', type: 'int', nullable: true })
    estimatedDurationMinutes?: number;

    @ManyToOne(() => ModuleEntity, (m) => m.lessons)
    @JoinColumn({ name: 'module_id' })
    module: ModuleEntity;
}
