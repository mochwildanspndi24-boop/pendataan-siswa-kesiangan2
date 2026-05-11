import type { ExportRow } from './exportUtils';

const SCHOOL_NAME = 'SMK DARUL MUTTAQIN CIANJUR';
const LOGO_URL = 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100050100/514a7296-7778-48.png';

interface AggRow {
  studentName: string;
  className: string;
  totalCount: number;
  dates: string[];
}

function aggregateRows(rows: ExportRow[]): AggRow[] {
  const map = new Map<string, AggRow>();
  for (const row of rows) {
    const key = row.studentName + '||' + row.className;
    if (!map.has(key)) {
      map.set(key, { studentName: row.studentName, className: row.className, totalCount: 0, dates: [] });
    }
    const agg = map.get(key)!;
    agg.totalCount += row.count;
    agg.dates.push(row.date);
  }
  return [...map.values()].sort((a, b) => b.totalCount - a.totalCount);
}

function escHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function generateReportHtml(rows: ExportRow[], title: string, subtitle: string): string {
  const now = new Date().toLocaleString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const aggRows = aggregateRows(rows);
  const totalCount = aggRows.reduce((s, r) => s + r.totalCount, 0);
  const uniqueStudents = aggRows.length;
  const classSet = new Set(aggRows.map((r) => r.className));
  const uniqueClasses = classSet.size;

  const tableRows = aggRows.map((row, i) => {
    const countClass = row.totalCount >= 4 ? 'count-danger' : row.totalCount >= 2 ? 'count-warning' : 'count-normal';
    const datesHtml = row.dates.map(function(d) { return escHtml(d); }).join(', ');
    return '<tr>' +
      '<td class="center">' + (i + 1) + '</td>' +
      '<td>' + escHtml(row.studentName) + '</td>' +
      '<td>' + escHtml(row.className) + '</td>' +
      '<td class="center"><span class="count-badge ' + countClass + '">' + row.totalCount + 'x</span></td>' +
      '<td class="dates">' + datesHtml + '</td>' +
      '</tr>';
  }).join('');

  return '<!DOCTYPE html>' +
    '<html lang="id">' +
    '<head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>Laporan Kesiangan - ' + SCHOOL_NAME + '</title>' +
    '<style>' +
    '*{margin:0;padding:0;box-sizing:border-box}' +
    'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#f0f4f0;color:#1a1a1a;min-height:100vh}' +
    '.wrapper{max-width:960px;margin:0 auto;padding:24px 16px}' +
    '.header{background:linear-gradient(135deg,#1d6b3d 0%,#2d8a52 60%,#c89a2a 100%);border-radius:16px;padding:28px 32px;margin-bottom:24px;display:flex;align-items:center;gap:20px;color:white}' +
    '.logo{width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,0.15);padding:8px;flex-shrink:0;object-fit:contain}' +
    '.school-name{font-size:22px;font-weight:900;letter-spacing:0.5px;line-height:1.2}' +
    '.school-sub{font-size:11px;opacity:0.75;margin-top:4px;text-transform:uppercase;letter-spacing:1px}' +
    '.report-title{font-size:15px;font-weight:700;margin-top:8px;opacity:0.9}' +
    '.report-sub{font-size:12px;opacity:0.65;margin-top:2px}' +
    '.stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px}' +
    '.stat-card{background:white;border-radius:12px;padding:16px;text-align:center;border:1px solid #e0e0e0;box-shadow:0 1px 4px rgba(0,0,0,0.06)}' +
    '.stat-num{font-size:28px;font-weight:900;color:#1d6b3d}' +
    '.stat-lbl{font-size:11px;color:#666;margin-top:2px;text-transform:uppercase;letter-spacing:0.5px}' +
    '.table-card{background:white;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0;box-shadow:0 1px 4px rgba(0,0,0,0.06)}' +
    '.table-header{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid #e8e8e8;background:#f8faf8}' +
    '.table-title{font-size:13px;font-weight:700;color:#1a1a1a}' +
    '.table-info{font-size:11px;color:#888}' +
    'table{width:100%;border-collapse:collapse}' +
    'thead{background:#f0f7f0}' +
    'th{padding:10px 12px;text-align:left;font-size:11px;font-weight:700;color:#2d6b3a;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #d0e8d8}' +
    'td{padding:9px 12px;font-size:13px;border-bottom:1px solid #f0f0f0;vertical-align:top}' +
    'tr:hover{background:#f8fbf8}' +
    'tr:last-child td{border-bottom:none}' +
    '.center{text-align:center}' +
    '.count-badge{display:inline-flex;align-items:center;justify-content:center;padding:2px 8px;border-radius:20px;font-size:12px;font-weight:800}' +
    '.count-normal{background:#dcfce7;color:#166534}' +
    '.count-warning{background:#fef9c3;color:#854d0e}' +
    '.count-danger{background:#fee2e2;color:#991b1b}' +
    '.dates{font-size:11px;color:#555;max-width:240px}' +
    '.footer{margin-top:20px;text-align:center;font-size:11px;color:#888;padding-bottom:20px}' +
    '.print-btn{position:fixed;bottom:20px;right:20px;background:linear-gradient(135deg,#1d6b3d,#2d8a52);color:white;border:none;border-radius:12px;padding:12px 20px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 4px 16px rgba(29,107,61,0.4);display:flex;align-items:center;gap:6px}' +
    '.print-btn:hover{opacity:0.9}' +
    '@media print{.print-btn{display:none!important}.wrapper{padding:0}}' +
    '@media(max-width:600px){.stats-row{grid-template-columns:repeat(2,1fr)}.header{flex-direction:column;text-align:center}.logo{margin:0 auto}}' +
    '</style>' +
    '</head>' +
    '<body>' +
    '<div class="wrapper">' +
    '<div class="header">' +
    '<img src="' + LOGO_URL + '" alt="Logo" class="logo" crossorigin="anonymous">' +
    '<div>' +
    '<div class="school-name">' + SCHOOL_NAME + '</div>' +
    '<div class="school-sub">Sistem Pendataan Siswa Kesiangan</div>' +
    '<div class="report-title">' + escHtml(title) + '</div>' +
    '<div class="report-sub">' + escHtml(subtitle) + ' &nbsp;|&nbsp; Dicetak: ' + escHtml(now) + '</div>' +
    '</div>' +
    '</div>' +
    '<div class="stats-row">' +
    '<div class="stat-card"><div class="stat-num">' + uniqueStudents + '</div><div class="stat-lbl">Siswa Terlambat</div></div>' +
    '<div class="stat-card"><div class="stat-num">' + totalCount + '</div><div class="stat-lbl">Total Kejadian</div></div>' +
    '<div class="stat-card"><div class="stat-num">' + uniqueClasses + '</div><div class="stat-lbl">Kelas Terlibat</div></div>' +
    '</div>' +
    '<div class="table-card">' +
    '<div class="table-header">' +
    '<span class="table-title">Daftar Siswa Kesiangan (Dirangkum per Siswa)</span>' +
    '<span class="table-info">' + aggRows.length + ' siswa</span>' +
    '</div>' +
    '<table>' +
    '<thead><tr>' +
    '<th class="center" style="width:44px">No</th>' +
    '<th>Nama Siswa</th>' +
    '<th style="width:120px">Kelas</th>' +
    '<th class="center" style="width:70px">Total</th>' +
    '<th>Tanggal Kesiangan</th>' +
    '</tr></thead>' +
    '<tbody>' +
    (aggRows.length > 0 ? tableRows : '<tr><td colspan="5" class="center" style="padding:40px;color:#aaa">Tidak ada data</td></tr>') +
    '</tbody>' +
    '</table>' +
    '</div>' +
    '<div class="footer">' +
    'Dokumen ini dibuat otomatis oleh Sistem Kesiangan ' + SCHOOL_NAME + '<br>' +
    '&copy; 2026 ' + SCHOOL_NAME + '. All rights reserved.' +
    '</div>' +
    '</div>' +
    '<button class="print-btn" onclick="window.print()">&#128438; Cetak / Simpan PDF</button>' +
    '</body>' +
    '</html>';
}

export function downloadHtml(html: string, filename: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
