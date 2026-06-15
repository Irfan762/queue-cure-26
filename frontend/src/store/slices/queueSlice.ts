import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { QueueToken, QueueState } from '@/types'

interface QueueSliceState {
  currentToken: QueueToken | null
  waitingTokens: QueueToken[]
  avgConsultationTime: number
  queueLength: number
  loading: boolean
  error: string | null
  lastUpdate: number
}

const initialState: QueueSliceState = {
  currentToken: null,
  waitingTokens: [],
  avgConsultationTime: 15,
  queueLength: 0,
  loading: false,
  error: null,
  lastUpdate: 0,
}

const queueSlice = createSlice({
  name: 'queue',
  initialState,
  reducers: {
    setQueueState: (state, action: PayloadAction<QueueState>) => {
      state.currentToken = action.payload.currentToken
      state.waitingTokens = action.payload.waitingTokens
      state.avgConsultationTime = action.payload.avgConsultationTime
      state.queueLength = action.payload.queueLength
      state.lastUpdate = action.payload.lastUpdate
      state.error = null
    },
    setCurrentToken: (state, action: PayloadAction<QueueToken | null>) => {
      state.currentToken = action.payload
      state.lastUpdate = Date.now()
    },
    setWaitingTokens: (state, action: PayloadAction<QueueToken[]>) => {
      state.waitingTokens = action.payload
      state.queueLength = action.payload.length
      state.lastUpdate = Date.now()
    },
    setAvgConsultationTime: (state, action: PayloadAction<number>) => {
      state.avgConsultationTime = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    addToken: (state, action: PayloadAction<QueueToken>) => {
      state.waitingTokens.push(action.payload)
      state.queueLength = state.waitingTokens.length
      state.lastUpdate = Date.now()
    },
    updateToken: (state, action: PayloadAction<QueueToken>) => {
      const index = state.waitingTokens.findIndex(t => t.id === action.payload.id)
      if (index !== -1) {
        state.waitingTokens[index] = action.payload
      }
      state.lastUpdate = Date.now()
    },
  },
})

export const {
  setQueueState,
  setCurrentToken,
  setWaitingTokens,
  setAvgConsultationTime,
  setLoading,
  setError,
  addToken,
  updateToken,
} = queueSlice.actions
export default queueSlice.reducer
