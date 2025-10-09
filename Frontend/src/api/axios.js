import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/',
  headers: { 'Content-Type': 'application/json' },
  // Increased timeout for longer AI calls (2 minutes)
  timeout: 120000,
});

api.interceptors.response.use(
  res => res,
  err => {
    // Normalize error messages for UI consumers
    const serverError = err?.response?.data?.error || err?.response?.data || null
    const timedOut = err?.code === 'ECONNABORTED' || (err?.message && /timeout/i.test(err.message))
    const message = serverError || (timedOut ? 'Request timed out' : err?.message) || 'API Error'
    console.error('API Error:', serverError || err.message || err)
    // attach a normalized message property so callers can use it
    err.normalizedMessage = message
    return Promise.reject(err)
  }
)

export default api;
