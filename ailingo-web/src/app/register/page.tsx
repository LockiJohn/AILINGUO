"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (password !== confirm) {
            setError('Le password non corrispondono')
            setLoading(false)
            return
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            if (res.ok) {
                // Auto login after registration
                const signRes = await signIn('credentials', {
                    redirect: false,
                    email,
                    password,
                })

                if (!signRes?.error) {
                    router.push('/onboarding')
                    router.refresh()
                } else {
                    router.push('/login')
                }
            } else {
                const data = await res.json()
                setError(data.error || 'Errore durante la registrazione')
            }
        } catch (err) {
            setError('Si è verificato un errore di connessione')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col flex-center" style={{ height: '100vh', padding: 'var(--space-8)' }}>
            <div className="card animate-scale-in" style={{ width: '100%', maxWidth: 400, padding: 'var(--space-8)' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                    <div className="gradient-text" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>AILINGO</div>
                    <p className="text-secondary">Crea un nuovo account</p>
                </div>

                {error && <div className="text-error" style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 4 }}>Email</label>
                        <input
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 4 }}>Password</label>
                        <input
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 4 }}>Conferma Password</label>
                        <input
                            type="password"
                            className="input"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 'var(--space-4)' }} disabled={loading}>
                        {loading ? 'Registrazione...' : 'Registrati'}
                    </button>
                </form>

                <p className="text-secondary" style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: 'var(--text-sm)' }}>
                    Hai già un account? <Link href="/login" style={{ color: 'var(--clr-primary-400)', fontWeight: 600 }}>Accedi</Link>
                </p>
            </div>
        </div>
    )
}
