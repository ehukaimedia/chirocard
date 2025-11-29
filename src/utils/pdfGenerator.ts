import { jsPDF } from "jspdf";

interface SessionData {
    date: string;
    practitionerName: string;
    notes: string;
    bodyLog: Record<string, string>;
    signatureImage: string; // Base64
}

export function generateSessionPDF(data: SessionData) {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(23, 125, 79); // Emerald
    doc.text("ChiroCard Session Record", margin, y);

    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("User-Owned Personal Health Record", margin, y);

    y += 20;

    // Meta Data
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Date: ${data.date}`, margin, y);
    y += 8;
    doc.text(`Practitioner: ${data.practitionerName || "Guest Practitioner"}`, margin, y);

    y += 15;
    doc.setLineWidth(0.5);
    doc.line(margin, y, 190, y);
    y += 10;

    // Body Log
    doc.setFontSize(14);
    doc.text("Bodywork Log", margin, y);
    y += 10;
    doc.setFontSize(11);

    Object.entries(data.bodyLog).forEach(([part, status]) => {
        if (status !== "normal") {
            const statusText = status.charAt(0).toUpperCase() + status.slice(1);
            doc.text(`• ${part.replace("-", " ")}: ${statusText}`, margin + 5, y);
            y += 7;
        }
    });

    if (Object.keys(data.bodyLog).length === 0 || Object.values(data.bodyLog).every(s => s === "normal")) {
        doc.text("• No specific issues logged.", margin + 5, y);
        y += 7;
    }

    y += 10;

    // Notes
    doc.setFontSize(14);
    doc.text("Practitioner Notes", margin, y);
    y += 10;
    doc.setFontSize(11);
    const splitNotes = doc.splitTextToSize(data.notes || "No notes added.", 170);
    doc.text(splitNotes, margin, y);
    y += (splitNotes.length * 7) + 10;

    // Signature
    if (data.signatureImage) {
        doc.text("Signed:", margin, y);
        y += 5;
        doc.addImage(data.signatureImage, "PNG", margin, y, 50, 25);
        y += 30;
    }

    // Footer Disclaimer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
        "Disclaimer: This is a user-owned personal record and does not replace the official legal medical record maintained by the provider.",
        margin,
        pageHeight - 10
    );

    return doc;
}
