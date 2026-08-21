import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const pyRes = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/generate_appeal_pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!pyRes.ok) {
      throw new Error('Failed to generate First Appeal PDF');
    }

    const pdfBuffer = await pyRes.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="First_Appeal_${body.rti_registration_no || 'RTI'}.pdf"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error generating appeal document' },
      { status: 500 }
    );
  }
}
