import React from "react";
import Navbar from "./components/Navbar";
import { Routes,Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import SeatLayout from "./pages/SeatLayout";
import MovieDetails from "./pages/MovieDetails";
import Movies from "./pages/Movies";
import MyBookings from "./pages/MyBookings";
import Favorite from "./pages/Favorite";
import {Toaster} from 'react-hot-toast'
import Footer from "./components/Footer";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import AdminMovieForm from "./components/AdminMovieForm";
import AdminDashboard from "./components/AdminDashboard";
import AdminMovieList from "./components/AdminMovieList";
import AdminTheaterList from "./components/AdminTheaterList";
import AdminRoomList from "./components/AdminRoomList";
import UserProfile from "./components/UserProfile";
import AdminSettings from "./components/AdminSettings";
import AdminShowtimeList from "./components/AdminShowtimeList";
import AdminUserList from "./components/AdminUserList";


const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  // removed unused isAuthPage variable

  return(
    <ErrorBoundary>
      <AuthProvider>
        <Toaster/>
        {!isAdminRoute && <Navbar/>}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home/>} />
          <Route path="/movies" element={<Movies/>} />
          <Route path="/movies/:id" element={<MovieDetails/>} />

          {/* Protected User Routes */}
          <Route path="/movies/:id/:date" element={<ProtectedRoute><SeatLayout/></ProtectedRoute>} />
          <Route path="/booking/:id" element={<ProtectedRoute><SeatLayout/></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings/></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute><Favorite/></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><UserProfile/></ProtectedRoute>} />

          {/* Admin Routes (protected, nested) */}
          <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard/></ProtectedRoute>}>
            <Route index element={<AdminMovieList/>} />
            <Route path="movies" element={<AdminMovieList/>} />
            <Route path="theaters" element={<AdminTheaterList/>} />
            <Route path="rooms" element={<AdminRoomList/>} />
            <Route path="movies/add" element={<AdminMovieForm/>} />
            <Route path="movies/edit/:id" element={<AdminMovieForm/>} />
            <Route path="showtimes" element={<AdminShowtimeList/>} />
            <Route path="users" element={<AdminUserList/>} />
            <Route path="settings" element={<AdminSettings/>} />
          </Route>
        </Routes>
        {!isAdminRoute && <Footer/>}
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App 