import { ArrowRightIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BlurCircle from './BlurCircle'
import MovieCard from './MovieCard'
import { movieService } from '../services'

const FeaturedSection = () => {
    const navigate = useNavigate()
    const [movies, setMovies] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      const load = async () => {
        try {
          setLoading(true)
          const resp = await movieService.getMoviesRequest(1, 9)
          setMovies(resp.data?.data || [])
        } catch (e) {
          setMovies([])
        } finally {
          setLoading(false)
        }
      }
      load()
    }, [])

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden'>

        <div className='relative flex items-center justify-between pt-20 pb-10'>
            <BlurCircle top='0' right= '-80px'/>
            <p className='text-gray-300 font-medium text-lg'>Now Showing</p>
            <button onClick={()=>navigate('/movies') } className='group flex items-center gap-2 text-sm text-gray-300 cursor-pointer'>
                View All 
                <ArrowRightIcon className='group-hover:translate-x-0.5 transition w-4.5 h-4.5'/>
            </button>
        </div>

        <div className='flex flex-wrap justify-center gap-8 mt-8'>
            {loading ? (
              <div className='text-gray-400'>Loading...</div>
            ) : (
              movies.map((movie)=>(
                <MovieCard key={movie.id || movie.title} movie={movie}/>
              ))
            )}
        </div>

        <div className='flex justify-center mt-20'>
            <button onClick={()=>{navigate('/movies'); scrollTo(0,0)}} 
                    className='px-10 py-3 text-sm bg-[var(--color-primary)] hover:bg-[var(--color-primary-dull)] cursor-pointer'>
                    Show more
            </button>
        </div>

    </div>
  )
}

export default FeaturedSection
