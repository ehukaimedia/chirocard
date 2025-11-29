import { jsPDF } from "jspdf";

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
    notes: string;
    bodyLog: Record<string, string>;
    signatureImage: string; // Base64
    recommendations?: {
        title: string;
        description?: string;
        frequency: string;
        category: string;
    }[];
}

export function generateSessionPDF(data: SessionData) {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    // --- Header Section ---
    doc.setFontSize(24);
    doc.setTextColor(23, 125, 79); // Emerald
    doc.setFont(undefined, 'bold');
    doc.text("ChiroCard Session Record", margin, y);

    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont(undefined, 'normal');
    doc.text("User-Owned Personal Health Record", margin, y);

    y += 12;
    // Required Text
    doc.setFontSize(9);
    doc.setTextColor(80);
    const introText = "ChiroCard is your digital passport for holistic hands-on therapies—chiropractic, massage, physical therapy, cupping, and acupuncture, giving you full control of your holistic body-work data.";
    const splitIntro = doc.splitTextToSize(introText, 170);
    doc.text(splitIntro, margin, y);
    y += (splitIntro.length * 5) + 10;

    // --- Info Grid ---
    const startY = y;

    // Patient Info (Left Column)
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("PATIENT", margin, y);
    y += 5;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont(undefined, 'bold');
    doc.text(data.userContact?.name || "Guest User", margin, y);
    y += 5;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    if (data.userContact?.email) {
        doc.text(data.userContact.email || "", margin, y);
        y += 4;
    }
    if (data.userContact?.phone) {
        doc.text(data.userContact.phone || "", margin, y);
        y += 4;
    }
    if (data.userContact?.address) {
        const splitAddress = doc.splitTextToSize(data.userContact.address || "", 80);
        doc.text(splitAddress, margin, y);
        y += (splitAddress.length * 4);
    }

    // Practitioner Info (Right Column)
    let rightY = startY;
    const rightColX = 110;
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("PRACTITIONER", rightColX, rightY);
    rightY += 5;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont(undefined, 'bold');
    doc.text(`Practitioner: ${data.practitionerName || "Guest Practitioner"}`, rightColX, rightY);
    rightY += 5;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);

    if (data.practitioner?.role) {
        doc.text(data.practitioner.role || "", rightColX, rightY);
        rightY += 4;
    }
    if (data.practitioner?.clinicName) {
        doc.text(data.practitioner.clinicName || "", rightColX, rightY);
        rightY += 4;
    }
    if (data.practitioner?.phone) {
        doc.text(data.practitioner.phone || "", rightColX, rightY);
        rightY += 4;
    }
    if (data.practitioner?.email) {
        doc.text(data.practitioner.email || "", rightColX, rightY);
        rightY += 4;
    }
    if (data.practitioner?.website) {
        doc.setTextColor(23, 125, 79);
        doc.text(data.practitioner.website || "", rightColX, rightY);
        doc.setTextColor(0);
        rightY += 4;
    }

    // Align Y to the bottom of the tallest column
    y = Math.max(y, rightY) + 10;

    // Date Line
    doc.setDrawColor(200);
    doc.line(margin, y, 190, y);
    y += 10;
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Date of Session: ${data.date}`, margin, y);
    y += 15;

    // --- Body Log ---
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(23, 125, 79);
    doc.text("Bodywork Log", margin, y);
    y += 8;
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.setFont(undefined, 'normal');

    let hasIssues = false;
    Object.entries(data.bodyLog).forEach(([part, status]) => {
        if (status !== "normal") {
            hasIssues = true;
            const statusText = status.charAt(0).toUpperCase() + status.slice(1);
            doc.text(`• ${part.replace("-", " ")}: ${statusText}`, margin + 5, y);
            y += 6;
        }
    });

    if (!hasIssues) {
        doc.text("• No specific issues logged.", margin + 5, y);
        y += 6;
    }

    y += 10;

    // --- Notes ---
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(23, 125, 79);
    doc.text("Practitioner Notes", margin, y);
    y += 8;
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.setFont(undefined, 'normal');

    const splitNotes = doc.splitTextToSize(data.notes || "No notes added.", 170);
    doc.text(splitNotes, margin, y);
    y += (splitNotes.length * 6) + 10;

    // --- Signature ---
    // Check for page break
    if (y > 250) {
        doc.addPage();
        y = 20;
    }

    if (data.signatureImage) {
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Signed by Practitioner:", margin, y);
        y += 5;
        doc.addImage(data.signatureImage, "PNG", margin, y, 50, 25);
        y += 30;
    }

    // --- Recommendations ---
    if (data.recommendations && data.recommendations.length > 0) {
        doc.addPage();
        y = 20;
        doc.setFontSize(18);
        doc.setTextColor(23, 125, 79);
        doc.setFont(undefined, 'bold');
        doc.text("Holistic Recommendations", margin, y);
        y += 15;

        doc.setFontSize(11);
        doc.setTextColor(0);

        data.recommendations.forEach(rec => {
            doc.setFont(undefined, 'bold');
            doc.text(`• ${rec.title}`, margin, y);

            // Category Badge-like text
            const catWidth = doc.getTextWidth(`• ${rec.title}`);
            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text(`(${rec.category})`, margin + catWidth + 2, y);

            y += 6;
            doc.setFontSize(11);
            doc.setTextColor(0);
            doc.setFont(undefined, 'normal');

            if (rec.description) {
                const splitDesc = doc.splitTextToSize(`Details: ${rec.description}`, 160);
                doc.text(splitDesc, margin + 5, y);
                y += (splitDesc.length * 6);
            }

            doc.text(`  Frequency: ${rec.frequency || ''}`, margin + 5, y);
            y += 10;
        });
    }

    // --- Footer Disclaimer (on every page) ---
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(8);
        doc.setTextColor(150);
        const disclaimer = "Disclaimer: This is a user-owned personal record and does not replace the official legal medical record maintained by the provider.";
        doc.text(disclaimer, margin, pageHeight - 10);
        doc.text(`Page ${i} of ${pageCount}`, 180, pageHeight - 10);
    }

    return doc;
}

export function downloadPDF(doc: jsPDF, filename: string) {
    try {
        // Force octet-stream to ensure download behavior and prevent preview
        const blob = doc.output('blob');
        const pdfBlob = new Blob([blob], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(pdfBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none'; // Ensure it's not visible
        document.body.appendChild(link);

        link.click();

        // Longer timeout to ensure download starts before cleanup
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 2000);
    } catch (error) {
        console.error("Download failed:", error);
        doc.save(filename);
    }
}
