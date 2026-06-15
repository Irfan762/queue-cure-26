import React from 'react'
import { QueueToken } from '@/types'

interface CurrentTokenCardProps {
  token: QueueToken | null
  loading?: boolean
}

export const CurrentTokenCard: React.FC<CurrentTokenCardProps> = ({ token, loading = false }) => {
  if (loading) {
    return (
      <div className="card bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-200 animate-pulse">
        <div className="h-32 flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="card bg-gray-100 border-2 border-dashed border-gray-300">
        <div className="text-center py-8">
          <p className="text-2xl font-bold text-gray-500">No Token Currently Served</p>
          <p className="text-gray-400 mt-2">Click "Call Next Token" to start</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300">
      <div className="text-center">
        <p className="text-sm font-semibold text-green-700 mb-2">NOW SERVING</p>
        <p className="text-6xl font-bold text-green-600 mb-4">{String(token.tokenNumber).padStart(3, '0')}</p>
        <p className="text-xl text-green-800 font-semibold">{token.patientName}</p>
        {token.phone && <p className="text-sm text-green-700 mt-2">{token.phone}</p>}
      </div>
    </div>
  )
}
