"use client"
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '../../store/userStore'

interface Message {
    id: string;
    role: 'user' | 'tutor';
    content: string;
}

export default function TutorScreen() {
    const router = useRouter()
    const { user } = useUserStore()
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'tutor',
            content: "Ciao! Sono il tuo Tutor AILINGO personale. 👋\n\nPuoi chiedermi traduzioni, regole grammaticali, differenze tra vocaboli, o semplicemente di esercitarci su qualcosa in particolare. Come posso aiutarti oggi?"
        }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping])

    const generateTutorResponse = async (userMessage: string) => {
        setIsTyping(true)
        const msgLower = userMessage.toLowerCase()
        let response = ""

        try {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 400)) // Fake network delay

            // Regex extraction for translation
            const translateMatch = msgLower.match(/(?:come si dice|traduci|traduzione di) (.*?) (?:in inglese|in italiano)?$/i)
            // Regex extraction for differences
            const diffMatch = msgLower.match(/(?:differenza tra|vs) (.*?) e (.*)/i)

            if (translateMatch && translateMatch[1]) {
                const word = translateMatch[1].replace(/[?!.,]/g, '').trim()
                response = `AILINGO traduce "${word}" sempre con precisione nel contesto giusto. Ricorda che l'inglese dipende molto dalla frase intera. Riesci a farmi un esempio di frase con questa parola? Ti dirò se è corretta!`
            } else if (diffMatch && diffMatch[1] && diffMatch[2]) {
                const word1 = diffMatch[1].replace(/[?!.,]/g, '').trim()
                const word2 = diffMatch[2].replace(/[?!.,]/g, '').trim()
                response = `Capire le sfumature tra "${word1}" e "${word2}" è il segreto per suonare come un madrelingua!\nSpesso la differenza sta nel registro (formale vs informale) o in piccole regole di grammatica locale. Ti consiglio di segnarti entrambi e provare a usarli nei prossimi esercizi di traduzione!`
            } else if (msgLower.includes('grammatica') || msgLower.includes('regola')) {
                response = "La grammatica inglese ha molte meno eccezioni dell'italiano, ma la struttura Soggetto + Verbo + Oggetto è molto più rigida. Su quale regola (es. Present Perfect, Condizionali) vuoi concentrarti ora?"
            } else if (msgLower.includes('ciao') || msgLower.includes('salve') || msgLower.includes('hello') || msgLower.includes('hi')) {
                response = "Hello there! 👋 Pronto per imparare nuove cose oggi? Usa la Dashboard per vedere i tuoi progressi."
            } else if (msgLower.includes('bravo') || msgLower.includes('grazie')) {
                response = "You're welcome! 🚀 Il mio obiettivo è farti diventare fluente. Continua così!"
            } else {
                response = "Interessante punto di vista! 🤔 La pratica costante è la chiave. Se trovi un argomento difficile, ti suggerisco di fare più esercizi 'Ripassa' sulle tue Parole Deboli. Posso aiutarti con qualcos'altro?"
            }

            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'tutor', content: response }])
        } catch (e) {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'tutor', content: "Mmh, ho perso la connessione al mio database offline... Puoi ripetere?" }])
        } finally {
            setIsTyping(false)
        }
    }

    const handleSend = () => {
        if (!input.trim()) return
        const newMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() }
        setMessages(prev => [...prev, newMsg])
        setInput('')
        generateTutorResponse(newMsg.content)
    }

    return (
        <div className="screen-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0 }}>
            {/* Header Navbar */}
            <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--clr-border)', background: 'var(--clr-bg-page)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: '50%', background: 'var(--gradient-subtle)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                        border: '1px solid var(--clr-border-accent)'
                    }}>
                        🤖
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>AI Tutor</h2>
                        <span style={{ fontSize: '0.8rem', color: 'var(--clr-accent)', fontWeight: 600 }}>● Online e Pronto</span>
                    </div>
                </div>
                <button className="btn btn-ghost" onClick={() => router.back()}>← Esci</button>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {messages.map(msg => (
                    <div key={msg.id} style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        animation: 'slideInRight 0.3s ease-out'
                    }}>
                        <div style={{
                            padding: 'var(--space-3) var(--space-4)',
                            borderRadius: 'var(--radius-lg)',
                            background: msg.role === 'user' ? 'var(--gradient-primary)' : 'var(--clr-bg-surface)',
                            color: msg.role === 'user' ? '#fff' : 'var(--clr-text)',
                            border: msg.role === 'tutor' ? '1px solid var(--clr-border)' : 'none',
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.5,
                            fontSize: 'var(--text-base)',
                            boxShadow: msg.role === 'user' ? '0 4px 15px rgba(99, 102, 241, 0.3)' : '0 2px 10px rgba(0,0,0,0.1)'
                        }}>
                            {msg.content}
                        </div>
                        <div style={{
                            fontSize: '0.7rem',
                            color: 'var(--clr-text-muted)',
                            marginTop: '4px',
                            textAlign: msg.role === 'user' ? 'right' : 'left'
                        }}>
                            {msg.role === 'user' ? 'Tu' : 'AILINGO Tutor'}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div style={{ alignSelf: 'flex-start' }}>
                        <div style={{
                            padding: 'var(--space-3) var(--space-4)',
                            borderRadius: 'var(--radius-lg)',
                            background: 'var(--clr-bg-surface)',
                            border: '1px solid var(--clr-border)',
                            display: 'flex', gap: '4px'
                        }}>
                            <span className="typing-dot" style={{ animationDelay: '0s' }}>●</span>
                            <span className="typing-dot" style={{ animationDelay: '0.2s' }}>●</span>
                            <span className="typing-dot" style={{ animationDelay: '0.4s' }}>●</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: 'var(--space-4) var(--space-6)', background: 'var(--clr-bg-surface)', borderTop: '1px solid var(--clr-border)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <input
                        type="text"
                        className="input"
                        style={{ flex: 1, padding: 'var(--space-3)', fontSize: 'var(--text-base)' }}
                        placeholder="Fai una domanda al tuo Tutor..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button
                        className="btn btn-primary"
                        style={{ width: 'auto', padding: '0 var(--space-6)' }}
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                    >
                        Invia ✈️
                    </button>
                </div>
                <div style={{ textAlign: 'center', marginTop: 'var(--space-2)', fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
                    Il Tutor IA può sbagliare. Controlla le informazioni importanti.
                </div>
            </div>
        </div>
    )
}
