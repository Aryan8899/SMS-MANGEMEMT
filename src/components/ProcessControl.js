import React, { useState } from 'react';
import { startSession, stopSession, restartSession } from '../services/api';

const ProcessControl = () => {
  const [sessionName, setSessionName] = useState('');
  const [programName, setProgramName] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAction = async (action, handler) => {
    setIsLoading(true);
    setError('');
    try {
      // Validate input before making the request
      if (!sessionName || !programName) {
        throw new Error('Session name and program name are required');
      }

      const response = await handler({
        session_name: sessionName,
        program_name: programName
      });
      console.log(`Sending request to ${action}:`, response);

      // Verify we have a valid response
      if (!response || !response.data) {
        throw new Error('No response received from server');
      }

      let statusMessage = '';
      if (action === 'start' || action === 'restart') {
        console.log("Process Info:", response.data.process_info);

        // Verify process_info exists and has pid before accessing
        if (!response.data.process_info?.pid) {
          throw new Error('Invalid process information received');
        }

        // Access the PID value directly from the process_info object
        let pid = response.data.process_info.pid;
        if (typeof pid === 'object') {
          pid = pid.value || JSON.stringify(pid); // Adjust according to the actual structure
        }
        statusMessage = `${action === 'start' ? 'Started' : 'Restarted'} program with PID: ${pid}`;
      } else {
        statusMessage = response.message || 'Program stopped successfully';
      }

      setStatus(statusMessage);
      setError('');
    } catch (error) {
      setError(`Failed to ${action} program: ${error.message}`);
      setStatus('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Process Control</h2>
      
      <div className="space-y-4 mb-6">
        <input
          type="text"
          placeholder="Session Name"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <input
          type="text"
          placeholder="Program Name"
          value={programName}
          onChange={(e) => setProgramName(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      <div className="flex space-x-9 mb-6">
        <button
          onClick={() => handleAction('start', startSession)}
          disabled={isLoading || !sessionName || !programName}
          className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Starting...' : 'Start'}
        </button>
        <button
          onClick={() => handleAction('stop', stopSession)}
          disabled={isLoading || !sessionName}
          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Stopping...' : 'Stop'}
        </button>
        <button
          onClick={() => handleAction('restart', restartSession)}
          disabled={isLoading || !sessionName || !programName}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Restarting...' : 'Restart'}
        </button>
      </div>

      {status && (
        <div className="p-4 bg-green-100 rounded-md mb-4">
          <p className="text-green-700">✓ {status}</p>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-100 rounded-md">
          <p className="text-red-700">✗ {error}</p>
        </div>
      )}
    </div>
  );
};

export default ProcessControl;
