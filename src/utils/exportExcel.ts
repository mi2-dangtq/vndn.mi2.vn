import * as XLSX from 'xlsx';
import type { Survey, SurveyStatistics, CultureScores, SurveyResponse } from '../types';
import { formatDate } from './calculations';

const CULTURE_KEYS: (keyof CultureScores)[] = ['clan', 'adhocracy', 'market', 'hierarchy'];
const CULTURE_LABELS: Record<keyof CultureScores, string> = {
  clan: 'Hợp tác (Clan)',
  adhocracy: 'Sáng tạo (Adhocracy)', 
  market: 'Cạnh tranh (Market)',
  hierarchy: 'Kiểm soát (Hierarchy)'
};

export function exportToExcel(survey: Survey, statistics: SurveyStatistics): void {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Tổng quan (Overview)
  const overviewData = [
    ['BÁO CÁO KHẢO SÁT VĂN HÓA DOANH NGHIỆP'],
    [],
    ['Công ty:', survey.companyName],
    ['Tiêu đề:', survey.title || 'Khảo sát VHDN'],
    ['Ngày xuất:', formatDate(new Date())],
    ['Số người tham gia:', statistics.totalResponses],
    [],
    ['ĐIỂM VĂN HÓA TRUNG BÌNH'],
    ['Loại văn hóa', 'Hiện tại', 'Mong muốn', 'Thay đổi'],
    ...CULTURE_KEYS.map(key => [
      CULTURE_LABELS[key],
      statistics.averageCurrent[key],
      statistics.averagePreferred[key],
      statistics.averagePreferred[key] - statistics.averageCurrent[key]
    ])
  ];
  const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
  
  // Set column widths
  overviewSheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Tổng quan');

  // Sheet 2: Chi tiết 6 khía cạnh (Dimensions)
  const dimensionsData = [
    ['CHI TIẾT THEO 6 KHÍA CẠNH'],
    [],
    ['Khía cạnh', 'Clan (HT)', 'Adhocracy (HT)', 'Market (HT)', 'Hierarchy (HT)', 
     'Clan (MM)', 'Adhocracy (MM)', 'Market (MM)', 'Hierarchy (MM)'],
    ...statistics.dimensionResults.map(dim => [
      `${dim.dimensionNumber}. ${dim.dimensionName}`,
      dim.current.clan,
      dim.current.adhocracy,
      dim.current.market,
      dim.current.hierarchy,
      dim.preferred.clan,
      dim.preferred.adhocracy,
      dim.preferred.market,
      dim.preferred.hierarchy
    ])
  ];
  const dimensionsSheet = XLSX.utils.aoa_to_sheet(dimensionsData);
  dimensionsSheet['!cols'] = [
    { wch: 25 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 14 },
    { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 14 }
  ];
  XLSX.utils.book_append_sheet(workbook, dimensionsSheet, 'Chi tiết 6 khía cạnh');

  // Sheet 3: Phân tích theo Phòng ban
  const deptData = [
    ['PHÂN TÍCH THEO PHÒNG BAN'],
    [],
    ['Phòng ban', 'Clan', 'Adhocracy', 'Market', 'Hierarchy'],
    ...Object.entries(statistics.byDepartment).map(([dept, scores]) => [
      dept, scores.clan, scores.adhocracy, scores.market, scores.hierarchy
    ])
  ];
  const deptSheet = XLSX.utils.aoa_to_sheet(deptData);
  deptSheet['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(workbook, deptSheet, 'Theo Phòng ban');

  // Sheet 4: Phân tích theo Vị trí
  const posData = [
    ['PHÂN TÍCH THEO VỊ TRÍ'],
    [],
    ['Vị trí', 'Clan', 'Adhocracy', 'Market', 'Hierarchy'],
    ...Object.entries(statistics.byPosition).map(([pos, scores]) => [
      pos, scores.clan, scores.adhocracy, scores.market, scores.hierarchy
    ])
  ];
  const posSheet = XLSX.utils.aoa_to_sheet(posData);
  posSheet['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(workbook, posSheet, 'Theo Vị trí');

  // Sheet 5: Phân tích theo Thâm niên
  const senData = [
    ['PHÂN TÍCH THEO THÂM NIÊN'],
    [],
    ['Thâm niên', 'Clan', 'Adhocracy', 'Market', 'Hierarchy'],
    ...Object.entries(statistics.bySeniority).map(([sen, scores]) => [
      sen, scores.clan, scores.adhocracy, scores.market, scores.hierarchy
    ])
  ];
  const senSheet = XLSX.utils.aoa_to_sheet(senData);
  senSheet['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(workbook, senSheet, 'Theo Thâm niên');

  // Sheet 6: Dữ liệu thô (Raw Data)
  const rawHeaders = [
    'ID', 'Phòng ban', 'Vị trí', 'Thâm niên', 'Giới tính', 'Độ tuổi', 'Ngày gửi',
    ...Array.from({ length: 6 }, (_, i) => [
      `D${i + 1}_A_HT(1-10)`, `D${i + 1}_B_HT(1-10)`, `D${i + 1}_C_HT(1-10)`, `D${i + 1}_D_HT(1-10)`,
      `D${i + 1}_A_MM(1-10)`, `D${i + 1}_B_MM(1-10)`, `D${i + 1}_C_MM(1-10)`, `D${i + 1}_D_MM(1-10)`
    ]).flat()
  ];

  const rawData = [
    ['DỮ LIỆU THÔ - TẤT CẢ PHẢN HỒI'],
    [],
    rawHeaders,
    ...survey.responses.map((response: SurveyResponse) => {
      const baseInfo = [
        response.id.substring(0, 8),
        response.participantInfo.department,
        response.participantInfo.position,
        response.participantInfo.seniority,
        response.participantInfo.gender || '',
        response.participantInfo.ageGroup || '',
        formatDate(response.submittedAt)
      ];

      const answerData: number[] = [];
      for (let i = 1; i <= 6; i++) {
        const answer = response.answers.find(a => a.dimensionNumber === i);
        if (answer) {
          answerData.push(
            answer.scoreA_current, answer.scoreB_current, answer.scoreC_current, answer.scoreD_current,
            answer.scoreA_preferred, answer.scoreB_preferred, answer.scoreC_preferred, answer.scoreD_preferred
          );
        } else {
          answerData.push(0, 0, 0, 0, 0, 0, 0, 0);
        }
      }

      return [...baseInfo, ...answerData];
    })
  ];
  
  const rawSheet = XLSX.utils.aoa_to_sheet(rawData);
  rawSheet['!cols'] = [
    { wch: 10 }, { wch: 18 }, { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 18 },
    ...Array(48).fill({ wch: 8 })
  ];
  XLSX.utils.book_append_sheet(workbook, rawSheet, 'Dữ liệu thô');

  // Save file
  const fileName = `VHDN_Data_${survey.companyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
