'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function AdminVerify() {
  const router = useRouter()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => { inputs.current[0]?.focus() }, [])

  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[i] = digit
    setCode(next)
    if (digit && i < 5) inputs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      inputs.current[i - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setCode(pasted.split(''))
      inputs.current[5]?.focus()
    }
  }

  const submit = async () => {
    const full = code.join('')
    if (full.length < 6) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: full }),
    })

    if (res.ok) {
      router.push('/admin')
    } else {
      const { error: msg, result } = await res.json()
      setError(msg ?? 'Invalid code.')
      setLoading(false)
      setCode(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
      // Expired or locked — go back to login
      if (result === 'expired' || result === 'locked') {
        setTimeout(() => router.push('/admin/login'), 2000)
      }
    }
  }

  // Auto-submit when all 6 digits are filled
  useEffect(() => {
    if (code.every(Boolean)) submit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  return (
    <div className="adm-login-wrap">
      <div className="adm-login-box">
        <div className="adm-login-logo">KS · Admin</div>
        <p className="adm-verify-hint">
          A 6-digit code was sent to your email and phone. Enter it below.
        </p>
        <div className="adm-otp-row" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el }}
              className="adm-otp-input"
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading}
            />
          ))}
        </div>
        {error && <div className="adm-login-error">{error}</div>}
        <button
          className="adm-login-btn"
          onClick={submit}
          disabled={loading || code.some((d) => !d)}
        >
          {loading ? 'Verifying…' : 'Verify →'}
        </button>
        <button
          className="adm-verify-back"
          onClick={() => router.push('/admin/login')}
        >
          ← Back to login
        </button>
      </div>
    </div>
  )
}
