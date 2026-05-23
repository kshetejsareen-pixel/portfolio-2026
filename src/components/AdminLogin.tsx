'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/admin')
    } else {
      setError('Wrong password.')
      setLoading(false)
    }
  }

  return (
    <div className="adm-login-wrap">
      <div className="adm-login-box">
        <div className="adm-login-logo">KS · Admin</div>
        <form onSubmit={handleSubmit} className="adm-login-form">
          <input
            className="adm-login-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
          />
          {error && <div className="adm-login-error">{error}</div>}
          <button className="adm-login-btn" type="submit" disabled={loading}>
            {loading ? 'Checking…' : 'Enter →'}
          </button>
        </form>
      </div>
    </div>
  )
}
