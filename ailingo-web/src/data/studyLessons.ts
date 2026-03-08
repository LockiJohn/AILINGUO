// ─── Static Study Lesson Library ───────────────────────────────────────────
// Each lesson has:
//   slides: 3-5 mini-lesson screens (text + examples)
//   exercises: built directly on the lesson content

export interface StudySlide {
    title: string
    body: string       // supports simple markdown-like **bold**
    example?: string   // highlighted example box
    emoji?: string
}

export interface StudyExercise {
    type: 'multiple_choice' | 'true_false' | 'fill_blank'
    prompt: string
    options?: string[]
    correct: string
    explanation: string
}

export interface StudyLesson {
    id: string
    subject: 'english' | 'italian' | 'physics' | 'chemistry'
    title: string
    subtitle: string
    emoji: string
    difficulty: 1 | 2 | 3
    estimatedMinutes: number
    xp: number
    slides: StudySlide[]
    exercises: StudyExercise[]
}

// ═══════════════════════════════════════════════════════════════════
//  ENGLISH
// ═══════════════════════════════════════════════════════════════════
const englishLessons: StudyLesson[] = [
    {
        id: 'eng-present-simple',
        subject: 'english',
        title: 'Present Simple',
        subtitle: 'Quando e come si usa il Presente Semplice',
        emoji: '🕐',
        difficulty: 1,
        estimatedMinutes: 5,
        xp: 40,
        slides: [
            {
                emoji: '🎯',
                title: 'Cos\'è il Present Simple?',
                body: 'Il **Present Simple** descrive azioni abituali, fatti generali e stati permanenti.',
                example: '✅ I go to school every day.\n✅ Water boils at 100°C.\n✅ She lives in Rome.',
            },
            {
                emoji: '⚙️',
                title: 'Come si costruisce?',
                body: 'La struttura è: **Soggetto + verbo base**.\nCon he/she/it aggiungi **-s** al verbo.',
                example: 'I play → She plays\nI go → He goes\nI watch → She watches',
            },
            {
                emoji: '❌',
                title: 'Come si nega?',
                body: 'Per negare usa **don\'t** (I/you/we/they) oppure **doesn\'t** (he/she/it) davanti al verbo base.',
                example: 'I don\'t like coffee.\nShe doesn\'t work on Sundays.',
            },
            {
                emoji: '❓',
                title: 'Come si fa una domanda?',
                body: 'Metti **Do** o **Does** all\'inizio della frase.\nIl verbo rimane alla **forma base** (no -s).',
                example: 'Do you speak English?\nDoes he play football?',
            },
        ],
        exercises: [
            { type: 'multiple_choice', prompt: 'She ___ (to play) tennis every Friday.', options: ['play', 'plays', 'is playing', 'played'], correct: 'plays', explanation: 'Con he/she/it aggiungiamo -s al verbo nel Present Simple.' },
            { type: 'multiple_choice', prompt: 'They ___ (to not / eat) meat.', options: ['doesn\'t eat', 'don\'t eat', 'not eat', 'no eat'], correct: 'don\'t eat', explanation: 'Con they usiamo "don\'t" per negare.' },
            { type: 'true_false', prompt: '"Does she works here?" è una frase corretta?', correct: 'Falso', explanation: 'Con Does il verbo rimane alla forma base: "Does she WORK here?"' },
            { type: 'multiple_choice', prompt: 'Qual è la forma corretta?', options: ['He don\'t swim.', 'He doesn\'t swim.', 'He not swim.', 'He no swim.'], correct: 'He doesn\'t swim.', explanation: 'Con he/she/it usiamo "doesn\'t" per negare.' },
            { type: 'fill_blank', prompt: '___ you like pizza? (Do/Does)', correct: 'Do', explanation: 'Con "you" usiamo "Do" per formare domande.' },
            { type: 'multiple_choice', prompt: 'My brother ___ in Milan.', options: ['live', 'lives', 'is live', 'liveing'], correct: 'lives', explanation: 'Con he/she/it il Present Simple vuole -s finale.' },
        ],
    },
    {
        id: 'eng-articles',
        subject: 'english',
        title: 'Articoli A, An, The',
        subtitle: 'La differenza tra articolo determinativo e indeterminativo',
        emoji: '📰',
        difficulty: 1,
        estimatedMinutes: 5,
        xp: 35,
        slides: [
            {
                emoji: '🔵',
                title: 'A / An (Articolo Indeterminativo)',
                body: '**A** si usa davanti a parole che iniziano per consonante.\n**An** si usa davanti a parole che iniziano per vocale (a, e, i, o, u).',
                example: 'a dog, a car, a book\nan apple, an orange, an hour',
            },
            {
                emoji: '🟢',
                title: 'The (Articolo Determinativo)',
                body: '**The** si usa quando parliamo di qualcosa di specifico, già noto o unico.\nSi usa con sostantivi sia singolari che plurali.',
                example: 'I saw a dog. The dog was huge.\nThe sun rises in the east.',
            },
            {
                emoji: '🚫',
                title: 'Quando NON si usa l\'articolo',
                body: 'Non si usa l\'articolo davanti a:\n• nomi propri (Italy, Marco)\n• sport (He plays **football**)\n• pasti generali (I eat **breakfast** at 7)',
                example: 'She is from Spain. ✅\nShe is from the Spain. ❌',
            },
        ],
        exercises: [
            { type: 'multiple_choice', prompt: 'I have ___ umbrella.', options: ['a', 'an', 'the', 'no article'], correct: 'an', explanation: '"Umbrella" inizia per vocale → an umbrella.' },
            { type: 'multiple_choice', prompt: '___ Eiffel Tower is in Paris.', options: ['A', 'An', 'The', 'No article'], correct: 'The', explanation: 'Luoghi unici e famosi vogliono "The".' },
            { type: 'true_false', prompt: '"She plays the football" è corretto?', correct: 'Falso', explanation: 'Con gli sport non si usa l\'articolo: "She plays football."' },
            { type: 'multiple_choice', prompt: 'I saw ___ cat. ___ cat was black.', options: ['a / The', 'the / The', 'a / A', 'an / The'], correct: 'a / The', explanation: 'Prima menzione → a. Seconda menzione (già noto) → The.' },
            { type: 'fill_blank', prompt: 'He is ___ engineer. (a/an)', correct: 'an', explanation: '"Engineer" inizia per vocale → an engineer.' },
        ],
    },
    {
        id: 'eng-past-simple',
        subject: 'english',
        title: 'Past Simple',
        subtitle: 'Come parlare del passato in inglese',
        emoji: '⏮️',
        difficulty: 2,
        estimatedMinutes: 6,
        xp: 50,
        slides: [
            {
                emoji: '📅',
                title: 'Quando si usa il Past Simple?',
                body: 'Il **Past Simple** descrive azioni completate nel passato, spesso con un tempo preciso.',
                example: 'I went to Rome last year.\nShe called me yesterday.\nThey watched a movie in 2023.',
            },
            {
                emoji: '🔧',
                title: 'Verbi regolari',
                body: 'Per i verbi regolari aggiungi **-ed** alla forma base.',
                example: 'work → worked\nplay → played\nwatch → watched\nlive → lived',
            },
            {
                emoji: '⚡',
                title: 'Verbi irregolari',
                body: 'I verbi irregolari hanno forme diverse. Devi memorizzarli!',
                example: 'go → went\nhave → had\nsee → saw\ndo → did\nbuy → bought',
            },
            {
                emoji: '❌',
                title: 'Negazione e domande',
                body: 'Usa **didn\'t** (did not) per negare.\nUsa **Did** per fare domande.\nIl verbo principale rimane alla **forma base**.',
                example: 'I didn\'t go to school.\nDid you see the film?',
            },
        ],
        exercises: [
            { type: 'multiple_choice', prompt: 'Yesterday, she ___ (to buy) a new phone.', options: ['buyed', 'bought', 'buy', 'buys'], correct: 'bought', explanation: '"Buy" è un verbo irregolare → bought.' },
            { type: 'multiple_choice', prompt: 'We ___ (to not / go) to the party.', options: ['didn\'t went', 'didn\'t go', 'don\'t go', 'not went'], correct: 'didn\'t go', explanation: 'Con "didn\'t" il verbo resta alla forma base (go, non went).' },
            { type: 'true_false', prompt: '"Did she worked at the bank?" è corretto?', correct: 'Falso', explanation: 'Con "Did" il verbo è alla base: "Did she WORK at the bank?"' },
            { type: 'multiple_choice', prompt: 'Qual è il Past Simple di "go"?', options: ['goed', 'went', 'gone', 'go'], correct: 'went', explanation: '"Go" è un verbo irregolare. Il passato è "went".' },
            { type: 'fill_blank', prompt: 'I ___ TV last night. (watched/watch)', correct: 'watched', explanation: '"Watch" è un verbo regolare → watched.' },
        ],
    },
    {
        id: 'eng-daily-phrases',
        subject: 'english',
        title: 'Frasi Quotidiane',
        subtitle: '20 espressioni indispensabili per la vita di ogni giorno',
        emoji: '💬',
        difficulty: 1,
        estimatedMinutes: 5,
        xp: 30,
        slides: [
            {
                emoji: '👋',
                title: 'Saluti',
                body: 'Le espressioni più comuni per salutare e congedarsi.',
                example: 'What\'s up? → Come stai?\nSee you later! → A dopo!\nTake care! → Stammi bene!\nNice to meet you! → Piacere di conoscerti!',
            },
            {
                emoji: '🙏',
                title: 'Essere educati',
                body: 'Espressioni fondamentali per la cortesia.',
                example: 'Could you please...? → Potresti...?\nI\'m sorry → Mi dispiace\nNever mind → Non importa\nNo worries! → Nessun problema!',
            },
            {
                emoji: '🤔',
                title: 'Non capisco!',
                body: 'Cosa dire quando non si capisce qualcosa.',
                example: 'Could you repeat that? → Puoi ripetere?\nWhat do you mean? → Cosa intendi?\nI\'m not sure → Non sono sicuro/-a\nCould you speak more slowly? → Più lentamente?',
            },
        ],
        exercises: [
            { type: 'multiple_choice', prompt: 'Come si dice "Non importa" in inglese?', options: ['No way', 'Never mind', 'No thanks', 'Not really'], correct: 'Never mind', explanation: '"Never mind" = non importa, lascia perdere.' },
            { type: 'multiple_choice', prompt: '"What\'s up?" significa:', options: ['Cosa stai guardando?', 'Cosa c\'è su?', 'Come stai? / Cosa succede?', 'Dove sei?'], correct: 'Come stai? / Cosa succede?', explanation: '"What\'s up?" è un saluto informale che significa "Come stai?" o "Cosa succede?"' },
            { type: 'true_false', prompt: '"Take care" si usa solo tra nemici.', correct: 'Falso', explanation: '"Take care" è un congedo amichevole che significa "stammi bene".' },
            { type: 'multiple_choice', prompt: 'Vuoi che qualcuno parli più lentamente. Dici:', options: ['Speak fast!', 'Could you speak more slowly?', 'No more talking!', 'You are fast.'], correct: 'Could you speak more slowly?', explanation: '"Could you speak more slowly?" è una richiesta educata di parlare più lentamente.' },
        ],
    },
]

// ═══════════════════════════════════════════════════════════════════
//  ITALIAN
// ═══════════════════════════════════════════════════════════════════
const italianLessons: StudyLesson[] = [
    {
        id: 'ita-articoli',
        subject: 'italian',
        title: 'Gli Articoli Italiani',
        subtitle: 'Il, lo, la, i, gli, le e quando usarli',
        emoji: '📖',
        difficulty: 1,
        estimatedMinutes: 5,
        xp: 35,
        slides: [
            {
                emoji: '🔵',
                title: 'Articoli determinativi maschili',
                body: '**il** → davanti a consonante: il cane, il libro\n**lo** → davanti a z, s+consonante, ps, y: lo zaino, lo studente\n**l\'** → davanti a vocale: l\'albero',
                example: 'il telefono\nlo schermo\nl\'amico',
            },
            {
                emoji: '🟣',
                title: 'Articoli determinativi femminili',
                body: '**la** → davanti a consonante: la casa, la borsa\n**l\'** → davanti a vocale: l\'arancia, l\'isola',
                example: 'la porta\nl\'estate\nla music',
            },
            {
                emoji: '🟢',
                title: 'Articoli al plurale',
                body: 'Maschile: **i** (il → i), **gli** (lo/l\' → gli)\nFemminile: **le** (la/l\' → le)',
                example: 'il cane → i cani\nlo studente → gli studenti\nla casa → le case',
            },
        ],
        exercises: [
            { type: 'multiple_choice', prompt: '___ zaino è pesante.', options: ['Il', 'Lo', 'La', 'L\''], correct: 'Lo', explanation: '"Zaino" inizia con z → si usa "lo".' },
            { type: 'multiple_choice', prompt: '___ amico di Marco è simpatico.', options: ['Il', 'Lo', 'L\'', 'La'], correct: 'L\'', explanation: '"Amico" inizia per vocale → si usa l\'.' },
            { type: 'multiple_choice', prompt: 'Plurale di "il libro":', options: ['li libri', 'i libri', 'gli libri', 'le libri'], correct: 'i libri', explanation: '"Il" al plurale diventa "i": i libri.' },
            { type: 'true_false', prompt: '"Lo problema" è corretto?', correct: 'Falso', explanation: '"Problema" inizia per p (consonante normale) → si usa "il": il problema.' },
            { type: 'fill_blank', prompt: '___ studenti sono bravi. (i/gli)', correct: 'gli', explanation: '"Studente" inizia per s+consonante → gli studenti al plurale.' },
        ],
    },
    {
        id: 'ita-presente',
        subject: 'italian',
        title: 'Il Presente Indicativo',
        subtitle: 'Coniugare i verbi italiani al presente',
        emoji: '✏️',
        difficulty: 2,
        estimatedMinutes: 6,
        xp: 45,
        slides: [
            {
                emoji: '🔤',
                title: 'I tre gruppi di verbi',
                body: 'I verbi italiani si dividono in 3 coniugazioni:\n**-ARE** (parlare, amare)\n**-ERE** (leggere, credere)\n**-IRE** (finire, partire)',
                example: 'parl-ARE\nlegg-ERE\npart-IRE',
            },
            {
                emoji: '📊',
                title: 'Verbi in -ARE',
                body: 'Radice + desinenza: -o, -i, -a, -iamo, -ate, -ano',
                example: 'io parlo\ntu parli\nlui/lei parla\nnoi parliamo\nvoi parlate\nloro parlano',
            },
            {
                emoji: '📊',
                title: 'Verbi in -ERE e -IRE',
                body: '-ERE: -o, -i, -e, -iamo, -ete, -ono\n-IRE: -o, -i, -e, -iamo, -ite, -ono',
                example: 'io leggo / parto\ntu leggi / parti\nlui legge / parte',
            },
            {
                emoji: '⚡',
                title: 'Verbi irregolari fondamentali',
                body: 'Alcuni verbi hanno forme irregolari che devi memorizzare.',
                example: 'essere: sono, sei, è, siamo, siete, sono\navere: ho, hai, ha, abbiamo, avete, hanno\nandare: vado, vai, va, andiamo, andate, vanno',
            },
        ],
        exercises: [
            { type: 'multiple_choice', prompt: 'Io ___ (parlare) con Maria ogni giorno.', options: ['parla', 'parli', 'parlo', 'parlate'], correct: 'parlo', explanation: 'Con "io" i verbi in -ARE terminano in -o: parlo.' },
            { type: 'multiple_choice', prompt: 'Voi ___ (leggere) molti libri.', options: ['leggete', 'leggono', 'leggi', 'legge'], correct: 'leggete', explanation: 'Con "voi" i verbi in -ERE terminano in -ete: leggete.' },
            { type: 'multiple_choice', prompt: '"Io ___ (avere) fame."', options: ['ha', 'ho', 'hai', 'hanno'], correct: 'ho', explanation: '"Avere" è irregolare. Con "io" si dice "ho".' },
            { type: 'true_false', prompt: '"Lui sono italiano" è corretto?', correct: 'Falso', explanation: 'Con "lui" il verbo "essere" è "è": Lui è italiano.' },
            { type: 'fill_blank', prompt: 'Lei ___ a Roma. (va/va/vado)', correct: 'va', explanation: '"Andare" è irregolare. Con lei si dice "va".' },
        ],
    },
]

// ═══════════════════════════════════════════════════════════════════
//  PHYSICS
// ═══════════════════════════════════════════════════════════════════
const physicsLessons: StudyLesson[] = [
    {
        id: 'phy-forces',
        subject: 'physics',
        title: 'Le Forze',
        subtitle: 'Cos\'è una forza e come agisce sui corpi',
        emoji: '💪',
        difficulty: 1,
        estimatedMinutes: 5,
        xp: 40,
        slides: [
            {
                emoji: '🎯',
                title: 'Cos\'è una forza?',
                body: 'Una **forza** è un\'azione capace di mettere in moto un corpo, fermarlo, o cambiarne la direzione.\nSi misura in **Newton (N)**.',
                example: 'Spingere una porta → forza di contatto\nLa Terra attira la mela → forza a distanza (gravità)',
            },
            {
                emoji: '⬇️',
                title: 'La Forza Peso',
                body: 'La **forza peso** è l\'attrazione gravitazionale della Terra su un corpo.\n**P = m × g**\ndove g ≈ 9.8 m/s² (accelerazione di gravità)',
                example: 'Un oggetto di 5 kg:\nP = 5 × 9.8 = 49 N',
            },
            {
                emoji: '🛑',
                title: 'L\'Attrito',
                body: 'L\'**attrito** è una forza che si oppone al movimento tra due superfici a contatto.\n• Attrito **statico**: impedisce l\'inizio del moto\n• Attrito **dinamico**: rallenta il moto in atto',
                example: 'Spingere una scatola sul pavimento → senti resistenza → è l\'attrito!',
            },
            {
                emoji: '📐',
                title: 'Vettori e direzione',
                body: 'Le forze sono **grandezze vettoriali**: hanno modulo (intensità), direzione e verso.\nSi rappresentano con **frecce**.',
                example: '→ 10 N verso destra\n← 10 N verso sinistra\n= equilibrio, il corpo non si muove!',
            },
        ],
        exercises: [
            { type: 'multiple_choice', prompt: 'L\'unità di misura della forza è:', options: ['Joule', 'Pascal', 'Newton', 'Watt'], correct: 'Newton', explanation: 'Le forze si misurano in Newton (N), in onore del fisico Isaac Newton.' },
            { type: 'multiple_choice', prompt: 'Un oggetto di 10 kg. Qual è la sua forza peso? (g=9.8)', options: ['10 N', '9.8 N', '98 N', '100 N'], correct: '98 N', explanation: 'P = m × g = 10 × 9.8 = 98 N.' },
            { type: 'true_false', prompt: 'L\'attrito aiuta sempre il movimento.', correct: 'Falso', explanation: 'L\'attrito si OPPONE al movimento. Rallenta o impedisce lo spostamento.' },
            { type: 'multiple_choice', prompt: 'Le forze sono grandezze:', options: ['Scalari', 'Chimiche', 'Vettoriali', 'Termiche'], correct: 'Vettoriali', explanation: 'Le forze hanno modulo, direzione e verso → sono vettoriali.' },
            { type: 'multiple_choice', prompt: 'Due forze uguali e opposte su un corpo producono:', options: ['Accelerazione', 'Equilibrio', 'Caduta', 'Esplosione'], correct: 'Equilibrio', explanation: 'Se le forze si bilanciano, la risultante è zero e il corpo è in equilibrio.' },
        ],
    },
    {
        id: 'phy-motion',
        subject: 'physics',
        title: 'Il Moto',
        subtitle: 'Velocità, accelerazione e le leggi del movimento',
        emoji: '🚀',
        difficulty: 2,
        estimatedMinutes: 6,
        xp: 50,
        slides: [
            {
                emoji: '📏',
                title: 'Velocità media',
                body: 'La **velocità media** è il rapporto tra spazio percorso e tempo impiegato.\n**v = s / t**',
                example: 'Un\'auto percorre 120 km in 2 ore:\nv = 120/2 = 60 km/h',
            },
            {
                emoji: '⚡',
                title: 'Accelerazione',
                body: 'L\'**accelerazione** è la variazione di velocità nel tempo.\n**a = Δv / Δt**\nSi misura in **m/s²**',
                example: 'Da 0 a 30 m/s in 10 s:\na = 30/10 = 3 m/s²',
            },
            {
                emoji: '🎯',
                title: 'Moto Rettilineo Uniforme (MRU)',
                body: 'Nel **MRU** la velocità è costante e l\'accelerazione è zero.\nLa legge oraria è: **s = v × t**',
                example: 'A 20 m/s per 5 s:\ns = 20 × 5 = 100 m',
            },
            {
                emoji: '🌊',
                title: 'Le 3 Leggi di Newton',
                body: '1ª: Un corpo rimane in quiete o MRU se la forza netta è zero.\n2ª: **F = m × a** (forza uguale massa per accelerazione)\n3ª: Azione e reazione sono uguali e contrari.',
                example: 'F = 5 kg × 2 m/s² = 10 N',
            },
        ],
        exercises: [
            { type: 'multiple_choice', prompt: 'Un\'auto percorre 200 km in 4 ore. Velocità media?', options: ['50 km/h', '800 km/h', '40 km/h', '60 km/h'], correct: '50 km/h', explanation: 'v = s/t = 200/4 = 50 km/h.' },
            { type: 'multiple_choice', prompt: 'Nel Moto Rettilineo Uniforme l\'accelerazione è:', options: ['Costante', 'Crescente', 'Zero', 'Negativa'], correct: 'Zero', explanation: 'Nel MRU la velocità è costante, quindi l\'accelerazione è zero.' },
            { type: 'multiple_choice', prompt: 'F = m × a → se m=3 kg e a=4 m/s², F=?', options: ['1.3 N', '7 N', '12 N', '0.75 N'], correct: '12 N', explanation: 'F = 3 × 4 = 12 N. Questa è la 2ª Legge di Newton.' },
            { type: 'true_false', prompt: 'L\'accelerazione si misura in m/s.', correct: 'Falso', explanation: 'L\'accelerazione si misura in m/s² (metri al secondo QUADRO).' },
        ],
    },
    {
        id: 'phy-energy',
        subject: 'physics',
        title: 'Energia e Lavoro',
        subtitle: 'Energia cinetica, potenziale e principio di conservazione',
        emoji: '⚡',
        difficulty: 2,
        estimatedMinutes: 6,
        xp: 50,
        slides: [
            {
                emoji: '⚙️',
                title: 'Il Lavoro Fisico',
                body: 'Il **lavoro** è l\'energia trasferita da una forza quando sposta un corpo.\n**L = F × s** (in Joule)\nSolo se forza e spostamento sono paralleli!',
                example: 'Spingi con 10 N per 5 m:\nL = 10 × 5 = 50 J',
            },
            {
                emoji: '🏃',
                title: 'Energia Cinetica',
                body: 'L\'**energia cinetica** (Ec) è l\'energia del moto.\n**Ec = ½ × m × v²**',
                example: 'Oggetto di 2 kg a 3 m/s:\nEc = ½ × 2 × 9 = 9 J',
            },
            {
                emoji: '🏔️',
                title: 'Energia Potenziale',
                body: 'L\'**energia potenziale gravitazionale** (Ep) dipende dall\'altezza.\n**Ep = m × g × h**',
                example: 'm=1 kg, h=10 m, g=9.8:\nEp = 1×9.8×10 = 98 J',
            },
            {
                emoji: '♻️',
                title: 'Conservazione dell\'Energia',
                body: 'L\'**energia totale** (cinetica + potenziale) si conserva in assenza di attrito.\nEp si converte in Ec e viceversa.',
                example: 'Una palla che cade:\n↓ altezza → ↓ Ep → ↑ Ec → più veloce!',
            },
        ],
        exercises: [
            { type: 'multiple_choice', prompt: 'Unità di misura dell\'energia e del lavoro:', options: ['Newton', 'Watt', 'Joule', 'Pascal'], correct: 'Joule', explanation: 'Energia e lavoro si misurano in Joule (J).' },
            { type: 'multiple_choice', prompt: 'Un oggetto da 4 kg si muove a 2 m/s. Ec=?', options: ['16 J', '8 J', '4 J', '2 J'], correct: '8 J', explanation: 'Ec = ½ × 4 × 4 = 8 J.' },
            { type: 'true_false', prompt: 'Una palla ferma in cima a un dirupo ha energia cinetica alta.', correct: 'Falso', explanation: 'Se è ferma, la velocità è 0 → Ec = 0. Ha però alta energia POTENZIALE.' },
            { type: 'multiple_choice', prompt: 'In assenza di attrito, l\'energia meccanica totale si:', options: ['Annulla', 'Conserva', 'Raddoppia', 'Dimezza'], correct: 'Conserva', explanation: 'È il Principio di Conservazione dell\'Energia Meccanica.' },
        ],
    },
]

// ═══════════════════════════════════════════════════════════════════
//  CHEMISTRY
// ═══════════════════════════════════════════════════════════════════
const chemistryLessons: StudyLesson[] = [
    {
        id: 'chem-atoms',
        subject: 'chemistry',
        title: 'Atomi e Molecole',
        subtitle: 'I mattoni fondamentali della materia',
        emoji: '⚛️',
        difficulty: 1,
        estimatedMinutes: 5,
        xp: 40,
        slides: [
            {
                emoji: '🔬',
                title: 'L\'Atomo',
                body: 'L\'**atomo** è la più piccola parte di un elemento che conserva le proprietà chimiche di quell\'elemento.\nÈ composto da:\n• **Protoni** (+) → nucleo\n• **Neutroni** (neutrali) → nucleo\n• **Elettroni** (-) → orbite esterne',
                example: 'Atomo di Idrogeno:\n1 protone + 0 neutroni + 1 elettrone',
            },
            {
                emoji: '🔗',
                title: 'Le Molecole',
                body: 'Una **molecola** è formata da due o più atomi legati insieme.\nPuò essere formata da atomi dello stesso elemento o di elementi diversi.',
                example: 'H₂ → molecola biatomica (idrogeno)\nH₂O → acqua (idrogeno + ossigeno)\nCO₂ → anidride carbonica',
            },
            {
                emoji: '🧮',
                title: 'Numero Atomico e di Massa',
                body: '**Numero atomico (Z)** = numero di protoni (identifica l\'elemento)\n**Numero di massa (A)** = protoni + neutroni',
                example: 'Carbonio: Z=6, A=12\n→ 6 protoni + 6 neutroni',
            },
        ],
        exercises: [
            { type: 'multiple_choice', prompt: 'Quale particella subatomica ha carica NEGATIVA?', options: ['Protone', 'Neutrone', 'Elettrone', 'Nucleo'], correct: 'Elettrone', explanation: 'Gli elettroni hanno carica negativa e orbitano attorno al nucleo.' },
            { type: 'multiple_choice', prompt: 'H₂O è una molecola composta da:', options: ['Solo ossigeno', 'Idrogeno e azoto', 'Idrogeno e ossigeno', 'Carbonio e ossigeno'], correct: 'Idrogeno e ossigeno', explanation: 'H₂O = 2 atomi di Idrogeno (H) + 1 atomo di Ossigeno (O).' },
            { type: 'true_false', prompt: 'Il neutrone ha carica positiva.', correct: 'Falso', explanation: 'Il neutrone è NEUTRO, senza carica elettrica.' },
            { type: 'multiple_choice', prompt: 'Il numero atomico identifica:', options: ['Il numero di neutroni', 'Il numero di protoni', 'Il peso dell\'atomo', 'Il numero di elettroni liberi'], correct: 'Il numero di protoni', explanation: 'Il numero atomico Z = numero di protoni, che è unico per ogni elemento.' },
            { type: 'fill_blank', prompt: 'Il numero di massa A = protoni + ___', correct: 'neutroni', explanation: 'A = Z (protoni) + N (neutroni).' },
        ],
    },
    {
        id: 'chem-states',
        subject: 'chemistry',
        title: 'Stati della Materia',
        subtitle: 'Solido, liquido, gas e i passaggi di stato',
        emoji: '🧊',
        difficulty: 1,
        estimatedMinutes: 5,
        xp: 35,
        slides: [
            {
                emoji: '🧊',
                title: 'Lo Stato Solido',
                body: 'Nei **solidi** le particelle sono molto vicine e in posizioni fisse.\n→ Volume e forma **propri**.\n→ Non comprimibili.',
                example: 'Ghiaccio, roccia, ferro, legno',
            },
            {
                emoji: '💧',
                title: 'Lo Stato Liquido',
                body: 'Nei **liquidi** le particelle sono vicine ma libere di scorrere.\n→ Volume **proprio**, forma del **contenitore**.\n→ Poco comprimibili.',
                example: 'Acqua, olio, alcool, mercurio',
            },
            {
                emoji: '💨',
                title: 'Lo Stato Gassoso',
                body: 'Nei **gas** le particelle sono molto separate e in movimento.\n→ Né volume né forma propri.\n→ Molto comprimibili.',
                example: 'Vapore acqueo, aria, ossigeno puro',
            },
            {
                emoji: '🔄',
                title: 'Passaggi di Stato',
                body: '**Fusione**: solido → liquido (↑ temperatura)\n**Solidificazione**: liquido → solido (↓ temperatura)\n**Evaporazione**: liquido → gas\n**Condensazione**: gas → liquido\n**Sublimazione**: solido → gas (diretto)',
                example: 'Ghiaccio → 0°C → acqua (fusione)\nAcqua → 100°C → vapore (ebollizione)',
            },
        ],
        exercises: [
            { type: 'multiple_choice', prompt: 'Quale stato della materia NON ha forma propria ma ha volume proprio?', options: ['Solido', 'Liquido', 'Gas', 'Plasma'], correct: 'Liquido', explanation: 'I liquidi assumono la forma del contenitore ma mantengono il proprio volume.' },
            { type: 'multiple_choice', prompt: 'Il passaggio da solido a gas direttamente si chiama:', options: ['Fusione', 'Evaporazione', 'Sublimazione', 'Condensazione'], correct: 'Sublimazione', explanation: 'Sublimazione = passaggio diretto da solido a gas (es. ghiaccio secco).' },
            { type: 'true_false', prompt: 'I gas sono facilmente comprimibili.', correct: 'Vero', explanation: 'Nei gas le particelle sono distanziate → possono essere compresse facilmente.' },
            { type: 'multiple_choice', prompt: 'Il passaggio da gas a liquido si chiama:', options: ['Fusione', 'Condensazione', 'Evaporazione', 'Solidificazione'], correct: 'Condensazione', explanation: 'Condensazione = gas → liquido. Es: vapore che si trasforma in gocce d\'acqua.' },
            { type: 'fill_blank', prompt: 'L\'acqua bolle a ___ gradi Celsius. (100/0/37)', correct: '100', explanation: 'L\'acqua evapora (bolle) a 100°C a pressione atmosferica standard.' },
        ],
    },
    {
        id: 'chem-reactions',
        subject: 'chemistry',
        title: 'Reazioni Chimiche',
        subtitle: 'Come e perché gli elementi si combinano',
        emoji: '🧪',
        difficulty: 2,
        estimatedMinutes: 6,
        xp: 50,
        slides: [
            {
                emoji: '🔀',
                title: 'Cos\'è una reazione chimica?',
                body: 'Una **reazione chimica** è una trasformazione in cui le sostanze di partenza (**reagenti**) si convertono in nuove sostanze (**prodotti**).',
                example: 'Reagenti → Prodotti\nFerro + Ossigeno → Ossido di ferro (ruggine)',
            },
            {
                emoji: '⚖️',
                title: 'La Legge di Lavoisier',
                body: 'In una reazione chimica la **massa totale si conserva**: la massa dei reagenti è uguale alla massa dei prodotti.\n"Nulla si crea, nulla si distrugge, tutto si trasforma."',
                example: '2 g H₂ + 16 g O₂ → 18 g H₂O\n✅ 18 g = 18 g',
            },
            {
                emoji: '🔥',
                title: 'Reazioni esotermiche ed endotermiche',
                body: '**Esotermica**: rilascia calore (energia esce)\n**Endotermica**: assorbe calore (energia entra)',
                example: 'Combustione → esotermica (fuoco, calore)\nFotosintesi → endotermica (usa luce solare)',
            },
        ],
        exercises: [
            { type: 'multiple_choice', prompt: 'In una reazione chimica le sostanze di partenza si chiamano:', options: ['Prodotti', 'Elementi', 'Reagenti', 'Composti'], correct: 'Reagenti', explanation: 'I REAGENTI si trasformano durante la reazione per dare i PRODOTTI.' },
            { type: 'true_false', prompt: 'Nella combustione si perde massa.', correct: 'Falso', explanation: 'Per la Legge di Lavoisier la massa si conserva. Masa reagenti = massa prodotti.' },
            { type: 'multiple_choice', prompt: 'Una reazione che rilascia calore si chiama:', options: ['Endotermica', 'Esotermica', 'Neutra', 'Reversibile'], correct: 'Esotermica', explanation: 'Esotermica = energia ESCE (calore rilasciato). Es. combustione.' },
            { type: 'multiple_choice', prompt: 'La fotosintesi è una reazione:', options: ['Esotermica', 'Nulla si fa', 'Endotermica', 'Esplosiva'], correct: 'Endotermica', explanation: 'La fotosintesi ASSORBE energia luminosa → reazione endotermica.' },
        ],
    },
]

// ═══════════════════════════════════════════════════════════════════
//  EXPORT
// ═══════════════════════════════════════════════════════════════════
export const allStudyLessons: StudyLesson[] = [
    ...englishLessons,
    ...italianLessons,
    ...physicsLessons,
    ...chemistryLessons,
]

export const getLessonsBySubject = (subject: StudyLesson['subject']) =>
    allStudyLessons.filter(l => l.subject === subject)

export const getLessonById = (id: string) =>
    allStudyLessons.find(l => l.id === id) ?? null

export const SUBJECT_META: Record<StudyLesson['subject'], { label: string; emoji: string; color: string }> = {
    english: { label: 'Inglese', emoji: '🇬🇧', color: '#3b82f6' },
    italian: { label: 'Italiano', emoji: '🇮🇹', color: '#22c55e' },
    physics: { label: 'Fisica', emoji: '⚛️', color: '#f97316' },
    chemistry: { label: 'Chimica', emoji: '🧪', color: '#a855f7' },
}
