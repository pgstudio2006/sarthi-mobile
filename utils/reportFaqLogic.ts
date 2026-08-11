import type { AppLanguage } from '../i18n/translations';
import { DOMAIN_ADVICE_I18N } from './domainAdviceI18n';
import { REPORT_FAQ_TEMPLATES } from './reportFaqTemplatesI18n';
import { translateIsaaLabel, joinItems } from './faqI18n';

export interface ReportFAQItem {
  title: string;
  body: string;
}

export interface ReportDomainInput {
  key: string;
  label: string;
  score: number;
  maxScore: number;
  status: string;
  attention: string[];
  strengths: string[];
}

export interface ReportFAQInput {
  childName?: string;
  score: number;
  total: number;
  result: string;
  completedCount: number;
  isRepeat: boolean;
  previousScore?: { totalScore?: number; date?: string } | null;
  domains: ReportDomainInput[];
}

function getDomainAdvice(key: string, lang: AppLanguage) {
  return DOMAIN_ADVICE_I18N[lang]?.[key] ?? DOMAIN_ADVICE_I18N.English[key] ?? {
    support: 'Talk to a specialist about a focused plan for this area.',
    strength: 'Keep encouraging this skill through everyday play.',
  };
}

function child(name?: string): string {
  return name?.trim() || 'my child';
}

function toSentence(items: string[], lang: AppLanguage, max = 3): string {
  return joinItems(items.slice(0, max), lang);
}

function needsSupport(status: string): boolean {
  const lower = (status ?? '').toLowerCase();
  return lower.includes('support') || lower.includes('progress');
}

function isNoSigns(result: string): boolean {
  const lower = (result ?? '').toLowerCase();
  return lower.includes('no sign') || lower === 'normal';
}

function getPriorityDomains(domains: ReportDomainInput[], count = 3): ReportDomainInput[] {
  const withAttention = domains
    .filter((d) => d.attention.length > 0)
    .sort((a, b) => b.score - a.score);

  if (withAttention.length > 0) {
    return withAttention.slice(0, count);
  }

  return [...domains].sort((a, b) => b.score - a.score).slice(0, count);
}

function buildDomainFAQs(name: string, domains: ReportDomainInput[], lang: AppLanguage): ReportFAQItem[] {
  const faqs: ReportFAQItem[] = [];
  const t = REPORT_FAQ_TEMPLATES[lang] || REPORT_FAQ_TEMPLATES.English;

  for (const domain of getPriorityDomains(domains)) {
    const advice = getDomainAdvice(domain.key, lang);
    const translatedLabel = translateIsaaLabel(domain.label, lang);

    if (domain.attention.length > 0) {
      const points = toSentence(domain.attention.map(a => translateIsaaLabel(a, lang)), lang);
      faqs.push({
        title: t.whyFocusTitle(name, translatedLabel),
        body: t.whyFocusBody(name, domain.score, domain.maxScore, translatedLabel, points, advice.support),
      });
    }

    if (domain.strengths.length > 0) {
      const points = toSentence(domain.strengths.map(s => translateIsaaLabel(s, lang)), lang);
      faqs.push({
        title: t.whatsWorkingTitle(name, translatedLabel),
        body: t.whatsWorkingBody(name, domain.score, domain.maxScore, translatedLabel, points, advice.strength),
      });
    }
  }

  return faqs;
}

function buildFirstScreeningFAQs(input: ReportFAQInput, priorityDomains: ReportDomainInput[], lang: AppLanguage): ReportFAQItem[] {
  const name = child(input.childName);
  const t = REPORT_FAQ_TEMPLATES[lang] || REPORT_FAQ_TEMPLATES.English;
  const priorityLabels = priorityDomains.map((d) => translateIsaaLabel(d.label, lang)).join(', ');
  const firstPriority = priorityDomains[0];
  const firstPriorityLabel = firstPriority ? translateIsaaLabel(firstPriority.label, lang) : '';
  const resultText = isNoSigns(input.result)
    ? t.fewerSignals()
    : t.levelOfSignals();

  const faqs: ReportFAQItem[] = [
    {
      title: t.scoreMeaningTitle(name, input.score, input.total),
      body: t.scoreMeaningBody(name, input.score, input.total, input.result, resultText),
    },
    {
      title: t.confirmAutismTitle(name),
      body: t.confirmAutismBody(name),
    },
  ];

  if (priorityLabels) {
    const focusText = isNoSigns(input.result)
      ? `the relative focus areas are: ${priorityLabels}. Continue supporting these through everyday play and monitor milestones.`
      : `the priority areas to focus on are: ${priorityLabels}. Start with small, practical activities for ${firstPriorityLabel || 'the first area'} and track what you notice.`;
    faqs.push({
      title: t.whichAreasTitle(),
      body: t.whichAreasBody(focusText),
    });

    faqs.push({
      title: t.whatToDoTitle(),
      body: t.whatToDoBody(firstPriorityLabel || 'priority areas'),
    });
  } else {
    faqs.push({
      title: t.whichAreasTitle(),
      body: t.whichAreasAllWellBody(),
    });

    faqs.push({
      title: t.whatToDoTitle(),
      body: t.whatToDoAllWellBody(),
    });
  }

  faqs.push(
    {
      title: t.whichSpecialistTitle(name),
      body: t.whichSpecialistBody(name),
    },
    {
      title: t.supportAtHomeTitle(name),
      body: t.supportAtHomeBody(name),
    },
    {
      title: t.whenRepeatTitle(),
      body: t.whenRepeatBody(),
    },
    {
      title: t.saarathiTrackTitle(name),
      body: t.saarathiTrackBody(name),
    }
  );

  return faqs;
}

function buildRepeatFAQs(input: ReportFAQInput, priorityDomains: ReportDomainInput[], lang: AppLanguage): ReportFAQItem[] {
  const name = child(input.childName);
  const t = REPORT_FAQ_TEMPLATES[lang] || REPORT_FAQ_TEMPLATES.English;
  const prev = input.previousScore?.totalScore ?? 0;
  const current = input.score;
  const diff = current - prev;
  const trend = diff < 0
    ? t.improvementBy(Math.abs(diff))
    : diff > 0
    ? t.higherBy(diff)
    : t.sameAsBefore();

  const priorityLabels = priorityDomains.map((d) => translateIsaaLabel(d.label, lang)).join(', ');

  const faqs: ReportFAQItem[] = [
    {
      title: t.isProgressTitle(name),
      body: t.isProgressBody(name, prev, input.score, input.total, trend),
    },
    {
      title: t.whichAreasNeedSupportTitle(),
      body: t.whichAreasNeedSupportBody(priorityLabels),
    },
    {
      title: t.whyScoresChangedTitle(),
      body: t.whyScoresChangedBody(),
    },
    {
      title: t.helpImproveTitle(name),
      body: t.helpImproveBody(name),
    },
    {
      title: t.nextScreeningTitle(),
      body: t.nextScreeningBody(),
    },
    {
      title: t.workWithTherapistTitle(name),
      body: t.workWithTherapistBody(name),
    },
    {
      title: t.saarathiMonitorTitle(name),
      body: t.saarathiMonitorBody(name),
    },
  ];

  if (input.previousScore?.date) {
    faqs.push({
      title: t.patternsTitle(name),
      body: t.patternsBody(name, input.previousScore.date, prev, current),
    });
  }

  return faqs;
}

export function getReportFAQs(input: ReportFAQInput, language?: string): ReportFAQItem[] {
  const lang = (language as AppLanguage) || 'English';
  const name = child(input.childName);
  const t = REPORT_FAQ_TEMPLATES[lang] || REPORT_FAQ_TEMPLATES.English;
  const domainFaqs = buildDomainFAQs(name, input.domains, lang);
  const priorityDomains = getPriorityDomains(input.domains);

  const generalFaqs = input.isRepeat
    ? buildRepeatFAQs(input, priorityDomains, lang)
    : buildFirstScreeningFAQs(input, priorityDomains, lang);

  const seen = new Set<string>();
  const out: ReportFAQItem[] = [];

  for (const item of [...domainFaqs, ...generalFaqs]) {
    if (seen.has(item.title)) continue;
    seen.add(item.title);
    out.push(item);
    if (out.length >= 10) break;
  }

  // If we somehow have fewer than 10, pad with a safe general set.
  while (out.length < 10) {
    const placeholder = {
      title: t.whatElseTitle(name),
      body: t.whatElseBody(),
    };
    if (!seen.has(placeholder.title)) {
      seen.add(placeholder.title);
      out.push(placeholder);
    } else {
      break;
    }
  }

  return out.slice(0, 10);
}
