import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({ baseURL: BASE })

export const submitTicket = (ticket) => api.post('/api/analyze', ticket)
export const getReport    = (jobId)  => api.get(`/api/report/${jobId}`)
export const getJobs      = ()       => api.get('/api/jobs')
export const indexCodebase = (path)  => api.post('/api/index-codebase', { path })

export default api
