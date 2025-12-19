import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Task } from '../tasks/task.entity';

@Entity()
export class TaskType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // 'procurement' or 'development'

  @Column('text')
  statusConfig: string; // JSON string storing status configuration

  @OneToMany(() => Task, (task) => task.taskType)
  tasks: Task[];
}

