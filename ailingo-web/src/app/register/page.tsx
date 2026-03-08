"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

export default function RegisterPage() {
    const [name, setName] = useState('')
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

        if (password.length < 6) {
            setError('La password deve essere di almeno 6 caratteri')
            setLoading(false)
            return
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password })
            })

            if (res.ok) {
                const signRes = await signIn('credentials', {
                    redirect: false,
                    email: email.trim().toLowerCase(),
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
        <div style={{
            minHeight: '100svh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-6)',
            background: 'radial-gradient(ellipse at 20% 50%, rgba(99,55,245,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 10%, rgba(34,229,160,0.08) 0%, transparent 50%), var(--clr-bg-base)',
        }}>
            <div className="card animate-scale-in" style={{ width: '100%', maxWidth: 400, padding: 'var(--space-8)' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                    <div className="gradient-text" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-1)' }}>
                        AILINGO
                    </div>
                    <p className="text-secondary" style={{ fontSize: '0.95rem' }}>Crea il tuo account gratuito</p>
                </div>

                {error && (
                    <div style={{
                        marginBottom: 'var(--space-4)',
                        padding: 'var(--space-3) var(--space-4)',
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--clr-error)',
                        textAlign: 'center',
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 6 }}>
                            Il tuo nome
                        </label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Es. Marco"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            autoComplete="name"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 6 }}>
                            Email
                        </label>
                        <input
                            type="email"
                            className="input"
                            placeholder="tuaemail@esempio.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 6 }}>
                            Password <span style={{ color: 'var(--clr-text-muted)', fontWeight: 400 }}>(min. 6 caratteri)</span>
                        </label>
                        <input
                            type="password"
                            className="input"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={6}
                            autoComplete="new-password"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 6 }}>
                            Conferma Password
                        </label>
                        <input
                            type="password"
                            className="input"
                            placeholder="••••••••"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            required
                            minLength={6}
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        style={{ marginTop: 'var(--space-2)' }}
                        disabled={loading}
                    >
                        {loading ? '⏳ Creazione account...' : '🚀 Crea Account'}
                    </button>
                </form>

                <p className="text-secondary" style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: 'var(--text-sm)' }}>
                    Hai già un account?{' '}
                    <Link href="/login" style={{ color: 'var(--clr-primary-400)', fontWeight: 700 }}>Accedi</Link>
                </p>
            </div>
        </div>
    )
}
