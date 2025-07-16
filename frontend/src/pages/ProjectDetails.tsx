import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Task } from '../types';

export default function ProjectDetails() {
  const { id: projectId } = useParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'todo', dueDate: '' });
  const [editTaskId, setEditTaskId] = useState<string | null>(null);

  const fetchTasks = () => {
    setLoading(true);
    axios
      .get(`/tasks?projectId=${projectId}&page=${page}&limit=${limit}&search=${search}`)
      .then((res) => {
        setTasks(res.data.tasks);
        setTotal(res.data.total);
      })
      .catch((err) => console.error('Error fetching tasks:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId, page, search]);

  const handleAddOrEditTask = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editTaskId) {
        await axios.put(`/tasks/${editTaskId}`, newTask);
      } else {
        await axios.post('/tasks', { ...newTask, projectId });
      }
      setNewTask({ title: '', description: '', status: 'todo', dueDate: '' });
      setEditTaskId(null);
      fetchTasks();
    } catch (err) {
      console.error('Error saving task:', err);
    }
  };

  const handleEdit = (task: Task) => {
    setNewTask({ title: task.title, description: task.description, status: task.status, dueDate: task.dueDate?.slice(0, 10) || '' });
    setEditTaskId(task._id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await axios.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-200 text-gray-800';
      case 'in-progress': return 'bg-yellow-200 text-yellow-800';
      case 'done': return 'bg-green-200 text-green-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-800">Project Tasks</h2>

        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            placeholder="Search tasks..."
            className="border p-2 rounded w-1/2"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>

        <form onSubmit={handleAddOrEditTask} className="space-y-4 mb-6 bg-white p-4 rounded shadow">
          <input
            type="text"
            placeholder="Task Title"
            className="w-full p-2 border rounded"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            className="w-full p-2 border rounded"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
          <select
            className="w-full p-2 border rounded"
            value={newTask.status}
            onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            {editTaskId ? 'Update Task' : 'Add Task'}
          </button>
        </form>

        {loading ? (
          <p className="text-center text-gray-600">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="text-center text-gray-500">No tasks found for this project.</p>
        ) : (
          <div className="space-y-4">
            {tasks.map((t) => (
              <div key={t._id} className="bg-white shadow-md rounded-lg p-5 border-l-4 border-blue-500 hover:border-purple-500 transition">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-blue-700">{t.title}</h3>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(t.status)}`}>
                    {t.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{t.description}</p>
                {t.dueDate && (
                  <p className="text-sm text-gray-600">
                    <strong>Due Date:</strong> {new Date(t.dueDate).toLocaleDateString()}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  <strong>Created:</strong> {new Date(t.createdAt).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Last updated:</strong> {new Date(t.updatedAt).toLocaleString()}
                </p>
                <div className="mt-2 space-x-2">
                  <button onClick={() => handleEdit(t)} className="px-3 py-1 text-sm bg-yellow-300 rounded hover:bg-yellow-400">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(t._id)} className="px-3 py-1 text-sm bg-red-400 text-white rounded hover:bg-red-500">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center mt-6 space-x-4">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            disabled={page === 1}
          >
            Prev
          </button>
          <span className="px-4 py-2 text-gray-700">Page {page}</span>
          <button
            onClick={() => setPage((prev) => (page * limit < total ? prev + 1 : prev))}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            disabled={page * limit >= total}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
