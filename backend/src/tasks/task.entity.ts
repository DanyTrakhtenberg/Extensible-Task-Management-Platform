import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { TaskType } from '../task-types/task-type.entity';
import { TaskStatusChange } from './task-status-change.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TaskType)
  @JoinColumn()
  taskType: TaskType;

  @Column()
  taskTypeId: number;

  @ManyToOne(() => User)
  @JoinColumn()
  assignedUser: User;

  @Column()
  assignedUserId: number;

  @Column()
  status: number;

  @Column({ default: false })
  isClosed: boolean;

  @Column('text', { nullable: true })
  customFields: string; // JSON string storing task-type-specific fields

  @OneToMany(() => TaskStatusChange, (statusChange) => statusChange.task)
  statusChanges: TaskStatusChange[];

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

