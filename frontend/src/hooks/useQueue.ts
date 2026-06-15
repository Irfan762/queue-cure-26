import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import {
  setQueueState,
  setCurrentToken,
  setWaitingTokens,
  setAvgConsultationTime,
  setLoading,
  setError,
  addToken,
  updateToken,
} from '@/store/slices/queueSlice'
import queueService from '@/services/queueService'
import { QueueToken } from '@/types'

export const useQueue = (clinicId?: string) => {
  const dispatch = useDispatch<AppDispatch>()
  const queue = useSelector((state: RootState) => state.queue)

  const fetchQueueState = useCallback(async () => {
    if (!clinicId) return

    try {
      dispatch(setLoading(true))
      const data = await queueService.getQueueState(clinicId)
      dispatch(
        setQueueState({
          currentToken: data.currentToken,
          waitingTokens: data.waitingTokens || [],
          avgConsultationTime: data.avgConsultationTime,
          queueLength: data.queueLength,
          lastUpdate: Date.now(),
        })
      )
    } catch (error: any) {
      dispatch(setError(error.message))
    } finally {
      dispatch(setLoading(false))
    }
  }, [clinicId, dispatch])

  const addPatient = useCallback(
    async (patientName: string, priority: string = 'normal', phone?: string) => {
      if (!clinicId) return

      try {
        dispatch(setLoading(true))
        const data = await queueService.addPatient(clinicId, patientName, priority, phone)
        dispatch(addToken(data))
        return data
      } catch (error: any) {
        dispatch(setError(error.message))
        throw error
      } finally {
        dispatch(setLoading(false))
      }
    },
    [clinicId, dispatch]
  )

  const callNextToken = useCallback(async () => {
    if (!clinicId) return

    try {
      const data = await queueService.callNextToken(clinicId)
      return data
    } catch (error: any) {
      dispatch(setError(error.message))
      throw error
    }
  }, [clinicId, dispatch])

  const setAvgTime = useCallback(
    async (avgTime: number) => {
      if (!clinicId) return

      try {
        await queueService.setAvgTime(clinicId, avgTime)
        dispatch(setAvgConsultationTime(avgTime))
      } catch (error: any) {
        dispatch(setError(error.message))
        throw error
      }
    },
    [clinicId, dispatch]
  )

  const markCompleted = useCallback(
    async (tokenId: string) => {
      try {
        await queueService.markCompleted(tokenId)
        const token = queue.waitingTokens.find(t => t.id === tokenId)
        if (token) {
          dispatch(updateToken({ ...token, status: 'completed' }))
        }
      } catch (error: any) {
        dispatch(setError(error.message))
        throw error
      }
    },
    [queue.waitingTokens, dispatch]
  )

  return {
    currentToken: queue.currentToken,
    waitingTokens: queue.waitingTokens,
    avgConsultationTime: queue.avgConsultationTime,
    queueLength: queue.queueLength,
    loading: queue.loading,
    error: queue.error,
    lastUpdate: queue.lastUpdate,
    fetchQueueState,
    addPatient,
    callNextToken,
    setAvgTime,
    markCompleted,
  }
}
