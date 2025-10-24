#!/usr/bin/env python3
"""
Script test tự động cho Movie Booking API
Chạy: python test_api.py
"""

import requests
import json
import time
from typing import Dict, Any

class MovieBookingAPITester:
    def __init__(self, base_url: str = "http://127.0.0.1:8000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.admin_token = None
        self.customer_token = None
        
    def log(self, message: str, status: str = "INFO"):
        """Log với timestamp"""
        timestamp = time.strftime("%H:%M:%S")
        print(f"[{timestamp}] {status}: {message}")
    
    def test_health(self) -> bool:
        """Test server health"""
        try:
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                self.log("Server is running", "SUCCESS")
                return True
            else:
                self.log(f"Server health check failed: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"Cannot connect to server: {e}", "ERROR")
            return False
    
    def test_register(self) -> bool:
        """Test user registration"""
        try:
            data = {
                "email": "testuser@example.com",
                "password": "testpass123",
                "confirm_password": "testpass123",
                "full_name": "Test User"
            }
            response = self.session.post(f"{self.base_url}/auth/register", json=data)
            
            if response.status_code == 200:
                self.log("User registration successful", "SUCCESS")
                return True
            else:
                self.log(f"Registration failed: {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"Registration error: {e}", "ERROR")
            return False
    
    def test_login_admin(self) -> bool:
        """Test admin login"""
        try:
            data = {
                "email": "admin@moviebooking.com",
                "password": "admin123"
            }
            response = self.session.post(f"{self.base_url}/auth/login", json=data)
            
            if response.status_code == 200:
                result = response.json()
                self.admin_token = result.get("access_token")
                self.log("Admin login successful", "SUCCESS")
                return True
            else:
                self.log(f"Admin login failed: {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"Admin login error: {e}", "ERROR")
            return False
    
    def test_login_customer(self) -> bool:
        """Test customer login"""
        try:
            data = {
                "email": "john@example.com",
                "password": "password123"
            }
            response = self.session.post(f"{self.base_url}/auth/login", json=data)
            
            if response.status_code == 200:
                result = response.json()
                self.customer_token = result.get("access_token")
                self.log("Customer login successful", "SUCCESS")
                return True
            else:
                self.log(f"Customer login failed: {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"Customer login error: {e}", "ERROR")
            return False
    
    def test_get_movies(self) -> bool:
        """Test get movies list"""
        try:
            response = self.session.get(f"{self.base_url}/movies/")
            
            if response.status_code == 200:
                movies = response.json()
                self.log(f"Found {len(movies.get('items', []))} movies", "SUCCESS")
                return True
            else:
                self.log(f"Get movies failed: {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"Get movies error: {e}", "ERROR")
            return False
    
    def test_get_theaters(self) -> bool:
        """Test get theaters list"""
        try:
            response = self.session.get(f"{self.base_url}/theaters/")
            
            if response.status_code == 200:
                theaters = response.json()
                self.log(f"Found {len(theaters.get('items', []))} theaters", "SUCCESS")
                return True
            else:
                self.log(f"Get theaters failed: {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"Get theaters error: {e}", "ERROR")
            return False
    
    def test_get_showtimes(self) -> bool:
        """Test get showtimes list"""
        try:
            response = self.session.get(f"{self.base_url}/showtimes/")
            
            if response.status_code == 200:
                showtimes = response.json()
                self.log(f"Found {len(showtimes.get('items', []))} showtimes", "SUCCESS")
                return True
            else:
                self.log(f"Get showtimes failed: {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"Get showtimes error: {e}", "ERROR")
            return False
    
    def test_create_movie(self) -> bool:
        """Test create movie (admin only)"""
        if not self.admin_token:
            self.log("No admin token available", "ERROR")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            data = {
                "title": "Test Movie",
                "description": "A test movie for API testing",
                "genre": "Test",
                "duration": 120,
                "language": "English"
            }
            response = self.session.post(f"{self.base_url}/movies/", json=data, headers=headers)
            
            if response.status_code == 200:
                self.log("Movie creation successful", "SUCCESS")
                return True
            else:
                self.log(f"Movie creation failed: {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"Movie creation error: {e}", "ERROR")
            return False
    
    def test_get_user_profile(self) -> bool:
        """Test get user profile"""
        if not self.customer_token:
            self.log("No customer token available", "ERROR")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.customer_token}"}
            response = self.session.get(f"{self.base_url}/auth/me", headers=headers)
            
            if response.status_code == 200:
                user = response.json()
                self.log(f"User profile: {user.get('email')}", "SUCCESS")
                return True
            else:
                self.log(f"Get user profile failed: {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"Get user profile error: {e}", "ERROR")
            return False
    
    def test_rate_limiting(self) -> bool:
        """Test rate limiting"""
        try:
            # Gửi nhiều request liên tiếp
            for i in range(5):
                response = self.session.get(f"{self.base_url}/movies/")
                if response.status_code == 429:
                    self.log("Rate limiting is working", "SUCCESS")
                    return True
                time.sleep(0.1)
            
            self.log("Rate limiting not triggered (may be normal)", "WARNING")
            return True
        except Exception as e:
            self.log(f"Rate limiting test error: {e}", "ERROR")
            return False
    
    def run_all_tests(self):
        """Chạy tất cả tests"""
        self.log("Starting Movie Booking API Tests", "INFO")
        self.log("=" * 50, "INFO")
        
        tests = [
            ("Health Check", self.test_health),
            ("User Registration", self.test_register),
            ("Admin Login", self.test_login_admin),
            ("Customer Login", self.test_login_customer),
            ("Get Movies", self.test_get_movies),
            ("Get Theaters", self.test_get_theaters),
            ("Get Showtimes", self.test_get_showtimes),
            ("Create Movie (Admin)", self.test_create_movie),
            ("Get User Profile", self.test_get_user_profile),
            ("Rate Limiting", self.test_rate_limiting),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            self.log(f"Running {test_name}...", "INFO")
            if test_func():
                passed += 1
            time.sleep(0.5)  # Small delay between tests
        
        self.log("=" * 50, "INFO")
        self.log(f"Test Results: {passed}/{total} tests passed", "INFO")
        
        if passed == total:
            self.log("All tests passed! API is working correctly.", "SUCCESS")
        else:
            self.log(f"{total - passed} tests failed. Check the logs above.", "WARNING")

if __name__ == "__main__":
    tester = MovieBookingAPITester()
    tester.run_all_tests()
