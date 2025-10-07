// FIX: Use default import for jsPDF to get correct typings for the instance.
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Report } from '../types';

const generateQRImage = (qrCodeDataURL: string): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = qrCodeDataURL;
        img.onload = () => resolve(img);
    });
};


// A simple number to words converter (handles up to thousands)
const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

function convert_hundreds(num: number): string {
    if (num > 99) {
        return ones[Math.floor(num / 100)] + ' hundred ' + convert_tens(num % 100);
    }
    return convert_tens(num);
}

function convert_tens(num: number): string {
    if (num < 10) return ones[num];
    if (num >= 10 && num < 20) return teens[num - 10];
    return tens[Math.floor(num / 10)] + ' ' + ones[num % 10];
}

function numToWords(num: number): string {
    if (num === 0) return 'Zero';
    const numStr = Math.floor(num).toString();
    if (numStr.length > 6) return 'Number too large'; // Simple implementation limit
    
    let words = '';
    const number = Math.floor(num);
    
    if (number >= 100000) {
        words += convert_tens(Math.floor(number / 100000)) + ' Lakh ';
    }

    if (number >= 1000) {
        words += convert_hundreds(Math.floor((number % 100000) / 1000)) + ' Thousand ';
    }
    
    if (number >= 0) {
        words += convert_hundreds(number % 1000);
    }

    return words.trim().replace(/\s+/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Only';
}


export const generateReportPDF = async (report: Report, qrCodeDataURL: string) => {
    const doc = new jsPDF();
    const qrImage = await generateQRImage(qrCodeDataURL);

    // Header Part 1 (Logo and Address)
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 122, 255);
    doc.text('Health', 23, 16);
    doc.setTextColor(80, 80, 80);
    doc.text('Care', 41, 16);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('In Front of Judge kothi More,Ganga', 120, 12);
    doc.text('Dayal Market Near Janta ultra sound,', 120, 17);
    doc.text('Ramana Pakri Road (ARA)802301', 120, 22);
    
    doc.setFont('helvetica', 'bold');
    doc.text('E-mail: healthcarejachghar@gmail.com', 120, 27);
    doc.setTextColor(220, 53, 69);
    doc.text('Sunday Evening Closed', 170, 17);
    doc.setTextColor(0, 0, 0);

    // Header Part 2 (Blue and Red Banners)
    doc.setFillColor(0, 115, 183);
    doc.rect(14, 35, 186, 8, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Health Care Pathology Lab.', 18, 41);

    doc.setFillColor(220, 53, 69);
    doc.rect(120, 35, 80, 8, 'F');
    doc.setFontSize(10);
    doc.text('Mobile no-8340767544,9263867823', 124, 41);
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Fully Computerised', 18, 50);

    doc.setLineWidth(0.5);
    doc.line(14, 55, 200, 55);
    
    // Patient Info
    doc.setFontSize(10);
    doc.text(`LAB NO : ${report.id}`, 14, 62);
    doc.text(`PATIENT NAME : ${report.patientName}`, 14, 68);
    doc.text(`REF BY DR. : ${report.refByDr}`, 14, 74);
    
    doc.text(`DATE : ${report.date}`, 150, 62);
    doc.text(`SEX : ${report.patientGender}`, 150, 68);
    doc.text(`AGE : ${report.patientAge}`, 150, 74);
    
    doc.setLineWidth(0.5);
    doc.line(14, 80, 200, 80);

    // Report title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORT ON THE EXAMINATION OF BLOOD', 105, 88, { align: 'center'});

    // Table
    const tableColumn = ["TEST", "RESULT", "NORMAL RANGE"];
    const tableRows: (string | number)[][] = report.tests.map(test => [
        test.testName,
        test.result,
        test.normalRange,
    ]);

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 95,
        theme: 'grid',
        headStyles: { fillColor: [255, 255, 255], textColor: [0,0,0], lineWidth: 0.1, lineColor: [0,0,0], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 2, lineWidth: 0.1, lineColor: [0,0,0] },
        columnStyles: {
            0: { fontStyle: 'bold' },
        }
    });

    const finalY = (doc as any).lastAutoTable.finalY;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.text('-: END OF REPORT :-', 105, finalY + 15, { align: 'center' });

    // Footer
    const footerY = 230;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('S.Kumar', 20, footerY + 20);
    doc.text('D.M.L.T.', 20, footerY + 25);

    doc.text('Dr.R.K.Sharan', 180, footerY + 20, { align: 'right' });
    doc.text('M.B.B.S', 180, footerY + 25, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Highlighted Result Values Indicate Abnormal Report', 14, footerY + 40);
    doc.text('Report Printed By My Lab Health Care Lab.', 14, footerY + 44);
    
    doc.text('Not For Medico Legal Purose', 200, footerY + 44, { align: 'right' });
    
    // QR Code
    doc.addImage(qrImage, 'PNG', 85, footerY, 40, 40);
    
    doc.save(`Report-${report.id}-${report.patientId}.pdf`);
};

export const generateBillPDF = (report: Report) => {
    const doc = new jsPDF();
    const collectionFee = 50.00;
    
    // Header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('HEALTH CARE PATHO LAB', 14, 15);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Phone no.: 9263867823, 8340767544', 14, 21);
    doc.text('Email: healthcarejachghar@gmail.com', 14, 26);

    doc.text('In Front of Judge kothi More,', 200, 15, { align: 'right' });
    doc.text('Near Janta ultra sound,', 200, 20, { align: 'right' });
    doc.text('Ramana Pakri Road ARA', 200, 25, { align: 'right' });
    
    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 122, 255); // Blue color
    doc.text('Tax Invoice', 105, 40, { align: 'center' });
    doc.setTextColor(0, 0, 0); // Reset color

    doc.setLineWidth(0.5);
    doc.line(14, 45, 200, 45);

    // Patient Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Bill To:', 14, 52);
    doc.setFont('helvetica', 'bold');
    doc.text(`PATIENT NAME : ${report.patientName}`, 14, 58);
    doc.text(`REF BY DR. : ${report.refByDr}`, 14, 64);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`DATE : ${report.date}`, 145, 58);
    doc.text(`AGE : ${report.patientAge}`, 145, 64);
    doc.text(`SEX : ${report.patientGender}`, 145, 70);

    // Table
    const tableColumn = ["#", "Item name", "Quantity", "Price/ unit", "Amount"];
    const tableRows: any[][] = [];
    let total = 0;

    report.tests.forEach((test, index) => {
        const testData = [
            index + 1,
            test.testName,
            1,
            `₹ ${test.price.toFixed(2)}`,
            `₹ ${test.price.toFixed(2)}`,
        ];
        tableRows.push(testData);
        total += test.price;
    });

    // Add collection fee
    tableRows.push([
        report.tests.length + 1,
        'COLLECTION FEE',
        1,
        `₹ ${collectionFee.toFixed(2)}`,
        `₹ ${collectionFee.toFixed(2)}`,
    ]);
    total += collectionFee;

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 75,
        theme: 'striped',
        headStyles: { fillColor: [0, 115, 183], textColor: [255, 255, 255] },
        styles: { fontSize: 10 },
        columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            2: { halign: 'center' },
            3: { halign: 'right' },
            4: { halign: 'right' },
        }
    });

    const finalY = (doc as any).lastAutoTable.finalY;
    
    // Total line
    doc.setLineWidth(0.5);
    doc.line(14, finalY + 2, 200, finalY + 2);

    // Total Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Total', 14, finalY + 8);
    doc.text(`${report.tests.length + 1}`, 108, finalY + 8);
    doc.text(`₹ ${total.toFixed(2)}`, 198, finalY + 8, { align: 'right' });

    doc.line(14, finalY + 12, 200, finalY + 12);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMS AND CONDITIONS', 14, finalY + 18);
    doc.text('INVOICE AMOUNT IN WORDS', 14, finalY + 24);
    doc.setFont('helvetica', 'normal');
    doc.text(numToWords(total), 65, finalY + 24);
    
    doc.text('For, Health Care', 198, finalY + 36, { align: 'right' });
    doc.text('Authorized Signatory', 198, finalY + 56, { align: 'right' });

    doc.save(`Bill-${report.id}-${report.patientId}.pdf`);
};