import React, { useState, useEffect } from 'react';
import { showtimeService, movieService, theaterService, roomService } from '../services';
import { toast } from 'react-hot-toast';
import { Edit2, Trash2, Plus } from 'lucide-react';

const AdminShowtimeList = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    movie_id: '',
    theater_id: '',
    room_id: '',
    start_time: '',
    end_time: '',
    base_price: '',
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [showtimesRes, moviesRes, theatersRes, roomsRes] = await Promise.all([
        showtimeService.getShowtimesRequest(1, 100),
        movieService.getMoviesRequest(1, 100),
        theaterService.getTheatersRequest(1, 100),
        roomService.getRoomsRequest(1, 100),
      ]);

      setShowtimes(showtimesRes.data?.data || showtimesRes.data?.items || []);
      setMovies(moviesRes.data?.data || moviesRes.data?.items || []);
      setTheaters(theatersRes.data?.data || theatersRes.data?.items || []);
      setAllRooms(roomsRes.data?.data || roomsRes.data?.items || []);
    } catch {
      toast.error('Failed to load data');
      // silent log
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Client-side overlap check: same room cannot overlap time ranges
      const allSt = await showtimeService.getShowtimesRequest(1, 100);
      const sameRoom = (allSt.data?.data || []).filter(s => String(s.room_id) === String(formData.room_id));
      const sStart = new Date(formData.start_time);
      const sEnd = new Date(formData.end_time);
      const overlapped = sameRoom.some(s => {
        const eStart = new Date(s.start_time);
        const eEnd = new Date(s.end_time);
        return !(sEnd <= eStart || sStart >= eEnd);
      });
      if (overlapped) {
        toast.error('Time conflict: another showtime exists in this room for the selected range');
        return;
      }
      const payload = {
        movie_id: Number(formData.movie_id),
        room_id: Number(formData.room_id),
        start_time: formData.start_time,
        end_time: formData.end_time,
        base_price: Number(formData.base_price),
      };
      if (editId) {
        await showtimeService.updateShowtimeRequest(editId, payload);
        toast.success('Showtime updated successfully');
      } else {
        await showtimeService.createShowtimeRequest(payload);
        toast.success('Showtime created successfully');
      }
      setIsModalOpen(false);
      setEditId(null);
      resetForm();
      fetchData();
    } catch {
      toast.error('Failed to save showtime');
    }
  };

  const handleEdit = async (showtime) => {
    setEditId(showtime.id);
    try {
      let theaterId = '';
      // fetch room to get theater id
      const room = await roomService.getRoomByIdRequest(showtime.room_id);
      theaterId = room?.data?.theater_id || '';
      if (theaterId) {
        const r = await roomService.getRoomsByTheaterRequest(theaterId, 1, 100);
        setRooms(r.data?.data || []);
      }
      setFormData({
        movie_id: showtime.movie_id,
        theater_id: theaterId,
        room_id: showtime.room_id,
        start_time: new Date(showtime.start_time).toISOString().slice(0, 16),
        end_time: new Date(showtime.end_time).toISOString().slice(0, 16),
        base_price: showtime.base_price,
      });
    } catch {
      setFormData({
        movie_id: showtime.movie_id,
        theater_id: '',
        room_id: showtime.room_id,
        start_time: new Date(showtime.start_time).toISOString().slice(0, 16),
        end_time: new Date(showtime.end_time).toISOString().slice(0, 16),
        base_price: showtime.base_price,
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this showtime?')) {
      try {
        await showtimeService.deleteShowtimeRequest(id);
        toast.success('Showtime deleted successfully');
        fetchData();
      } catch {
        toast.error('Failed to delete showtime');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      movie_id: '',
      theater_id: '',
      room_id: '',
      start_time: '',
      end_time: '',
      base_price: '',
    });
    setRooms([])
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Showtime Management</h1>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Showtime
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Movie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Room</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Start Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">End Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {showtimes.map((showtime) => (
              <tr key={showtime.id} className="hover:bg-gray-700/50">
                <td className="px-6 py-4 text-sm text-gray-300">
                  {movies.find(m => m.id === showtime.movie_id)?.title}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {allRooms.find(r => r.id === showtime.room_id)?.name || `Room #${showtime.room_id}`}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {new Date(showtime.start_time).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {new Date(showtime.end_time).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  ${showtime.base_price}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-center">
                  <button
                    onClick={() => handleEdit(showtime)}
                    className="text-blue-400 hover:text-blue-300 mx-2"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(showtime.id)}
                    className="text-red-400 hover:text-red-300 mx-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editId ? 'Edit Showtime' : 'Add New Showtime'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Movie</label>
                  <select
                    value={formData.movie_id}
                    onChange={(e) => setFormData({ ...formData, movie_id: e.target.value })}
                    className="w-full bg-gray-700 rounded-lg p-2"
                    required
                  >
                    <option value="">Select Movie</option>
                    {movies.map((movie) => (
                      <option key={movie.id} value={movie.id}>
                        {movie.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Theater</label>
                  <select
                    value={formData.theater_id}
                    onChange={async (e) => {
                      const val = e.target.value
                      setFormData({ ...formData, theater_id: val, room_id: '' })
                      if (val) {
                        try {
                          const r = await roomService.getRoomsByTheaterRequest(val, 1, 100)
                          setRooms(r.data?.data || [])
                        } catch {
                          setRooms([])
                        }
                      } else {
                        setRooms([])
                      }
                    }}
                    className="w-full bg-gray-700 rounded-lg p-2"
                    required
                  >
                    <option value="">Select Theater</option>
                    {theaters.map((theater) => (
                      <option key={theater.id} value={theater.id}>
                        {theater.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Room</label>
                  <select
                    value={formData.room_id}
                    onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                    className="w-full bg-gray-700 rounded-lg p-2"
                    required
                  >
                    <option value="">Select Room</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full bg-gray-700 rounded-lg p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full bg-gray-700 rounded-lg p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Base Price</label>
                  <input
                    type="number"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    className="w-full bg-gray-700 rounded-lg p-2"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditId(null);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90"
                >
                  {editId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShowtimeList;