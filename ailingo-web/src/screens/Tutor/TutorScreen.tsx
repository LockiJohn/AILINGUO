"use client"
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '../../store/userStore'

interface Message {
    id: string;
    role: 'user' | 'tutor';
    content: string;
}

const TOPIC_CHIPS = [
    { label: '📖 Vocaboli', prompt: 'Spiegami come usare una parola nuova nel contesto giusto' },
    { label: '📐 Grammatica', prompt: 'Spiegami una regola grammaticale importante in inglese' },
    { label: '🌍 Traduzione', prompt: 'Come si dice in inglese: ' },
    { label: '💬 Frasi utili', prompt: 'Dimmi 5 frasi utili per la vita quotidiana in inglese' },
    { label: '🎵 Pronuncia', prompt: 'Come si pronuncia correttamente questa parola: ' },
    { label: '🔄 Differenza', prompt: 'Qual è la differenza tra ' },
]

const STARTER_PROMPTS = [
    '🤔 Come si dice "Mi dispiace" in inglese in modo naturale?',
    '📝 Spiega quando usare "have been" vs "have gone"',
    '💡 Dammi 3 espressioni inglesi che usano i madrelingua ogni giorno',
]

export default function TutorScreen() {
    const router = useRouter()
    const { user } = useUserStore()
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'tutor',
            content: "Ciao! Sono il tuo Tutor AILINGO 👋\n\nScegli un argomento qui sotto oppure scrivimi liberamente — traduzioni, grammatica, pronuncia, differenze tra parole. Sono qui per aiutarti!"
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
            await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 400))

            const translateMatch = msgLower.match(/(?:come si dice|traduci|traduzione di) (.*?) (?:in inglese|in italiano)?$/i)
            const diffMatch = msgLower.match(/(?:differenza tra|vs|difference between) (.*?) (?:e|and) (.*)/i)

            if (translateMatch && translateMatch[1]) {
                const word = translateMatch[1].replace(/[?!.,]/g, '').trim()
                response = `✅ AILINGO traduce "${word}" con precisione nel contesto giusto.\n\nL'inglese dipende molto dalla frase intera — un madrelingua sceglie la parola in base al registro (formale/informale) e al contesto.\n\n💡 Prova a farmi un esempio di frase con questa parola: ti dirò se è corretta!`
            } else if (diffMatch && diffMatch[1] && diffMatch[2]) {
                const word1 = diffMatch[1].replace(/[?!.,]/g, '').trim()
                const word2 = diffMatch[2].replace(/[?!.,]/g, '').trim()
                response = `📐 Capire le sfumature tra "${word1}" e "${word2}" è il segreto per suonare come un madrelingua!\n\nSpesso la differenza sta nel registro (formale vs informale) o in piccole regole di grammatica locale.\n\n💡 Ti consiglio di segnarti entrambi e provare a usarli nei prossimi esercizi di traduzione!`
            } else if (msgLower.includes('grammatica') || msgLower.includes('regola') || msgLower.includes('grammar')) {
                response = `📐 La grammatica inglese ha molte meno eccezioni dell'italiano, ma la struttura **Soggetto + Verbo + Oggetto** è molto più rigida.\n\nAlcune regole chiave:\n• Present Perfect vs Simple Past: usa il PP per esperienze, il SP per eventi precisi nel passato\n• Condizionali: If + Simple Past → Would + infinito (es. "If I had time, I would study")\n\nSu quale regola vuoi concentrarti ora?`
            } else if (msgLower.includes('pronuncia') || msgLower.includes('pronunc')) {
                response = `🎵 La pronuncia inglese è diversa dall'italiano: molte lettere si "mangiano"!\n\nConsigli pratici:\n• Ascolta podcast in inglese per 10 min al giorno\n• Ripeti ad alta voce durante gli esercizi di ascolto\n• Il suono "th" (come in "the", "this") non esiste in italiano — metti la lingua tra i denti!\n\nDimmi una parola specifica e ti spiego come pronunciarla.`
            } else if (msgLower.includes('ciao') || msgLower.includes('salve') || msgLower.includes('hello') || msgLower.includes('hi')) {
                response = "Hello there! 👋 Pronto per imparare nuove cose oggi?\n\nUsa i bottoni qui sotto per scegliere un argomento, oppure scrivimi direttamente. Puoi chiedermi qualsiasi cosa sull'inglese!"
            } else if (msgLower.includes('bravo') || msgLower.includes('grazie') || msgLower.includes('ottimo')) {
                response = "You're welcome! 🚀 Il mio obiettivo è farti diventare fluente.\n\nRicorda: la costanza batte la perfezione. Anche 10 minuti al giorno fanno la differenza. Continua così!"
            } else if (msgLower.includes('frasi') || msgLower.includes('espressioni')) {
                response = `💬 Ecco 5 frasi che i madrelingua usano ogni giorno:\n\n1. "What's up?" → Come stai? / Cosa c'è di nuovo?\n2. "I'm on my way" → Sto arrivando\n3. "Let me know" → Fammi sapere\n4. "It's up to you" → Sta a te / Decidi tu\n5. "Never mind" → Non importa / Lascia perdere\n\n💡 Prova a usare una di queste nella prossima conversazione!`
            } else {
                response = "Interessante! 🤔 La pratica costante è la chiave dell'apprendimento.\n\nSe trovi un argomento difficile, ti suggerisco di fare più esercizi 'Ripassa' sulle tue Parole Deboli — o scegli uno degli argomenti qui sotto per approfondire. Posso aiutarti con qualcos'altro?"
            }

            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'tutor', content: response }])
        } catch (e) {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'tutor', content: "Mmh, ho perso la connessione. Puoi ripetere?" }])
        } finally {
            setIsTyping(false)
        }
    }

    const handleSend = (text?: string) => {
        const msg = (text ?? input).trim()
        if (!msg) return
        const newMsg: Message = { id: Date.now().toString(), role: 'user', content: msg }
        setMessages(prev => [...prev, newMsg])
        setInput('')
        generateTutorResponse(msg)
    }

    const handleChip = (prompt: string) => {
        // If prompt ends with a colon, put it in input for the user to complete
        if (prompt.endsWith(': ') || prompt.endsWith(': ')) {
            setInput(prompt)
        } else {
            handleSend(prompt)
        }
    }

    const showStarterPrompts = messages.length === 1

    return (
        <div className="screen-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0 }}>
            {/* Header */}
            <div style={{
                padding: 'var(--space-3) var(--space-5)',
                borderBottom: '1px solid var(--clr-border)',
                background: 'var(--clr-bg-page)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-subtle)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
                        border: '1px solid var(--clr-border-accent)', flexShrink: 0,
                    }}>
                        🤖
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.1 }}>AI Tutor</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--clr-accent-400)', fontWeight: 600 }}>● Online e Pronto</div>
                    </div>
                </div>
                <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => router.back()}
                    style={{ padding: 'var(--space-2) var(--space-4)', fontSize: '0.85rem' }}
                >
                    ← Esci
                </button>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {messages.map(msg => (
                    <div key={msg.id} style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        animation: 'slideUp 0.3s ease-out',
                    }}>
                        <div style={{
                            padding: 'var(--space-3) var(--space-4)',
                            borderRadius: 'var(--radius-lg)',
                            background: msg.role === 'user' ? 'var(--gradient-primary)' : 'var(--clr-bg-surface)',
                            color: msg.role === 'user' ? '#fff' : 'var(--clr-text)',
                            border: msg.role === 'tutor' ? '1px solid var(--clr-border)' : 'none',
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.55,
                            fontSize: '0.95rem',
                            boxShadow: msg.role === 'user' ? '0 4px 15px rgba(99,102,241,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                        }}>
                            {msg.content}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--clr-text-muted)', marginTop: 3, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                            {msg.role === 'user' ? 'Tu' : 'AILINGO Tutor'}
                        </div>
                    </div>
                ))}

                {/* Starter prompts — shown only when just the welcome msg is visible */}
                {showStarterPrompts && (
                    <div style={{ alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxWidth: '85%' }}>
                        {STARTER_PROMPTS.map((p, i) => (
                            <button
                                key={i}
                                onClick={() => handleSend(p.replace(/^[^\s]+\s/, ''))}
                                style={{
                                    background: 'rgba(99,55,245,0.08)',
                                    border: '1px solid var(--clr-border-accent)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: 'var(--space-3) var(--space-4)',
                                    color: 'var(--clr-text-secondary)',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    lineHeight: 1.4,
                                    transition: 'all var(--transition-fast)',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--clr-primary-400)')}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--clr-border-accent)')}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                )}

                {isTyping && (
                    <div style={{ alignSelf: 'flex-start' }}>
                        <div style={{
                            padding: 'var(--space-3) var(--space-4)',
                            borderRadius: 'var(--radius-lg)',
                            background: 'var(--clr-bg-surface)',
                            border: '1px solid var(--clr-border)',
                            display: 'flex', gap: '5px', alignItems: 'center',
                        }}>
                            <span className="typing-dot" style={{ animationDelay: '0s' }}>●</span>
                            <span className="typing-dot" style={{ animationDelay: '0.2s' }}>●</span>
                            <span className="typing-dot" style={{ animationDelay: '0.4s' }}>●</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Topic chips */}
            <div style={{
                overflowX: 'auto',
                display: 'flex',
                gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-4)',
                borderTop: '1px solid var(--clr-border)',
                background: 'var(--clr-bg-surface)',
                flexShrink: 0,
                scrollbarWidth: 'none',
            }}>
                {TOPIC_CHIPS.map(chip => (
                    <button
                        key={chip.label}
                        onClick={() => handleChip(chip.prompt)}
                        disabled={isTyping}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            whiteSpace: 'nowrap',
                            padding: 'var(--space-2) var(--space-3)',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--clr-border-accent)',
                            background: 'rgba(99,55,245,0.08)',
                            color: 'var(--clr-primary-300)',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                            flexShrink: 0,
                        }}
                    >
                        {chip.label}
                    </button>
                ))}
            </div>

            {/* Input area */}
            <div style={{
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--clr-bg-surface)',
                paddingBottom: 'calc(var(--space-3) + env(safe-area-inset-bottom, 0px))',
                flexShrink: 0,
            }}>
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                    <input
                        type="text"
                        className="input"
                        style={{ flex: 1, padding: 'var(--space-3) var(--space-4)', fontSize: '0.95rem' }}
                        placeholder="Scrivi una domanda..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    {/* Compact icon-only send button */}
                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isTyping}
                        title="Invia"
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            border: 'none',
                            background: input.trim() && !isTyping ? 'var(--clr-primary-500)' : 'var(--clr-bg-hover)',
                            color: '#fff',
                            cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.1rem',
                            transition: 'all var(--transition-fast)',
                            flexShrink: 0,
                            boxShadow: input.trim() && !isTyping ? '0 4px 12px rgba(99,55,245,0.4)' : 'none',
                        }}
                    >
                        ✈️
                    </button>
                </div>
                <div style={{ textAlign: 'center', marginTop: 'var(--space-2)', fontSize: '0.7rem', color: 'var(--clr-text-muted)' }}>
                    Il Tutor IA può sbagliare. Verifica le info importanti.
                </div>
            </div>
        </div>
    )
}
