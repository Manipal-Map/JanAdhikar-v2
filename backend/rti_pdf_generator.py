import io
from typing import Dict, Any
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY


def generate_rti_pdf(applicant_details: Dict[str, Any], department_info: Dict[str, Any], rti_body_text: str) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        topMargin=25 * mm, bottomMargin=20 * mm, leftMargin=20 * mm, rightMargin=20 * mm
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('TitleC', parent=styles['Heading2'], alignment=TA_CENTER, spaceAfter=14, fontSize=13)
    normal = ParagraphStyle('NormalJ', parent=styles['Normal'], alignment=TA_JUSTIFY, fontSize=10.5, leading=15)

    story = []
    story.append(Paragraph(
        "APPLICATION FOR INFORMATION UNDER SECTION 6(1) OF<br/>THE RIGHT TO INFORMATION ACT, 2005",
        title_style
    ))

    to_block = (
        f"To,<br/>"
        f"{department_info.get('pio_designation', 'The Public Information Officer')}<br/>"
        f"{department_info.get('public_authority_name', '')}<br/>"
        f"{department_info.get('suggested_address_template', '')}"
    )
    story.append(Paragraph(to_block, normal))
    story.append(Spacer(1, 8 * mm))

    if department_info.get("address_confidence") == "LOW":
        note_style = ParagraphStyle('Note', parent=normal, textColor=colors.red, fontSize=9)
        story.append(Paragraph(
            "⚠ Address confidence is LOW — verify the exact PIO office and address before mailing/filing this application.",
            note_style
        ))
        story.append(Spacer(1, 6 * mm))

    story.append(Paragraph("<b>Subject:</b> Application seeking information under Section 6(1) of the Right to Information Act, 2005.", normal))
    story.append(Spacer(1, 6 * mm))

    story.append(Paragraph("Sir/Madam,", normal))
    story.append(Paragraph(
        f"I, {applicant_details.get('name', '[Applicant Name]')}, an Indian citizen, wish to seek the following "
        f"information under the Right to Information Act, 2005:", normal
    ))
    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph(rti_body_text.replace("\n", "<br/>"), normal))
    story.append(Spacer(1, 6 * mm))

    story.append(Paragraph(
        "I state that the above information is not exempted under Section 8 or Section 9 of the RTI Act, 2005, "
        "and I am entitled to receive it as a citizen of India under Section 3 of the Act. I request that the "
        "information be provided within the statutory period of 30 days under Section 7(1).", normal
    ))
    story.append(Spacer(1, 6 * mm))

    fee_table = Table([
        ["Application Fee", "₹10/- (as prescribed under RTI Rules, 2012)"],
        ["Mode of Payment", applicant_details.get('fee_mode', "IPO / Demand Draft / Court Fee Stamp / Online")],
        ["Category", applicant_details.get('category', 'General (Not BPL)')],
    ], colWidths=[50 * mm, 105 * mm])
    fee_table.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 0.5, colors.grey),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('FONTSIZE', (0, 0), (-1, -1), 9.5),
        ('BACKGROUND', (0, 0), (0, -1), colors.whitesmoke),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(fee_table)
    story.append(Spacer(1, 10 * mm))

    applicant_table = Table([
        ["Applicant Name", applicant_details.get('name', '')],
        ["Address", applicant_details.get('address', '')],
        ["Phone / Email", applicant_details.get('contact', '')],
        ["Place", applicant_details.get('place', '')],
        ["Date", applicant_details.get('date', '')],
    ], colWidths=[40 * mm, 115 * mm])
    applicant_table.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, -1), 0.4, colors.lightgrey),
        ('FONTSIZE', (0, 0), (-1, -1), 9.5),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(applicant_table)
    story.append(Spacer(1, 14 * mm))
    story.append(Paragraph("Signature of Applicant: ____________________", normal))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
