import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { movieService, showtimeService, favoriteService } from '../services';
import BlurCircle from '../components/BlurCircle';
import { Heart, PlayCircleIcon, StarIcon } from 'lucide-react';
import timeFormat from '../lib/timeFormat';
import DateSelect from '../components/DateSelect';
import MovieCard from '../components/MovieCard';
import Loading from '../components/Loading';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const MovieDetails = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFavorite, setIsFavorite] = useState(false);
  const [similarMovies, setSimilarMovies] = useState([]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const [movieResponse, showtimesResponse] = await Promise.all([
        movieService.getMovieByIdRequest(id),
        showtimeService.getShowtimesRequest(id, selectedDate)
      ]);

      setMovie(movieResponse.data);
      setShowtimes(showtimesResponse.data);

      // Check if movie is in user's favorites
      if (user) {
        try {
          const favoriteResponse = await favoriteService.checkFavoriteRequest(id);
          setIsFavorite(favoriteResponse.data.isFavorite);
        } catch (error) {
          console.error('Error checking favorite status:', error);
        }
      }

    } catch (error) {
      toast.error('Failed to load movie details');
      console.error('Error fetching movie details:', error);
      navigate('/movies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovieDetails();
  }, [id, selectedDate]);

  return show ? (
    <div className='px-6 md:px-16 lg:px-40 pt-30 md:pt-50'>
       <div className='flex flex-col md:flex-row gap-8 max-w-6xl mx-auto'>

          <img src={show.movie.poster_path} alt="" className='max-md:mx-auto rounded-xl h-104 max-w-70 object-cover' />
          
          <div className='relative flex flex-col gap-3'>
            <BlurCircle top='-100px' left='-100px'/>
            <p className='text-primary'>ENGLISH</p>
            <h1 className='text-4xl font-semibold max-w-96 text-balance'>{show.movie.title}</h1>
            <div className='flex items-center gap-2 text-gray-300'>
              <StarIcon className='w-5 h-5 text-primary fill-primary'/>
              {show.movie.vote_average.toFixed(1)} User Rating
            </div>
            <p className='text-gray-400 mt-2 text-sm leading-tight max-w-xl'>{show.movie.overview}</p>
            
            <p>
              {timeFormat(movie.runtime)} · {movie.genres.map(genre => genre.name).join(", ")} · {movie.release_date.split("-")[0]}
            </p>

            <div className='flex items-center gap-4 mt-4'>
              <button 
                className='flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90'
                onClick={() => document.querySelector('#showtimes').scrollIntoView({ behavior: 'smooth' })}
              >
                Book Tickets
              </button>
              
              {user && (
                <button 
                  onClick={async () => {
                    try {
                      if (isFavorite) {
                        await favoriteService.removeFavoriteRequest(id);
                        toast.success('Removed from favorites');
                      } else {
                        await favoriteService.addFavoriteRequest(id);
                        toast.success('Added to favorites');
                      }
                      setIsFavorite(!isFavorite);
                    } catch (error) {
                      toast.error('Failed to update favorites');
                    }
                  }}
                  className='p-3 rounded-lg border border-gray-700 hover:border-primary'
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-primary text-primary' : ''}`} />
                </button>
              )}
            </div>

            <div id="showtimes" className='mt-12'>
              <h2 className='text-2xl font-semibold mb-4'>Select Date & Showtime</h2>
              <DateSelect 
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />

              <div className='mt-6'>
                {showtimes.length > 0 ? (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {showtimes.map(showtime => (
                      <div 
                        key={showtime.id}
                        className='p-4 rounded-lg border border-gray-700 hover:border-primary cursor-pointer'
                        onClick={() => navigate(`/booking/${showtime.id}`)}
                      >
                        <p className='font-semibold'>{new Date(showtime.start_time || showtime.startTime).toLocaleTimeString()}</p>
                        <p className='text-sm text-gray-400'>{showtime.theater?.name || showtime.theater_name || ''}</p>
                        <p className='text-sm text-gray-400'>{showtime.theater?.location || ''}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-gray-400'>No showtimes available for this date.</p>
                )}
              </div>
            </div>

            <div className='flex items-center flex-wrap gap-4 mt-4'>
              <button className='flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 
              hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95'>
                <PlayCircleIcon className='w-5 h-5'/>
                Watch Trailer
              </button>
              <a href="#dateSelect" className='px-10 py-3 text-sm bg-[var(--color-primary)] 
              hover:bg-[var(--color-primary-dull)] transition rounded-md font-medium cursor-pointer active:scale-95'>Buy Tickets</a>
              <button className='bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95'>
                <Heart className={`w-5 h-5`}/>
              </button>
            </div>
          </div>
        </div>
          
      <p className='text-lg font-medium mt-20'>Your Favorite Cast</p>
      <div className='overflow-x-auto no-scrollbar mt-8 pb-4'>
        <div className='flex items-center gap-4 w-max px-4'>
          {show.movie.casts.slice(0,12).map((cast, index)=>(
            <div key={index} className='flex flex-col items-center text-center'>
              <img src={cast.profile_path} alt="" className='rounded-full h-20 md:h-20 aspect-square object-cover' />
              <p className='font-medium text-xs mt-3'>{cast.name}</p>
            </div>
          ))}
        </div>
      </div>  

      <DateSelect dateTime={show.dateTime} id={id}/>   

      <p className='text-lg font-medium mt-20 mb-8'>You May Also Like </p>

      <div className='flex flex-wrap max-sm:justify-center gap-8'>
          {dummyShowsData.slice(0,4).map((movie, index)=>(
            <MovieCard key={index} movie={movie}/>
          ))}
      </div> 

      <div className='flex justify-center mt-20'>
          <button onClick={()=> {navigate('/movies'); scrollTo(0,0)}} className='px-10 py-3 text-sm bg-[var(--color-primary)] hover:bg-[var(--color-primary-dull)] transition rounded-md font-medium cursor-pointer'>
            Show more
          </button>
      </div>

    </div>
  ) : <Loading/>
}

export default MovieDetails

