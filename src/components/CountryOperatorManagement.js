import React, { useState, useEffect } from 'react';
import { addCountryOperator, getCountryOperators } from '../services/api';

const CountryOperatorManagement = () => {
  const [country, setCountry] = useState('');
  const [operator, setOperator] = useState('');
  const [isHighPriority, setIsHighPriority] = useState(false);
  const [operators, setOperators] = useState([]);
  const [error, setError] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchOperators();
  }, []);

  const fetchOperators = async () => {
    try {
      setFetching(true);
      const response = await getCountryOperators();
      console.log('Fetched operators:', response.data); // Log data for debugging
      const operatorsData = Array.isArray(response.data) ? response.data : []; // Ensure response is an array
      setOperators(operatorsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching operators:', err);
      setError('Failed to fetch operators');
    } finally {
      setFetching(false);
    }
  };

  const handleAddOperator = async (e) => {
    e.preventDefault();
  
    // Check for duplicate entry
    const isDuplicate = operators.some(
      (op) => op.country === country && op.operator === operator
    );
  
    if (isDuplicate) {
      setError('This country-operator combination already exists.');
      return; // Exit the function if duplicate found
    }
  
    try {
      setAdding(true);
      const newOperator = { country, operator, is_high_priority: isHighPriority };
  
      // Add the operator through the API
      await addCountryOperator(newOperator);
  
      // Optimistically update the operators list in the state
      setOperators((prevOperators) => [...prevOperators, newOperator]);
  
      // Clear form fields
      setCountry('');
      setOperator('');
      setIsHighPriority(false);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error adding operator:', err);
      setError('Failed to add operator');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Country-Operator Management</h2>
      
      <form onSubmit={handleAddOperator} className="mb-6">
        <div className="grid grid-cols-1 gap-4 mb-4">
          <input
            type="text"
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Operator"
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            required
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isHighPriority}
              onChange={(e) => setIsHighPriority(e.target.checked)}
              className="mr-2"
            />
            <span className="text-gray-700">High Priority</span>
          </label>
        </div>
        <button type="submit" disabled={adding} className={`w-full px-4 py-2 text-white rounded-md ${adding ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
          {adding ? 'Adding...' : 'Add Operator'}
        </button>
      </form>

      {error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">{error}</div>}

      <h3 className="text-2xl font-semibold mb-4">Existing Operators</h3>
      {fetching ? (
        <div className="text-center text-gray-500">Loading operators...</div>
      ) : (
        <ul className="list-disc pl-5">
          {operators.length > 0 ? (
            operators.map((op, idx) => (
              <li key={idx} className="flex justify-between items-center p-2 border-b border-gray-200">
                <span className="text-gray-800">{op.country} - {op.operator}</span>
                <span className={`px-2 py-1 text-xs font-bold text-white rounded-md ${op.is_high_priority ? 'bg-red-500' : 'bg-green-500'}`}>
                  {op.is_high_priority ? "High Priority" : "Normal"}
                </span>
              </li>
            ))
          ) : (
            <p className="text-gray-500">No operators found.</p>
          )}
        </ul>
      )}
    </div>
  );
};

export default CountryOperatorManagement;
