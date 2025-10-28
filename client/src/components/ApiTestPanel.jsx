import React, { useState } from 'react';
import { testApiServices } from '../utils/apiTest';
import { checkApiConnection } from '../lib/api';

const ApiTestPanel = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [detailedLogs, setDetailedLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    setDetailedLogs(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const handleTestApi = async () => {
    setIsTesting(true);
    setTestResults(null);
    setDetailedLogs([]);
    
    addLog('🧪 Starting API Services test...', 'info');
    
    try {
      const results = await testApiServices();
      addLog(results ? '✅ All tests completed successfully' : '❌ Some tests failed', results ? 'success' : 'error');
      
      setTestResults({
        success: results,
        message: results ? 'All services working correctly' : 'Some services failed - check console for details',
        timestamp: new Date().toLocaleString()
      });
    } catch (error) {
      addLog(`❌ Test failed: ${error.message}`, 'error');
      setTestResults({
        success: false,
        error: error.message,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setDetailedLogs([]);
    addLog('🔗 Testing API connection...', 'info');
    
    try {
      const isConnected = await checkApiConnection();
      addLog(isConnected ? '✅ API connection successful' : '❌ API connection failed', isConnected ? 'success' : 'error');
      
      setTestResults({
        success: isConnected,
        message: isConnected ? 'API server is reachable' : 'Cannot connect to API server',
        timestamp: new Date().toLocaleString()
      });
    } catch (error) {
      addLog(`❌ Connection error: ${error.message}`, 'error');
      setTestResults({
        success: false,
        error: error.message,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setIsTesting(false);
    }
  };

  const clearLogs = () => {
    setDetailedLogs([]);
    setTestResults(null);
  };

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold">🔧 API Test Panel</h3>
        <button 
          onClick={clearLogs}
          className="text-xs text-gray-400 hover:text-white"
        >
          Clear
        </button>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={handleTestConnection}
          disabled={isTesting}
          className="w-full px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded"
        >
          {isTesting ? 'Testing...' : 'Test Connection'}
        </button>
        
        <button
          onClick={handleTestApi}
          disabled={isTesting}
          className="w-full px-3 py-1 text-xs bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded"
        >
          {isTesting ? 'Testing...' : 'Test All Services'}
        </button>
      </div>

      {detailedLogs.length > 0 && (
        <div className="mt-3 pt-2 border-t border-gray-600 max-h-32 overflow-y-auto">
          <div className="text-xs text-gray-400 mb-1">Logs:</div>
          {detailedLogs.map((log, index) => (
            <div key={index} className={`text-xs ${log.type === 'success' ? 'text-green-400' : log.type === 'error' ? 'text-red-400' : 'text-gray-300'}`}>
              [{log.timestamp}] {log.message}
            </div>
          ))}
        </div>
      )}

      {testResults && (
        <div className="mt-3 pt-2 border-t border-gray-600">
          <div className={`text-xs ${testResults.success ? 'text-green-400' : 'text-red-400'}`}>
            {testResults.success ? '✅' : '❌'} {testResults.message || testResults.error}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {testResults.timestamp}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiTestPanel;
