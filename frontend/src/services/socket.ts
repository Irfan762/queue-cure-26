import io, { Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

let socket: Socket | null = null

export const initSocket = (): Socket => {
  if (socket?.connected) {
    return socket
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    auth: {
      token: localStorage.getItem('token'),
    },
  })

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id)
  })

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error)
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected')
  })

  return socket
}

export const getSocket = (): Socket | null => socket

export const socketEvents = {
  // Emit events
  joinClinic: (clinicId: string) => {
    socket?.emit('queue:join-clinic', { clinicId })
  },

  leaveClinic: (clinicId: string) => {
    socket?.emit('queue:leave-clinic', { clinicId })
  },

  addPatient: (data: any, callback?: (response: any) => void) => {
    socket?.emit('queue:add-patient', data, callback)
  },

  callNext: (clinicId: string, callback?: (response: any) => void) => {
    socket?.emit('queue:call-next', { clinicId }, callback)
  },

  markCompleted: (tokenId: string, callback?: (response: any) => void) => {
    socket?.emit('queue:mark-completed', { tokenId }, callback)
  },

  setAvgTime: (clinicId: string, avgTime: number) => {
    socket?.emit('queue:set-avg-time', { clinicId, avgTime })
  },

  // Listen events
  onQueueUpdated: (callback: (data: any) => void) => {
    socket?.on('queue:updated', callback)
  },

  onTokenCalled: (callback: (data: any) => void) => {
    socket?.on('queue:token-called', callback)
  },

  onTokenCompleted: (callback: (data: any) => void) => {
    socket?.on('queue:token-completed', callback)
  },

  onPatientPositionUpdated: (callback: (data: any) => void) => {
    socket?.on('queue:patient-position-updated', callback)
  },

  onQueueError: (callback: (data: any) => void) => {
    socket?.on('queue:error', callback)
  },

  onReceptionistSessionExpired: (callback: (data: any) => void) => {
    socket?.on('receptionist:session-expired', callback)
  },

  // Cleanup
  offQueueUpdated: () => {
    socket?.off('queue:updated')
  },

  offTokenCalled: () => {
    socket?.off('queue:token-called')
  },

  offTokenCompleted: () => {
    socket?.off('queue:token-completed')
  },

  offPatientPositionUpdated: () => {
    socket?.off('queue:patient-position-updated')
  },

  disconnect: () => {
    socket?.disconnect()
    socket = null
  },
}

export default socket
