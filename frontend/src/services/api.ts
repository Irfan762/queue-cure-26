import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  logout: () => apiClient.post('/auth/logout'),
}

export const queueAPI = {
  addPatient: (clinicId: string, patientName: string, priority: string = 'normal', phone?: string) =>
    apiClient.post('/queue/add-patient', { clinicId, patientName, priority, phone }),
  
  callNextToken: (clinicId: string) =>
    apiClient.post('/queue/call-next', { clinicId }),
  
  getQueueState: (clinicId: string) =>
    apiClient.get(`/queue/current-state?clinicId=${clinicId}`),
  
  setAvgTime: (clinicId: string, avgConsultationTimeMinutes: number) =>
    apiClient.put('/queue/set-avg-time', { clinicId, avgConsultationTimeMinutes }),
  
  markCompleted: (tokenId: string) =>
    apiClient.post('/queue/mark-completed', { tokenId }),
  
  getPatientInfo: (clinicId: string, tokenNumber: number) =>
    apiClient.get(`/queue/patient-info?clinicId=${clinicId}&tokenNumber=${tokenNumber}`),
}

export const metricsAPI = {
  getDailyMetrics: (clinicId: string, date?: string) =>
    apiClient.get(`/metrics/daily?clinicId=${clinicId}${date ? `&date=${date}` : ''}`),
  
  getReportMetrics: (clinicId: string, startDate: string, endDate: string) =>
    apiClient.get(`/metrics/report?clinicId=${clinicId}&startDate=${startDate}&endDate=${endDate}`),
}

export default apiClient
