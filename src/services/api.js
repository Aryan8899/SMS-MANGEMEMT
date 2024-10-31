import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    // Add withCredentials if you're using cookies/sessions
    withCredentials: true,
  });
  
// API Endpoints
export const sendSMS = (data) => api.post('/send_sms/', data);
export const startSession = (data) => api.post('/start_program/', data);
export const stopSession = (data) => api.post('/stop_program/', data);
export const restartSession = (data) => api.post('/restart_program/', data);
export const addCountryOperator = (data) => api.post('/add_country_operator/', data);
export const getCountryOperators = () => api.get('/country_operators/');
export const testDBConnection = () => api.get('/test_db_connection/');
