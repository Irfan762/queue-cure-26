import React from 'react'

interface QueueInfoProps {
  tokensAhead: number
  estimatedWaitTime: number
  currentTokenNumber: number | null
  patientPosition: number
}

export const QueueInfo: React.FC<QueueInfoProps> = ({
  tokensAhead,
  estimatedWaitTime,
  currentTokenNumber,
  patientPosition,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
        <p className="text-sm text-blue-600 font-semibold">YOUR POSITION</p>
        <p className="text-4xl font-bold text-blue-700 mt-2">{patientPosition}</p>
        <p className="text-xs text-blue-500 mt-2">in queue</p>
      </div>

      <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-l-4 border-yellow-500">
        <p className="text-sm text-yellow-600 font-semibold">TOKENS AHEAD</p>
        <p className="text-4xl font-bold text-yellow-700 mt-2">{tokensAhead}</p>
        <p className="text-xs text-yellow-500 mt-2">patients</p>
      </div>

      <div className="card bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500">
        <p className="text-sm text-green-600 font-semibold">ESTIMATED WAIT</p>
        <p className="text-4xl font-bold text-green-700 mt-2">{estimatedWaitTime}</p>
        <p className="text-xs text-green-500 mt-2">minutes</p>
      </div>

      <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500">
        <p className="text-sm text-purple-600 font-semibold">NOW SERVING</p>
        <p className="text-4xl font-bold text-purple-700 mt-2">
          {currentTokenNumber ? String(currentTokenNumber).padStart(3, '0') : '-'}
        </p>
        <p className="text-xs text-purple-500 mt-2">token</p>
      </div>
    </div>
  )
}
