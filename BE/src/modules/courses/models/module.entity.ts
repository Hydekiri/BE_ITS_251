import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Course } from './course.entity';
import { Lesson } from './lesson.entity';

@Entity('modules')
export class ModuleEntity {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ name: 'sequence_order', type: 'int', default: 1 })
    sequenceOrder: number;

    @Column({ name: 'estimated_duration_minutes', type: 'int', nullable: true })
    estimatedDurationMinutes?: number;

    @ManyToOne(() => Course, (c) => c.modules)
    @JoinColumn({ name: 'course_id' })
    course: Course;

    @OneToMany(() => Lesson, (l) => l.module)
    lessons?: Lesson[];
}
