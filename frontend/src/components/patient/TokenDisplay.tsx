import React from 'react'
import { QueueToken } from '@/types'

interface TokenDisplayProps {
  token: QueueToken | null
  loading?: boolean
}

export const TokenDisplay: React.FC<TokenDisplayProps> = ({ token, loading = false }) => {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-40 bg-gray-200 rounded-lg" />
      </div>
    )
  }

  if (!token) {
    return (
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-8 text-center">
        <p className="text-gray-600 text-lg">Waiting for next token...</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-12 text-center text-white shadow-2xl">
      <p className="text-lg font-semibold opacity-90 mb-4">NOW SERVING</p>
      <p className="text-8xl font-bold mb-6 tracking-wider">{String(token.tokenNumber).padStart(3, '0')}</p>
      <p className="text-2xl font-semibold">{token.patientName}</p>
      <p className="text-primary-100 mt-4 text-sm">Called at {new Date(token.calledAt || Date.now()).toLocaleTimeString()}</p>
    </div>
  )
}
