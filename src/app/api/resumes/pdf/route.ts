import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { createResume, getUserById } from "@/lib/database";
import { uploadResume } from "@/lib/azure/storage";
import PDFDocument from 'pdfkit';
import type { ResumeData, Experience, Education } from '@/types/resume';

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Get user ID from session
    const userId = (session.user as any).id;
    
    // Get the resume data from request body
    const resumeData: ResumeData = await request.json();
    
    // Get user profile data
    const user = await getUserById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create a PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true
    });

    // Convert to buffer
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    
    // Title
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text(resumeData.title, { align: 'center' });
    
    doc.moveDown(2);

    // Summary
    if (resumeData.summary) {
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('Summary', { underline: true });
      
      doc.fontSize(12)
         .font('Helvetica')
         .text(resumeData.summary);
      
      doc.moveDown(2);
    }

    // Experience
    if (resumeData.experience.length > 0) {
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('Professional Experience', { underline: true });
      
      doc.moveDown(1);

      resumeData.experience.forEach((exp: Experience, index: number) => {
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text(exp.title);
        
        doc.fontSize(12)
           .font('Helvetica')
           .text(`${exp.company} | ${exp.startDate} - ${exp.endDate}`);
        
        // Split description into bullet points
        const bullets = exp.description.split('\n').filter(Boolean);
        
        doc.moveDown(0.5);
        bullets.forEach((bullet: string) => {
          doc.fontSize(12)
             .font('Helvetica')
             .text(`• ${bullet}`, {
               indent: 20,
               align: 'left',
               lineGap: 5
             });
        });

        if (index < resumeData.experience.length - 1) {
          doc.moveDown(1);
        }
      });

      doc.moveDown(2);
    }

    // Education
    if (resumeData.education.length > 0) {
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('Education', { underline: true });
      
      doc.moveDown(1);

      resumeData.education.forEach((edu: Education, index: number) => {
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text(edu.degree);
        
        doc.fontSize(12)
           .font('Helvetica')
           .text(`${edu.school} | ${edu.year}`);

        if (index < resumeData.education.length - 1) {
          doc.moveDown(1);
        }
      });

      doc.moveDown(2);
    }

    // Skills
    if (resumeData.skills.length > 0) {
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('Skills', { underline: true });
      
      doc.moveDown(1);

      doc.fontSize(12)
         .font('Helvetica')
         .text(resumeData.skills.join(', '), {
           align: 'left',
           lineGap: 5
         });
    }

    // Finalize PDF
    doc.end();

    // Convert chunks to base64
    const pdfBuffer = Buffer.concat(chunks);
    const base64Pdf = pdfBuffer.toString('base64');
    const pdfUrl = `data:application/pdf;base64,${base64Pdf}`;

    // Create resume record in database
    const resume = await createResume({
      userId,
      title: resumeData.title || 'My Resume',
      content: JSON.stringify(resumeData),
      file: pdfUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ resume, pdfUrl }, { status: 201 });
  } catch (error) {
    console.error("Error generating resume PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate resume PDF" },
      { status: 500 }
    );
  }
} 