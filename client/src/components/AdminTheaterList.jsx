import React, { useState, useEffect } from 'react';
import { theaterService } from '../services';
import { toast } from 'react-hot-toast';
import { Edit2, Trash2, Plus } from 'lucide-react';

const AdminTheaterList = () => {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', address: '' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchTheaters();
  }, []);

  const fetchTheaters = async () => {
    try {
      setLoading(true);
      const res = await theaterService.getTheatersRequest();
      setTheaters(res.data.items || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load theaters');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await theaterService.updateTheaterRequest(editId, formData);
        toast.success('Theater updated');
      } else {
        await theaterService.createTheaterRequest(formData);
        toast.success('Theater created');
      }
      setIsModalOpen(false);
      setEditId(null);
      setFormData({ name: '', address: '' });
      fetchTheaters();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to save theater');
    }
  };

  const handleEdit = (t) => {
    setEditId(t.id);
    setFormData({ name: t.name || '', address: t.address || '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this theater?')) return;
    try {
      await theaterService.deleteTheaterRequest(id);
      toast.success('Deleted');
      fetchTheaters();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Theater Management</h1>
        <button onClick={() => { setFormData({ name: '', address: '' }); setIsModalOpen(true); }} className="flex items-center px-4 py-2 bg-primary text-white rounded-lg">
          <Plus className="w-5 h-5 mr-2" /> Add Theater
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Address</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {theaters.map(t => (
              <tr key={t.id} className="hover:bg-gray-700/50">
                <td className="px-6 py-4 text-sm text-gray-300">{t.name}</td>
                <td className="px-6 py-4 text-sm text-gray-300">{t.address}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => handleEdit(t)} className="text-blue-400 mx-2"><Edit2 className="w-5 h-5"/></button>
                  <button onClick={() => handleDelete(t.id)} className="text-red-400 mx-2"><Trash2 className="w-5 h-5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">{editId ? 'Edit Theater' : 'Add Theater'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Name</label>
                <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-700 p-2 rounded" required />
              </div>
              <div>
                <label className="block text-sm mb-1">Address</label>
                <input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-gray-700 p-2 rounded" required />
              </div>
              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditId(null); }} className="px-4 py-2 bg-gray-700 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary rounded text-white">{editId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTheaterList;
