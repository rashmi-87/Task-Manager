import { useState, useEffect } from "react";
import Column from './Column';
import axios from "axios";
import TaskModal from "./TaskModal";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const TaskBoard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState({});
  const [columns, setColumns] = useState({
    pending: { id: 'pending', title: 'Pending', taskIds: [] },
    done: { id: 'done', title: 'Done', taskIds: [] },
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const config = {
    headers: { Authorization: `Bearer ${user?.token}` },
  };

  useEffect(() => {
  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`, config);
      const fetchedTasks = response.data;

      const tasksById = {};
      fetchedTasks.forEach(task => { tasksById[task._id] = task; });

      const pendingTaskIds = fetchedTasks
        .filter(t => t.status === "pending")
        .map(t => t._id);

      const doneTaskIds = fetchedTasks
        .filter(t => t.status === "done")
        .map(t => t._id);

      setTasks(tasksById);
      setColumns(prev => ({
        pending: { ...prev.pending, taskIds: pendingTaskIds },
        done: { ...prev.done, taskIds: doneTaskIds },
      }));
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  if (user) fetchTasks();
}, [user]);

  const handleOpenModal = (task = null) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTask(null);
    setIsModalOpen(false);
  };

const handleSaveTask = async (taskData) => {
  if (!taskData.title || !taskData.dueDate) {
    alert("Title and Due Date are required!");
    return;
  }

  try {
    const payload = {
      ...taskData,
      dueDate: new Date(taskData.dueDate).toISOString(), // <-- associate task with logged-in user
    };

    let response;
    if (editingTask) {
      response = await axios.put(
        `${API_URL}/tasks/${editingTask._id}`,
        payload,
        config
      );
      const updatedTask = response.data;
      setTasks(prev => ({ ...prev, [updatedTask._id]: updatedTask }));
    } else {
      response = await axios.post(`${API_URL}/tasks`, payload, config);
      const newTask = response.data;
      setTasks(prev => ({ ...prev, [newTask._id]: newTask }));
      setColumns(prev => ({
        ...prev,
        [newTask.status]: {
          ...prev[newTask.status],
          taskIds: [...prev[newTask.status].taskIds, newTask._id],
        },
      }));
    }
  } catch (error) {
    console.error("Error saving task:", error);
    alert(
      error.response?.data?.message || "Failed to save task. Please try again."
    );
  }

  handleCloseModal();
};


  const handleDeleteTask = async (taskId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this task?");
    if (!isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/tasks/${taskId}`, config);
      setTasks(prev => {
        const newTasks = { ...prev };
        delete newTasks[taskId];
        return newTasks;
      });

      setColumns(prev => {
        const newCols = { ...prev };
        for (const col of Object.values(newCols)) {
          col.taskIds = col.taskIds.filter(id => id !== taskId);
        }
        return newCols;
      });
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = async (e, newStatus) => {
    const taskId = e.dataTransfer.getData("taskId");
    const task = tasks[taskId];
    const oldStatus = task.status;
    if (oldStatus === newStatus) return;

    const newColumns = { ...columns };
    newColumns[oldStatus].taskIds = newColumns[oldStatus].taskIds.filter(id => id !== taskId);
    newColumns[newStatus].taskIds.push(taskId);
    setColumns(newColumns);

    const updatedTask = { ...task, status: newStatus };
    setTasks(prev => ({ ...prev, [taskId]: updatedTask }));

    try {
      await axios.put(`${API_URL}/tasks/${taskId}`, { status: newStatus }, config);
    } catch (err) {
      console.error("Error updating task status:", err);
      
      setColumns(columns);
      setTasks(tasks);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">My Tasks</h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.values(columns).map(column => (
          <Column
            key={column.id}
            column={column}
            tasks={column.taskIds.map(taskId => tasks[taskId])}
            onEdit={handleOpenModal}
            onDelete={handleDeleteTask}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
          />
        ))}
      </div>

      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
          task={editingTask}
        />
      )}
    </div>
  );
};

export default TaskBoard;
