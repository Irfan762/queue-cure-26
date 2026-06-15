import { useCallback, useState } from 'react'
import { useQueue } from './useQueue'

export interface AddPatientFormData {
  patientName: string
  phone?: string
  priority: 'urgent' | 'high' | 'normal' | 'low'
}

export const usePatients = (clinicId?: string) => {
  const { addPatient: addPatientToQueue, loading, error } = useQueue(clinicId)
  const [recentPatients, setRecentPatients] = useState<any[]>([])

  const addPatient = useCallback(
    async (data: AddPatientFormData) => {
      try {
        const result = await addPatientToQueue(data.patientName, data.priority, data.phone)
        setRecentPatients((prev) => [result, ...prev.slice(0, 9)])
        return result
      } catch (error) {
        throw error
      }
    },
    [addPatientToQueue]
  )

  return {
    addPatient,
    recentPatients,
    loading,
    error,
  }
}
