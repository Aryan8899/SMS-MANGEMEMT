import React, { useState } from 'react';
import { testDBConnection } from '../services/api';

const DBConnectionTest = () => {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false); // State for loading

  const handleTestConnection = async () => {
    setIsLoading(true); // Set loading state to true
    setStatus(''); // Clear previous status
    try {
      const response = await testDBConnection();
      setStatus(`Connected to database: ${response.data.database}`);
    } catch (error) {
      setStatus('Failed to connect to database');
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Database Connection Test</h2>
      <button 
        onClick={handleTestConnection} 
        disabled={isLoading} 
        className={`w-full px-4 py-2 text-white rounded-md ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {isLoading ? 'Testing...' : 'Test Connection'}
      </button>
      {status && (
        <p className={`mt-4 text-center ${status.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
          {status}
        </p>
      )}
    </div>
  );
};

export default DBConnectionTest;
