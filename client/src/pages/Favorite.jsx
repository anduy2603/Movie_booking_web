import React, { useEffect, useState } from 'react'
import { favoriteService } from '../services'
import { useAuth } from '../hooks/useAuth'
import MovieCard from '../components/MovieCard'
import BlurCircle from '../components/BlurCircle'
import Loading from '../components/Loading'
import { toast } from 'react-hot-toast'
import { Heart } from 'lucide-react'

const Favorite = () => {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  const loadFavorites = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await favoriteService.getUserFavoritesRequest(user.id)
      console.log('Favorites API response:', response)
      
      // FastAPI với response_model=List[MovieRead] trả về array trực tiếp trong response.data
      const favoritesData = Array.isArray(response.data) ? response.data : []
      
      console.log('Parsed favorites:', favoritesData)
      console.log('Number of favorites:', favoritesData.length)
      setFavorites(favoritesData)
    } catch (error) {
      console.error('Failed to load favorites:', error)
      console.error('Error details:', error.response?.data || error.message)
      toast.error('Failed to load favorite movies')
      setFavorites([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFavorites()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleRemoveFavorite = async (movieId) => {
    if (!user) return
    
    try {
      await favoriteService.toggleFavoriteRequest(user.id, movieId)
      toast.success('Removed from favorites')
      // Reload favorites after removal
      await loadFavorites()
    } catch (error) {
      console.error('Failed to remove favorite:', error)
      toast.error('Failed to remove from favorites')
    }
  }

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
        <>
          <div className='mb-4 text-gray-400 text-sm'>
            Total: {favorites.length} {favorites.length === 1 ? 'movie' : 'movies'} in favorites
          </div>
          <div className='flex flex-wrap max-sm:justify-center gap-8'>
            {favorites.map((movie) => (
              <div key={movie.id} className='relative group'>
                <MovieCard movie={movie} />
                <button
                  onClick={() => handleRemoveFavorite(movie.id)}
                  className='absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 shadow-lg'
                  title='Remove from favorites'
                >
                  <Heart className='w-4 h-4 fill-white text-white' />
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className='flex flex-col items-center justify-center h-[50vh]'>
          <Heart className='w-16 h-16 text-gray-600 mb-4' />
          <h2 className='text-xl text-gray-400 text-center mb-4'>No favorite movies yet</h2>
          <p className='text-gray-500 text-center max-w-md'>
            Start adding movies to your favorites by clicking the heart icon (<Heart className='w-4 h-4 inline fill-primary text-primary' />) on movie details page!
          </p>
        </div>
      )}
    </div>
  )
}

export default Favorite