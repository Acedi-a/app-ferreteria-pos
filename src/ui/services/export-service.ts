import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import logoClaudio from '../assets/logo_claudio.png';

export type Accessor<T> = keyof T | ((row: T) => any);
export interface ColumnDef<T> {
  header: string;
  accessor: Accessor<T>;
}

function toValue<T>(row: T, acc: Accessor<T>) {
  if (typeof acc === 'function') return acc(row);
  return (row as any)[acc];
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9-_\.]/g, '_');
}

export function buildFileName(base: string, opts?: { desde?: string; hasta?: string; ext?: string }) {
  const p: string[] = [base];
  if (opts?.desde && opts?.hasta) p.push(`${opts.desde}_a_${opts.hasta}`);
  else if (opts?.desde) p.push(`desde_${opts.desde}`);
  else if (opts?.hasta) p.push(`hasta_${opts.hasta}`);
  const file = sanitizeFilename(p.filter(Boolean).join('_')) + (opts?.ext ? `.${opts.ext}` : '');
  return file;
}

export class ExportService {
  static exportCSV<T>(data: T[], cols: ColumnDef<T>[], fileBase: string, opts?: { desde?: string; hasta?: string }) {
    const rows = data.map((r) => {
      const o: any = {};
      cols.forEach((c) => {
        let v = toValue(r, c.accessor);
        if (typeof v === 'number') v = Number(v.toFixed(2));
        o[c.header] = v;
      });
      return o;
    });
    const csv = Papa.unparse(rows, { quotes: true, delimiter: ',', header: true, newline: '\r\n' });
    const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, buildFileName(fileBase, { ...opts, ext: 'csv' }));
  }

  static exportExcel<T>(data: T[], cols: ColumnDef<T>[], fileBase: string, opts?: { desde?: string; hasta?: string }) {
    const aoa: any[][] = [];
    aoa.push(cols.map((c) => c.header));
    data.forEach((r) => {
      aoa.push(
        cols.map((c) => {
          const v = toValue(r, c.accessor);
          return typeof v === 'number' ? Number(v.toFixed(2)) : v;
        })
      );
    });
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const blob = new Blob([buf], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, buildFileName(fileBase, { ...opts, ext: 'xlsx' }));
  }

  static exportPDF<T>(data: T[], cols: ColumnDef<T>[], fileBase: string, opts?: { desde?: string; hasta?: string }) {
    const doc = new jsPDF({ orientation: cols.length > 6 ? 'landscape' : 'portrait', unit: 'pt' });
    
    // Agregar logo centrado (120x120)
    try {
      const pageWidth = doc.internal.pageSize.getWidth();
      const logoSize = 120;
      const logoX = (pageWidth - logoSize) / 2; // Centrar horizontalmente
      doc.addImage(logoClaudio, 'PNG', logoX, 10, logoSize, logoSize);
    } catch (error) {
      console.warn('No se pudo agregar el logo al PDF:', error);
    }
    
    const head = [cols.map((c) => c.header)];
    const body = data.map((r) => cols.map((c) => {
      const v = toValue(r, c.accessor);
      return typeof v === 'number' ? Number(v.toFixed(2)) : v;
    }));
    autoTable(doc, {
      head,
      body,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 64, 175] },
      margin: { top: 140 }, // Margen superior para logo de 120px
      didDrawPage: () => {
        // Título centrado debajo del logo
        const title = fileBase;
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(title, pageWidth / 2, 50, { align: 'center' });
        
        // Subtítulo con rango de fechas centrado
        const fr = [opts?.desde, opts?.hasta].filter(Boolean).join(' a ');
        if (fr) {
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          doc.text(`Período: ${fr}`, pageWidth / 2, 80, { align: 'center' });
        }
        
        // Línea separadora
        doc.setDrawColor(200, 200, 200);
        doc.line(40, 130, pageWidth - 40, 130); // Línea debajo del texto
      },
    });
    doc.save(buildFileName(fileBase, { ...opts, ext: 'pdf' }));
  }
}
