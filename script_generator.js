const fs = require('fs');
const path = require('path');

const levels = ['a1', 'a2', 'b1', 'b2', 'c1'];
const outDir = path.join(process.cwd(), 'content', 'levels');

levels.forEach(l => {
    const dir = path.join(outDir, l);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Full conversational sentences for high quality teaching
const sentences = {
    a1: [
        { en: 'I am a student.', it: 'Io sono uno studente.', blank: 'am', distractors: ['is', 'are', 'be'] },
        { en: 'She likes apples.', it: 'A lei piacciono le mele.', blank: 'likes', distractors: ['like', 'liking', 'to like'] },
        { en: 'The cat is black.', it: 'Il gatto è nero.', blank: 'cat', distractors: ['dog', 'bird', 'mouse'] },
        { en: 'We go to school every day.', it: 'Andiamo a scuola tutti i giorni.', blank: 'go', distractors: ['goes', 'going', 'went'] },
        { en: 'My name is John.', it: 'Il mio nome è John.', blank: 'name', distractors: ['age', 'house', 'car'] },
        { en: 'They are my friends.', it: 'Loro sono i miei amici.', blank: 'friends', distractors: ['enemies', 'teachers', 'parents'] },
        { en: 'I have a red car.', it: 'Ho una macchina rossa.', blank: 'have', distractors: ['has', 'having', 'had'] },
        { en: 'You read a book.', it: 'Tu leggi un libro.', blank: 'read', distractors: ['write', 'listen', 'speak'] }
    ],
    a2: [
        { en: 'I went to the cinema yesterday.', it: 'Sono andato al cinema ieri.', blank: 'went', distractors: ['go', 'gone', 'going'] },
        { en: 'She is cooking dinner right now.', it: 'Lei sta preparando la cena in questo momento.', blank: 'cooking', distractors: ['cooks', 'cooked', 'cook'] },
        { en: 'This book is better than that one.', it: 'Questo libro è migliore di quello.', blank: 'better', distractors: ['good', 'best', 'well'] },
        { en: 'We will meet tomorrow at noon.', it: 'Ci incontreremo domani a mezzogiorno.', blank: 'will', distractors: ['would', 'do', 'did'] },
        { en: 'Have you ever been to Paris?', it: 'Sei mai stato a Parigi?', blank: 'ever', distractors: ['never', 'always', 'often'] },
        { en: 'He was sleeping when the phone rang.', it: 'Stava dormendo quando il telefono ha squillato.', blank: 'sleeping', distractors: ['sleeps', 'slept', 'sleep'] },
        { en: 'I don\'t want to buy anything.', it: 'Non voglio comprare niente.', blank: 'anything', distractors: ['something', 'nothing', 'everything'] },
        { en: 'They must leave immediately.', it: 'Devono partire immediatamente.', blank: 'must', distractors: ['can', 'may', 'might'] }
    ],
    b1: [
        { en: 'If it rains, we will stay at home.', it: 'Se piove, resteremo a casa.', blank: 'rains', distractors: ['rain', 'rained', 'will rain'] },
        { en: 'I have lived here since 2010.', it: 'Vivo qui dal 2010.', blank: 'since', distractors: ['for', 'from', 'in'] },
        { en: 'She told me that she was tired.', it: 'Mi ha detto che era stanca.', blank: 'told', distractors: ['said', 'spoke', 'talked'] },
        { en: 'The environment needs to be protected.', it: 'L\'ambiente ha bisogno di essere protetto.', blank: 'environment', distractors: ['economy', 'society', 'technology'] },
        { en: 'You don\'t have to wear a tie.', it: 'Non devi per forza indossare la cravatta.', blank: 'have to', distractors: ['mustn\'t', 'should', 'can'] },
        { en: 'I am used to getting up early.', it: 'Sono abituato ad alzarmi presto.', blank: 'getting', distractors: ['get', 'got', 'to get'] },
        { en: 'He managed to pass the exam.', it: 'È riuscito a superare l\'esame.', blank: 'managed', distractors: ['could', 'can', 'succeeded'] },
        { en: 'I wish I had more free time.', it: 'Vorrei avere più tempo libero.', blank: 'had', distractors: ['have', 'will have', 'having'] }
    ],
    b2: [
        { en: 'By the time we arrived, the movie had already started.', it: 'Quando siamo arrivati, il film era già iniziato.', blank: 'had', distractors: ['has', 'was', 'did'] },
        { en: 'If I had known, I would have helped you.', it: 'Se l\'avessi saputo, ti avrei aiutato.', blank: 'known', distractors: ['knew', 'know', 'knowing'] },
        { en: 'The phenomenon is completely ubiquitous.', it: 'Il fenomeno è completamente onnipresente.', blank: 'ubiquitous', distractors: ['unique', 'rare', 'isolated'] },
        { en: 'Despite the rain, we went for a walk.', it: 'Nonostante la pioggia, siamo andati a fare una passeggiata.', blank: 'Despite', distractors: ['Although', 'Even though', 'However'] },
        { en: 'The house is being painted next week.', it: 'La casa verrà dipinta la prossima settimana.', blank: 'being', distractors: ['been', 'be', 'to be'] },
        { en: 'He denied stealing the money.', it: 'Ha negato di aver rubato i soldi.', blank: 'stealing', distractors: ['to steal', 'stole', 'stolen'] },
        { en: 'I would rather you didn\'t smoke here.', it: 'Preferirei che tu non fumassi qui.', blank: 'didn\'t', distractors: ['don\'t', 'won\'t', 'not'] },
        { en: 'It\'s high time we left.', it: 'È ora che ce ne andiamo.', blank: 'left', distractors: ['leave', 'leaving', 'will leave'] }
    ],
    c1: [
        { en: 'Had I realized the danger, I wouldn\'t have gone.', it: 'Se mi fossi reso conto del pericolo, non sarei andato.', blank: 'Had', distractors: ['If', 'Should', 'Were'] },
        { en: 'Seldom have I seen such a beautiful sunset.', it: 'Raramente ho visto un tramonto così bello.', blank: 'have I seen', distractors: ['I have seen', 'did I see', 'I saw'] },
        { en: 'Having finished his work, he went home.', it: 'Avendo finito il suo lavoro, andò a casa.', blank: 'Having finished', distractors: ['Finished', 'Finishing', 'Have finished'] },
        { en: 'It is quintessential that you attend the meeting.', it: 'È essenziale che tu partecipi alla riunione.', blank: 'quintessential', distractors: ['optional', 'trivial', 'unnecessary'] },
        { en: 'He mitigates the risks by planning ahead.', it: 'Mitiga i rischi pianificando in anticipo.', blank: 'mitigates', distractors: ['aggravates', 'ignores', 'increases'] },
        { en: 'But for your help, I would have failed.', it: 'Se non fosse stato per il tuo aiuto, avrei fallito.', blank: 'But for', distractors: ['Except', 'Without', 'Unless'] },
        { en: 'Not only is she smart, but she is also hardworking.', it: 'Non solo è intelligente, ma è anche gran lavoratrice.', blank: 'is she', distractors: ['she is', 'she was', 'was she'] },
        { en: 'No sooner had I arrived than it started pouring.', it: 'Non appena sono arrivato, ha iniziato a diluviare.', blank: 'than', distractors: ['when', 'then', 'that'] }
    ]
};

const grammarRules = {
    a1: ['Present Simple: Uso di base per routine.', 'Verb To Be: Essere in inglese.', 'Sostantivi e Plurali'],
    a2: ['Past Simple: Azioni finite nel passato.', 'Present Continuous: Azioni in corso.', 'Aggettivi Comparativi'],
    b1: ['Present Perfect: Passato recente con impatto sul presente.', 'First Conditional: Ipotesi reali.', 'Modals completi'],
    b2: ['Past Perfect: Il passato nel passato.', 'Third Conditional: Ipotesi irreali.', 'Passive Voice complessa'],
    c1: ['Mixed Conditionals: Condizioni asimmetriche.', 'Inversion: Strutture enfatiche.', 'Participle Clauses Avanzate']
};

levels.forEach((levelCode) => {
    for (let u = 1; u <= 5; u++) { // 5 Units per level

        const unit = {
            levelCode: levelCode.toUpperCase(),
            order: u,
            title_en: `Unit ${u}: ${levelCode.toUpperCase()} Mastery`,
            title_it: `Unità ${u}: Padronanza ${levelCode.toUpperCase()}`,
            description_it: `Migliora le tue competenze di livello ${levelCode.toUpperCase()} con frasi complete ed esempi d'uso quotidiano.`,
            icon: ['🎓', '🚀', '💡', '🏆', '🌍'][u - 1],
            lessons: []
        };

        for (let l = 1; l <= 6; l++) { // 6 Lessons per unit
            let type = l % 3 === 0 ? 'grammar' : (l % 2 === 0 ? 'listening' : 'vocabulary');
            let rule = type === 'grammar' ? grammarRules[levelCode][u % 3] : null;

            const lesson = {
                order: l,
                title_en: `${type.charAt(0).toUpperCase() + type.slice(1)} Practice ${l}`,
                title_it: `Esercizio di ${type === 'grammar' ? 'Grammatica' : (type === 'listening' ? 'Ascolto' : 'Fraseologia')} ${l}`,
                type: type,
                estimated_minutes: [3, 5, 8][l % 3],
                exercises: []
            };

            for (let e = 1; e <= 8; e++) { // 8 Exercises per lesson
                const sentence = sentences[levelCode][e % sentences[levelCode].length];
                let exType = ['multiple_choice', 'translation', 'fill_in_the_blank'][e % 3];
                if (type === 'listening') exType = 'listening';

                const exercise = {
                    type: exType,
                    difficulty: Math.ceil(u / 2)
                };

                if (exType === 'multiple_choice') {
                    exercise.prompt_it = `Qual è la traduzione esatta per: "${sentence.it}"?`;

                    const fake1 = sentence.en.replace(sentence.blank, sentence.distractors[0]);
                    const fake2 = sentence.en.replace(sentence.blank, sentence.distractors[1]);
                    const fake3 = sentence.en.replace(sentence.blank, sentence.distractors[2]);

                    exercise.options = [sentence.en, fake1, fake2, fake3].sort(() => Math.random() - 0.5);
                    exercise.correct_answer = sentence.en;
                    exercise.explanation_it = `L'unica forma corretta e naturale è: "${sentence.en}".`;

                } else if (exType === 'translation') {
                    exercise.prompt_it = `Traduci l'intera frase in inglese: "${sentence.it}"`;
                    exercise.correct_answer = sentence.en;
                } else if (exType === 'listening') {
                    exercise.audio_text = sentence.en;
                    exercise.prompt_it = 'Trascrivi esattamente la frase in inglese che hai sentito.';

                    const fake1 = sentence.en.replace(sentence.blank, sentence.distractors[0]);
                    const fake2 = sentence.en.replace(sentence.blank, sentence.distractors[1]);

                    exercise.options = [sentence.en, fake1, fake2].sort(() => Math.random() - 0.5);
                    exercise.correct_answer = sentence.en;
                } else {
                    const blankedLine = sentence.en.replace(sentence.blank, '___');
                    exercise.prompt_en = `L'italiano è: ${sentence.it}. Completa la frase in inglese: ${blankedLine}`;
                    exercise.correct_answer = sentence.blank;

                    exercise.options = [sentence.blank, ...sentence.distractors].sort(() => Math.random() - 0.5);
                }

                if (rule) exercise.grammar_rule = rule;

                lesson.exercises.push(exercise);
            }
            unit.lessons.push(lesson);
        }

        // write unit file
        const fileName = path.join(outDir, levelCode, `unit_test_${u}.json`);
        fs.writeFileSync(fileName, JSON.stringify(unit, null, 2));
    }
});

console.log("Teacher-Level content generated: 150+ Full Sentence Conversational Exercises!");
