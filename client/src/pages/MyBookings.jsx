import React, { useEffect, useState, useCallback } from 'react'
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

  const load = useCallback(async () => {
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
  }, [user, page, statusFilter])

  useEffect(() => {
    load()
  }, [load])

  const cancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Once cancelled, you can delete it permanently.')) {
      return
    }
    try {
      await bookingService.cancelBookingRequest(bookingId)
      toast.success('Booking cancelled successfully. You can now delete it if you wish.')
      load()
    } catch (error) {
      console.error('Cancel failed:', error)
      toast.error(error?.response?.data?.detail || 'Cancel failed')
    }
  }

  const deleteBooking = async (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId)
    if (booking && booking.status !== 'cancelled') {
      toast.error('You can only delete cancelled bookings. Please cancel the booking first.')
      return
    }
    
    if (!window.confirm('Are you sure you want to permanently delete this cancelled booking? This action cannot be undone.')) {
      return
    }
    try {
      await bookingService.deleteBookingRequest(bookingId)
      toast.success('Booking deleted successfully')
      load()
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error(error?.response?.data?.detail || 'Delete failed')
    }
  }

  const payBooking = async (bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn thanh toán booking này? Sau khi thanh toán, booking sẽ được xác nhận.')) {
      return
    }
    try {
      await bookingService.payBookingRequest(bookingId, 'bank_transfer')
      toast.success('Thanh toán thành công! Booking đã được xác nhận.')
      load()
    } catch (error) {
      console.error('Payment failed:', error)
      toast.error(error?.response?.data?.detail || 'Thanh toán thất bại')
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
          className='px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white'
        >
          <option value=''>All Statuses</option>
          <option value='pending'>Pending</option>
          <option value='confirmed'>Confirmed</option>
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
                  <td className='px-6 py-4 text-sm text-gray-300'>{b.price?.toLocaleString() || 0} VND</td>
                  <td className='px-6 py-4 text-sm'>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      b.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      b.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                      b.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-sm font-medium text-center'>
                    <div className='flex gap-2 justify-center flex-wrap'>
                      {/* Hiển thị nút Thanh toán khi booking chưa có payment hoặc payment chưa success */}
                      {(b.status === 'pending' || b.status === 'confirmed') && !b.payment_id && (
                        <button
                          onClick={() => payBooking(b.id)}
                          className='px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs transition-colors'
                          title='Thanh toán booking này'
                        >
                          Thanh toán
                        </button>
                      )}
                      {/* Chỉ hiển thị nút Cancel khi booking chưa cancelled và chưa được thanh toán */}
                      {(b.status === 'pending' || (b.status === 'confirmed' && !b.payment_id)) && (
                        <button
                          onClick={() => cancel(b.id)}
                          className='px-3 py-1 rounded bg-orange-600 hover:bg-orange-700 text-white text-xs transition-colors'
                          title='Cancel this booking'
                        >
                          Cancel
                        </button>
                      )}
                      {/* Chỉ hiển thị nút Delete khi booking đã cancelled */}
                      {b.status === 'cancelled' && (
                        <button
                          onClick={() => deleteBooking(b.id)}
                          className='px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs transition-colors'
                          title='Permanently delete this cancelled booking'
                        >
                          Delete
                        </button>
                      )}
                      {/* Hiển thị thông báo khi đã thanh toán */}
                      {b.payment_id && b.status === 'confirmed' && (
                        <span className='text-xs text-green-400 italic' title='Đã thanh toán'>
                          ✓ Đã thanh toán
                        </span>
                      )}
                    </div>
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