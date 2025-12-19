import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { User } from '../users/user.entity';

@Entity()
export class TaskStatusChange {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Task)
  @JoinColumn()
  task: Task;

  @Column()
  taskId: number;

  @Column()
  fromStatus: number;

  @Column()
  toStatus: number;

  @ManyToOne(() => User)
  @JoinColumn()
  assignedUser: User;

  @Column()
  assignedUserId: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  changedAt: Date;
}

