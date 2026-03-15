import MultipleChoiceExercise from '../types/MultipleChoiceExercise'
import TranslationExercise from '../types/TranslationExercise'
import WordOrderExercise from '../types/WordOrderExercise'
import FillBlankExercise from '../types/FillBlankExercise'
import ListenWriteExercise from '../types/ListenWriteExercise'
import SpeakingExercise from '../types/SpeakingExercise'
import MatchPairsExercise from '../types/MatchPairsExercise'
import type { Exercise } from '../../../types'

export default function ExerciseRenderer({
    exercise,
    onAnswer,
    onNext,
}: {
    exercise: Exercise
    onAnswer: (correct: boolean, answer: string) => void
    onNext: () => void
}) {
    const props = { exercise, onAnswer, onNext }

    switch (exercise.type) {
        case 'multiple_choice':
            return <MultipleChoiceExercise {...props} />
        case 'translation_it_en':
        case 'translation_en_it':
            return <TranslationExercise {...props} />
        case 'word_order':
            return <WordOrderExercise {...props} />
        case 'fill_blank':
            return <FillBlankExercise {...props} />
        case 'listen_write':
            return <ListenWriteExercise {...props} />
        case 'speaking':
            return <SpeakingExercise {...props} />
        case 'match_pairs':
            return <MatchPairsExercise {...props} />
        default:
            return <TranslationExercise {...props} />
    }
}
