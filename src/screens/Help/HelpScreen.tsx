import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar'

export default function HelpScreen() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<'basics' | 'xp' | 'reviews'>('basics')

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div className="screen-container">
                    <div className="flex flex-between mb-8">
                        <div>
                            <h1 className="gradient-text mb-2">Guida AILINGO</h1>
                            <p>Scopri come funziona l'app per massimizzare il tuo apprendimento.</p>
                        </div>
                        <button className="btn btn-ghost" onClick={() => navigate(-1)}>
                            ← Indietro
                        </button>
                    </div>

                    <div className="flex gap-4 mb-6">
                        <button
                            className={`btn ${activeTab === 'basics' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setActiveTab('basics')}
                        >
                            📚 Le Basi
                        </button>
                        <button
                            className={`btn ${activeTab === 'xp' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setActiveTab('xp')}
                        >
                            ⭐ XP e Combo
                        </button>
                        <button
                            className={`btn ${activeTab === 'reviews' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            🧠 Ripassi
                        </button>
                    </div>

                    <div className="card animate-fade-in" style={{ maxWidth: 800 }}>
                        {activeTab === 'basics' && (
                            <div className="flex-col gap-4">
                                <h3>Come funziona AILINGO?</h3>
                                <p>
                                    AILINGO è strutturato in Corsi, Livelli e Lezioni. Ogni lezione è composta da diversi
                                    esercizi interattivi: dalla traduzione alla pronuncia (Speaking), fino ai quiz a scelta multipla.
                                </p>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                                    <h4 className="text-primary mb-2">💡 Tasti di Aiuto negli Esercizi</h4>
                                    <p>Durante un esercizio, se rimani bloccato, troverai due pulsanti in alto a destra:</p>
                                    <ul style={{ paddingLeft: '20px', color: 'var(--clr-text-secondary)', lineHeight: 1.8 }}>
                                        <li><strong>Tasto Regola:</strong> Ti mostra una spiegazione grammaticale senza farti perdere punti.</li>
                                        <li><strong>Tasto Soluzione:</strong> Ti svela la risposta esatta! <em>(Attenzione: usare questo tasto ti impedirà di ricevere XP per quella specifica domanda e azzererà la tua Combo 🔥).</em></li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {activeTab === 'xp' && (
                            <div className="flex-col gap-4">
                                <h3>Come guadagnare XP</h3>
                                <p>Ogni esercizio completato con successo ti conferisce Punti Esperienza (XP). Più sei bravo, più punti ottieni!</p>
                                <ul style={{ paddingLeft: '20px', color: 'var(--clr-text-secondary)', lineHeight: 1.8 }}>
                                    <li><strong>Risposta Esatta:</strong> <span className="text-success">+10 XP</span></li>
                                    <li><strong>Velocità (meno di 5s):</strong> <span className="text-accent">+5 XP Bonus</span></li>
                                </ul>
                                <div style={{ background: 'var(--gradient-card)', border: '1px solid var(--clr-border-accent)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-2)' }}>
                                    <h4 className="text-purple mb-2">🔥 Sistema Combo</h4>
                                    <p>
                                        Infila una serie di risposte corrette di fila per attivare il moltiplicatore Combo. <br />
                                        <strong>Ogni 3 risposte esatte consecutive</strong> riceverai un <span className="badge badge-accent">+15 XP BONUS</span> massiccio!
                                        <br /><em>Attenzione: se sbagli una mossa, la barra del Combo si spezzerà.</em>
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="flex-col gap-4">
                                <h3>Algoritmo Spaced Repetition (Ripassi)</h3>
                                <p>
                                    AILINGO usa un sistema intelligente chiamato SM-2. L'App calcola "quando" è il momento ideale
                                    per farti ripassare una determinata parola affinché entri nella tua memoria a lungo termine.
                                </p>
                                <p>
                                    Quando una scheda nella tua Dashboard si illumina indicando "Ripassi Pronti", vuol dire che
                                    il timer di "decadimento della memoria" è scaduto. Ti consigliamo di fare i ripassi prima
                                    di iniziare nuove lezioni!
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    )
}
