# Il Prompt Definitivo per AILINGO 🚀

Copia e incolla il testo qui sotto su ChatGPT, Claude o Gemni ogni volta che vuoi fargli generare un'intera Unità nuova (con svariate lezioni) per la tua app. 
Questo prompt è ingegnerizzato per sfruttare al 100% i tuoi 9 tipi di esercizi, richiedere spiegazioni brillanti e sfornare codice JSON perfetto, pronto per essere buttato nel database!

---

**Copia da qui in giù:**

\`\`\`text
Agisci come un Esperto Insegnante di Inglese Madrelingua, un Ingegnere Linguistico e un UX Content Designer per app di e-learning (livello Duolingo/Babbel).

Il tuo compito è generare un intero file JSON contenente un'UNITA' per un'app di apprendimento dell'inglese rivolta a italiani.
L'Unità deve essere divisa in più "lessons" (lezioni), ciascuna con 6-8 esercizi.

## REGOLE PEDAGOGICHE:
1. **Coinvolgimento & Umorismo:** Le frasi non devono essere noiose (es. non "La mela è rossa"). Usa situazioni reali, divertenti o utili (es. litigare con un cameriere, flirtare d'estate, sopravvivere in aeroporto).
2. **Progressività:** Inizia con gli abbinamenti parola (difficoltà 1), passa a frasi brevi (difficoltà 2) e concludi con dettati liberi o traduzioni lunghe (difficoltà 3).
3. **Micro-Learning:** La `explanation_it` (spiegazione post-errore o post-risoluzione) deve attaccare i classici "falsi amici" e strafalcioni italiani. Sii empatico ma dritto al punto (Max 2 frasi).
4. **Regola Grammaticale:** Il campo facoltativo `grammar_rule` deve essere iper-sintetico, quasi una formula matematica (es. "I would like = Vorrei (educato)").

## TIPI DI ESERCIZIO SUPPORTATI (USALI TUTTI, MIXALI):
- `multiple_choice`: Domanda a scelta multipla (usa "options" array da 4).
- `translation_it_en`: Traduci dall'italiano all'inglese (crea una frase che l'utente deve ricostruire o scrivere).
- `translation_en_it`: Traduci dall'inglese all'italiano.
- `word_order`: (In fase di sviluppo, evitalo per ora o usalo per frasi brevi).
- `fill_blank`: Completa la parola mancante (nel "prompt_en" usa "_____" per il buco).
- `listen_write`: Trascrivi quello che senti (usa "audio_text").
- `speaking`: L'utente deve pronunciare la frase al microfono (usa "audio_text" e "correct_answer").
- `match_pairs`: Abbina parole ITA-ENG ("correct_answer" deve essere formato così: "mela:apple|cane:dog|rosso:red|ciao:hello").
- `free_dictation`: Nessun aiuto visivo. L'utente ascolta "audio_text" e digita l'esatta stringa in "correct_answer" ignorando la punteggiatura. Massima difficoltà.

## SCHEMA JSON RICHIESTO:
Devi restituire SOLO codice JSON valido, senza testo fuori dal blocco di codice.

{
    "levelCode": "[Es: A1, A2, B1...]",
    "order": [Numero unità, es: 4],
    "title_en": "[Titolo Unità INGLESE]",
    "title_it": "[Titolo Unità ITALIANO]",
    "description_it": "[Piccola e accattivante descrizione]",
    "icon": "[Un'emoji adatta, es: ✈️]",
    "lessons": [
        {
            "order": 1,
            "title_en": "Lesson Name",
            "title_it": "Nome Lezione",
            "type": "vocabulary", // o grammar, o listening
            "estimated_minutes": 5,
            "exercises": [
                {
                    "type": "match_pairs",
                    "prompt_it": "Abbina le parole:",
                    "options": ["italiano1", "italiano2", "italiano3", "italiano4", "english1", "english2", "english3", "english4"], // mischiate!
                    "correct_answer": "italiano1:english1|italiano2:english2|italiano3:english3|italiano4:english4",
                    "difficulty": 1
                },
                // ... aggiungi qui un fill_blank, poi un multiple_choice (fornendo "options" e "correct_answer"),
                // poi uno "speaking", e concludi con un "free_dictation".
                // Includi sempre "explanation_it" per spiegazioni curiose e "grammar_rule" quando c'è una regola sottostante.
                // Usa sempre "audio_text" con la frase inglese pronunciata negli esercizi dove ha senso riprodurla.
            ]
        }
        // ... (Aggiungi una seconda lezione a questa unità per consolidare).
    ]
}

## LA TUA MISSIONE ORA:
Generami un'Unità completa per il livello A2 focalizzata sul tema "[INSERISCI QUI IL TEMA, es: Viaggiare e Sopravvivere in Aeroporto / Colloquio di Lavoro]".
\`\`\`
