import React, { useState } from 'react';
import { sendSMS } from '../services/api';

const SMSForm = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleSendSMS = async () => {
    try {
      const response = await sendSMS({ phone_number: phoneNumber, message });
      setStatus(`SMS sent successfully! SID: ${response.data.sid}`);
    } catch (error) {
      setStatus('Failed to send SMS');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-center text-blue-700 mb-6">Send SMS</h2>

      <label className="block text-gray-700 font-medium mb-2" htmlFor="phoneNumber">
        Phone Number
      </label>
      <input
        id="phoneNumber"
        type="text"
        placeholder="Enter phone number"
        className="border border-gray-300 p-3 rounded w-full mb-4 focus:outline-none focus:ring focus:ring-blue-300"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />

      <label className="block text-gray-700 font-medium mb-2" htmlFor="message">
        Message
      </label>
      <textarea
        id="message"
        placeholder="Enter your message"
        className="border border-gray-300 p-3 rounded w-full mb-4 focus:outline-none focus:ring focus:ring-blue-300"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        onClick={handleSendSMS}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full transition duration-200"
      >
        Send SMS
      </button>

      {status && (
        <p className={`mt-4 font-medium ${status.includes("successfully") ? 'text-green-600' : 'text-red-600'}`}>
          {status}
        </p>
      )}
    </div>
  );
};

export default SMSForm;
