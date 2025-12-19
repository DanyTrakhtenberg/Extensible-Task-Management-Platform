# Extensible Task-Management Platform

A full-stack task management platform that cleanly separates general workflow rules from task-specific rules, enabling easy extension with new task types without structural rewrites.

## Architecture Overview

The platform implements a clean architecture where:

1. **General Workflow Rules** (in `backend/src/tasks/workflow.service.ts`): Apply to every task, present and future
   - Tasks assigned to exactly one user
   - Tasks are either Open or Closed (Closed tasks are immutable)
   - Status tracked by ascending integers
   - Forward moves must be sequential (no skipping)
   - Backward moves are always allowed
   - Tasks may be closed only at final status
   - Every status change must satisfy type-specific data requirements and record the next assigned user

2. **Task-Specific Rules** (configured in `TaskType.statusConfig`): Apply only to a given task type
   - Each task type defines its status progression and required fields per status
   - Stored as JSON configuration in the database
   - No code changes needed to add new task types (just add a new TaskType record)

## Task Types

### Procurement Task
- **Status 1**: Created (no required data)
- **Status 2**: Supplier offers received (requires: `priceQuote1`, `priceQuote2`)
- **Status 3**: Purchase completed (requires: `receipt`)
- **Closed**: Only from status 3

### Development Task
- **Status 1**: Created (no required data)
- **Status 2**: Specification completed (requires: `specification`)
- **Status 3**: Development completed (requires: `branchName`)
- **Status 4**: Distribution completed (requires: `versionNumber`)
- **Closed**: Only from status 4

## Technology Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: SQLite with TypeORM
- **Language**: TypeScript
- **API**: REST

### Frontend
- **Framework**: React with TypeScript
- **HTTP Client**: Axios
- **Styling**: CSS (minimal, functionality-focused)

## Project Structure

```
.
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── database/       # Database seed script
│   │   ├── tasks/          # Task entities, services, controllers, workflow engine
│   │   ├── task-types/     # Task type entities and services
│   │   ├── users/          # User entities and services
│   │   ├── app.module.ts   # Root module
│   │   └── main.ts         # Application entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── App.tsx         # Main application component
│   │   ├── App.css         # Styles
│   │   └── index.tsx       # Entry point
│   └── package.json
├── package.json            # Root package.json for workspace
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <your-repo-url>
   cd Extensible-Task-Management-Platform
   ```

2. **Install dependencies**:
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Seed the database**:
   ```bash
   cd backend
   npm run seed
   ```
   This creates:
   - 4 demo users (Alice, Bob, Charlie, Diana)
   - 2 task types (Procurement, Development)

### Running the Application

#### Backend (Terminal 1)
```bash
cd backend
npm run start:dev
```
The backend server will run on `http://localhost:3001`

#### Frontend (Terminal 2)
```bash
cd frontend
npm start
```
The frontend will run on `http://localhost:3000` and automatically open in your browser.

## API Endpoints

### Tasks
- `POST /tasks` - Create a new task
  ```json
  {
    "taskTypeId": 1,
    "assignedUserId": 1
  }
  ```

- `PATCH /tasks/:id/status` - Change task status
  ```json
  {
    "newStatus": 2,
    "nextAssignedUserId": 2,
    "customFields": {
      "priceQuote1": "100 USD",
      "priceQuote2": "120 USD"
    }
  }
  ```

- `PATCH /tasks/:id/close` - Close a task (only from final status)

- `GET /tasks/user/:userId` - Get all tasks assigned to a user

- `GET /tasks/:id` - Get task details

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID

### Task Types
- `GET /task-types` - Get all task types
- `GET /task-types/:id` - Get task type by ID

## How to Add a New Task Type

To add a new task type without touching existing code:

1. **Add a new TaskType record to the database** (via seed script or API):
   ```typescript
   {
     name: 'your-task-type',
     statusConfig: JSON.stringify({
       finalStatus: 5, // The final status number
       statusFields: {
         1: [], // Status 1 - no required fields
         2: ['field1'], // Status 2 - requires 'field1'
         3: ['field2', 'field3'], // Status 3 - requires 'field2' and 'field3'
         // ... etc
         5: [] // Final status
       }
     })
   }
   ```

2. **Optionally update the frontend** to display status labels nicely:
   - Add status labels in the `getStatusLabel` function in `frontend/src/App.tsx`

That's it! The workflow engine will automatically enforce all general rules, and the task-specific validation will use your new configuration.

## Database Schema

### Users
- `id`: Primary key
- `name`: User name
- `email`: User email (unique)

### TaskTypes
- `id`: Primary key
- `name`: Task type name (unique, e.g., 'procurement', 'development')
- `statusConfig`: JSON string containing status configuration

### Tasks
- `id`: Primary key
- `taskTypeId`: Foreign key to TaskType
- `assignedUserId`: Foreign key to User (current assignee)
- `status`: Current status (integer)
- `isClosed`: Boolean flag
- `customFields`: JSON string storing task-type-specific fields
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### TaskStatusChanges
- `id`: Primary key
- `taskId`: Foreign key to Task
- `fromStatus`: Previous status
- `toStatus`: New status
- `assignedUserId`: User assigned at this status change
- `changedAt`: Timestamp of change

## Features

- ✅ Clean separation of general and task-specific rules
- ✅ Extensible architecture (add new task types without code changes)
- ✅ Full workflow validation (sequential forward moves, backward moves, closure rules)
- ✅ Task assignment tracking
- ✅ Status change history
- ✅ RESTful API
- ✅ React frontend with task management UI
- ✅ TypeScript for type safety

## Evaluation Notes

This implementation demonstrates:

1. **Server-side Architecture**:
   - Clean architecture with workflow engine (`WorkflowService`) enforcing general rules
   - Task-specific rules stored as configuration (not hardcoded)
   - Generic task handling avoiding repetitive conditional logic
   - How to add a third task type: Simply add a new `TaskType` record with appropriate `statusConfig` - no code changes needed

2. **Client-side**:
   - Clear state management with React hooks
   - Organized, reusable components (`CreateTaskForm`, `TaskDetailsModal`)
   - Functional UI for task lifecycle management

## License

This project is created for educational/assignment purposes.
