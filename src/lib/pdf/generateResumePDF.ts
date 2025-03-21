import PDFDocument from 'pdfkit';

export interface ResumeData {
  title?: string;
  summary?: string;
  experience?: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description: string;
  }>;
  education?: Array<{
    degree: string;
    school: string;
    year: string;
  }>;
  skills?: string[];
}

export interface Profile {
  name?: string;
  email?: string;
  location?: string;
  phone?: string;
}

export async function generateResumePDF(profile: Profile, resumeData: ResumeData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4'
      });

      // Collect the PDF chunks
      const chunks: Uint8Array[] = [];
      doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Set font and initial styling
      doc.font('Helvetica-Bold');
      
      // Header section
      doc.fontSize(24).text(profile.name || '', { align: 'center' });
      doc.moveDown(0.5);
      doc.font('Helvetica');
      doc.fontSize(12).text(profile.email || '', { align: 'center' });
      if (profile.phone) {
        doc.text(profile.phone, { align: 'center' });
      }
      if (profile.location) {
        doc.text(profile.location, { align: 'center' });
      }
      doc.moveDown();

      // Summary section
      if (resumeData.summary) {
        doc.font('Helvetica-Bold');
        doc.fontSize(14).text('Professional Summary', { underline: true });
        doc.moveDown(0.5);
        doc.font('Helvetica');
        doc.fontSize(12).text(resumeData.summary);
        doc.moveDown();
      }

      // Experience section
      if (resumeData.experience && resumeData.experience.length > 0) {
        doc.font('Helvetica-Bold');
        doc.fontSize(14).text('Professional Experience', { underline: true });
        doc.moveDown(0.5);
        
        resumeData.experience.forEach(exp => {
          doc.font('Helvetica-Bold');
          doc.fontSize(12).text(exp.title);
          doc.font('Helvetica');
          doc.fontSize(11).text(exp.company);
          doc.fontSize(10).text(`${exp.startDate} - ${exp.endDate || 'Present'}`);
          doc.moveDown(0.5);
          doc.fontSize(11).text(exp.description);
          doc.moveDown();
        });
      }

      // Education section
      if (resumeData.education && resumeData.education.length > 0) {
        doc.font('Helvetica-Bold');
        doc.fontSize(14).text('Education', { underline: true });
        doc.moveDown(0.5);
        
        resumeData.education.forEach(edu => {
          doc.font('Helvetica-Bold');
          doc.fontSize(12).text(edu.degree);
          doc.font('Helvetica');
          doc.fontSize(11).text(edu.school);
          doc.fontSize(10).text(edu.year);
          doc.moveDown();
        });
      }

      // Skills section
      if (resumeData.skills && resumeData.skills.length > 0) {
        doc.font('Helvetica-Bold');
        doc.fontSize(14).text('Skills', { underline: true });
        doc.moveDown(0.5);
        doc.font('Helvetica');
        doc.fontSize(11).text(resumeData.skills.join(', '));
      }

      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
} 