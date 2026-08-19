import io
import re
from typing import Dict, Any
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY

def sanitize_for_pdf(text: str) -> str:
    """Cleans LLM text of Markdown and unsupported Unicode that causes black boxes in ReportLab."""
    if not text:
        return ""
    
    # 1. Replace common Unicode characters and symbols with standard ASCII equivalents
    replacements = {
        '“': '"', '”': '"', 
        '‘': "'", '’': "'",
        '–': '-', '—': '-', 
        '•': '-', '…': '...',
        '₹': 'Rs. ',
        '\u200b': '', '\xa0': ' ', '\r': ''
    }
    for k, v in replacements.items():
        text = text.replace(k, v)
        
    # 2. Strip Markdown formatting (e.g., **bold**, *italic*, ### headers)
    # This ensures the document looks like a formal typed letter, not code.
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
    text = re.sub(r'\*(.*?)\*', r'\1', text)
    text = re.sub(r'#{1,6}\s?', '', text)
    
    # 3. Ultimate Fallback: Force Latin-1 encoding. 
    # Any remaining weird invisible characters that would cause a black box are safely deleted.
    text = text.encode('latin-1', 'ignore').decode('latin-1')
    
    return text

def generate_rti_pdf(applicant_details: Dict[str, Any], department_info: Dict[str, Any], rti_body_text: str) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4, 
        topMargin=20*mm, bottomMargin=20*mm, 
        leftMargin=20*mm, rightMargin=20*mm
    )
    styles = getSampleStyleSheet()
    title = ParagraphStyle('Title', parent=styles['Heading3'], alignment=TA_CENTER, spaceAfter=15)
    normal = ParagraphStyle('Normal', parent=styles['Normal'], alignment=TA_JUSTIFY, leading=16, fontSize=11)

    story = []
    
    # Header
    story.append(Paragraph("<b>FORM A</b>", title))
    story.append(Paragraph("<b>Application under Section 6(1) of the Right to Information Act, 2005</b>", title))
    story.append(Spacer(1, 10*mm))

    # PIO Address (Sanitized)
    story.append(Paragraph("To,", normal))
    pio_desig = sanitize_for_pdf(department_info.get('pio_designation', 'The Public Information Officer'))
    pub_auth = sanitize_for_pdf(department_info.get('public_authority_name', ''))
    address = sanitize_for_pdf(department_info.get('suggested_address_template', ''))
    
    story.append(Paragraph(f"<b>{pio_desig}</b>", normal))
    story.append(Paragraph(pub_auth, normal))
    story.append(Paragraph(address, normal))
    story.append(Spacer(1, 8*mm))

    # Body Fields
    fields = [
        ("1. Full name of the applicant", applicant_details.get('name', '')),
        ("2. Permanent address", applicant_details.get('address', '')),
        ("3. Phone / Email", applicant_details.get('contact', '')),
        ("4. Particulars of information solicited", ""),
    ]

    for label, val in fields:
        val_clean = sanitize_for_pdf(val)
        story.append(Paragraph(f"<b>{label}:</b> {val_clean}", normal))
        story.append(Spacer(1, 4*mm))

    # RTI Content (Sanitized and formatted)
    clean_rti_body = sanitize_for_pdf(rti_body_text)
    # Convert standard line breaks to ReportLab <br/> tags
    clean_rti_body = clean_rti_body.replace("\n", "<br/>")
    
    story.append(Paragraph(clean_rti_body, normal))
    story.append(Spacer(1, 8*mm))

    # Statutory Declarations
    story.append(Paragraph("<b>5. Mode of delivery:</b> Speed Post / Registered Post", normal))
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph("<b>6. Fee details:</b> Rs. 10 paid via IPO/DD/Online", normal))
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph("I declare that I am a citizen of India. The requested information does not fall under exemptions of Section 8 or 9 of the RTI Act.", normal))
    story.append(Spacer(1, 15*mm))

    # Signoff
    place_clean = sanitize_for_pdf(applicant_details.get('place', ''))
    story.append(Paragraph(f"<b>Place:</b> {place_clean}", normal))
    story.append(Paragraph("<b>Date:</b> ______________", normal))
    story.append(Paragraph("<b>Signature:</b> ________________________", ParagraphStyle('Sign', parent=normal, alignment=2)))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
