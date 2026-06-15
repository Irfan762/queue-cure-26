import { RootState } from './index'

export const selectAuth = (state: RootState) => state.auth
export const selectQueue = (state: RootState) => state.queue
export const selectUI = (state: RootState) => state.ui

export const selectUser = (state: RootState) => state.auth.user
export const selectAuthToken = (state: RootState) => state.auth.token
export const selectIsAuthenticated = (state: RootState) => !!state.auth.token

export const selectCurrentToken = (state: RootState) => state.queue.currentToken
export const selectWaitingTokens = (state: RootState) => state.queue.waitingTokens
export const selectAvgConsultationTime = (state: RootState) => state.queue.avgConsultationTime
export const selectQueueLength = (state: RootState) => state.queue.queueLength
export const selectQueueLoading = (state: RootState) => state.queue.loading
export const selectQueueError = (state: RootState) => state.queue.error
