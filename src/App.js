import React from 'react'; 
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import SMSForm from './components/SMSForm';
import ProcessControl from './components/ProcessControl';
import CountryOperatorManagement from './components/CountryOperatorManagement';
import DBConnectionTest from './components/DBConnectionTest';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-blue-300 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-8">SMS Management System</h1>
      
      <Router>
        <nav className="bg-blue-600 text-white w-full md:w-3/4 lg:w-1/2 rounded-lg shadow-md mb-8">
          <ul className="flex justify-around py-4">
            <li className="hover:bg-blue-700 px-4 py-2 rounded">
              <Link to="/send-sms">Send SMS</Link>
            </li>
            <li className="hover:bg-blue-700 px-4 py-2 rounded">
              <Link to="/process-control">Process Control</Link>
            </li>
            <li className="hover:bg-blue-700 px-4 py-2 rounded">
              <Link to="/country-operator-management">Country Operator Management</Link>
            </li>
            <li className="hover:bg-blue-700 px-4 py-2 rounded">
              <Link to="/db-connection-test">DB Connection Test</Link>
            </li>
          </ul>
        </nav>
        
        <div className="bg-white w-full md:w-3/4 lg:w-1/2 rounded-lg shadow-lg p-8">
          <Routes>
            <Route path="/" element={<SMSForm />} />
            <Route path="/send-sms" element={<SMSForm />} />
            <Route path="/process-control" element={<ProcessControl />} />
            <Route path="/country-operator-management" element={<CountryOperatorManagement />} />
            <Route path="/db-connection-test" element={<DBConnectionTest />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
