import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export interface ExportRow {
  no: number;
  studentName: string;
  className: string;
  date: string;
  count: number;
  times: string;
}

export function exportToExcel(rows: ExportRow[], filename: string, sheetName = 'Laporan Kesiangan') {
  const wsData = [
    ['SMK DARUL MUTTAQIN CIANJUR'],
    ['LAPORAN SISWA KESIANGAN'],
    [''],
    ['No', 'Nama Siswa', 'Kelas', 'Tanggal', 'Jumlah Kesiangan', 'Jam Kesiangan'],
    ...rows.map((r) => [r.no, r.studentName, r.className, r.date, r.count, r.times]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [
    { wch: 5 },
    { wch: 35 },
    { wch: 12 },
    { wch: 15 },
    { wch: 18 },
    { wch: 30 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToPDF(
  rows: ExportRow[],
  filename: string,
  title: string,
  subtitle: string,
  logoUrl?: string
) {
  const doc = new jsPDF({ orientation: 'landscape' });

  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SMK DARUL MUTTAQIN CIANJUR', doc.internal.pageSize.width / 2, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(title, doc.internal.pageSize.width / 2, 28, { align: 'center' });
  doc.text(subtitle, doc.internal.pageSize.width / 2, 35, { align: 'center' });

  doc.setLineWidth(0.5);
  doc.line(14, 40, doc.internal.pageSize.width - 14, 40);

  autoTable(doc, {
    startY: 45,
    head: [['No', 'Nama Siswa', 'Kelas', 'Tanggal', 'Jumlah Kesiangan', 'Jam Kesiangan']],
    body: rows.map((r) => [r.no, r.studentName, r.className, r.date, r.count, r.times]),
    headStyles: {
      fillColor: [27, 113, 62],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 60 },
      2: { cellWidth: 25 },
      3: { cellWidth: 28 },
      4: { cellWidth: 30 },
      5: { cellWidth: 60 },
    },
    didDrawPage: (data) => {
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.text(
        `Halaman ${data.pageNumber} - Dicetak: ${format(new Date(), 'dd MMMM yyyy HH:mm', { locale: id })}`,
        14,
        pageHeight - 10
      );
    },
  });

  doc.save(`${filename}.pdf`);
}

export function importFromExcel(file: File): Promise<{ studentName: string; className: string; date: string; count: number }[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const ws = workbook.Sheets[workbook.SheetNames[0]];
        const rows: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];

        // skip header rows (first 4 rows)
        const dataRows = rows.slice(4).filter((row) => row[0] && row[1]);
        const result = dataRows.map((row) => ({
          studentName: String(row[1] || ''),
          className: String(row[2] || ''),
          date: String(row[3] || ''),
          count: Number(row[4] || 0),
        }));
        resolve(result);
      } catch {
        reject(new Error('Format file tidak valid'));
      }
    };
    reader.readAsArrayBuffer(file);
  });
}
