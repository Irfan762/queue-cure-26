import { useEffect, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { initSocket, getSocket, socketEvents } from '@/services/socket'
import { RootState, AppDispatch } from '@/store'
import { setQueueState, setCurrentToken, setWaitingTokens, addNotification } from '@/store/slices/queueSlice'

export const useSocket = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const socket = initSocket()

    socket.on('connect', () => {
      setIsConnected(true)
      setError(null)
      console.log('Connected to socket:', socket.id)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      setError(error.message)
      console.error('Socket error:', error)
    })

    return () => {
      // Don't disconnect on unmount, keep connection alive
    }
  }, [])

  const subscribe = useCallback((clinicId: string) => {
    const socket = getSocket()
    if (!socket) return

    socketEvents.onQueueUpdated((data) => {
      console.log('Queue updated:', data)
      dispatch(
        setQueueState({
          currentToken: data.currentToken,
          waitingTokens: data.tokens || [],
          avgConsultationTime: data.avgConsultationTime,
          queueLength: data.queueLength,
          lastUpdate: Date.now(),
        })
      )
    })

    socketEvents.onTokenCalled((data) => {
      console.log('Token called:', data)
      dispatch(
        addNotification({
          message: `Token #${data.tokenNumber} called for ${data.patientName}`,
          type: 'success',
        })
      )
    })

    socketEvents.onPatientPositionUpdated((data) => {
      console.log('Patient position updated:', data)
    })

    socketEvents.joinClinic(clinicId)
  }, [dispatch])

  const unsubscribe = useCallback((clinicId: string) => {
    socketEvents.leaveClinic(clinicId)
  }, [])

  return {
    isConnected,
    error,
    subscribe,
    unsubscribe,
  }
}
