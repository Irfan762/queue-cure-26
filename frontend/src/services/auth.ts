import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password })
    return response.data
  },

  logout: async () => {
    const response = await axios.post(`${API_BASE_URL}/auth/logout`)
    return response.data
  },
}

export default authAPI
