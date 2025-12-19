import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import { TaskType } from '../task-types/task-type.entity';
import { Task } from '../tasks/task.entity';
import { TaskStatusChange } from '../tasks/task-status-change.entity';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'task-management.db',
  entities: [User, TaskType, Task, TaskStatusChange],
  synchronize: true,
  logging: false,
});

async function seed() {
  await AppDataSource.initialize();

  const userRepository = AppDataSource.getRepository(User);
  const taskTypeRepository = AppDataSource.getRepository(TaskType);

  // Clear existing data (in order to respect foreign key constraints)
  const taskStatusChangeRepository = AppDataSource.getRepository(TaskStatusChange);
  const taskRepository = AppDataSource.getRepository(Task);
  
  await taskStatusChangeRepository.clear();
  await taskRepository.clear();
  await taskTypeRepository.clear();
  await userRepository.clear();

  // Seed users
  const users = [
    { name: 'Alice Johnson', email: 'alice@example.com' },
    { name: 'Bob Smith', email: 'bob@example.com' },
    { name: 'Charlie Brown', email: 'charlie@example.com' },
    { name: 'Diana Prince', email: 'diana@example.com' },
  ];

  const savedUsers = await userRepository.save(users);
  console.log(`Seeded ${savedUsers.length} users`);

  // Seed task types
  // Procurement Task configuration
  const procurementConfig = {
    finalStatus: 3,
    statusFields: {
      1: [], // Created - no required fields
      2: ['priceQuote1', 'priceQuote2'], // Supplier offers received - requires 2 price quotes
      3: ['receipt'], // Purchase completed - requires receipt
    },
  };

  // Development Task configuration
  const developmentConfig = {
    finalStatus: 4,
    statusFields: {
      1: [], // Created - no required fields
      2: ['specification'], // Specification completed - requires specification text
      3: ['branchName'], // Development completed - requires branch name
      4: ['versionNumber'], // Distribution completed - requires version number
    },
  };

  const taskTypes = [
    {
      name: 'procurement',
      statusConfig: JSON.stringify(procurementConfig),
    },
    {
      name: 'development',
      statusConfig: JSON.stringify(developmentConfig),
    },
  ];

  const savedTaskTypes = await taskTypeRepository.save(taskTypes);
  console.log(`Seeded ${savedTaskTypes.length} task types`);

  console.log('\nDatabase seeded successfully!');
  console.log('\nUsers:');
  savedUsers.forEach((user) => {
    console.log(`  - ${user.name} (ID: ${user.id}, Email: ${user.email})`);
  });

  console.log('\nTask Types:');
  savedTaskTypes.forEach((type) => {
    console.log(`  - ${type.name} (ID: ${type.id})`);
  });

  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});

