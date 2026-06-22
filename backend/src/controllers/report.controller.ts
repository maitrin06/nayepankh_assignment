import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { db } from '../utils/firebase';
import { AuthRequest } from '../middleware/auth.middleware';

// GET /api/reports/certificate/:id (Download dynamic PDF certificate)
export const getCertificatePDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Certificate ID

    const certSnap = await db.collection('certificates').doc(id).get();
    if (!certSnap.exists) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    const cert = certSnap.data();

    // Create a landscape-oriented A4 PDF document
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 40,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Certificate_${cert.volunteerName.replace(/\s+/g, '_')}.pdf`);

    doc.pipe(res);

    // --- Draw elegant certificate frame ---
    // Outer border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
       .lineWidth(3)
       .strokeColor('#1e293b') // Dark Slate
       .stroke();

    // Inner thin border
    doc.rect(28, 28, doc.page.width - 56, doc.page.height - 56)
       .lineWidth(1)
       .strokeColor('#d97706') // Amber / Gold
       .stroke();

    // --- Header Section ---
    doc.moveDown(4);
    doc.font('Helvetica-Bold')
       .fontSize(32)
       .fillColor('#1e293b')
       .text('VOLUNTEERHUB', { align: 'center' });

    doc.font('Helvetica')
       .fontSize(10)
       .fillColor('#d97706')
       .text('SMART VOLUNTEER REGISTRATION & MANAGEMENT', { align: 'center', characterSpacing: 1 });

    doc.moveDown(2);

    // --- Certificate Subtitle ---
    doc.font('Helvetica-Oblique')
       .fontSize(16)
       .fillColor('#475569')
       .text('Certificate of Appreciation', { align: 'center' });

    doc.moveDown(1.5);

    // --- Recipient Name ---
    doc.font('Helvetica')
       .fontSize(14)
       .fillColor('#64748b')
       .text('THIS CERTIFICATE IS PROUDLY PRESENTED TO', { align: 'center' });

    doc.moveDown(1);

    doc.font('Helvetica-Bold')
       .fontSize(28)
       .fillColor('#b45309') // Dark amber
       .text(cert.volunteerName, { align: 'center' });

    doc.moveDown(1.5);

    // --- Recognition Text ---
    const recognitionText = `For outstanding volunteer service and dedicated commitment to "${cert.eventName}". Through active participation and noble deeds, the recipient contributed a total of ${cert.hoursCompleted} hours towards community welfare and social change.`;
    
    doc.font('Helvetica')
       .fontSize(12)
       .fillColor('#334155')
       .text(recognitionText, {
         width: 500,
         align: 'center',
         lineGap: 4
       });

    // --- Footer Section ---
    doc.moveDown(4);

    // Signatures / Metadata Line
    const signatureY = doc.y;
    
    // Left: Date Issued
    doc.font('Helvetica-Bold')
       .fontSize(10)
       .fillColor('#1e293b')
       .text('DATE ISSUED', 100, signatureY);
    
    doc.font('Helvetica')
       .fontSize(10)
       .fillColor('#475569')
       .text(new Date(cert.issuedAt).toLocaleDateString(), 100, signatureY + 15);

    // Right: Verification Code
    doc.font('Helvetica-Bold')
       .fontSize(10)
       .fillColor('#1e293b')
       .text('VERIFICATION CREDENTIAL ID', 500, signatureY);
    
    doc.font('Helvetica')
       .fontSize(10)
       .fillColor('#475569')
       .text(cert.verificationCode || `vh-cert-val-${id}`, 500, signatureY + 15);

    // Center: Logo / Seal representation
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .fillColor('#d97706')
       .text('★ ★ ★ SEAL ★ ★ ★', doc.page.width / 2 - 50, signatureY + 5);

    doc.end();
  } catch (error: any) {
    console.error('Download certificate error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// GET /api/reports/pdf (Generate and download PDF system analytics summary)
export const getPDFReport = async (req: AuthRequest, res: Response) => {
  try {
    const volunteersSnapshot = await db.collection('volunteers').get();
    const eventsSnapshot = await db.collection('events').get();
    const logsSnapshot = await db.collection('activityLogs').get();

    const volunteers = volunteersSnapshot.docs.map((d: any) => d.data());
    const events = eventsSnapshot.docs.map((d: any) => d.data());
    const logs = logsSnapshot.docs.map((d: any) => d.data());

    const totalVols = volunteers.length;
    const approvedVols = volunteers.filter((v: any) => v.status === 'approved').length;
    const pendingVols = volunteers.filter((v: any) => v.status === 'pending').length;
    const totalEvents = events.length;
    const totalHours = volunteers.reduce((acc: number, curr: any) => acc + (curr.hoursCompleted || 0), 0);

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=VolunteerHub_Analytics_Report.pdf');
    
    doc.pipe(res);

    // Report Header
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#1e293b').text('VolunteerHub NGO Analytics Report', { align: 'center' });
    doc.fontSize(10).font('Helvetica').fillColor('#475569').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Metrics Box
    doc.rect(50, doc.y, 500, 100).fillColor('#f8fafc').fill();
    doc.fillColor('#1e293b');

    // Text inside box
    const currentY = doc.y + 15;
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('Key Performance Indicators (KPIs)', 70, currentY);
    doc.font('Helvetica').fontSize(10);
    doc.text(`Total Volunteers: ${totalVols} (Approved: ${approvedVols}, Pending: ${pendingVols})`, 70, currentY + 20);
    doc.text(`Total Events Created: ${totalEvents}`, 70, currentY + 35);
    doc.text(`Total Contribution Hours: ${totalHours} hrs`, 70, currentY + 50);

    doc.y = currentY + 80;
    doc.moveDown(2);

    // Events Table
    doc.font('Helvetica-Bold').fontSize(14).text('Upcoming and Past Events');
    doc.moveDown(0.5);

    events.forEach((ev: any, idx: number) => {
      doc.font('Helvetica-Bold').fontSize(11).text(`${idx + 1}. ${ev.title}`);
      doc.font('Helvetica').fontSize(9).text(`Location: ${ev.location} | Date: ${new Date(ev.date).toLocaleDateString()} | Registered Volunteers: ${ev.volunteerIds?.length || 0}`);
      doc.fontSize(9).fillColor('#475569').text(ev.description, { width: 480 });
      doc.moveDown(1.5).fillColor('#1e293b');
    });

    // Recent System Activity Logs
    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(14).text('System Activity Log Trail');
    doc.moveDown(1);

    // Filter last 10 logs
    const recentLogs = logs
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 15);

    recentLogs.forEach((log: any) => {
      const timeStr = new Date(log.timestamp).toLocaleString();
      doc.font('Helvetica-Bold').fontSize(9).text(`[${timeStr}] ${log.action}`, { continued: true });
      doc.font('Helvetica').text(`: ${log.details}`);
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error: any) {
    console.error('Download report PDF error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// GET /api/reports/excel (Download Excel Volunteers roster)
export const getExcelReport = async (req: AuthRequest, res: Response) => {
  try {
    const volunteersSnapshot = await db.collection('volunteers').get();
    const usersSnapshot = await db.collection('users').get();

    const usersMap = new Map<string, any>();
    usersSnapshot.docs.forEach((doc: any) => {
      usersMap.set(doc.id, doc.data());
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Volunteers List');

    sheet.columns = [
      { header: 'Volunteer ID', key: 'id', width: 15 },
      { header: 'Full Name', key: 'name', width: 25 },
      { header: 'Email Address', key: 'email', width: 30 },
      { header: 'Contact No', key: 'phone', width: 15 },
      { header: 'Age', key: 'age', width: 8 },
      { header: 'Gender', key: 'gender', width: 10 },
      { header: 'Availability', key: 'availability', width: 25 },
      { header: 'Location', key: 'location', width: 15 },
      { header: 'Skills', key: 'skills', width: 35 },
      { header: 'Hours Credited', key: 'hours', width: 15 },
      { header: 'Roster Status', key: 'status', width: 12 },
    ];

    volunteersSnapshot.docs.forEach((doc: any) => {
      const volData = doc.data();
      const user = usersMap.get(volData.userId) || {};
      sheet.addRow({
        id: doc.id,
        name: user.name || 'N/A',
        email: user.email || 'N/A',
        phone: user.phone || 'N/A',
        age: volData.age || 'N/A',
        gender: volData.gender || 'N/A',
        availability: volData.availability || 'N/A',
        location: volData.location || 'N/A',
        skills: volData.skills || 'N/A',
        hours: volData.hoursCompleted || 0,
        status: volData.status || 'pending',
      });
    });

    // Formatting headers
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' },
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Volunteers_Directory_Roster.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error: any) {
    console.error('Download Excel error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};