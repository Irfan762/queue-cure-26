import React, { useState } from 'react'

interface AverageTimeSettingsProps {
  currentAvgTime: number
  onSave: (time: number) => Promise<void>
  loading?: boolean
}

export const AverageTimeSettings: React.FC<AverageTimeSettingsProps> = ({
  currentAvgTime,
  onSave,
  loading = false,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [avgTime, setAvgTime] = useState(currentAvgTime)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setError(null)

    if (avgTime < 1 || avgTime > 120) {
      setError('Average time must be between 1 and 120 minutes')
      return
    }

    try {
      await onSave(avgTime)
      setIsEditing(false)
    } catch (err: any) {
      setError(err.message || 'Failed to update average time')
    }
  }

  if (!isEditing) {
    return (
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Average Consultation Time</p>
            <p className="text-3xl font-bold text-primary-600 mt-2">{currentAvgTime} minutes</p>
          </div>
          <button onClick={() => setIsEditing(true)} className="btn-secondary">
            Edit
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Update Average Time</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="avgTime" className="block text-sm font-medium text-gray-700 mb-2">
          Minutes
        </label>
        <input
          id="avgTime"
          type="number"
          min="1"
          max="120"
          value={avgTime}
          onChange={(e) => setAvgTime(Math.max(1, parseInt(e.target.value) || 0))}
          className="input-field"
          disabled={loading}
        />
      </div>

      <div className="flex gap-2">
        <button onClick={handleSave} disabled={loading} className="btn-primary flex-1">
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={() => {
            setIsEditing(false)
            setAvgTime(currentAvgTime)
            setError(null)
          }}
          disabled={loading}
          className="btn-secondary flex-1"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
