import React, { useState, useEffect } from 'react';
import { roomService, theaterService } from '../services';
import { toast } from 'react-hot-toast';
import { Edit2, Trash2, Plus } from 'lucide-react';

const AdminRoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', theater_id: '', capacity: 0 });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomsRes, theatersRes] = await Promise.all([
        roomService.getRoomsRequest(),
        theaterService.getTheatersRequest(),
      ]);
      setRooms(roomsRes.data.items || []);
      setTheaters(theatersRes.data.items || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await roomService.updateRoomRequest(editId, formData);
        toast.success('Room updated');
      } else {
        await roomService.createRoomRequest(formData);
        toast.success('Room created');
      }
      setIsModalOpen(false);
      setEditId(null);
      setFormData({ name: '', theater_id: '', capacity: 0 });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to save room');
    }
  };

  const handleEdit = (r) => {
    setEditId(r.id);
    setFormData({ name: r.name || '', theater_id: r.theater_id || '', capacity: r.capacity || 0 });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this room?')) return;
    try {
      await roomService.deleteRoomRequest(id);
      toast.success('Deleted');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Room Management</h1>
        <button onClick={() => { setFormData({ name: '', theater_id: '', capacity: 0 }); setIsModalOpen(true); }} className="flex items-center px-4 py-2 bg-primary text-white rounded-lg">
          <Plus className="w-5 h-5 mr-2" /> Add Room
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Theater</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Capacity</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {rooms.map(r => (
              <tr key={r.id} className="hover:bg-gray-700/50">
                <td className="px-6 py-4 text-sm text-gray-300">{r.name}</td>
                <td className="px-6 py-4 text-sm text-gray-300">{theaters.find(t => t.id === r.theater_id)?.name || '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-300">{r.capacity}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => handleEdit(r)} className="text-blue-400 mx-2"><Edit2 className="w-5 h-5"/></button>
                  <button onClick={() => handleDelete(r.id)} className="text-red-400 mx-2"><Trash2 className="w-5 h-5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">{editId ? 'Edit Room' : 'Add Room'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Name</label>
                <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-700 p-2 rounded" required />
              </div>
              <div>
                <label className="block text-sm mb-1">Theater</label>
                <select value={formData.theater_id} onChange={(e) => setFormData({...formData, theater_id: e.target.value})} className="w-full bg-gray-700 p-2 rounded" required>
                  <option value="">Select theater</option>
                  {theaters.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Capacity</label>
                <input type="number" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: Number(e.target.value)})} className="w-full bg-gray-700 p-2 rounded" required />
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

export default AdminRoomList;
