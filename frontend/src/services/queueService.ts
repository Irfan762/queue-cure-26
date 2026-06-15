import { authAPI, queueAPI } from './api'
import { getSocket, socketEvents } from './socket'

export const queueService = {
  // REST API operations
  addPatient: async (clinicId: string, patientName: string, priority = 'normal', phone?: string) => {
    try {
      const response = await queueAPI.addPatient(clinicId, patientName, priority, phone)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add patient')
    }
  },

  callNextToken: async (clinicId: string) => {
    try {
      const response = await queueAPI.callNextToken(clinicId)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to call next token')
    }
  },

  getQueueState: async (clinicId: string) => {
    try {
      const response = await queueAPI.getQueueState(clinicId)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch queue state')
    }
  },

  setAvgTime: async (clinicId: string, avgConsultationTimeMinutes: number) => {
    try {
      const response = await queueAPI.setAvgTime(clinicId, avgConsultationTimeMinutes)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update average time')
    }
  },

  markCompleted: async (tokenId: string) => {
    try {
      const response = await queueAPI.markCompleted(tokenId)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark token as completed')
    }
  },

  getPatientInfo: async (clinicId: string, tokenNumber: number) => {
    try {
      const response = await queueAPI.getPatientInfo(clinicId, tokenNumber)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Patient info not found')
    }
  },

  // Socket operations
  joinClinic: (clinicId: string) => {
    socketEvents.joinClinic(clinicId)
  },

  leaveClinic: (clinicId: string) => {
    socketEvents.leaveClinic(clinicId)
  },

  subscribeToQueueUpdates: (callback: (data: any) => void) => {
    socketEvents.onQueueUpdated(callback)
  },

  subscribeToTokenCalled: (callback: (data: any) => void) => {
    socketEvents.onTokenCalled(callback)
  },

  subscribeToTokenCompleted: (callback: (data: any) => void) => {
    socketEvents.onTokenCompleted(callback)
  },

  subscribeToPatientPositionUpdated: (callback: (data: any) => void) => {
    socketEvents.onPatientPositionUpdated(callback)
  },

  subscribeToQueueError: (callback: (data: any) => void) => {
    socketEvents.onQueueError(callback)
  },
}

export default queueService
