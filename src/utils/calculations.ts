import type { CultureScores, SurveyResponse, DimensionResult, SurveyStatistics } from '../types';

// Convert 4 raw scores (1-10) to percentages using Largest Remainder Method
// Guarantees the percentages always sum to exactly 100%
export function rawScoreToPercentages(a: number, b: number, c: number, d: number): { pctA: number; pctB: number; pctC: number; pctD: number } {
  const total = a + b + c + d;
  if (total === 0) return { pctA: 25, pctB: 25, pctC: 25, pctD: 25 };

  const rawPcts = [
    { key: 'A', value: (a / total) * 100 },
    { key: 'B', value: (b / total) * 100 },
    { key: 'C', value: (c / total) * 100 },
    { key: 'D', value: (d / total) * 100 },
  ];

  // Floor all values
  const floored = rawPcts.map(p => ({ ...p, floored: Math.floor(p.value), remainder: p.value - Math.floor(p.value) }));
  const currentSum = floored.reduce((sum, p) => sum + p.floored, 0);
  const deficit = 100 - currentSum;

  // Distribute remaining points to items with largest remainders
  floored.sort((a, b) => b.remainder - a.remainder);
  for (let i = 0; i < deficit; i++) {
    floored[i].floored += 1;
  }

  const result: Record<string, number> = {};
  floored.forEach(p => { result[`pct${p.key}`] = p.floored; });

  return {
    pctA: result.pctA,
    pctB: result.pctB,
    pctC: result.pctC,
    pctD: result.pctD
  };
}

// Calculate average culture scores (as %) from an array of responses
// Data is already stored as percentages in Google Sheets, so we just average directly
export function calculateAverageScores(responses: SurveyResponse[], type: 'current' | 'preferred'): CultureScores {
  if (responses.length === 0) {
    return { clan: 0, adhocracy: 0, market: 0, hierarchy: 0 };
  }

  const totals = { clan: 0, adhocracy: 0, market: 0, hierarchy: 0 };
  let count = 0;

  responses.forEach(response => {
    response.answers.forEach(answer => {
      if (type === 'current') {
        totals.clan += answer.scoreA_current;
        totals.adhocracy += answer.scoreB_current;
        totals.market += answer.scoreC_current;
        totals.hierarchy += answer.scoreD_current;
      } else {
        totals.clan += answer.scoreA_preferred;
        totals.adhocracy += answer.scoreB_preferred;
        totals.market += answer.scoreC_preferred;
        totals.hierarchy += answer.scoreD_preferred;
      }
      count++;
    });
  });

  const divisor = count || 1;
  return {
    clan: Math.round(totals.clan / divisor * 10) / 10,
    adhocracy: Math.round(totals.adhocracy / divisor * 10) / 10,
    market: Math.round(totals.market / divisor * 10) / 10,
    hierarchy: Math.round(totals.hierarchy / divisor * 10) / 10
  };
}

// Calculate dimension-by-dimension results
export function calculateDimensionResults(responses: SurveyResponse[]): DimensionResult[] {
  const dimensions = [
    { number: 1, name: 'Đặc điểm Chi phối' },
    { number: 2, name: 'Phong cách Lãnh đạo' },
    { number: 3, name: 'Quản lý Nhân sự' },
    { number: 4, name: 'Liên kết Tổ chức' },
    { number: 5, name: 'Nhấn mạnh Chiến lược' },
    { number: 6, name: 'Tiêu chí Thành công' }
  ];

  return dimensions.map(dim => {
    const dimAnswers = responses.flatMap(r => 
      r.answers.filter(a => a.dimensionNumber === dim.number)
    );

    const current: CultureScores = {
      clan: 0, adhocracy: 0, market: 0, hierarchy: 0
    };
    const preferred: CultureScores = {
      clan: 0, adhocracy: 0, market: 0, hierarchy: 0
    };

    if (dimAnswers.length > 0) {
      dimAnswers.forEach(answer => {
        // Data is already stored as percentages — use directly
        current.clan += answer.scoreA_current;
        current.adhocracy += answer.scoreB_current;
        current.market += answer.scoreC_current;
        current.hierarchy += answer.scoreD_current;
        preferred.clan += answer.scoreA_preferred;
        preferred.adhocracy += answer.scoreB_preferred;
        preferred.market += answer.scoreC_preferred;
        preferred.hierarchy += answer.scoreD_preferred;
      });

      const count = dimAnswers.length;
      current.clan = Math.round(current.clan / count * 10) / 10;
      current.adhocracy = Math.round(current.adhocracy / count * 10) / 10;
      current.market = Math.round(current.market / count * 10) / 10;
      current.hierarchy = Math.round(current.hierarchy / count * 10) / 10;
      preferred.clan = Math.round(preferred.clan / count * 10) / 10;
      preferred.adhocracy = Math.round(preferred.adhocracy / count * 10) / 10;
      preferred.market = Math.round(preferred.market / count * 10) / 10;
      preferred.hierarchy = Math.round(preferred.hierarchy / count * 10) / 10;
    }

    return {
      dimensionNumber: dim.number,
      dimensionName: dim.name,
      current,
      preferred
    };
  });
}

// Calculate statistics by segment (department, position, seniority)
export function calculateBySegment(
  responses: SurveyResponse[], 
  segmentKey: 'department' | 'position' | 'seniority'
): Record<string, CultureScores> {
  const segments: Record<string, SurveyResponse[]> = {};

  responses.forEach(response => {
    const key = response.participantInfo[segmentKey];
    if (!segments[key]) {
      segments[key] = [];
    }
    segments[key].push(response);
  });

  const result: Record<string, CultureScores> = {};
  Object.keys(segments).forEach(key => {
    result[key] = calculateAverageScores(segments[key], 'current');
  });

  return result;
}

// Get full survey statistics
export function calculateSurveyStatistics(responses: SurveyResponse[]): SurveyStatistics {
  return {
    totalResponses: responses.length,
    averageCurrent: calculateAverageScores(responses, 'current'),
    averagePreferred: calculateAverageScores(responses, 'preferred'),
    dimensionResults: calculateDimensionResults(responses),
    byDepartment: calculateBySegment(responses, 'department'),
    byPosition: calculateBySegment(responses, 'position'),
    bySeniority: calculateBySegment(responses, 'seniority')
  };
}

// Determine dominant culture type
export function getDominantCulture(scores: CultureScores): string {
  const entries = Object.entries(scores) as [keyof CultureScores, number][];
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  const labels = {
    clan: 'Hợp tác (Clan)',
    adhocracy: 'Sáng tạo (Adhocracy)',
    market: 'Cạnh tranh (Market)',
    hierarchy: 'Kiểm soát (Hierarchy)'
  };
  return labels[sorted[0][0]];
}

// Generate unique ID
export function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : 
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

// Format date for display
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}
