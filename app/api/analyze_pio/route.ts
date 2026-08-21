import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { case_id, pio_text } = await req.json();

    if (!case_id) {
      return NextResponse.json({ error: 'Case ID is required' }, { status: 400 });
    }

    // Call Python FastAPI or internal engine service
    const pyRes = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/analyze_pio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id, pio_text }),
    });

    if (!pyRes.ok) {
      throw new Error('Failed to process PIO response in backend');
    }

    const data = await pyRes.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
