import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Survey, SurveyStatistics, CultureScores } from '../types';
import { formatDate } from './calculations';

const CULTURE_LABELS: Record<keyof CultureScores, string> = {
  clan: 'Hợp tác (Clan)',
  adhocracy: 'Sáng tạo (Adhocracy)',
  market: 'Cạnh tranh (Market)',
  hierarchy: 'Kiểm soát (Hierarchy)'
};

export async function exportToPdf(
  survey: Survey,
  statistics: SurveyStatistics,
  chartElement: HTMLElement | null
): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // Helper function to add text
  const addText = (text: string, x: number, y: number, options?: { fontSize?: number; fontStyle?: 'normal' | 'bold'; color?: number[] }) => {
    pdf.setFontSize(options?.fontSize || 12);
    pdf.setFont('helvetica', options?.fontStyle || 'normal');
    if (options?.color) {
      pdf.setTextColor(options.color[0], options.color[1], options.color[2]);
    } else {
      pdf.setTextColor(0, 0, 0);
    }
    pdf.text(text, x, y);
  };

  // Header
  addText('BAO CAO KHAO SAT VAN HOA DOANH NGHIEP', pageWidth / 2, yPos, { 
    fontSize: 18, 
    fontStyle: 'bold' 
  });
  pdf.setTextColor(0, 0, 0);
  yPos += 12;

  addText(survey.companyName, pageWidth / 2, yPos, { fontSize: 14 });
  yPos += 8;
  
  addText(survey.title || 'Khao sat VHDN', pageWidth / 2, yPos, { fontSize: 12 });
  yPos += 8;

  addText(`Ngay xuat: ${formatDate(new Date())}`, pageWidth / 2, yPos, { fontSize: 10, color: [100, 100, 100] });
  yPos += 5;

  addText(`So nguoi tham gia: ${statistics.totalResponses}`, pageWidth / 2, yPos, { fontSize: 10, color: [100, 100, 100] });
  yPos += 15;

  // Capture radar chart if available
  if (chartElement) {
    try {
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#1e293b',
        scale: 2,
        useCORS: true
      });
      
      const chartWidth = pageWidth - margin * 2;
      const chartHeight = (canvas.height / canvas.width) * chartWidth;
      
      // Check if chart fits on current page
      if (yPos + chartHeight > pageHeight - margin) {
        pdf.addPage();
        yPos = margin;
      }
      
      const chartDataUrl = canvas.toDataURL('image/png');
      pdf.addImage(chartDataUrl, 'PNG', margin, yPos, chartWidth, chartHeight);
      yPos += chartHeight + 15;
    } catch (error) {
      console.error('Failed to capture chart:', error);
    }
  }

  // Culture Scores Table
  if (yPos + 60 > pageHeight - margin) {
    pdf.addPage();
    yPos = margin;
  }

  addText('DIEM VAN HOA TRUNG BINH', margin, yPos, { fontSize: 14, fontStyle: 'bold' });
  yPos += 10;

  // Table header
  const colWidths = [60, 35, 35, 35];
  const startX = margin;
  
  pdf.setFillColor(240, 240, 240);
  pdf.rect(startX, yPos - 6, colWidths.reduce((a, b) => a + b, 0), 8, 'F');
  
  addText('Loai van hoa', startX + 5, yPos, { fontSize: 10, fontStyle: 'bold' });
  addText('Hien tai', startX + colWidths[0] + 5, yPos, { fontSize: 10, fontStyle: 'bold' });
  addText('Mong muon', startX + colWidths[0] + colWidths[1] + 5, yPos, { fontSize: 10, fontStyle: 'bold' });
  addText('Thay doi', startX + colWidths[0] + colWidths[1] + colWidths[2] + 5, yPos, { fontSize: 10, fontStyle: 'bold' });
  yPos += 8;

  // Table rows
  const cultures: (keyof CultureScores)[] = ['clan', 'adhocracy', 'market', 'hierarchy'];
  cultures.forEach((culture) => {
    const current = statistics.averageCurrent[culture];
    const preferred = statistics.averagePreferred[culture];
    const change = preferred - current;
    
    addText(CULTURE_LABELS[culture], startX + 5, yPos, { fontSize: 10 });
    addText(current.toFixed(1), startX + colWidths[0] + 5, yPos, { fontSize: 10 });
    addText(preferred.toFixed(1), startX + colWidths[0] + colWidths[1] + 5, yPos, { fontSize: 10 });
    
    const changeText = (change > 0 ? '+' : '') + change.toFixed(1);
    const changeColor: number[] = change > 0 ? [34, 197, 94] : change < 0 ? [239, 68, 68] : [100, 100, 100];
    addText(changeText, startX + colWidths[0] + colWidths[1] + colWidths[2] + 5, yPos, { 
      fontSize: 10, 
      color: changeColor 
    });
    
    yPos += 7;
  });

  yPos += 10;

  // 6 Dimensions Summary
  if (yPos + 60 > pageHeight - margin) {
    pdf.addPage();
    yPos = margin;
  }

  addText('KET QUA THEO 6 KHIA CANH', margin, yPos, { fontSize: 14, fontStyle: 'bold' });
  yPos += 10;

  statistics.dimensionResults.forEach((dim) => {
    if (yPos + 15 > pageHeight - margin) {
      pdf.addPage();
      yPos = margin;
    }

    addText(`${dim.dimensionNumber}. ${dim.dimensionName}`, margin, yPos, { fontSize: 11, fontStyle: 'bold' });
    yPos += 6;
    
    const dimText = `Clan: ${dim.current.clan.toFixed(1)} | Adhocracy: ${dim.current.adhocracy.toFixed(1)} | Market: ${dim.current.market.toFixed(1)} | Hierarchy: ${dim.current.hierarchy.toFixed(1)}`;
    addText(dimText, margin + 5, yPos, { fontSize: 9 });
    yPos += 8;
  });

  // Save PDF
  const fileName = `VHDN_Report_${survey.companyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
}
