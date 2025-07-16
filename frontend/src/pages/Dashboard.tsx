import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Project } from '../types';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active'
  });

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`/projects?page=${page}&limit=${limit}&search=${search}`);
      setProjects(res.data.projects);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, limit, page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editProjectId) {
        await axios.put(`/projects/${editProjectId}`, formData);
      } else {
        await axios.post('/projects', formData);
      }
      setFormData({ title: '', description: '', status: 'active' });
      setEditProjectId(null);
      fetchProjects();
    } catch (err) {
      console.error('Error saving project:', err);
    }
  };

  const handleEdit = (project: Project) => {
    setFormData({
      title: project.title,
      description: project.description,
      status: project.status,
    });
    setEditProjectId(project._id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await axios.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-800 mb-6 text-center">Your Projects</h1>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full border p-2 rounded shadow-sm mb-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow p-4 rounded mb-6 space-y-3">
          <h3 className="text-lg font-semibold">{editProjectId ? 'Edit Project' : 'Add New Project'}</h3>
          <input
            className="w-full border p-2 rounded"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <textarea
            className="w-full border p-2 rounded"
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <select
            className="w-full border p-2 rounded"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            {editProjectId ? 'Update Project' : 'Add Project'}
          </button>
        </form>

        {loading ? (
          <p className="text-center text-gray-600">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-center text-gray-500">No projects found.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((p) => (
              <div
                key={p._id}
                className="bg-white border-l-4 border-blue-500 rounded-lg p-4 shadow hover:border-purple-500 hover:shadow-md transition"
              >
                <Link to={`/projects/${p._id}`}>
                  <h2 className="text-lg font-semibold text-blue-700 mb-1">{p.title}</h2>
                  <p className="text-sm text-gray-600 mb-2">{p.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        p.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {p.status.toUpperCase()}
                    </span>
                    <span className="text-gray-500">
                      Created: {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-gray-500">
                      Last updated: {new Date(p.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleEdit(p)}
                    className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}