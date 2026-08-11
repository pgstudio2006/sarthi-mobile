import { translateIsaaLabel } from './faqI18n';
import type { AppLanguage } from '../i18n/translations';

export const ISAA_LABELS: Record<string, string> = {
  "How often does the child avoid looking at people's faces while talking or playing?": "Has poor eye contact",
  "How often does the child not smile back when someone smiles at them?": "Lacks social smile",
  "How often does the child prefer to stay alone instead of joining family members or other children?": "Remains aloof",
  "How often does the child not seek help, comfort, or share excitement with a familiar person?": "Does not reach out to others",
  "How often does the child seem unaware of people around them?": "Unable to relate to people",
  "How often does the child not notice or join what other people are doing?": "Unable to respond to social/environmental cues",
  "How often does the child play alone in the same way again and again?": "Engages in solitary and repetitive play activities",
  "How often does the child have difficulty waiting for their turn during play or conversation?": "Unable to take turns in social interaction",
  "How often does the child avoid playing or interacting with other children of a similar age?": "Does not maintain peer relationships",
  "How often does the child react in a way that does not match the situation?": "Shows inappropriate emotional response",
  "How often does the child react much more strongly than the situation requires?": "Shows exaggerated emotions",
  "How often does the child suddenly laugh, cry, or become excited without an obvious reason?": "Engages in self-stimulating emotions",
  "How often does the child do dangerous things without seeming to understand the risk?": "Lacks fear of danger",
  "How often does the child suddenly become very excited or upset without an obvious reason?": "Excited or agitated for no apparent reason",
  "How often does the child stop using words or sentences they could previously say?": "Acquired speech and lost it",
  "How often does the child find it difficult to use gestures like pointing, waving, or nodding to communicate?": "Has difficulty in using non-verbal language or gestures to communicate",
  "How often does the child repeat the same words or phrases again and again?": "Engages in stereotyped and repetitive use of language",
  "How often does the child repeat words or questions exactly as they hear them?": "Engages in echolalic speech",
  "How often does the child make unusual sounds instead of using words?": "Produces infantile squeals/unusual noises",
  "How often does the child have difficulty starting or continuing a conversation?": "Unable to initiate or sustain conversation with others",
  "How often does the child use words that do not have a clear meaning to others?": "Uses jargon or meaningless words",
  "How often does the child refer to themselves using the wrong words, such as saying \"you\" instead of \"I\"?": "Uses pronoun reversals",
  "How often does the child have difficulty understanding the real meaning behind what others say.": "Unable to grasp pragmatics of communication (real meaning)",
  "How often does the child repeatedly flap their hands, rock their body, spin, or make the same movements again and again?": "Engages in stereotyped and repetitive motor mannerisms",
  "How often does the child become unusually attached to a particular object?": "Shows attachment to inanimate objects",
  "How often does the child seem unable to sit still or stay calm?": "Shows hyperactivity/restlessness",
  "How often does the child hit, kick, bite, push, or hurt others?": "Exhibits aggressive behavior",
  "How often does the child have intense tantrums that are difficult to calm?": "Throws temper tantrums",
  "How often does the child hurt themselves on purpose?": "Engages in self-injurious behavior",
  "How often does the child become upset when daily routines or familiar things change?": "Insists on sameness",
  "How often does the child react strongly to everyday sounds, lights, smells, touch, or certain clothes?": "Unusually sensitive to sensory stimuli",
  "How often does the child stare into space for a long time without responding?": "Stares into space for long periods of time",
  "How often does the child have difficulty following a moving object with their eyes?": "Has difficulty in tracking objects",
  "How often does the child look at objects in unusual ways?": "Has unusual vision",
  "How often does the child seem to feel little or no pain after getting hurt?": "Insensitive to pain",
  "How often does child repeatedly smell objects, put things in their mouth, or frequently touch people?": "Responds to objects/people unusually by smelling, touching or tasting",
  "How often does the child have difficulty staying focused on an activity?": "Inconsistent attention and concentration",
  "How often does the child take much longer than expected to respond when spoken to?": "Shows delay in responding",
  "How often does the child remember unusual details much better than expected?": "Has unusual memory of some kind",
  "How often does the child show an exceptional skill that is much stronger than expected for their age?": "Has 'savant' ability",
};

export function toIsaaLabel(question: string): string {
  return ISAA_LABELS[question] || question;
}

export function toIsaaLabelTranslated(question: string, lang: string): string {
  const enLabel = ISAA_LABELS[question] || question;
  return translateIsaaLabel(enLabel, lang as AppLanguage);
}

export const DOMAIN_QUESTIONS: Record<string, string[]> = {
  Social: [
    "How often does the child avoid looking at people's faces while talking or playing?",
    "How often does the child not smile back when someone smiles at them?",
    "How often does the child prefer to stay alone instead of joining family members or other children?",
    "How often does the child not seek help, comfort, or share excitement with a familiar person?",
    "How often does the child seem unaware of people around them?",
    "How often does the child not notice or join what other people are doing?",
    "How often does the child play alone in the same way again and again?",
    "How often does the child have difficulty waiting for their turn during play or conversation?",
    "How often does the child avoid playing or interacting with other children of a similar age?",
  ],
  Emotion: [
    "How often does the child react in a way that does not match the situation?",
    "How often does the child react much more strongly than the situation requires?",
    "How often does the child suddenly laugh, cry, or become excited without an obvious reason?",
    "How often does the child do dangerous things without seeming to understand the risk?",
    "How often does the child suddenly become very excited or upset without an obvious reason?",
  ],
  Speech: [
    "How often does the child stop using words or sentences they could previously say?",
    "How often does the child find it difficult to use gestures like pointing, waving, or nodding to communicate?",
    "How often does the child repeat the same words or phrases again and again?",
    "How often does the child repeat words or questions exactly as they hear them?",
    "How often does the child make unusual sounds instead of using words?",
    "How often does the child have difficulty starting or continuing a conversation?",
    "How often does the child use words that do not have a clear meaning to others?",
    "How often does the child refer to themselves using the wrong words, such as saying \"you\" instead of \"I\"?",
    "How often does the child have difficulty understanding the real meaning behind what others say.",
  ],
  Behavior: [
    "How often does the child repeatedly flap their hands, rock their body, spin, or make the same movements again and again?",
    "How often does the child become unusually attached to a particular object?",
    "How often does the child seem unable to sit still or stay calm?",
    "How often does the child hit, kick, bite, push, or hurt others?",
    "How often does the child have intense tantrums that are difficult to calm?",
    "How often does the child hurt themselves on purpose?",
    "How often does the child become upset when daily routines or familiar things change?",
  ],
  Sensory: [
    "How often does the child react strongly to everyday sounds, lights, smells, touch, or certain clothes?",
    "How often does the child stare into space for a long time without responding?",
    "How often does the child have difficulty following a moving object with their eyes?",
    "How often does the child look at objects in unusual ways?",
    "How often does the child seem to feel little or no pain after getting hurt?",
    "How often does child repeatedly smell objects, put things in their mouth, or frequently touch people?",
  ],
  Cognitive: [
    "How often does the child have difficulty staying focused on an activity?",
    "How often does the child take much longer than expected to respond when spoken to?",
    "How often does the child remember unusual details much better than expected?",
    "How often does the child show an exceptional skill that is much stronger than expected for their age?",
  ],
};
