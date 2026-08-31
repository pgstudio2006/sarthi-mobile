import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LOGO_DATA_URI from '../assets/logoDataUri';


import { toIsaaLabel } from './domainQuestions';

import SocialIcon from '../assets/figma/screen28/Frame-7.svg';
import EmotionIcon from '../assets/figma/screen28/Frame-5.svg';
import SpeechIcon from '../assets/figma/screen28/Frame-15.svg';
import BehaviorIcon from '../assets/figma/screen28/Frame-14.svg';
import SensoryIcon from '../assets/figma/screen28/Frame-13.svg';
import CognitiveIcon from '../assets/figma/screen28/Frame-11.svg';

export type ScreeningReportData = {
  childName: string;
  score: number;
  total: number;
  result: string;
  date?: string;
  screener?: string;
  domainBreakdown: any[];
  domainAnswers: Record<string, (number | null)[]>;
};

const DOMAIN_QUESTIONS: Record<string, string[]> = {
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

const DOMAIN_LABELS: Record<string, string> = {
  Social: 'Social Relationships',
  Emotion: 'Emotion Responses',
  Speech: 'Speech & Communication',
  Behavior: 'Behaviour Patterns',
  Sensory: 'Sensory Responses',
  Cognitive: 'Cognitive Skills (Attention & Memory)',
};

const DOMAIN_ORDER = ['Social', 'Emotion', 'Speech', 'Behavior', 'Sensory', 'Cognitive'];

type StatusConfig = {
  label: string;
  text: string;
  bg: string;
  border: string;
  recommendation: string;
  activities: string[];
};

const STATUS_CONFIG: Record<string, StatusConfig> = {
  excellent: {
    label: 'Excellent',
    text: '#1A7340',
    bg: '#E6F4EA',
    border: '#34A853',
    recommendation: 'Strong skills in this area. Continue everyday play and practice.',
    activities: ['Keep the same daily routines', 'Praise positive interactions', 'Build on strengths with fun games'],
  },
  good: {
    label: 'Good',
    text: '#1A7340',
    bg: '#E6F4EA',
    border: '#34A853',
    recommendation: 'On track. Reinforce these skills through regular routines.',
    activities: ['Practice during playtime', 'Encourage communication', 'Celebrate small wins'],
  },
  average: {
    label: 'Making progress',
    text: '#BB853E',
    bg: '#FDF3E5',
    border: '#BB853E',
    recommendation: 'Some variation is normal. Watch, encourage, and re-check over time.',
    activities: ['Add gentle practice', 'Use positive reinforcement', 'Track progress weekly'],
  },
  'needs attention': {
    label: 'Needs support',
    text: '#E25648',
    bg: '#FDF0EB',
    border: '#E25648',
    recommendation: 'Targeted practice and professional screening guidance are recommended.',
    activities: ['Practice short, focused sessions', 'Use visual supports', 'Speak with a therapist if concerns continue'],
  },
  'high priority': {
    label: 'Needs extra support',
    text: '#B9382E',
    bg: '#FDE8E8',
    border: '#B9382E',
    recommendation: 'Please consult a developmental specialist for an in-depth evaluation.',
    activities: ['Seek professional evaluation', 'Start early intervention if advised', 'Create a calm, structured environment'],
  },
};

const DOMAIN_ACTIVITIES: Record<string, string[]> = {
  Social: ['Play turn-taking games', 'Practice eye contact and greeting', 'Use emotion picture cards'],
  Emotion: ['Name feelings during daily routines', 'Use calm-down techniques', 'Read stories about emotions'],
  Speech: ['Read aloud together daily', 'Expand on what the child says', 'Use short, clear instructions'],
  Behavior: ['Keep consistent routines', 'Use visual schedules', 'Offer simple choices'],
  Sensory: ['Provide quiet sensory breaks', 'Introduce textures gradually', 'Use movement activities'],
  Cognitive: ['Sort objects by color and shape', 'Play memory games', 'Break tasks into small steps'],
};

type CategoryConfig = {
  label: string;
  color: string;
  lightBg: string;
  explanation: string;
  recommendation: string;
};

function normalizeStatus(status?: string): string {
  if (!status) return 'average';
  const s = status.toLowerCase().trim();
  if (s.includes('doing great')) return 'excellent';
  if (s.includes('doing well')) return 'good';
  if (s.includes('making progress')) return 'average';
  if (s.includes('needs extra support')) return 'high priority';
  if (s.includes('needs support')) return 'needs attention';
  if (s.includes('needs attention')) return 'needs attention';
  if (s.includes('excellent') || s.includes('great')) return 'excellent';
  if (s.includes('good') || s.includes('well')) return 'good';
  if (s.includes('average') || s.includes('ok') || s.includes('fair')) return 'average';
  if (s.includes('high') || s.includes('critical') || s.includes('severe')) return 'high priority';
  if (s.includes('attention') || s.includes('support') || s.includes('needs')) return 'needs attention';
  return 'average';
}

function deriveStatus(score: number, maxScore: number): string {
  const ratio = score / (maxScore || 1);
  if (ratio <= 0.25) return 'good';
  if (ratio <= 0.5) return 'average';
  if (ratio <= 0.75) return 'needs attention';
  return 'high priority';
}

function getOverallCategory(score: number): CategoryConfig {
  if (score < 70) {
    return {
      label: 'No Signs of Autism', color: '#1A7340', lightBg: '#E6F4EA',
      explanation: 'No significant developmental signals were observed in this screening.',
      recommendation: 'Continue regular developmental activities and routine monitoring.',
    };
  }
  if (score <= 106) {
    return {
      label: 'Mild Autism', color: '#BB853E', lightBg: '#FEF3C7',
      explanation: 'Some developmental signals were noticed. These results are not a diagnosis, but they can guide your next steps.',
      recommendation: 'Consider a detailed evaluation and early support with a specialist.',
    };
  }
  if (score <= 153) {
    return {
      label: 'Moderate Autism', color: '#E8564A', lightBg: '#FDEEEA',
      explanation: 'Several developmental signals were noted. A professional assessment is recommended.',
      recommendation: 'Speak with a developmental pediatrician or child psychiatrist for guidance.',
    };
  }
  return {
    label: 'Severe Autism', color: '#B9382E', lightBg: '#FDE8E8',
    explanation: 'A high number of developmental signals were reported. Professional evaluation is strongly recommended.',
    recommendation: 'Please consult a developmental specialist as soon as possible.',
  };
}

function statusBadge(status?: string): string {
  const key = normalizeStatus(status);
  const cfg = STATUS_CONFIG[key] || STATUS_CONFIG.average;
  return `<span style="display:inline-block;padding:4px 10px;border-radius:12px;background:${cfg.bg};color:${cfg.text};border:1px solid ${cfg.border};font-size:11px;font-weight:600;">${escapeHtml(cfg.label)}</span>`;
}

function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getScreenerRole(screener?: string): string {
  if (!screener) return 'caregiver';
  const match = screener.match(/\(([^)]+)\)/);
  return match ? match[1] : screener;
}

function buildReportHtml(data: ScreeningReportData): string {
  const { childName, score, total, date, screener, domainBreakdown, domainAnswers } = data;
  const screenerRole = getScreenerRole(screener);
  const questionCount = DOMAIN_ORDER.reduce((sum, key) => sum + (DOMAIN_QUESTIONS[key]?.length || 0), 0);
  const category = getOverallCategory(score);

  const resultLabel = data.result === 'Normal' ? 'No Signs of Autism' : data.result || 'Screening Result';
  const resultPhrase = (() => {
    if (data.result === 'Normal') return 'no significant';
    const r = (data.result || '').toLowerCase();
    if (r.includes('mild')) return 'mild';
    if (r.includes('moderate')) return 'moderate';
    if (r.includes('severe')) return 'severe';
    return 'some';
  })();

  const pdfStatusBadge = (statusLabel: string) => {
    const key = normalizeStatus(statusLabel);
    const cfg = STATUS_CONFIG[key] || STATUS_CONFIG.average;
    return `<span style='display:inline-block;padding:4px 10px;border-radius:12px;background:${cfg.bg};color:${cfg.text};border:1px solid ${cfg.border};font-size:11px;font-weight:600;'>${escapeHtml(statusLabel)}</span>`;
  };

  const focusDomains: string[] = [];
  const strengthDomains: string[] = [];

  const overviewRows = DOMAIN_ORDER.map((key) => {
    const bd = domainBreakdown?.find((b: any) => b.key === key);
    const label = DOMAIN_LABELS[key];
    const scoreStr = bd ? `${bd.score} / ${bd.maxScore}` : '-';
    const statusLabel = bd?.score !== undefined ? getDomainStatus(key, Number(bd.score)).label : (bd?.status || 'Doing well');
    const statusKey = normalizeStatus(statusLabel);
    if (statusKey === 'needs attention' || statusKey === 'high priority') focusDomains.push(label);
    if (statusKey === 'excellent' || statusKey === 'good') strengthDomains.push(label);
    return `<tr>
      <td style='padding:8px 10px;border:1px solid #E2E4E8;'>${escapeHtml(label)}</td>
      <td style='padding:8px 10px;border:1px solid #E2E4E8;text-align:center;font-weight:600;'>${escapeHtml(scoreStr)}</td>
      <td style='padding:8px 10px;border:1px solid #E2E4E8;'>${pdfStatusBadge(statusLabel)}</td>
    </tr>`;
  }).join('');

  const domainDetails = DOMAIN_ORDER.map((key, index) => {
    const bd = domainBreakdown?.find((b: any) => b.key === key);
    const label = DOMAIN_LABELS[key];
    const scoreStr = bd ? `${bd.score} / ${bd.maxScore}` : '-';
    const statusLabel = bd?.score !== undefined ? getDomainStatus(key, Number(bd.score)).label : (bd?.status || 'Doing well');
    const questions = DOMAIN_QUESTIONS[key] || [];
    const answers = domainAnswers[key] || [];

    const working: string[] = [];
    const attention: string[] = [];
    const missing: string[] = [];
    questions.forEach((q, i) => {
      const a = answers[i];
      if (a === null || a === undefined) missing.push(toIsaaLabel(q));
      else if (a >= 2) attention.push(toIsaaLabel(q));
      else working.push(toIsaaLabel(q));
    });

    const workingItems = working.length
      ? working.map((q, i) => `<li style='margin:4px 0;'><span style='color:#1A7340;margin-right:6px;'>&#10003;</span>${i + 1}. ${escapeHtml(q)}</li>`).join('')
      : '<li style=\'margin:4px 0;color:#6B7180;\'>No item in this category.</li>';
    const attentionItems = attention.length
      ? attention.map((q, i) => `<li style='margin:4px 0;'><span style='color:#B71C1C;margin-right:6px;'>&#9888;</span>${i + 1}. ${escapeHtml(q)}</li>`).join('')
      : '<li style=\'margin:4px 0;color:#6B7180;\'>No major challenge was noted in this area at this time.</li>';

    const missingNote = missing.length
      ? `<p style='margin:8px 0;font-size:12px;color:#6B7180;'>* Note: ${escapeHtml(screenerRole)} did not provide an answer for the following question${missing.length > 1 ? 's' : ''} — ${missing.map(escapeHtml).join('; ')}</p>`
      : '';

    const pageBreak = index === 2 || index === DOMAIN_ORDER.length - 1 ? `<div style='page-break-after:always;'></div>` : '';

    return `
      <div class='domain-detail' style='margin-top:18px;padding:14px 8px 10px;border-top:1px solid #E2E4E8;background:#FFFFFF;'>
        <div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;'>
          <h3 style='font-size:16px;color:#2D2A3A;margin:0;'>${escapeHtml(label)}</h3>
          ${pdfStatusBadge(statusLabel)}
        </div>
        <p style='margin:4px 0 12px;font-size:14px;'>Score: ${escapeHtml(scoreStr)}</p>
        <h4 style='font-size:14px;color:#1A7340;margin:12px 0 4px;'>What's Working Well  (${working.length})</h4>
        <ul style='padding-left:20px;font-size:12px;margin:0;'>${workingItems}</ul>
        <h4 style='font-size:14px;color:#B71C1C;margin:12px 0 4px;'>Needs Attention  (${attention.length})</h4>
        <ul style='padding-left:20px;font-size:12px;margin:0;'>${attentionItems}</ul>
        ${missingNote}
      </div>
      ${pageBreak}
    `;
  }).join('');

  const focusText = focusDomains.length ? focusDomains.join(' and ') : 'some domains';
  const strengthText = strengthDomains.length ? strengthDomains.join(' and ') : 'some domains';
  const resultExplanation = data.result === 'Normal'
    ? `${escapeHtml(childName)} showed no significant autism-related signals in the screening. ${strengthDomains.length ? `Strengths were noted in ${escapeHtml(strengthText)}.` : ''} Continue regular developmental activities and routine monitoring.`
    : `${escapeHtml(childName)} shows ${resultPhrase} signs mainly in the ${escapeHtml(focusText)} domains, while ${escapeHtml(childName)} responds well in the ${escapeHtml(strengthText)} domain. A detailed evaluation by a specialist and early intervention can help support ${escapeHtml(childName)}'s development.`;

  const focusAreasLine = focusDomains.length
    ? `<p style='font-size:12px;margin:4px 0;'><span style='color:#B71C1C;'>&#9888;</span> <strong>Focus Areas:</strong> ${escapeHtml(focusDomains.join('  •  '))}</p>`
    : '';

  return `
    <html>
      <head>
        <meta charset='utf-8' />
        <style>
          @page { size: A4; margin: 16mm 18mm 18mm; }
          * { box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, Helvetica, Arial, sans-serif; color: #2D2A3A; margin: 0; font-size: 12px; }
          h1 { font-size: 22px; color: #2D2A3A; margin: 12px 0 4px; line-height: 1.2; }
          h2 { font-size: 16px; color: #535BD8; margin: 20px 0 10px; line-height: 1.25; }
          h3, h4 { page-break-after: avoid; }
          p, li, td, th { font-size: 12px; line-height: 1.45; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; page-break-inside: avoid; }
          th { background: #F3F2FF; color: #535BD8; text-align: left; padding: 8px 10px; border: 1px solid #E2E4E8; }
          td { vertical-align: top; }
          .domain-detail { page-break-inside: avoid; }
          .page-section { page-break-after: always; }
        </style>
      </head>
      <body>
        <header style='text-align:center;margin-bottom:20px;'>
          <img src='${LOGO_DATA_URI}' width='48' height='48' style='display:block;margin:0 auto 8px;' />
          <h1>${escapeHtml(childName)}'s Autism Screening Report</h1>
          <p style='margin:0;color:#6B7180;font-style:italic;font-size:11px;'>Based on ISAA (Indian Scale for Assessment of Autism)</p>
        </header>

        <section style='background:#F7F7F7;padding:12px 10px 16px;margin-bottom:18px;'>
          <h2 style='color:#333;margin:0 0 12px;font-size:14px;'>Screening Overview</h2>
          <p style='font-size:14px;margin:0 0 16px;'><strong>Overall Score:  ${score} / ${total}</strong></p>
          <div style='height:17px;background:#E4E4E4;overflow:hidden;margin:0 0 14px;'>
            <div style='height:17px;width:${Math.min(100, Math.max(0, (score / Math.max(1, total)) * 100))}%;background:${category.color};'></div>
          </div>
          <p style='display:inline-block;min-width:180px;text-align:center;padding:5px 12px;margin:0;background:${category.lightBg};color:${category.color};font-size:12px;font-weight:700;'>${escapeHtml(resultLabel)}</p>
          <p style='font-size:11px;color:#777;font-style:italic;margin:14px 0 0;'>* This score is only indicative, not a diagnosis. Please consult a specialist to confirm.</p>
        </section>

        <h2>Overview of the 6 Domains</h2>
        <table>
          <thead>
            <tr><th style='width:50%;'>Domain</th><th style='text-align:center;'>Score</th><th>Status</th></tr>
          </thead>
          <tbody>${overviewRows}</tbody>
        </table>

        <section style='background:${category.lightBg};padding:14px 16px;margin:18px 0;'>
          <h2 style='color:${category.color};margin:0 0 8px;font-size:14px;'>Screening Result</h2>
          <p style='font-size:16px;margin:0 0 8px;'><strong>${escapeHtml(resultLabel)}</strong> <span style='font-size:12px;'>(${score} / ${total})</span></p>
          <p style='font-size:12px;margin:8px 0;'>${resultExplanation}</p>
          ${focusAreasLine}
          <p style='font-size:12px;margin:8px 0 0;'><strong>For a detailed diagnosis, please consult a Developmental Pediatrician.</strong></p>
        </section>

        <div style='padding:12px 16px;background:#F4F4F6;margin:16px 0;'>
          <h3 style='margin:0;font-size:14px;color:#333;'><span style='margin-right:6px;color:#B07D00;'>&#9888;</span>A Screening is Not a Diagnosis</h3>
          <p style='margin:6px 0 0;font-size:12px;color:#6B7180;'>Screening results are not a diagnosis. They help identify developmental signals and guide the next steps. Please consult a child psychiatrist or a developmental specialist to confirm.</p>
        </div>

        <div style='page-break-before:always;'></div>
        <h2>Development by Domain</h2>
        <p style='font-size:12px;color:#6B7180;'>See below what is working well and where more attention is needed in each domain.</p>

        ${domainDetails}

        <p style='margin-top:32px;font-size:11px;color:#6B7180;'>
          This report has been prepared based on the scores given by ${escapeHtml(screenerRole)} (from the ${questionCount} ISAA questions). The “What's Working Well” section lists items answered Rarely or Sometimes (score 0 or 1), and the “Needs Attention” section lists items answered Often, Most of the times or Almost Always (score 2 or higher).
        </p>
      </body>
    </html>
  `;
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^\w\s-]/g, '').trim() || 'report';
}

export function getResultColors(result?: string) {
  const r = (result || '').toLowerCase();
  if (r.includes('severe')) {
    return { text: '#2D2A3A', bg: '#FDE8E8', border: '#E25648', fill: '#B9382E' };
  }
  if (r.includes('moderate')) {
    return { text: '#2D2A3A', bg: '#FDEEEA', border: '#EF6B61', fill: '#E8564A' };
  }
  if (r.includes('mild')) {
    return { text: '#BB853E', bg: '#FEF3C7', border: '#BB853E', fill: '#BB853E' };
  }
  return { text: '#1A7340', bg: '#E6F4EA', border: '#34A853', fill: '#1A7340' };
}

export function getDomainRingColor(
  status: string | undefined,
  defaultColor: string,
  progress?: number,
): string {
  const s = (status ?? '').toLowerCase();
  if (s.includes('support')) return '#E25648';
  return defaultColor;
}

const DOMAIN_STATUS_RANGES: Record<string, { label: string; min: number; max: number }[]> = {
  Social: [
    { label: 'Doing great', min: 0, max: 9 }, { label: 'Doing well', min: 10, max: 18 },
    { label: 'Making progress', min: 19, max: 27 }, { label: 'Needs support', min: 28, max: 36 },
    { label: 'Needs extra support', min: 37, max: 45 },
  ],
  Emotion: [
    { label: 'Doing great', min: 0, max: 5 }, { label: 'Doing well', min: 6, max: 10 },
    { label: 'Making progress', min: 11, max: 15 }, { label: 'Needs support', min: 16, max: 20 },
    { label: 'Needs extra support', min: 21, max: 25 },
  ],
  Speech: [
    { label: 'Doing great', min: 0, max: 9 }, { label: 'Doing well', min: 10, max: 18 },
    { label: 'Making progress', min: 19, max: 27 }, { label: 'Needs support', min: 28, max: 36 },
    { label: 'Needs extra support', min: 37, max: 45 },
  ],
  Behavior: [
    { label: 'Doing great', min: 0, max: 7 }, { label: 'Doing well', min: 8, max: 14 },
    { label: 'Making progress', min: 15, max: 21 }, { label: 'Needs support', min: 22, max: 28 },
    { label: 'Needs extra support', min: 29, max: 35 },
  ],
  Sensory: [
    { label: 'Doing great', min: 0, max: 6 }, { label: 'Doing well', min: 7, max: 12 },
    { label: 'Making progress', min: 13, max: 18 }, { label: 'Needs support', min: 19, max: 24 },
    { label: 'Needs extra support', min: 25, max: 30 },
  ],
  Cognitive: [
    { label: 'Doing great', min: 0, max: 4 }, { label: 'Doing well', min: 5, max: 8 },
    { label: 'Making progress', min: 9, max: 12 }, { label: 'Needs support', min: 13, max: 16 },
    { label: 'Needs extra support', min: 17, max: 20 },
  ],
};

export function getDomainStatus(domain: string, score: number) {
  const ranges = DOMAIN_STATUS_RANGES[domain] ?? DOMAIN_STATUS_RANGES.Social;
  const safeScore = Number.isFinite(score) ? Math.max(0, score) : 0;
  return ranges.find((range) => safeScore >= range.min && safeScore <= range.max) ?? ranges[ranges.length - 1];
}

export function getStatusColors(status?: string) {
  const normalized = (status ?? '').toLowerCase();
  if (normalized.includes('extra support') || normalized.includes('more support')) {
    return { color: '#B9382E', bg: '#FDE8E8' };
  }
  if (normalized.includes('needs support') || normalized.includes('support')) {
    return { color: '#E25648', bg: '#FDF0EB' };
  }
  if (normalized.includes('progress')) {
    return { color: '#BB853E', bg: '#FDF3E5' };
  }
  return { color: '#1A7340', bg: '#E8F7F0' };
}

export type DomainInsightCard = {
  title: string;
  heading: string;
  status: string;
  statusColor: string;
  statusBg: string;
  color: string;
  Icon: any;
  bullets: string[];
};

const DOMAIN_INSIGHT_META: Record<string, { title: string; color: string; Icon: any; supportHeading: string; goodHeading: string }> = {
  Social: { title: 'Social Interaction', color: '#9651C8', Icon: SocialIcon, supportHeading: 'Social interaction needs support', goodHeading: 'Social interaction is on track' },
  Emotion: { title: 'Emotion Responses', color: '#2BA8A6', Icon: EmotionIcon, supportHeading: 'Emotion responses need support', goodHeading: 'Emotion responses are on track' },
  Speech: { title: 'Speech & Language', color: '#3B8DBD', Icon: SpeechIcon, supportHeading: 'Communication needs support', goodHeading: 'Speech & language is on track' },
  Behavior: { title: 'Behaviour Patterns', color: '#D66A8E', Icon: BehaviorIcon, supportHeading: 'Repetitive patterns need guidance', goodHeading: 'Daily behaviours are well-balanced' },
  Sensory: { title: 'Sensory Responses', color: '#F4A261', Icon: SensoryIcon, supportHeading: 'Sensory responses need support', goodHeading: 'Sensory responses are on track' },
  Cognitive: { title: 'Cognitive Patterns', color: '#6D7EAE', Icon: CognitiveIcon, supportHeading: 'Attention & focus need support', goodHeading: 'Cognitive skills are on track' },
};

export function buildDomainTopInsights(domainBreakdown?: any[], previousScore?: any): DomainInsightCard[] {
  if (!domainBreakdown || domainBreakdown.length === 0) return [];
  const cards: DomainInsightCard[] = [];
  const order = ['Social', 'Emotion', 'Speech', 'Behavior', 'Sensory', 'Cognitive'];
  order.forEach((key) => {
    const meta = DOMAIN_INSIGHT_META[key];
    const bd = domainBreakdown.find((b: any) => b.key === key);
    if (!meta) return;
    const score = Number(bd?.score || 0);
    const maxScore = Number(bd?.maxScore || 45);
    const needsSupport = (bd?.status ?? '').toLowerCase().includes('need') || score > maxScore * 0.4;
    const prevBd = previousScore?.domainBreakdown?.find((b: any) => b.key === key);
    const isImproved = prevBd ? score < Number(prevBd.score || 0) : false;
    const status = bd?.score !== undefined
      ? getDomainStatus(key, score).label
      : (bd?.status || (needsSupport ? 'Needs support' : 'Doing well'));
    const statusColors = getStatusColors(status);
    const statusColor = statusColors.color;
    const statusBg = statusColors.bg;
    const heading = isImproved ? meta.goodHeading : needsSupport ? meta.supportHeading : meta.goodHeading;
    const activities = (DOMAIN_ACTIVITIES[key] || []).slice(0, 3);
    const bullets = activities.length ? activities : ['Keep supporting development with age-appropriate activities.', 'Praise small wins during daily routines.', 'Monitor progress and repeat screening if needed.'];
    cards.push({
      title: meta.title,
      heading,
      status,
      statusColor,
      statusBg,
      color: meta.color,
      Icon: meta.Icon,
      bullets,
    });
  });
  return cards;
}

export async function generateScreeningReportPDF(data: ScreeningReportData, action: 'share' | 'download' = 'share') {
  let Print: any;
  let Sharing: any;
  try {
    // @ts-ignore
    Print = require('expo-print');
    // @ts-ignore
    Sharing = require('expo-sharing');
  } catch {
    Alert.alert('PDF feature unavailable', 'Please run npm install so that expo-print and expo-sharing are available.');
    return;
  }

  if (!Print || !Print.printToFileAsync) {
    Alert.alert('PDF feature unavailable', 'expo-print module is not loaded.');
    return;
  }

  try {
    const { uri } = await Print.printToFileAsync({
      html: buildReportHtml(data),
    });

    let shareUri = uri;
    let dialogTitle = `${data.childName} Screening Report`;
    if (action === 'download') {
      dialogTitle = `Download ${data.childName} Screening Report`;
    }

    let FileSystem: any;
    try {
      // @ts-ignore
      FileSystem = require('expo-file-system/legacy');
    } catch {
      // fall through to share with original URI
    }

    const fileName = `${sanitizeFileName(data.childName)} - Screening report by Saarathi.pdf`;

    if (action === 'download' && Platform.OS === 'android' && FileSystem?.StorageAccessFramework) {
      const directoryKey = '@sarthi/download-directory-uri';
      let directoryUri = await AsyncStorage.getItem(directoryKey);

      if (!directoryUri) {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permissions.granted) {
          Alert.alert('Download cancelled', 'Choose the Downloads folder to save the PDF report.');
          return;
        }
        if (!permissions.directoryUri) {
          Alert.alert('Download cancelled', 'The selected folder is unavailable.');
          return;
        }
        directoryUri = permissions.directoryUri;
        await AsyncStorage.setItem(directoryKey, permissions.directoryUri);
      }

      try {
        if (!directoryUri) throw new Error('Download directory permission is missing');
        const destinationUri = await FileSystem.StorageAccessFramework.createFileAsync(
          directoryUri,
          fileName,
          'application/pdf',
        );
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        await FileSystem.writeAsStringAsync(destinationUri, base64, { encoding: FileSystem.EncodingType.Base64 });
        Alert.alert('Report downloaded', `${fileName} was saved to your selected folder.`);
        return;
      } catch {
        await AsyncStorage.removeItem(directoryKey);
        Alert.alert('Permission required', 'Please choose the Downloads folder again to save this report.');
        return;
      }
    }

    if (FileSystem && FileSystem.cacheDirectory && FileSystem.makeDirectoryAsync && FileSystem.copyAsync) {
      const reportDir = `${FileSystem.cacheDirectory}reports`;
      const reportUri = `${reportDir}/${fileName}`;
      await FileSystem.makeDirectoryAsync(reportDir, { intermediates: true });
      await FileSystem.copyAsync({ from: uri, to: reportUri });
      shareUri = reportUri;
    }

    if (Sharing && Sharing.isAvailableAsync) {
      const available = await Sharing.isAvailableAsync();
      if (available && Sharing.shareAsync) {
        await Sharing.shareAsync(shareUri, { mimeType: 'application/pdf', dialogTitle });
        return;
      }
    }

    Alert.alert('Report saved', `PDF saved to ${shareUri}`);
  } catch (err: any) {
    Alert.alert('PDF generation failed', err?.message || 'Unknown error');
  }
}
