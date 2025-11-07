# Services Documentation

## Overview
This directory contains all API service functions for connecting to the Movie Booking backend API.

## Services Available

### 🔐 AuthService (`authService.js`)
- `loginRequest(email, password)` - User login
- `registerRequest(userData)` - User registration  
- `getMeRequest()` - Get current user info
- `updateProfileRequest(userData)` - Update user profile
- `changePasswordRequest(currentPassword, newPassword)` - Change password
- `logoutRequest()` - User logout

### 🎬 MovieService (`movieService.js`)
- `getMoviesRequest(page, size)` - Get paginated movies list
- `getMovieByIdRequest(movieId)` - Get movie by ID
- `createMovieRequest(movieData)` - Create movie (admin only)
- `updateMovieRequest(movieId, movieData)` - Update movie (admin only)
- `deleteMovieRequest(movieId)` - Delete movie (admin only)
- `searchMoviesRequest(query, page, size)` - Search movies

### 🎫 BookingService (`bookingService.js`)
- `getBookingsRequest(page, size)` - Get all bookings (admin only)
- `getBookingByIdRequest(bookingId)` - Get booking by ID
- `getUserBookingsRequest(userId, page, size)` - Get user's bookings
- `createBookingRequest(bookingsData)` - Create booking(s)
- `createSingleBookingRequest(bookingData)` - Create single booking
- `cancelBookingRequest(bookingId)` - Cancel booking
- `deleteBookingRequest(bookingId)` - Delete booking

### ❤️ FavoriteService (`favoriteService.js`)
- `getUserFavoritesRequest(userId)` - Get user's favorite movies
- `toggleFavoriteRequest(userId, movieId)` - Toggle favorite status
- `addToFavoritesRequest(userId, movieId)` - Add to favorites
- `removeFromFavoritesRequest(userId, movieId)` - Remove from favorites

### 🏢 TheaterService (`theaterService.js`)
- `getTheatersRequest(page, size)` - Get paginated theaters list
- `getTheaterByIdRequest(theaterId)` - Get theater by ID
- `createTheaterRequest(theaterData)` - Create theater (admin only)
- `updateTheaterRequest(theaterId, theaterData)` - Update theater (admin only)
- `deleteTheaterRequest(theaterId)` - Delete theater (admin only)

### 🕐 ShowtimeService (`showtimeService.js`)
- `getShowtimesRequest(page, size)` - Get paginated showtimes list
- `getShowtimeByIdRequest(showtimeId)` - Get showtime by ID
- `getShowtimesByMovieRequest(movieId, page, size)` - Get showtimes by movie
- `createShowtimeRequest(showtimeData)` - Create showtime (admin only)
- `updateShowtimeRequest(showtimeId, showtimeData)` - Update showtime (admin only)
- `deleteShowtimeRequest(showtimeId)` - Delete showtime (admin only)

### 🪑 SeatService (`seatService.js`)
- `getAllSeatsRequest()` - Get all seats
- `getSeatByIdRequest(seatId)` - Get seat by ID
- `getSeatsByRoomRequest(roomId)` - Get seats by room
- `createSeatRequest(seatData)` - Create seat (admin only)
- `updateSeatRequest(seatId, seatData)` - Update seat (admin only)
- `deleteSeatRequest(seatId)` - Delete seat (admin only)

## Usage Examples

### Import Services
```javascript
// Import individual service
import { getMoviesRequest } from '../services/movieService';

// Import all services
import * as movieService from '../services/movieService';

// Import from index
import { movieService, authService } from '../services';
```

### Using in Components
```javascript
import React, { useState, useEffect } from 'react';
import { getMoviesRequest } from '../services/movieService';

const MoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await getMoviesRequest(1, 10);
        setMovies(response.data.data);
      } catch (error) {
        console.error('Failed to fetch movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // ... rest of component
};
```

## Error Handling
All services use the centralized error handling from `api.js`:
- Automatic error messages via toast notifications
- 401 errors automatically clear tokens and redirect
- Network errors show appropriate messages
- Validation errors display detailed messages

## API Configuration
Set your API base URL in `.env`:
```
VITE_API_BASE_URL=http://localhost:8000
```

## Testing
Use the backend test script `server/test_api.py` to test API endpoints:
```bash
cd server
python test_api.py
```
