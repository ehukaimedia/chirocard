import { jsPDF } from "jspdf";

// Body region ID to human-readable label mapping
const BODY_REGION_LABELS: Record<string, string> = {
    "head": "Head",
    "neck": "Neck",
    "l-shoulder": "Left Shoulder",
    "r-shoulder": "Right Shoulder",
    "upper-back": "Upper Back",
    "lower-back": "Lower Back",
    "chest": "Chest",
    "abdominals": "Abdominals",
    "l-arm": "Left Arm",
    "r-arm": "Right Arm",
    "l-hip": "Left Hip",
    "r-hip": "Right Hip",
    "l-leg": "Left Leg",
    "r-leg": "Right Leg",
    "l-foot": "Left Foot",
    "r-foot": "Right Foot",
};

interface SessionData {
    date: string;
    practitionerName: string;
    practitioner?: {
        name: string;
        role: string;
        clinicName?: string;
        phone?: string;
        email?: string;
        website?: string;
        address?: string;
    };
    userContact?: {
        name: string;
        email?: string;
        phone?: string;
        address?: string;
    };
    patientIntake?: {
        notes?: string;
        bodyAreas?: Record<string, string>;
        bodyNotes?: Record<string, string>;
    };
    notes: string;
    bodyLog: Record<string, string>;
    treatmentNotes?: Record<string, string>;
    userSignature?: string;
    signatureImage: string;
    recommendations?: {
        title: string;
        description?: string;
        frequency: string;
        category: string;
    }[];
}

// Modern color palette
const COLORS = {
    primary: [23, 125, 79] as [number, number, number],
    primaryLight: [220, 252, 231] as [number, number, number],
    dark: [39, 39, 42] as [number, number, number],
    text: [63, 63, 70] as [number, number, number],
    muted: [113, 113, 122] as [number, number, number],
    light: [161, 161, 170] as [number, number, number],
    border: [228, 228, 231] as [number, number, number],
    bgLight: [250, 250, 250] as [number, number, number],
    bgCard: [255, 255, 255] as [number, number, number],
    red: [220, 38, 38] as [number, number, number],
    redLight: [254, 242, 242] as [number, number, number],
    green: [22, 163, 74] as [number, number, number],
    greenLight: [240, 253, 244] as [number, number, number],
    blue: [37, 99, 235] as [number, number, number],
    blueLight: [239, 246, 255] as [number, number, number],
    amber: [217, 119, 6] as [number, number, number],
    amberLight: [254, 252, 232] as [number, number, number],
    purple: [124, 58, 237] as [number, number, number],
    purpleLight: [245, 243, 255] as [number, number, number],
};

const LOGO_IMAGE = "data:image/png;base64,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…";

// Consistent spacing
const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    section: 20,
};

// Font sizes
const FONT = {
    xs: 7,
    sm: 8,
    base: 9,
    md: 10,
    lg: 11,
    xl: 14,
    xxl: 20,
    title: 24,
};

function formatBodyPart(partId: string): string {
    return BODY_REGION_LABELS[partId] || partId.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function getStatusConfig(status: string): { label: string; color: [number, number, number]; bgColor: [number, number, number] } {
    switch (status) {
        case "issue": return { label: "Issue", color: COLORS.red, bgColor: COLORS.redLight };
        case "addressed": return { label: "Addressed", color: COLORS.green, bgColor: COLORS.greenLight };
        case "watch": return { label: "Monitor", color: COLORS.blue, bgColor: COLORS.blueLight };
        default: return { label: status, color: COLORS.muted, bgColor: COLORS.bgLight };
    }
}

function getCategoryConfig(category: string): { color: [number, number, number]; bgColor: [number, number, number] } {
    switch (category) {
        case "relief": return { color: COLORS.blue, bgColor: COLORS.blueLight };
        case "movement": return { color: COLORS.green, bgColor: COLORS.greenLight };
        case "lifestyle": return { color: COLORS.purple, bgColor: COLORS.purpleLight };
        default: return { color: COLORS.muted, bgColor: COLORS.bgLight };
    }
}

// Helper to draw rounded rectangle with optional border
function drawCard(doc: jsPDF, x: number, y: number, w: number, h: number, options: {
    fill?: [number, number, number];
    border?: [number, number, number];
    radius?: number;
} = {}) {
    const { fill = COLORS.bgCard, border, radius = 4 } = options;
    doc.setFillColor(...fill);
    if (border) {
        doc.setDrawColor(...border);
        doc.setLineWidth(0.35);
        doc.roundedRect(x, y, w, h, radius, radius, 'FD');
    } else {
        doc.roundedRect(x, y, w, h, radius, radius, 'F');
    }
}

// Helper to draw section header with a light underline
function drawSectionHeader(doc: jsPDF, title: string, y: number, margin: number): number {
    doc.setFontSize(FONT.xl);
    doc.setTextColor(...COLORS.dark);
    doc.setFont("helvetica", 'bold');
    doc.text(title, margin, y + 12);

    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.25);
    doc.line(margin, y + 15, doc.internal.pageSize.width - margin, y + 15);
    
    return y + 24;
}

// Helper to draw a pill/badge
function drawPill(doc: jsPDF, text: string, x: number, y: number, color: [number, number, number], bgColor: [number, number, number]): number {
    const padding = 4;
    doc.setFontSize(FONT.xs);
    const textWidth = doc.getTextWidth(text);
    const pillWidth = textWidth + padding * 2;
    
    doc.setFillColor(...bgColor);
    doc.roundedRect(x, y - 4, pillWidth, 10, 5, 5, 'F');
    
    doc.setTextColor(...color);
    doc.setFont("helvetica", 'bold');
    doc.text(text, x + padding, y + 2);
    
    return pillWidth;
}

export function generateSessionPDF(data: SessionData) {
    const doc = new jsPDF();
    const margin = 16;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const contentWidth = pageWidth - (margin * 2);
    let y = 0;

    // ============================================================
    // HEADER
    // ============================================================
    
    y = margin;
    
    // Logo image and brand text
    const logoSize = 14;
    try {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(margin, y - 2, logoSize, logoSize, 4, 4, 'F');
        doc.addImage(LOGO_IMAGE, "PNG", margin, y - 2, logoSize, logoSize, undefined, 'FAST');
    } catch (e) { /* ignore */ }
    
    const brandX = margin + logoSize + 6;
    doc.setFontSize(FONT.title);
    doc.setFont("helvetica", 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text("Chiro", brandX, y + 8);
    
    const chiroWidth = doc.getTextWidth("Chiro");
    doc.setTextColor(...COLORS.dark);
    doc.text("Card", brandX + chiroWidth, y + 8);
    
    // Tagline
    doc.setFontSize(FONT.sm);
    doc.setTextColor(...COLORS.muted);
    doc.setFont("helvetica", 'normal');
    doc.text("The Digital Body Work Passport", brandX, y + 13);
    
    // Date badge on right
    const dateText = data.date;
    doc.setFontSize(FONT.base);
    doc.setTextColor(...COLORS.text);
    doc.text("Session Date", pageWidth - margin, y + 3, { align: 'right' });
    doc.setFontSize(FONT.lg);
    doc.setFont("helvetica", 'bold');
    doc.setTextColor(...COLORS.dark);
    doc.text(dateText, pageWidth - margin, y + 10, { align: 'right' });
    
    y += 24;
    
    // Divider
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.25);
    doc.line(margin, y, pageWidth - margin, y);
    
    y += SPACING.lg;

    // ============================================================
    // CONTACT CARDS - Two columns
    // ============================================================
    
    const cardGap = 10;
    const cardWidth = (contentWidth - cardGap) / 2;
    const cardHeight = 52;
    
    // Patient Card
    drawCard(doc, margin, y, cardWidth, cardHeight, { fill: COLORS.bgLight, border: COLORS.border });
    
    let cardY = y + SPACING.md;
    doc.setFontSize(FONT.xs);
    doc.setTextColor(...COLORS.primary);
    doc.setFont("helvetica", 'bold');
    doc.text("PATIENT", margin + SPACING.md, cardY);
    
    cardY += SPACING.sm;
    doc.setFontSize(FONT.lg);
    doc.setTextColor(...COLORS.dark);
    doc.text(data.userContact?.name || "Patient", margin + SPACING.md, cardY);
    
    cardY += SPACING.sm;
    doc.setFontSize(FONT.base);
    doc.setTextColor(...COLORS.text);
    doc.setFont("helvetica", 'normal');
    
    const patientDetails: string[] = [];
    if (data.userContact?.phone) patientDetails.push(data.userContact.phone);
    if (data.userContact?.email) patientDetails.push(data.userContact.email);
    patientDetails.forEach(detail => {
        doc.text(detail, margin + SPACING.md, cardY);
        cardY += SPACING.xs + 1;
    });
    
    // Practitioner Card
    const rightCardX = margin + cardWidth + cardGap;
    drawCard(doc, rightCardX, y, cardWidth, cardHeight, { fill: COLORS.greenLight, border: COLORS.border });
    
    cardY = y + SPACING.md;
    doc.setFontSize(FONT.xs);
    doc.setTextColor(...COLORS.primary);
    doc.setFont("helvetica", 'bold');
    doc.text("PRACTITIONER", rightCardX + SPACING.md, cardY);
    
    cardY += SPACING.sm;
    doc.setFontSize(FONT.lg);
    doc.setTextColor(...COLORS.dark);
    doc.text(data.practitionerName || "Practitioner", rightCardX + SPACING.md, cardY);
    
    cardY += SPACING.sm;
    doc.setFontSize(FONT.base);
    doc.setFont("helvetica", 'normal');
    
    if (data.practitioner?.role) {
        doc.setTextColor(...COLORS.primary);
        doc.text(data.practitioner.role, rightCardX + SPACING.md, cardY);
        cardY += SPACING.xs + 1;
    }
    
    doc.setTextColor(...COLORS.text);
    const practDetails: string[] = [];
    if (data.practitioner?.clinicName) practDetails.push(data.practitioner.clinicName);
    if (data.practitioner?.phone) practDetails.push(data.practitioner.phone);
    practDetails.slice(0, 2).forEach(detail => {
        doc.text(detail, rightCardX + SPACING.md, cardY);
        cardY += SPACING.xs + 1;
    });
    
    y += cardHeight + SPACING.section;

    // ============================================================
    // PATIENT INTAKE (if exists)
    // ============================================================
    
    const hasIntakeNotes = data.patientIntake?.notes;
    const intakeAreas = data.patientIntake?.bodyAreas ? 
        Object.entries(data.patientIntake.bodyAreas).filter(([_, s]) => s !== 'normal') : [];
    
    if (hasIntakeNotes || intakeAreas.length > 0) {
        y = drawSectionHeader(doc, "Patient Intake", y, margin);
        
        if (hasIntakeNotes) {
            const noteLines = doc.splitTextToSize(`"${data.patientIntake!.notes}"`, contentWidth - SPACING.xl);
            const noteBoxH = Math.max(20, noteLines.length * 5 + SPACING.md);
            
            drawCard(doc, margin, y, contentWidth, noteBoxH, { fill: COLORS.amberLight });
            
            doc.setFontSize(FONT.md);
            doc.setTextColor(...COLORS.text);
            doc.setFont("helvetica", 'italic');
            doc.text(noteLines, margin + SPACING.md, y + SPACING.md);
            
            y += noteBoxH + SPACING.sm;
        }
        
        if (intakeAreas.length > 0) {
            doc.setFontSize(FONT.sm);
            doc.setTextColor(...COLORS.muted);
            doc.setFont("helvetica", 'normal');
            doc.text("Areas of Concern:", margin + SPACING.xs, y + 4);
            y += SPACING.md;
            
            intakeAreas.forEach(([partId, status]) => {
                const config = getStatusConfig(status);
                const label = formatBodyPart(partId);
                const note = data.patientIntake?.bodyNotes?.[partId];
                
                doc.setFontSize(FONT.md);
                doc.setTextColor(...COLORS.dark);
                doc.setFont("helvetica", 'normal');
                doc.text(label, margin + SPACING.sm, y + 4);
                
                const pillX = margin + SPACING.sm + doc.getTextWidth(label) + SPACING.sm;
                drawPill(doc, config.label.toUpperCase(), pillX, y + 2, config.color, COLORS.bgCard);
                
                if (note) {
                    doc.setFontSize(FONT.base);
                    doc.setTextColor(...COLORS.muted);
                    doc.text(` — ${note}`, pillX + doc.getTextWidth(config.label.toUpperCase()) + SPACING.md, y + 4);
                }
                y += SPACING.md;
            });
        }
        
        y += SPACING.md;
    }

    // ============================================================
    // BODYWORK LOG
    // ============================================================
    
    y = drawSectionHeader(doc, "Bodywork Log", y, margin);
    
    const bodyEntries = Object.entries(data.bodyLog).filter(([_, status]) => status !== 'normal');
    
    if (bodyEntries.length > 0) {
        bodyEntries.forEach(([partId, status]) => {
            if (y > pageHeight - 50) {
                doc.addPage();
                y = margin;
            }
            
            const config = getStatusConfig(status);
            const label = formatBodyPart(partId);
            const treatmentNote = data.treatmentNotes?.[partId];
            const rowHeight = treatmentNote ? 26 : 18;
            
            // Row card
            drawCard(doc, margin, y, contentWidth, rowHeight, { fill: COLORS.bgCard, border: COLORS.border });
            
            // Body part name
            doc.setFontSize(FONT.lg);
            doc.setTextColor(...COLORS.dark);
            doc.setFont("helvetica", 'bold');
            doc.text(label, margin + SPACING.md, y + 11);
            
            // Status pill
            const pillX = margin + SPACING.md + doc.getTextWidth(label) + SPACING.sm;
            drawPill(doc, config.label.toUpperCase(), pillX, y + 9, config.color, config.bgColor);
            
            // Treatment note
            if (treatmentNote) {
                doc.setFontSize(FONT.base);
                doc.setTextColor(...COLORS.text);
                doc.setFont("helvetica", 'normal');
                const noteLines = doc.splitTextToSize(treatmentNote, contentWidth - SPACING.xl * 2);
                doc.text(noteLines[0], margin + SPACING.md, y + 20);
            }
            
            y += rowHeight + SPACING.sm;
        });
    } else {
        drawCard(doc, margin, y, contentWidth, 24, { fill: COLORS.bgLight });
        doc.setFontSize(FONT.md);
        doc.setTextColor(...COLORS.muted);
        doc.setFont("helvetica", 'italic');
        doc.text("No specific body areas logged in this session.", margin + SPACING.md, y + 14);
        y += 24;
    }
    
    y += SPACING.lg;

    // ============================================================
    // PRACTITIONER NOTES
    // ============================================================
    
    if (y > pageHeight - 80) {
        doc.addPage();
        y = margin;
    }
    
    y = drawSectionHeader(doc, "Practitioner Notes", y, margin);
    
    const notesText = data.notes || "No additional notes recorded.";
    const splitNotes = doc.splitTextToSize(notesText, contentWidth - SPACING.xl);
    const notesBoxH = Math.max(28, splitNotes.length * 5 + SPACING.lg);
    
    drawCard(doc, margin, y, contentWidth, notesBoxH, { fill: COLORS.bgLight, border: COLORS.border });
    
    doc.setFontSize(FONT.md);
    doc.setTextColor(...COLORS.text);
    doc.setFont("helvetica", 'normal');
    doc.text(splitNotes, margin + SPACING.md, y + SPACING.md);
    
    y += notesBoxH + SPACING.section;

    // ============================================================
    // RECOMMENDATIONS
    // ============================================================
    
    if (data.recommendations && data.recommendations.length > 0) {
        if (y > pageHeight - 100) {
            doc.addPage();
            y = margin;
        }
        
        y = drawSectionHeader(doc, "Recommendations & Homework", y, margin);
        
        data.recommendations.forEach((rec, index) => {
            if (y > pageHeight - 50) {
                doc.addPage();
                y = margin;
            }
            
            const config = getCategoryConfig(rec.category);
            const rowHeight = rec.description ? 28 : 18;
            
            // Card
            drawCard(doc, margin, y, contentWidth, rowHeight, { fill: COLORS.bgCard, border: COLORS.border });
            
            // Title
            doc.setFontSize(FONT.lg);
            doc.setTextColor(...COLORS.dark);
            doc.text(rec.title, margin + SPACING.md, y + 12);
            
            // Frequency badge
            const freqX = margin + SPACING.md + doc.getTextWidth(rec.title) + SPACING.sm;
            drawPill(doc, rec.frequency, freqX, y + 10, config.color, config.bgColor);
            
            // Category on right
            doc.setFontSize(FONT.xs);
            doc.setTextColor(...COLORS.light);
            doc.setFont("helvetica", 'normal');
            doc.text(rec.category.toUpperCase(), pageWidth - margin - SPACING.sm, y + 12, { align: 'right' });
            
            // Description
            if (rec.description) {
                doc.setFontSize(FONT.base);
                doc.setTextColor(...COLORS.muted);
                doc.text(rec.description, margin + SPACING.md, y + 22);
            }
            
            y += rowHeight + SPACING.sm;
        });
        
        y += SPACING.md;
    }

    // ============================================================
    // SIGNATURES
    // ============================================================
    
    if (y > pageHeight - 80) {
        doc.addPage();
        y = margin;
    }
    
    // Divider
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.25);
    doc.line(margin, y, pageWidth - margin, y);
    y += SPACING.lg;
    
    doc.setFontSize(FONT.lg);
    doc.setTextColor(...COLORS.dark);
    doc.setFont("helvetica", 'bold');
    doc.text("Session Authorization", margin, y);
    y += SPACING.lg;
    
    const sigWidth = (contentWidth - cardGap) / 2;
    const sigHeight = 45;
    
    // Patient Signature
    drawCard(doc, margin, y, sigWidth, sigHeight, { fill: COLORS.bgLight, border: COLORS.border });
    
    doc.setFontSize(FONT.sm);
    doc.setTextColor(...COLORS.muted);
    doc.setFont("helvetica", 'normal');
    doc.text("Patient Signature", margin + SPACING.sm, y + SPACING.md);
    
    if (data.userSignature) {
        try {
            doc.addImage(data.userSignature, "PNG", margin + SPACING.sm, y + 14, 50, 20);
        } catch (e) { /* ignore */ }
    }
    
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.25);
    doc.line(margin + SPACING.sm, y + 36, margin + sigWidth - SPACING.sm, y + 36);
    doc.setFontSize(FONT.sm);
    doc.setTextColor(...COLORS.text);
    doc.text(data.userContact?.name || "Patient", margin + SPACING.sm, y + 42);
    
    // Practitioner Signature
    const sigRightX = margin + sigWidth + cardGap;
    drawCard(doc, sigRightX, y, sigWidth, sigHeight, { fill: COLORS.greenLight, border: COLORS.border });
    
    doc.setFontSize(FONT.sm);
    doc.setTextColor(...COLORS.muted);
    doc.text("Practitioner Signature", sigRightX + SPACING.sm, y + SPACING.md);
    
    if (data.signatureImage) {
        try {
            doc.addImage(data.signatureImage, "PNG", sigRightX + SPACING.sm, y + 14, 50, 20);
        } catch (e) { /* ignore */ }
    }
    
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.25);
    doc.line(sigRightX + SPACING.sm, y + 36, sigRightX + sigWidth - SPACING.sm, y + 36);
    doc.setFontSize(FONT.sm);
    doc.setTextColor(...COLORS.text);
    doc.text(data.practitionerName || "Practitioner", sigRightX + SPACING.sm, y + 42);

    // ============================================================
    // FOOTER ON ALL PAGES
    // ============================================================
    
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const footerY = pageHeight - 12;
        
        // Footer line
        doc.setDrawColor(...COLORS.border);
        doc.setLineWidth(0.25);
        doc.line(margin, footerY - 6, pageWidth - margin, footerY - 6);
        
        // Brand on left
        doc.setFontSize(FONT.sm);
        doc.setFont("helvetica", 'bold');
        doc.setTextColor(...COLORS.primary);
        doc.text("Chiro", margin, footerY);
        doc.setTextColor(...COLORS.dark);
        doc.text("Card", margin + doc.getTextWidth("Chiro"), footerY);
        
        // Disclaimer in center
        doc.setFontSize(FONT.xs);
        doc.setTextColor(...COLORS.light);
        doc.setFont("helvetica", 'normal');
        doc.text("ChiroCard Holistic body-work documentation— does not replace official medical records.", pageWidth / 2, footerY, { align: 'center' });
        
        // Page number on right
        doc.setTextColor(...COLORS.muted);
        doc.text(`${i} / ${pageCount}`, pageWidth - margin, footerY, { align: 'right' });
    }

    return doc;
}

export function downloadPDF(doc: jsPDF, filename: string) {
    const pdfFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    doc.save(pdfFilename);
}
