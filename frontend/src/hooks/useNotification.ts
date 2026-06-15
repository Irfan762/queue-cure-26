import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/store'
import { addNotification, removeNotification } from '@/store/slices/uiSlice'

export const useNotification = () => {
  const dispatch = useDispatch<AppDispatch>()

  const notify = useCallback(
    (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 3000) => {
      const id = Date.now().toString()
      dispatch(addNotification({ message, type }))
      if (duration > 0) {
        setTimeout(() => {
          dispatch(removeNotification(id))
        }, duration)
      }
      return id
    },
    [dispatch]
  )

  return { notify }
}
