import { StarIcon } from 'lucide-react'
import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import timeFormat from '../lib/timeFormat'

const MovieCard = ({movie}) => {

    const navigate = useNavigate()

    const year = useMemo(() => {
      if (!movie?.release_date) return ''
      try { return new Date(movie.release_date).getFullYear() } catch { return '' }
    }, [movie?.release_date])

    const genresDisplay = useMemo(() => {
      if (Array.isArray(movie?.genres)) {
        return movie.genres.slice(0,2).map(g => g?.name || g).join(' | ')
      }
      if (typeof movie?.genre === 'string') return movie.genre
      return ''
    }, [movie?.genres, movie?.genre])

    const runtimeDisplay = useMemo(() => {
      const minutes = movie?.runtime ?? movie?.duration
      return minutes ? timeFormat(minutes) : ''
    }, [movie?.runtime, movie?.duration])

    const ratingDisplay = useMemo(() => {
      const rating = movie?.vote_average ?? movie?.liked_by_count ?? 0
      return typeof rating === 'number' && rating.toFixed ? rating.toFixed(1) : String(rating)
    }, [movie?.vote_average, movie?.liked_by_count])

  return (
    <div className='flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:translate-y-1 transition duration-300 w-61'>
        <img onClick={()=> {navigate(`/movies/${movie.id}`); scrollTo(0,0)}}
            src={movie.poster_url || movie.backdrop_path || 'https://via.placeholder.com/400x300?text=No+Image'} alt={movie?.title || 'Movie'} className='rounded-lg h-52 w-full object-cover object-right-bottom cursor-pointer' />

            <p className='font-semibold mt-2 truncate'>{movie.title}</p>

            <p className='text-sm text-gray-400 mt-2'>
                {year}{year && (genresDisplay || runtimeDisplay) ? ' · ' : ''}
                {genresDisplay}{genresDisplay && runtimeDisplay ? ' · ' : ''}
                {runtimeDisplay}
            </p>

            <div className='flex items-center justify-between mt-4 pb-3'>
                <button onClick={()=>{navigate(`/movies/${movie.id}`); scrollTo(0,0)}} className='px-4 py-2 text-xs bg-[var(--color-primary)] hover:bg-[var(--color-primary-dull)] 
                transition rounded-full font-medium cursor-pointer'>
                Buy Tickets
                </button>
                <p className='flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1'>
                    <StarIcon className='w-4 h-4 text-primary fill-primary'/>
                    {ratingDisplay}
                </p>
            </div>

    </div>
  )
}

export default MovieCard