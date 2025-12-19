import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';
import { TaskTypesModule } from './task-types/task-types.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'task-management.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Set to false in production and use migrations
      logging: true,
    }),
    UsersModule,
    TaskTypesModule,
    TasksModule,
  ],
})
export class AppModule {}

