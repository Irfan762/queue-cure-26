import React, { useState } from 'react'
import clsx from 'clsx'

interface AddPatientFormProps {
  onSubmit: (data: { patientName: string; phone?: string; priority: string }) => Promise<void>
  loading?: boolean
}

export const AddPatientForm: React.FC<AddPatientFormProps> = ({ onSubmit, loading = false }) => {
  const [patientName, setPatientName] = useState('')
  const [phone, setPhone] = useState('')
  const [priority, setPriority] = useState('normal')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!patientName.trim()) {
      setError('Patient name is required')
      return
    }

    try {
      await onSubmit({ patientName: patientName.trim(), phone: phone.trim() || undefined, priority })
      setPatientName('')
      setPhone('')
      setPriority('normal')
    } catch (err: any) {
      setError(err.message || 'Failed to add patient')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Add Patient</h2>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-2">
          Patient Name *
        </label>
        <input
          id="patientName"
          type="text"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          placeholder="Enter patient name"
          className="input-field"
          disabled={loading}
          required
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter phone number (optional)"
          className="input-field"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
          Priority
        </label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="input-field"
          disabled={loading}
        >
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={clsx('btn-primary w-full', loading && 'opacity-50 cursor-not-allowed')}
      >
        {loading ? 'Adding Patient...' : 'Add Patient'}
      </button>
    </form>
  )
}
