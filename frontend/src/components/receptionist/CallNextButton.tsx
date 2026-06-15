import React from 'react'
import { QueueToken } from '@/types'
import clsx from 'clsx'

interface CallNextButtonProps {
  onCallNext: () => Promise<void>
  disabled?: boolean
  loading?: boolean
}

export const CallNextButton: React.FC<CallNextButtonProps> = ({ onCallNext, disabled = false, loading = false }) => {
  const [clicked, setClicked] = React.useState(false)

  const handleClick = async () => {
    // Prevent double-click
    if (clicked || disabled || loading) return

    try {
      setClicked(true)
      await onCallNext()
    } finally {
      setClicked(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading || clicked}
      className={clsx(
        'btn-primary px-8 py-4 text-lg font-bold w-full',
        'transition-all duration-200',
        (disabled || loading || clicked) && 'opacity-50 cursor-not-allowed'
      )}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="animate-spin">⏳</span>
          Calling Next...
        </span>
      ) : (
        'CALL NEXT TOKEN'
      )}
    </button>
  )
}
