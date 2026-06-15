import React from 'react'

interface WaitTimeCardProps {
  estimatedWaitTime: number
  avgConsultationTime: number
}

export const WaitTimeCard: React.FC<WaitTimeCardProps> = ({ estimatedWaitTime, avgConsultationTime }) => {
  const getWaitTimeColor = (minutes: number) => {
    if (minutes <= 10) return 'text-green-600'
    if (minutes <= 30) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getWaitTimeBgColor = (minutes: number) => {
    if (minutes <= 10) return 'bg-green-50'
    if (minutes <= 30) return 'bg-yellow-50'
    return 'bg-red-50'
  }

  return (
    <div className={`card ${getWaitTimeBgColor(estimatedWaitTime)}`}>
      <p className="text-sm font-medium text-gray-600">Estimated Waiting Time</p>
      <p className={`text-5xl font-bold mt-2 ${getWaitTimeColor(estimatedWaitTime)}`}>
        {estimatedWaitTime}
      </p>
      <p className="text-sm text-gray-600 mt-2">minutes</p>
      <p className="text-xs text-gray-500 mt-4">
        Based on {avgConsultationTime} min average consultation time
      </p>
    </div>
  )
}
