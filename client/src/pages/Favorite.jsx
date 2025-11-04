import React, { useEffect, useState } from 'react'
import { favoriteService } from '../services'
import { useAuth } from '../hooks/useAuth'
import MovieCard from '../components/MovieCard'
import BlurCircle from '../components/BlurCircle'
import Loading from '../components/Loading'
import { toast } from 'react-hot-toast'

const Favorite = () => {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await favoriteService.getUserFavoritesRequest(user.id)
        setFavorites(response.data || [])
      } catch (error) {
        console.error('Failed to load favorites:', error)
        toast.error('Failed to load favorite movies')
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [user])

  if (!user) {
    return (
      <div className='flex flex-col items-center justify-center h-screen'>
        <h1 className='text-3xl font-bold text-center text-gray-400'>Please login to view your favorites</h1>
      </div>
    )
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className='relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>
      <BlurCircle top='150px' left='0'/>
      <BlurCircle bottom='50px' right='50px'/>

      <h1 className='text-2xl md:text-3xl font-bold my-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'>
        Your Favorite Movies
      </h1>

      {favorites.length > 0 ? (
        <div className='flex flex-wrap max-sm:justify-center gap-8'>
          {favorites.map((movie) => (
            <MovieCard movie={movie} key={movie.id} />
          ))}
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center h-[50vh]'>
          <h2 className='text-xl text-gray-400 text-center mb-4'>No favorite movies yet</h2>
          <p className='text-gray-500 text-center'>Start adding movies to your favorites by clicking the heart icon on movie details!</p>
        </div>
      )}
    </div>
  )
}

export default Favorite