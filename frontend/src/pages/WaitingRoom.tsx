import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSocket } from '@/hooks/useSocket'
import queueService from '@/services/queueService'
import { TokenDisplay } from '@/components/patient/TokenDisplay'
import { QueueInfo } from '@/components/patient/QueueInfo'
import { WaitTimeCard } from '@/components/patient/WaitTimeCard'
import { QueueToken } from '@/types'

const WaitingRoom: React.FC = () => {
  const [searchParams] = useSearchParams()
  const clinicId = searchParams.get('clinicId') || 'default-clinic'
  const tokenNumber = parseInt(searchParams.get('tokenNumber') || '0')

  const [currentToken, setCurrentToken] = useState<QueueToken | null>(null)
  const [patientPosition, setPatientPosition] = useState(0)
  const [tokensAhead, setTokensAhead] = useState(0)
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(0)
  const [avgConsultationTime, setAvgConsultationTime] = useState(15)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { isConnected } = useSocket()

  useEffect(() => {
    if (!tokenNumber || !clinicId) {
      setError('Missing clinic ID or token number')
      setLoading(false)
      return
    }

    const fetchQueueState = async () => {
      try {
        setLoading(true)
        const data = await queueService.getPatientInfo(clinicId, tokenNumber)
        setCurrentToken(data.currentToken)
        setPatientPosition(data.patientPosition)
        setTokensAhead(data.tokensAhead)
        setEstimatedWaitTime(data.estimatedWaitTime)
        setAvgConsultationTime(data.avgConsultationTime || 15)
        setError(null)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch queue information')
      } finally {
        setLoading(false)
      }
    }

    fetchQueueState()
    const interval = setInterval(fetchQueueState, 2000)

    return () => clearInterval(interval)
  }, [clinicId, tokenNumber])

  useEffect(() => {
    queueService.subscribeToQueueUpdates((data) => {
      if (data.currentToken) {
        setCurrentToken(data.currentToken)
      }
    })

    queueService.subscribeToPatientPositionUpdated((data) => {
      if (data.tokenNumber === tokenNumber) {
        setPatientPosition(data.currentPosition)
        setTokensAhead(data.tokensAhead)
        setEstimatedWaitTime(data.estimatedWaitTimeMinutes)
      }
    })
  }, [tokenNumber])

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <p className="text-2xl font-bold text-red-600 mb-4">Error</p>
          <p className="text-gray-600 mb-6">{error}</p>
          <a href="/" className="btn-primary inline-block">
            Go Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-primary-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Waiting Room</h1>
              <p className="text-gray-600 mt-1">
                Your Token: <span className="font-bold text-primary-600">{String(tokenNumber).padStart(3, '0')}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <span className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                  <span className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></span>
                  Live
                </span>
              ) : (
                <span className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg">
                  <span className="w-3 h-3 bg-yellow-600 rounded-full"></span>
                  Offline
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Current Token Display */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Now Serving</h2>
          <TokenDisplay token={currentToken} loading={loading} />
        </div>

        {/* Queue Info Cards */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Status</h2>
          <QueueInfo
            tokensAhead={tokensAhead}
            estimatedWaitTime={estimatedWaitTime}
            currentTokenNumber={currentToken?.tokenNumber || null}
            patientPosition={patientPosition}
          />
        </div>

        {/* Wait Time Card */}
        <div>
          <WaitTimeCard estimatedWaitTime={estimatedWaitTime} avgConsultationTime={avgConsultationTime} />
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
          <p className="text-blue-900">
            <span className="font-semibold">Note:</span> This screen updates automatically every 2 seconds. Please keep this window open
            to see real-time updates of your position in the queue.
          </p>
        </div>
      </div>
    </div>
  )
}

export default WaitingRoom
