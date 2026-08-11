import { useEffect, useMemo, useState } from 'react';
import { getAiFaqs } from '../api/client';
import type { AiFaq } from '../api/client';
import { getReportFAQs, ReportFAQInput, ReportFAQItem } from './reportFaqLogic';

export function useReportFAQs(input: ReportFAQInput, childId?: string | null, language?: string) {
  const localFAQs = useMemo<ReportFAQItem[]>(() => getReportFAQs(input, language), [input, language]);
  const [apiFAQs, setApiFAQs] = useState<AiFaq[] | null>(null);

  useEffect(() => {
    if (!childId) return;
    getAiFaqs(childId, language).then((res) => {
      if (res.success && res.data.faqs.length === 10 && res.data.mode !== 'generic' && res.data.mode !== 'local') {
        setApiFAQs(res.data.faqs);
      }
    });
  }, [childId, language]);

  return apiFAQs ?? localFAQs;
}
