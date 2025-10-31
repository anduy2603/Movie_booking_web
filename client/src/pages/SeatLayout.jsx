import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { bookingService, seatService, showtimeService } from '../services'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'react-hot-toast'

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

  const selectShowtime = async (st) => {
    try {
      setLoading(true)
      setShowtime(st)
      const seatsResp = await seatService.getSeatsByRoomRequest(st.room_id)
      setSeats(Array.isArray(seatsResp.data) ? seatsResp.data : [])
      const bookedResp = await bookingService.getBookingsByShowtimeRequest(st.id)
      const booked = Array.isArray(bookedResp.data) ? bookedResp.data : []
      setBookedSeatIds(new Set(booked.map(b => b.seat_id)))
    } catch {
      toast.error('Failed to load seats')
    } finally {
      setLoading(false)
    }
  }

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

  const confirmBooking = async () => {
    try {
      if (!user) {
        toast.error('Please login to book tickets')
        return
      }
      if (selectedSeatIds.size === 0) {
        toast.error('Please select at least one seat')
        return
      }

      const payload = []
      for (const seat of seats) {
        if (selectedSeatIds.has(seat.id)) {
          payload.push({
            user_id: user.id,
            showtime_id: Number(showtime.id),
            seat_id: seat.id,
            price: computeSeatPrice(seat),
            status: 'pending',
          })
        }
      }

      await bookingService.createBookingRequest(payload)
      toast.success('Booking created successfully')
      navigate('/my-bookings')
    } catch (error) {
      console.error('Booking failed:', error)
      toast.error(error?.response?.data?.detail || 'Booking failed')
    }
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
      </div>
    )
  }

  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-2xl font-semibold mb-4'>Choose Showtime and Seats</h1>

      {/* Step 1: choose showtime */}
      {date && !showtime && (
        <div className='mb-8'>
          <div className='flex gap-4 items-center mb-4'>
            <div className='text-gray-300'>Date: <span className='text-white font-medium'>{date}</span></div>
          </div>
          {filteredShowtimes.length === 0 ? (
            <div className='text-gray-400'>No showtimes for the selected date/theater.</div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {filteredShowtimes.map(st => (
                <button
                  key={st.id}
                  onClick={() => selectShowtime(st)}
                  className='p-4 rounded-lg border border-gray-700 hover:border-primary text-left'
                >
                  <p className='font-semibold'>{new Date(st.start_time || st.startTime).toLocaleTimeString()}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: choose seats */}
      {showtime && (
        <>
          <p className='text-gray-300 mb-6'>
            Showtime: {new Date(showtime.start_time).toLocaleString()} · Base price: {showtime.base_price}
          </p>

      <div className='bg-gray-800 rounded-lg p-4 mb-6 text-center'>
        <div className='mx-auto w-2/3 h-2 bg-gray-700 rounded-full mb-4'></div>
        <span className='text-gray-400 text-sm'>Screen</span>
      </div>

      <div className='flex flex-col gap-3 items-center'>
        {seatsByRow.map(([rowLabel, rowSeats]) => (
          <div key={rowLabel} className='flex gap-2 items-center'>
            <span className='w-8 text-right text-gray-400'>{rowLabel}</span>
            {rowSeats.map((seat) => {
              const isBooked = bookedSeatIds.has(seat.id)
              const isSelected = selectedSeatIds.has(seat.id)
              return (
                <button
                  key={seat.id}
                  onClick={() => toggleSeat(seat.id)}
                  disabled={isBooked}
                  className={`px-3 py-2 rounded text-sm border transition 
                    ${isBooked ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed' : ''}
                    ${!isBooked && isSelected ? 'bg-primary/80 border-primary text-white' : ''}
                    ${!isBooked && !isSelected ? 'bg-gray-800 border-gray-600 text-gray-200 hover:border-primary' : ''}
                  `}
                  title={`Row ${seat.row} Seat ${seat.number} · ${computeSeatPrice(seat)}`}
                >
                  {seat.row}{seat.number}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div className='mt-8 flex justify-between items-center'>
        <div className='text-gray-300'>
          Selected: {selectedSeatIds.size} · Total: <span className='text-white font-semibold'>{totalPrice}</span>
        </div>
        <button
          onClick={confirmBooking}
          disabled={selectedSeatIds.size === 0}
          className='px-6 py-3 rounded-lg bg-primary text-white disabled:opacity-50'
        >
          Confirm Booking
        </button>
      </div>
        </>
      )}
    </div>
  )
}

export default SeatLayout