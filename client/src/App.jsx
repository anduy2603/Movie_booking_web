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
import ApiTestPanel from "./components/ApiTestPanel";
import ErrorBoundary from "./components/ErrorBoundary";


const App = () =>{

  const isAdminRoute = useLocation().pathname.startsWith('/admin')

  return(
    <ErrorBoundary>
      <AuthProvider>
        <Toaster/>
        {!isAdminRoute && <Navbar/>}
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/movies" element={<Movies/>} />
          <Route path="/movies/:id" element={<MovieDetails/>} />
          <Route path="/movies/:id/:date" element={
            <ProtectedRoute>
              <SeatLayout/>
            </ProtectedRoute>
          } />
          <Route path="/my-bookings" element={
            <ProtectedRoute>
              <MyBookings/>
            </ProtectedRoute>
          } />
          <Route path="/favorite" element={
            <ProtectedRoute>
              <Favorite/>
            </ProtectedRoute>
          } />
        </Routes>
        {!isAdminRoute && <Footer/>}
        <ApiTestPanel />
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App 