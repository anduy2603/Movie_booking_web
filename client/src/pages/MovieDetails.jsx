import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { movieService, showtimeService, favoriteService, theaterService, roomService } from '../services';
import BlurCircle from '../components/BlurCircle';
import { Heart, PlayCircleIcon, StarIcon } from 'lucide-react';
import timeFormat from '../lib/timeFormat';
// Replaced custom DateSelect with native date input for stability
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
  const [selectedShowtimeId, setSelectedShowtimeId] = useState(null);
  // const [similarMovies, setSimilarMovies] = useState([]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const [movieResponse, showtimesResponse] = await Promise.all([
        movieService.getMovieByIdRequest(id),
        // Fetch showtimes by movie (paginate generously and filter by date on client)
        showtimeService.getShowtimesByMovieRequest(id, 1, 100)
      ]);

      setMovie(movieResponse.data);
      setShowtimes(showtimesResponse.data?.data || []);

      // Check if movie is in user's favorites
      if (user) {
        try {
          const favList = await favoriteService.getUserFavoritesRequest(user.id);
          const list = favList?.data || [];
          setIsFavorite(Array.isArray(list) && list.some((m) => String(m.id) === String(id)));
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

  // Theater selection only (rooms are admin-defined inside showtimes)
  const [theaters, setTheaters] = useState([]);
  const [selectedTheaterId, setSelectedTheaterId] = useState('');
  const [theaterRoomIds, setTheaterRoomIds] = useState(new Set());

  useEffect(() => {
    const loadTheaters = async () => {
      try {
        const resp = await theaterService.getTheatersRequest(1, 100);
        setTheaters(resp.data?.data || []);
      } catch {
        setTheaters([]);
      }
    };
    loadTheaters();
  }, []);

  useEffect(() => {
    const loadRooms = async () => {
      if (!selectedTheaterId) { setTheaterRoomIds(new Set()); return; }
      try {
        const resp = await roomService.getRoomsByTheaterRequest(selectedTheaterId, 1, 100);
        const ids = new Set((resp.data?.data || []).map(r => r.id));
        setTheaterRoomIds(ids);
      } catch {
        setTheaterRoomIds(new Set());
      }
    };
    loadRooms();
  }, [selectedTheaterId]);

  const filteredShowtimes = useMemo(() => {
    if (!Array.isArray(showtimes)) return [];
    const day = selectedDate.toDateString();
    return showtimes.filter((s) => {
      const dt = new Date(s.start_time || s.startTime);
      const sameDay = dt.toDateString() === day;
      const theaterMatch = selectedTheaterId ? theaterRoomIds.has(s.room_id) : true;
      return sameDay && theaterMatch;
    });
  }, [showtimes, selectedDate, selectedTheaterId, theaterRoomIds]);

  // Format time to HH:MM (24-hour format)
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  if (loading) return <Loading/>;
  if (!movie) return null;

  return (
    <div className='px-6 md:px-16 lg:px-40 pt-30 md:pt-50'>
       <div className='flex flex-col md:flex-row gap-8 max-w-6xl mx-auto'>

         <img src={movie.poster_path || movie.poster_url} alt={movie.title} className='max-md:mx-auto rounded-xl h-104 max-w-70 object-cover' />
          
          <div className='relative flex flex-col gap-3'>
            <BlurCircle top='-100px' left='-100px'/>
            <p className='text-primary'>ENGLISH</p>
           <h1 className='text-4xl font-semibold max-w-96 text-balance'>{movie.title}</h1>
           <p className='text-gray-400 mt-2 text-sm leading-tight max-w-xl'>{movie.description || movie.overview || 'No description available'}</p>
            
            <p>
             {timeFormat(movie.runtime || movie.duration)} · {Array.isArray(movie.genres) ? movie.genres.map(genre => genre.name || genre).join(", ") : (movie.genre || '')} · {(movie.release_date || '').split("-")[0]}
            </p>

            <div id="showtimes" className='mt-12'>
              <h2 className='text-2xl font-semibold mb-4'>Select Date & Theater</h2>
              <input
                type='date'
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => {
                  const parts = e.target.value.split('-')
                  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
                  setSelectedDate(d)
                }}
                className='px-4 py-2 rounded-lg bg-gray-800 border border-gray-700'
              />

              {/* Theater filter (no room selection) */}
              <div className='flex gap-4 mt-4'>
                <select
                  value={selectedTheaterId}
                  onChange={(e) => setSelectedTheaterId(e.target.value)}
                  className='px-4 py-2 rounded-lg bg-gray-800 border border-gray-700'
                >
                  <option value=''>All Theaters</option>
                  {theaters.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className='mt-6'>
                {filteredShowtimes.length > 0 ? (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {filteredShowtimes.map(showtime => {
                      const isSelected = selectedShowtimeId === showtime.id;
                      return (
                        <button
                          key={showtime.id}
                          className={`p-4 rounded-lg border text-left w-full transition-all ${
                            isSelected
                              ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                              : 'bg-gray-800 border-gray-700 text-white hover:border-gray-600'
                          }`}
                          onClick={() => {
                            setSelectedShowtimeId(showtime.id);
                            navigate(`/booking/${showtime.id}`);
                          }}
                        >
                          <p className='font-semibold text-lg'>{formatTime(showtime.start_time || showtime.startTime)}</p>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className='text-gray-400'>No showtimes available for this date.</p>
                )}
              </div>
            </div>

            <div className='flex items-center flex-wrap gap-4 mt-4'>
              {movie.trailer_url && (
                <button 
                  onClick={() => window.open(movie.trailer_url, '_blank')}
                  className='flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 
                  hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95'
                >
                  <PlayCircleIcon className='w-5 h-5'/>
                  Watch Trailer
                </button>
              )}
              <button
                onClick={() => {
                  const dateISO = selectedDate.toISOString().split('T')[0]
                  const theaterQS = selectedTheaterId ? `?theater=${selectedTheaterId}` : ''
                  navigate(`/movies/${id}/${dateISO}${theaterQS}`)
                }}
                className='px-10 py-3 text-sm bg-[var(--color-primary)] 
              hover:bg-[var(--color-primary-dull)] transition rounded-md font-medium cursor-pointer active:scale-95'
              >
                Buy Tickets
              </button>
              {user && (
                <button 
                  onClick={async () => {
                    try {
                      await favoriteService.toggleFavoriteRequest(user.id, id);
                      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
                      setIsFavorite(!isFavorite);
                    } catch (error) {
                      console.error('Failed to update favorites:', error);
                      toast.error('Failed to update favorites');
                    }
                  }}
                  className='bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95 hover:bg-gray-600'
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-primary text-primary' : ''}`}/>
                </button>
              )}
            </div>
          </div>
        </div>
          
      {/* Additional sections can be added here (cast, recommendations) when data is available */}

    </div>
  )
}

export default MovieDetails

