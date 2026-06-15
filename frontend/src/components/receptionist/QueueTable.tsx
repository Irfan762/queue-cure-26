import React from 'react'
import { QueueToken } from '@/types'

interface QueueTableProps {
  tokens: QueueToken[]
  currentToken: QueueToken | null
  avgConsultationTime: number
  loading?: boolean
}

export const QueueTable: React.FC<QueueTableProps> = ({
  tokens,
  currentToken,
  avgConsultationTime,
  loading = false,
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'normal':
        return 'bg-blue-100 text-blue-800'
      case 'low':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'text-gray-600'
      case 'called':
        return 'text-yellow-600 font-semibold'
      case 'in_service':
        return 'text-blue-600 font-semibold'
      case 'completed':
        return 'text-green-600'
      case 'no_show':
        return 'text-red-600 line-through'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (tokens.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-500 text-lg">No patients in queue</p>
      </div>
    )
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b-2 border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Position</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Token #</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Patient Name</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Priority</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Wait Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tokens.map((token, index) => (
            <tr key={token.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-4 py-3 text-sm font-semibold text-gray-900">{index + 1}</td>
              <td className="px-4 py-3 text-sm font-bold text-primary-600">
                {String(token.tokenNumber).padStart(3, '0')}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">{token.patientName}</td>
              <td className="px-4 py-3">
                <span className={`badge ${getPriorityColor(token.priority)}`}>{token.priority}</span>
              </td>
              <td className={`px-4 py-3 text-sm ${getStatusColor(token.status)}`}>{token.status}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{token.estimatedWaitTimeMinutes} min</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
