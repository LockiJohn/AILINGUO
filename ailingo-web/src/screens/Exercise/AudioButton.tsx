"use client"
interface Props {
    text: string
    slow?: boolean
    large?: boolean
    label?: string
}

// Web Speech API TTS - works offline in Electron's Chromium
export default function AudioButton({ text, slow = false, large = false, label }: Props) {
    const speak = () => {
        if (!window.speechSynthesis) return
        window.speechSynthesis.cancel()
        const utt = new SpeechSynthesisUtterance(text)
        utt.lang = 'en-US'
        utt.rate = slow ? 0.6 : 1.0
        utt.pitch = 1.0
        window.speechSynthesis.speak(utt)
    }

    return (
        <button
            className={`btn btn-ghost ${large ? '' : 'btn-sm'}`}
            onClick={speak}
            title={slow ? 'Riproduci lentamente' : 'Riproduci audio'}
            style={{ gap: 6 }}
        >
            {label ?? (slow ? '🐢 Lento' : '🔊 Ascolta')}
        </button>
    )
}

