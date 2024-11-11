import { Injectable } from '@angular/core';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root'
})
export class GenerateExcelPdfService {

  
  /**
   * Export the given HTML table element to an Excel file (.xlsx).
   * 
   * @param table - The HTMLTableElement that will be exported.
   * @param excelFileName - The desired name for the Excel file (without extension).
   */
  exportTableToExcel(table: HTMLTableElement, excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(table);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${excelFileName}.xlsx`);
  }

  /**
   * Export the given HTML table element to a PDF file.
   * 
   * @param table - The HTMLTableElement that will be exported.
   * @param pdfFileName - The desired name for the PDF file (without extension).
   */
  exportTableToPdf(table: HTMLTableElement, pdfFileName: string): void {
    html2canvas(table).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`${pdfFileName}.pdf`);
    });
  }
}
