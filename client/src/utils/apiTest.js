import { checkApiConnection } from '../lib/api';
import * as movieService from '../services/movieService';
import * as authService from '../services/authService';

// Test API connection and services
export const testApiServices = async () => {
  console.log('🧪 Testing API Services...');
  
  try {
    // Test 1: Check API connection
    console.log('1. Testing API connection...');
    const isConnected = await checkApiConnection();
    console.log(isConnected ? '✅ API connection successful' : '❌ API connection failed');
    
    if (!isConnected) {
      console.error('❌ Cannot proceed with service tests - API not reachable');
      return false;
    }
    
    // Test 2: Test movies service (public endpoint)
    console.log('2. Testing movies service (public endpoint)...');
    try {
      const moviesResponse = await movieService.getMoviesRequest(1, 5);
      console.log('✅ Movies service working:', moviesResponse.data);
    } catch (error) {
      console.log('❌ Movies service failed:', error.message);
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', error.response.data);
      }
    }
    
    // Test 3: Test auth service (should return 401 without token)
    console.log('3. Testing auth service (expecting 401 without token)...');
    try {
      await authService.getMeRequest();
      console.log('⚠️ Auth service returned success without token (unexpected)');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Auth service working correctly (401 as expected)');
      } else {
        console.log('❌ Auth service failed with unexpected error:', error.message);
        console.log('Response status:', error.response?.status);
        console.log('Response data:', error.response?.data);
      }
    }
    
    console.log('🎉 API Services test completed!');
    return true;
    
  } catch (error) {
    console.error('❌ API Services test failed:', error);
    return false;
  }
};

// Test specific service with detailed logging
export const testSpecificService = async (serviceName, testFunction) => {
  console.log(`🧪 Testing ${serviceName}...`);
  try {
    const result = await testFunction();
    console.log(`✅ ${serviceName} test passed:`, result);
    return { success: true, data: result };
  } catch (error) {
    console.log(`❌ ${serviceName} test failed:`, error.message);
    if (error.response) {
      console.log(`Response status: ${error.response.status}`);
      console.log(`Response data:`, error.response.data);
    }
    return { success: false, error: error.message, status: error.response?.status };
  }
};

// Test movies service specifically
export const testMoviesService = async () => {
  return testSpecificService('Movies Service', () => movieService.getMoviesRequest(1, 5));
};

// Test auth service specifically
export const testAuthService = async () => {
  return testSpecificService('Auth Service', () => authService.getMeRequest());
};

// Helper function to test specific service
export const testService = async (serviceName, testFunction) => {
  console.log(`🧪 Testing ${serviceName}...`);
  try {
    const result = await testFunction();
    console.log(`✅ ${serviceName} test passed:`, result);
    return true;
  } catch (error) {
    console.log(`❌ ${serviceName} test failed:`, error.message);
    return false;
  }
};

export default {
  testApiServices,
  testSpecificService,
  testMoviesService,
  testAuthService,
  testService,
};
