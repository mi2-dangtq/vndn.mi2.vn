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
// Converts raw 1-10 scores to percentages first, then averages
export function calculateAverageScores(responses: SurveyResponse[], type: 'current' | 'preferred'): CultureScores {
  if (responses.length === 0) {
    return { clan: 0, adhocracy: 0, market: 0, hierarchy: 0 };
  }

  const totals = { clan: 0, adhocracy: 0, market: 0, hierarchy: 0 };
  let count = 0;

  responses.forEach(response => {
    response.answers.forEach(answer => {
      const scores = type === 'current'
        ? rawScoreToPercentages(answer.scoreA_current, answer.scoreB_current, answer.scoreC_current, answer.scoreD_current)
        : rawScoreToPercentages(answer.scoreA_preferred, answer.scoreB_preferred, answer.scoreC_preferred, answer.scoreD_preferred);
      
      totals.clan += scores.pctA;
      totals.adhocracy += scores.pctB;
      totals.market += scores.pctC;
      totals.hierarchy += scores.pctD;
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
        const curPct = rawScoreToPercentages(answer.scoreA_current, answer.scoreB_current, answer.scoreC_current, answer.scoreD_current);
        const prefPct = rawScoreToPercentages(answer.scoreA_preferred, answer.scoreB_preferred, answer.scoreC_preferred, answer.scoreD_preferred);
        current.clan += curPct.pctA;
        current.adhocracy += curPct.pctB;
        current.market += curPct.pctC;
        current.hierarchy += curPct.pctD;
        preferred.clan += prefPct.pctA;
        preferred.adhocracy += prefPct.pctB;
        preferred.market += prefPct.pctC;
        preferred.hierarchy += prefPct.pctD;
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
