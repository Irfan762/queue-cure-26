import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSocket } from '@/hooks/useSocket'
import { useQueue } from '@/hooks/useQueue'
import { RootState } from '@/store'
import { AddPatientForm } from '@/components/receptionist/AddPatientForm'
import { CallNextButton } from '@/components/receptionist/CallNextButton'
import { CurrentTokenCard } from '@/components/receptionist/CurrentTokenCard'
import { AverageTimeSettings } from '@/components/receptionist/AverageTimeSettings'
import { QueueTable } from '@/components/receptionist/QueueTable'
import { useNotification } from '@/hooks/useNotification'

const ReceptionistDashboard: React.FC = () => {
  const dispatch = useDispatch()
  const { notify } = useNotification()
  const auth = useSelector((state: RootState) => state.auth)
  const queue = useSelector((state: RootState) => state.queue)
  const ui = useSelector((state: RootState) => state.ui)

  const clinicId = auth.user?.clinicId || 'default-clinic'
  const { isConnected } = useSocket()
  const {
    currentToken,
    waitingTokens,
    avgConsultationTime,
    loading,
    error,
    fetchQueueState,
    addPatient,
    callNextToken,
    setAvgTime,
  } = useQueue(clinicId)

  useEffect(() => {
    fetchQueueState()
    const interval = setInterval(() => {
      fetchQueueState()
    }, 5000)
    return () => clearInterval(interval)
  }, [fetchQueueState])

  const handleAddPatient = async (data: { patientName: string; phone?: string; priority: string }) => {
    try {
      await addPatient(data.patientName, data.priority, data.phone)
      notify('Patient added successfully!', 'success')
      await fetchQueueState()
    } catch (err: any) {
      notify(err.message || 'Failed to add patient', 'error')
    }
  }

  const handleCallNext = async () => {
    try {
      const result = await callNextToken()
      notify(`Token #${result.tokenNumber} called`, 'success')
      await fetchQueueState()
    } catch (err: any) {
      notify(err.message || 'Failed to call next token', 'error')
    }
  }

  const handleSetAvgTime = async (time: number) => {
    try {
      await setAvgTime(time)
      notify('Average time updated!', 'success')
    } catch (err: any) {
      notify(err.message || 'Failed to update average time', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Receptionist Dashboard</h1>
              <p className="text-gray-600 mt-1">{auth.user?.name} • Clinic: {clinicId}</p>
            </div>
            <div className="flex items-center gap-4">
              {isConnected ? (
                <span className="flex items-center gap-2 text-green-600">
                  <span className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></span>
                  Live Connected
                </span>
              ) : (
                <span className="flex items-center gap-2 text-red-600">
                  <span className="w-3 h-3 bg-red-600 rounded-full"></span>
                  Disconnected
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notifications */}
        {ui.notifications.length > 0 && (
          <div className="fixed top-4 right-4 space-y-2 z-50">
            {ui.notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg shadow-lg text-white ${
                  notification.type === 'success'
                    ? 'bg-green-500'
                    : notification.type === 'error'
                    ? 'bg-red-500'
                    : notification.type === 'warning'
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
                }`}
              >
                {notification.message}
              </div>
            ))}
          </div>
        )}

        {/* Current Token */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Status</h2>
          <CurrentTokenCard token={currentToken} loading={loading} />
        </div>

        {/* Action Buttons */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Actions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CallNextButton onCallNext={handleCallNext} loading={ui.isCallNextLoading} />
            </div>
            <AverageTimeSettings
              currentAvgTime={avgConsultationTime}
              onSave={handleSetAvgTime}
              loading={loading}
            />
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Patient Form */}
          <div>
            <AddPatientForm onSubmit={handleAddPatient} loading={ui.isAddPatientLoading} />
          </div>

          {/* Queue Table */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Waiting Queue</h2>
              <p className="text-gray-600 mt-1">{waitingTokens.length} patients waiting</p>
            </div>
            <QueueTable
              tokens={waitingTokens}
              currentToken={currentToken}
              avgConsultationTime={avgConsultationTime}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReceptionistDashboard
