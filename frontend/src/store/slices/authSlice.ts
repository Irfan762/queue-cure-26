import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AuthUser } from '@/types'

interface AuthState {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload
      state.token = localStorage.getItem('token')
      localStorage.setItem('user', JSON.stringify(action.payload))
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
      localStorage.setItem('token', action.payload)
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.error = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setLoading, setUser, setToken, logout, setError } = authSlice.actions
export default authSlice.reducer
