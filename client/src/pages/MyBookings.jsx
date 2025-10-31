import React, { useEffect, useState } from 'react'
import { bookingService, seatService } from '../services'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'react-hot-toast'

const MyBookings = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

  const load = async () => {
    try {
      if (!user) return
      setLoading(true)
      const resp = await bookingService.getUserBookingsRequest(user.id, page, 10)
      let list = resp.data?.data || []
      // hydrate seat row/number if missing
      const missing = list.filter(b => !b.row || !b.number)
      if (missing.length > 0) {
        const uniqueSeatIds = Array.from(new Set(missing.map(b => b.seat_id)))
        const seatMap = {}
        await Promise.all(uniqueSeatIds.map(async id => {
          try {
            const s = await seatService.getSeatByIdRequest(id)
            seatMap[id] = s.data
          } catch (e) {
            console.debug('Failed to fetch seat', id, e)
          }
        }))
        list = list.map(b => (
          b.row && b.number ? b : { ...b, row: seatMap[b.seat_id]?.row, number: seatMap[b.seat_id]?.number }
        ))
      }
      setBookings(statusFilter ? list.filter(b => b.status === statusFilter) : list)
      setTotalPages(resp.data?.pages || 1)
    } catch (error) {
      console.error('Failed to load bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user, page, statusFilter])

  const cancel = async (bookingId) => {
    try {
      await bookingService.cancelBookingRequest(bookingId)
      toast.success('Booking cancelled')
      load()
    } catch (error) {
      console.error('Cancel failed:', error)
      toast.error(error?.response?.data?.detail || 'Cancel failed')
    }
  }

  if (!user) return null
  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
      </div>
    )
  }

  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-2xl font-semibold mb-6'>My Bookings</h1>

      <div className='mb-4'>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className='px-4 py-2 rounded-lg bg-gray-800 border border-gray-700'
        >
          <option value=''>All Statuses</option>
          <option value='pending'>Pending</option>
          <option value='cancelled'>Cancelled</option>
        </select>
      </div>

      {bookings.length === 0 ? (
        <p className='text-gray-400'>No bookings yet.</p>
      ) : (
        <div className='bg-gray-800 rounded-lg shadow overflow-x-auto'>
          <table className='min-w-full table-auto'>
            <thead className='bg-gray-700'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>Showtime</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>Seat</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>Price</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>Status</th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-700'>
              {bookings.map(b => (
                <tr key={b.id} className='hover:bg-gray-700/50'>
                  <td className='px-6 py-4 text-sm text-gray-300'>
                    {new Date(b.start_time || b.created_at).toLocaleString()}<br/>
                    <span className='text-xs text-gray-400'>Showtime #{b.showtime_id}</span>
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-300'>
                    Row {b.row || ''} Seat {b.number || ''}
                    <span className='text-xs text-gray-500 ml-2'>#{b.seat_id}</span>
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-300'>{b.price}</td>
                  <td className='px-6 py-4 text-sm text-gray-300'>{b.status}</td>
                  <td className='px-6 py-4 text-sm font-medium text-center'>
                    <button
                      onClick={() => cancel(b.id)}
                      disabled={b.status !== 'pending'}
                      className='px-3 py-1 rounded bg-red-600 text-white disabled:opacity-50'
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className='flex justify-center gap-2 mt-6'>
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className='px-4 py-2 rounded-lg bg-gray-800 disabled:opacity-50'
        >
          Previous
        </button>
        <span className='px-4 py-2'>Page {page} of {totalPages}</span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className='px-4 py-2 rounded-lg bg-gray-800 disabled:opacity-50'
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default MyBookings