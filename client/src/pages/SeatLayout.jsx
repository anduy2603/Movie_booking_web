import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { bookingService, seatService, showtimeService, paymentService } from '../services'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'react-hot-toast'
import { RefreshCw, Clock, DollarSign } from 'lucide-react'
import PaymentModal from '../components/PaymentModal'

const SeatLayout = () => {
  const { id: routeId, date } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [showtime, setShowtime] = useState(null)
  // movieId comes from routeId if needed; we don't store separately
  const [showtimes, setShowtimes] = useState([])
  
  const [seats, setSeats] = useState([])
  const [bookedSeatIds, setBookedSeatIds] = useState(new Set())
  const [selectedSeatIds, setSelectedSeatIds] = useState(new Set())
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Step handling is derived: when showtime is null -> choose showtime; else choose seats

  // Load theaters for filter prefill
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        if (date) {
          // routeId is movieId per App route -> list showtimes for this movie/date
          const stList = await showtimeService.getShowtimesByMovieRequest(routeId, 1, 100)
          setShowtimes(stList.data?.data || [])
        } else {
          // routeId is showtimeId -> jump directly to seat selection
          const stResp = await showtimeService.getShowtimeByIdRequest(routeId)
          const st = stResp.data
          await selectShowtime(st)
        }
      } catch (error) {
        console.error('Failed to initialize booking page:', error)
        toast.error('Failed to load showtimes')
        navigate('/movies')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [routeId, date])

  // No theater filtering for simplified flow

  const dateFilter = useMemo(() => {
    try { return new Date(date).toISOString().slice(0,10) } catch { return '' }
  }, [date])

  const filteredShowtimes = useMemo(() => {
    return (showtimes || []).filter(s => {
      const dISO = new Date(s.start_time || s.startTime).toISOString().slice(0,10)
      return dISO === dateFilter
    })
  }, [showtimes, dateFilter])

  // Format time to HH:MM (24-hour format)
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const loadBookedSeats = async (showtimeId) => {
    try {
      const bookedResp = await bookingService.getBookingsByShowtimeRequest(showtimeId)
      const booked = Array.isArray(bookedResp.data) ? bookedResp.data : []
      setBookedSeatIds(new Set(booked.map(b => b.seat_id)))
    } catch (error) {
      console.error('Failed to load booked seats:', error)
    }
  }

  const selectShowtime = async (st) => {
    try {
      setLoading(true)
      setShowtime(st)
      const seatsResp = await seatService.getSeatsByRoomRequest(st.room_id)
      setSeats(Array.isArray(seatsResp.data) ? seatsResp.data : [])
      await loadBookedSeats(st.id)
    } catch {
      toast.error('Failed to load seats')
    } finally {
      setLoading(false)
    }
  }

  // Refresh booked seats when window gains focus (user returns to page)
  useEffect(() => {
    const handleFocus = () => {
      if (showtime?.id) {
        loadBookedSeats(showtime.id)
      }
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [showtime])

  const toggleSeat = (seatId) => {
    if (bookedSeatIds.has(seatId)) return
    const next = new Set(selectedSeatIds)
    if (next.has(seatId)) next.delete(seatId)
    else next.add(seatId)
    setSelectedSeatIds(next)
  }

  const seatsByRow = useMemo(() => {
    const map = new Map()
    for (const seat of seats) {
      if (!map.has(seat.row)) map.set(seat.row, [])
      map.get(seat.row).push(seat)
    }
    for (const [, arr] of map) arr.sort((a, b) => a.number - b.number)
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [seats])

  const computeSeatPrice = (seat) => {
    const base = showtime?.base_price || 0
    const modifier = seat?.price_modifier ?? 1
    return Math.round(base * modifier * 100) / 100
  }

  const totalPrice = useMemo(() => {
    if (!showtime) return 0
    let sum = 0
    for (const seat of seats) {
      if (selectedSeatIds.has(seat.id)) sum += computeSeatPrice(seat)
    }
    return Math.round(sum * 100) / 100
  }, [selectedSeatIds, seats, showtime, computeSeatPrice])

  const handlePaymentConfirm = async (paymentMethod, totalAmount) => {
    let paymentId = null;
    
    try {
      if (!user) {
        toast.error('Please login to book tickets')
        throw new Error('User not logged in')
      }
      if (selectedSeatIds.size === 0) {
        toast.error('Please select at least one seat')
        throw new Error('No seats selected')
      }

      // Try to create payment (optional - nếu fail thì vẫn tạo booking)
      try {
        const paymentData = {
          method: paymentMethod,
          amount: totalAmount,
          status: paymentMethod === 'cash' ? 'pending' : 'success',
          created_by: user.id,
        };
        
        console.log('Creating payment:', paymentData);
        const paymentResponse = await paymentService.createPaymentRequest(paymentData);
        paymentId = paymentResponse.data?.id;
        console.log('Payment created successfully:', paymentId);
      } catch (paymentError) {
        console.warn('Payment creation failed, continuing without payment:', paymentError);
        // Payment optional - vẫn tiếp tục tạo booking
        paymentId = null;
        toast('Payment creation failed, but booking will still be created', { icon: '⚠️' });
      }

      // Create bookings (với hoặc không có payment_id)
      const payload = []
      for (const seat of seats) {
        if (selectedSeatIds.has(seat.id)) {
          const bookingData = {
            user_id: user.id,
            showtime_id: Number(showtime.id),
            seat_id: seat.id,
            price: computeSeatPrice(seat),
            status: 'pending',
          };
          
          // Chỉ thêm payment_id nếu payment đã được tạo thành công
          if (paymentId) {
            bookingData.payment_id = paymentId;
          }
          
          payload.push(bookingData);
        }
      }

      console.log('Creating bookings:', payload);
      const bookingResponse = await bookingService.createBookingRequest(payload);
      console.log('Bookings created successfully:', bookingResponse);
      
      toast.success('Booking created successfully')
      navigate('/my-bookings')
    } catch (error) {
      console.error('Booking process failed:', error)
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        stack: error?.stack
      });
      
      // If payment was created but booking failed, try to cancel payment
      if (paymentId) {
        try {
          await paymentService.updatePaymentStatusRequest(paymentId, 'cancelled')
          console.log('Payment cancelled due to booking failure')
        } catch (cancelError) {
          console.error('Failed to cancel payment:', cancelError)
        }
      }
      
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.message || error?.message || 'Booking failed'
      toast.error(errorMessage)
      throw error // Re-throw để PaymentModal biết có lỗi
    }
  }

  const confirmBooking = () => {
    if (!user) {
      toast.error('Please login to book tickets')
      return
    }
    if (selectedSeatIds.size === 0) {
      toast.error('Please select at least one seat')
      return
    }
    setShowPaymentModal(true)
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-7xl'>
      <h1 className='text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'>
        Choose Showtime and Seats
      </h1>

      {/* Step 1: choose showtime */}
      {date && !showtime && (
        <div className='mb-12'>
          <div className='flex gap-4 items-center mb-6'>
            <div className='flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700'>
              <Clock className='w-4 h-4 text-gray-400' />
              <span className='text-gray-300'>Date: <span className='text-white font-semibold'>{date}</span></span>
            </div>
          </div>
          {filteredShowtimes.length === 0 ? (
            <div className='text-center py-12 bg-gray-800/30 rounded-lg border border-gray-700'>
              <p className='text-gray-400 text-lg'>No showtimes available for the selected date.</p>
            </div>
          ) : (
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
              {filteredShowtimes.map(st => {
                const isSelected = showtime?.id === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => selectShowtime(st)}
                    className={`p-5 rounded-xl border-2 text-center transition-all transform hover:scale-105 ${
                      isSelected
                        ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/30'
                        : 'bg-gray-800 border-gray-700 text-white hover:border-gray-600 hover:bg-gray-750'
                    }`}
                  >
                    <p className='font-bold text-xl'>{formatTime(st.start_time || st.startTime)}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 2: choose seats */}
      {showtime && (
        <>
          {/* Showtime Info Card */}
          <div className='bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 mb-8 border border-gray-700 shadow-lg'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
              <div className='flex flex-wrap items-center gap-6'>
                <div className='flex items-center gap-2'>
                  <Clock className='w-5 h-5 text-[var(--color-primary)]' />
                  <span className='text-gray-300'>Showtime: <span className='text-white font-semibold text-lg'>{formatTime(showtime.start_time)}</span></span>
                </div>
                <div className='flex items-center gap-2'>
                  <DollarSign className='w-5 h-5 text-[var(--color-primary)]' />
                  <span className='text-gray-300'>Base Price: <span className='text-white font-semibold text-lg'>{showtime.base_price?.toLocaleString() || 0} VND</span></span>
                </div>
              </div>
              <button
                onClick={() => loadBookedSeats(showtime.id)}
                className='flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700/50 border border-gray-600 hover:bg-gray-700 transition-colors text-sm text-gray-300 hover:text-white'
                title='Refresh seat availability'
              >
                <RefreshCw className='w-4 h-4' />
                Refresh
              </button>
            </div>
          </div>

          {/* Screen */}
          <div className='relative mb-12'>
            <div className='bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-center border-2 border-gray-700 shadow-2xl'>
              <div className='mx-auto w-full max-w-4xl h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent rounded-full mb-6 opacity-50'></div>
              <div className='mx-auto w-full max-w-3xl h-3 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-lg mb-4'></div>
              <span className='text-gray-400 text-sm font-medium uppercase tracking-wider'>Screen</span>
            </div>
          </div>

          {/* Seat Legend */}
          <div className='flex flex-wrap justify-center gap-6 mb-8 p-4 bg-gray-800/30 rounded-lg border border-gray-700'>
            <div className='flex items-center gap-2'>
              <div className='w-6 h-6 rounded border-2 border-gray-600 bg-gray-800'></div>
              <span className='text-sm text-gray-400'>Available</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-6 h-6 rounded border-2 border-[var(--color-primary)] bg-[var(--color-primary)]'></div>
              <span className='text-sm text-gray-400'>Selected</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-6 h-6 rounded border-2 border-[var(--color-primary)] bg-[var(--color-primary)] opacity-75'></div>
              <span className='text-sm text-gray-400'>Booked</span>
            </div>
          </div>

          {/* Seat Layout */}
          <div className='flex flex-col gap-4 items-center mb-8 max-w-5xl mx-auto'>
            {seatsByRow.map(([rowLabel, rowSeats]) => (
              <div key={rowLabel} className='flex gap-2 items-center w-full'>
                <span className='w-10 text-right text-gray-400 font-semibold text-lg'>{rowLabel}</span>
                <div className='flex gap-2 flex-1 justify-center'>
                  {rowSeats.map((seat) => {
                    const isBooked = bookedSeatIds.has(seat.id)
                    const isSelected = selectedSeatIds.has(seat.id)
                    return (
                      <button
                        key={seat.id}
                        onClick={() => toggleSeat(seat.id)}
                        disabled={isBooked}
                        className={`px-4 py-3 rounded-lg text-sm font-semibold border-2 transition-all transform hover:scale-110 active:scale-95 ${
                          isBooked 
                            ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white cursor-not-allowed opacity-75' 
                            : isSelected
                            ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/30' 
                            : 'bg-gray-800 border-gray-600 text-gray-200 hover:border-gray-500 hover:bg-gray-750'
                        }`}
                        title={`Row ${seat.row} Seat ${seat.number} · ${computeSeatPrice(seat).toLocaleString()} VND`}
                      >
                        {seat.number}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Booking Summary */}
          <div className='sticky bottom-0 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 border-t-2 border-gray-700 shadow-2xl'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
              <div className='flex items-center gap-6'>
                <div className='text-gray-300'>
                  <span className='text-gray-400 text-sm'>Selected Seats:</span>
                  <span className='text-white font-bold text-xl ml-2'>{selectedSeatIds.size}</span>
                </div>
                <div className='h-6 w-px bg-gray-600'></div>
                <div className='text-gray-300'>
                  <span className='text-gray-400 text-sm'>Total Price:</span>
                  <span className='text-[var(--color-primary)] font-bold text-2xl ml-2'>{totalPrice.toLocaleString()}</span>
                  <span className='text-gray-500 text-sm ml-1'>VND</span>
                </div>
              </div>
              <button
                onClick={confirmBooking}
                disabled={selectedSeatIds.size === 0}
                className='px-8 py-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dull)] text-white font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-[var(--color-primary)]/30 disabled:shadow-none'
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        totalAmount={totalPrice}
        onConfirm={handlePaymentConfirm}
      />
    </div>
  )
}

export default SeatLayout