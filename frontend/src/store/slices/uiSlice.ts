import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  sidebarOpen: boolean
  notifications: Array<{
    id: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
  }>
  isCallNextLoading: boolean
  isAddPatientLoading: boolean
}

const initialState: UIState = {
  sidebarOpen: true,
  notifications: [],
  isCallNextLoading: false,
  isAddPatientLoading: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    addNotification: (state, action: PayloadAction<Omit<UIState['notifications'][0], 'id'>>) => {
      state.notifications.push({
        id: Date.now().toString(),
        ...action.payload,
      })
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    setCallNextLoading: (state, action: PayloadAction<boolean>) => {
      state.isCallNextLoading = action.payload
    },
    setAddPatientLoading: (state, action: PayloadAction<boolean>) => {
      state.isAddPatientLoading = action.payload
    },
  },
})

export const {
  toggleSidebar,
  addNotification,
  removeNotification,
  setCallNextLoading,
  setAddPatientLoading,
} = uiSlice.actions
export default uiSlice.reducer
