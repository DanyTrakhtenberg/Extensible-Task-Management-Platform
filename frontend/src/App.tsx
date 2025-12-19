import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:3001';

interface User {
  id: number;
  name: string;
  email: string;
}

interface TaskType {
  id: number;
  name: string;
  statusConfig: string;
}

interface Task {
  id: number;
  taskTypeId: number;
  assignedUserId: number;
  status: number;
  isClosed: boolean;
  customFields: string;
  taskType: TaskType;
  assignedUser: User;
}

function App() {
  const [currentUserId, setCurrentUserId] = useState<number>(1); // User ID - can be changed via dropdown
  const [users, setUsers] = useState<User[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateTask, setShowCreateTask] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, taskTypesRes, tasksRes] = await Promise.all([
        axios.get(`${API_BASE}/users`),
        axios.get(`${API_BASE}/task-types`),
        axios.get(`${API_BASE}/tasks/user/${currentUserId}`),
      ]);

      setUsers(usersRes.data);
      setTaskTypes(taskTypesRes.data);
      setTasks(tasksRes.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskTypeId: number, assignedUserId: number) => {
    try {
      await axios.post(`${API_BASE}/tasks`, {
        taskTypeId,
        assignedUserId,
      });
      setShowCreateTask(false);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleChangeStatus = async (
    taskId: number,
    newStatus: number,
    nextAssignedUserId: number,
    customFields: Record<string, any>
  ) => {
    try {
      await axios.patch(`${API_BASE}/tasks/${taskId}/status`, {
        newStatus,
        nextAssignedUserId,
        customFields,
      });
      setShowTaskDetails(false);
      setSelectedTask(null);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change status');
    }
  };

  const handleCloseTask = async (taskId: number) => {
    try {
      await axios.patch(`${API_BASE}/tasks/${taskId}/close`);
      setShowTaskDetails(false);
      setSelectedTask(null);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to close task');
    }
  };

  const getStatusConfig = (taskType: TaskType) => {
    return JSON.parse(taskType.statusConfig);
  };

  const getStatusLabel = (taskType: TaskType, status: number): string => {
    const config = getStatusConfig(taskType);
    if (taskType.name === 'procurement') {
      const labels: { [key: number]: string } = {
        1: 'Created',
        2: 'Supplier offers received',
        3: 'Purchase completed',
      };
      return labels[status] || `Status ${status}`;
    } else if (taskType.name === 'development') {
      const labels: { [key: number]: string } = {
        1: 'Created',
        2: 'Specification completed',
        3: 'Development completed',
        4: 'Distribution completed',
      };
      return labels[status] || `Status ${status}`;
    }
    return `Status ${status}`;
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Task Management Platform</h1>
        <div className="user-selector">
          <label htmlFor="user-select">Current User: </label>
          <select
            id="user-select"
            value={currentUserId}
            onChange={(e) => {
              setCurrentUserId(Number(e.target.value));
              loadData();
            }}
            className="user-select-dropdown"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="container">
        {error && (
          <div className="error-message">
            Error: {error}
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        <div className="actions">
          <button onClick={() => setShowCreateTask(true)}>Create New Task</button>
          <button onClick={loadData}>Refresh</button>
        </div>

        {showCreateTask && (
          <CreateTaskForm
            taskTypes={taskTypes}
            users={users}
            onSubmit={handleCreateTask}
            onCancel={() => setShowCreateTask(false)}
          />
        )}

        {showTaskDetails && selectedTask && (
          <TaskDetailsModal
            task={selectedTask}
            users={users}
            onStatusChange={handleChangeStatus}
            onCloseTask={handleCloseTask}
            onClose={() => {
              setShowTaskDetails(false);
              setSelectedTask(null);
            }}
            getStatusLabel={getStatusLabel}
            getStatusConfig={getStatusConfig}
          />
        )}

        <h2>My Tasks</h2>
        {tasks.length === 0 ? (
          <p>No tasks assigned to you.</p>
        ) : (
          <div className="tasks-list">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`task-card ${task.isClosed ? 'closed' : ''}`}
                onClick={() => {
                  setSelectedTask(task);
                  setShowTaskDetails(true);
                }}
              >
                <div className="task-header">
                  <h3>
                    {task.taskType.name.toUpperCase()} Task #{task.id}
                    {task.isClosed && <span className="closed-badge">CLOSED</span>}
                  </h3>
                </div>
                <div className="task-info">
                  <p>Status: {getStatusLabel(task.taskType, task.status)}</p>
                  <p>Assigned to: {task.assignedUser.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CreateTaskForm({
  taskTypes,
  users,
  onSubmit,
  onCancel,
}: {
  taskTypes: TaskType[];
  users: User[];
  onSubmit: (taskTypeId: number, assignedUserId: number) => void;
  onCancel: () => void;
}) {
  const [taskTypeId, setTaskTypeId] = useState<number>(taskTypes[0]?.id || 0);
  const [assignedUserId, setAssignedUserId] = useState<number>(users[0]?.id || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(taskTypeId, assignedUserId);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Create New Task</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Type:</label>
            <select
              value={taskTypeId}
              onChange={(e) => setTaskTypeId(Number(e.target.value))}
              required
            >
              {taskTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Assign To:</label>
            <select
              value={assignedUserId}
              onChange={(e) => setAssignedUserId(Number(e.target.value))}
              required
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="submit">Create Task</button>
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskDetailsModal({
  task,
  users,
  onStatusChange,
  onCloseTask,
  onClose,
  getStatusLabel,
  getStatusConfig,
}: {
  task: Task;
  users: User[];
  onStatusChange: (taskId: number, newStatus: number, nextAssignedUserId: number, customFields: Record<string, any>) => void;
  onCloseTask: (taskId: number) => void;
  onClose: () => void;
  getStatusLabel: (taskType: TaskType, status: number) => string;
  getStatusConfig: (taskType: TaskType) => any;
}) {
  const [newStatus, setNewStatus] = useState<number>(task.status);
  const [nextAssignedUserId, setNextAssignedUserId] = useState<number>(task.assignedUserId);
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [showChangeStatus, setShowChangeStatus] = useState<boolean>(false);

  const config = getStatusConfig(task.taskType);
  const finalStatus = config.finalStatus;
  const canClose = task.status === finalStatus && !task.isClosed;
  const canMoveForward = task.status < finalStatus && !task.isClosed;
  const canMoveBackward = task.status > 1 && !task.isClosed;

  const getRequiredFields = (status: number): string[] => {
    return config.statusFields[status] || [];
  };

  const handleStatusChange = (e: React.FormEvent) => {
    e.preventDefault();
    const requiredFields = getRequiredFields(newStatus);
    const fieldsToSubmit: Record<string, any> = {};
    
    requiredFields.forEach((field) => {
      if (!customFields[field]) {
        alert(`Field "${field}" is required for status ${newStatus}`);
        return;
      }
      fieldsToSubmit[field] = customFields[field];
    });

    onStatusChange(task.id, newStatus, nextAssignedUserId, fieldsToSubmit);
  };

  const renderCustomFieldsInput = () => {
    const requiredFields = getRequiredFields(newStatus);
    
    return requiredFields.map((field) => (
      <div key={field} className="form-group">
        <label>
          {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').replace(/\d+/g, ' $&')}:
        </label>
        <input
          type="text"
          placeholder={`Enter ${field}`}
          value={customFields[field] || ''}
          onChange={(e) => setCustomFields({ ...customFields, [field]: e.target.value })}
          required
        />
      </div>
    ));
  };

  const parsedCustomFields = task.customFields ? JSON.parse(task.customFields) : {};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>
          {task.taskType.name.toUpperCase()} Task #{task.id}
          {task.isClosed && <span className="closed-badge">CLOSED</span>}
        </h2>

        <div className="task-details">
          <p><strong>Current Status:</strong> {getStatusLabel(task.taskType, task.status)}</p>
          <p><strong>Assigned To:</strong> {task.assignedUser.name}</p>
          {Object.keys(parsedCustomFields).length > 0 && (
            <div>
              <strong>Custom Fields:</strong>
              <ul>
                {Object.entries(parsedCustomFields).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key}:</strong> {String(value)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {!task.isClosed && (
          <div className="task-actions">
            {canMoveForward && (
              <button onClick={() => {
                setNewStatus(task.status + 1);
                setShowChangeStatus(true);
              }}>
                Advance to Status {task.status + 1}
              </button>
            )}
            {canMoveBackward && (
              <button onClick={() => {
                setNewStatus(task.status - 1);
                setShowChangeStatus(true);
              }}>
                Move Back to Status {task.status - 1}
              </button>
            )}
            {canClose && (
              <button className="close-task-btn" onClick={() => onCloseTask(task.id)}>
                Close Task
              </button>
            )}
          </div>
        )}

        {showChangeStatus && (
          <form onSubmit={handleStatusChange} className="status-change-form">
            <h3>Change Status to {newStatus}: {getStatusLabel(task.taskType, newStatus)}</h3>
            
            <div className="form-group">
              <label>Next Assigned User:</label>
              <select
                value={nextAssignedUserId}
                onChange={(e) => setNextAssignedUserId(Number(e.target.value))}
                required
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            {renderCustomFieldsInput()}

            <div className="form-actions">
              <button type="submit">Change Status</button>
              <button type="button" onClick={() => setShowChangeStatus(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}

        <button className="close-modal-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default App;

