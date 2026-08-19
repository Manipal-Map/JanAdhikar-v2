import io
from typing import Dict, Any
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY

def generate_rti_pdf(applicant_details: Dict[str, Any], department_info: Dict[str, Any], rti_body_text: str) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=20*mm, bottomMargin=20*mm, leftMargin=20*mm, rightMargin=20*mm)
    styles = getSampleStyleSheet()
    title = ParagraphStyle('Title', parent=styles['Heading3'], alignment=TA_CENTER, spaceAfter=15)
    normal = ParagraphStyle('Normal', parent=styles['Normal'], alignment=TA_JUSTIFY, leading=16, fontSize=11)
    bold = ParagraphStyle('Bold', parent=normal, fontName='Helvetica-Bold')

    story = []
    
    # Header
    story.append(Paragraph("<b>FORM A</b>", title))
    story.append(Paragraph("<b>Application under Section 6(1) of the Right to Information Act, 2005</b>", title))
    story.append(Spacer(1, 10*mm))

    # PIO Address
    story.append(Paragraph("To,", normal))
    story.append(Paragraph(f"<b>{department_info.get('pio_designation', 'The Public Information Officer')}</b>", normal))
    story.append(Paragraph(f"{department_info.get('public_authority_name', '')}", normal))
    story.append(Paragraph(f"{department_info.get('suggested_address_template', '')}", normal))
    story.append(Spacer(1, 8*mm))

    # Body Fields
    fields = [
        ("1. Full name of the applicant", applicant_details.get('name', '')),
        ("2. Permanent address", applicant_details.get('address', '')),
        ("3. Phone / Email", applicant_details.get('contact', '')),
        ("4. Particulars of information solicited", ""),
    ]

    for label, val in fields:
        story.append(Paragraph(f"<b>{label}:</b> {val}", normal))
        story.append(Spacer(1, 4*mm))

    # RTI Content
    story.append(Paragraph(rti_body_text.replace("\n", "<br/>"), normal))
    story.append(Spacer(1, 8*mm))

    # Statutory Declarations
    story.append(Paragraph("<b>5. Mode of delivery:</b> Speed Post / Registered Post", normal))
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph("<b>6. Fee details:</b> ₹10 paid via IPO/DD/Online", normal))
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph("I declare that I am a citizen of India. The requested information does not fall under exemptions of Section 8 or 9 of the RTI Act.", normal))
    story.append(Spacer(1, 15*mm))

    # Signoff
    story.append(Paragraph(f"<b>Place:</b> {applicant_details.get('place', '')}", normal))
    story.append(Paragraph("<b>Date:</b> ______________", normal))
    story.append(Paragraph("<b>Signature:</b> ________________________", ParagraphStyle('Sign', parent=normal, alignment=2)))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
