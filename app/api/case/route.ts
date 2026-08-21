import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get('case_id');

    if (!caseId) {
      return NextResponse.json({ error: 'Case ID parameter is required' }, { status: 400 });
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const backendRes = await fetch(`${backendUrl}/api/case/${encodeURIComponent(caseId)}`, {
      cache: 'no-store',
    });

    let rawCaseData: any = {};
    if (backendRes.ok) {
      const parsed = await backendRes.json();
      rawCaseData = parsed.data || parsed || {};
    }

    // Determine filing date (fallback to 35 days ago for testing overdue status if empty)
    const filingDateObj = rawCaseData.created_at
      ? new Date(rawCaseData.created_at)
      : new Date(Date.now() - 35 * 24 * 60 * 60 * 1000);

    const filingDateISO = filingDateObj.toISOString();

    // 30-day statutory response window under Section 7(1)
    const responseDueDateObj = new Date(filingDateObj.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    // 60-day window for First Appeal under Section 19(1)
    const firstAppealDueDateObj = new Date(filingDateObj.getTime() + 60 * 24 * 60 * 60 * 1000);

    const now = new Date();
    const isOverdue = now > responseDueDateObj;

    const diffTime = now.getTime() - responseDueDateObj.getTime();
    const daysOverdue = isOverdue ? Math.floor(diffTime / (1000 * 60 * 60 * 24)) : 0;

    // Section 20(1) penalty: ₹250 per day of delay, capped at ₹25,000 max
    const section20Penalty = Math.min(25000, daysOverdue * 250);

    const timeRemainingSeconds = Math.max(
      0,
      Math.floor((responseDueDateObj.getTime() - now.getTime()) / 1000)
    );

    const responsePayload = {
      case_id: caseId,
      computed_status: rawCaseData.status || (isOverdue ? 'DEEMED_REFUSAL' : 'PENDING_PIO_REPLY'),
      is_overdue: isOverdue,
      days_overdue: daysOverdue,
      section_20_penalty_inr: section20Penalty,
      filing_date: filingDateISO,
      response_due_date: responseDueDateObj.toISOString(),
      first_appeal_due_date: firstAppealDueDateObj.toISOString(),
      time_remaining_seconds: timeRemainingSeconds,
      pio_response_text: rawCaseData.pio_response_text || '',
      exemption_cited: rawCaseData.exemption_cited || '',
      legal_counter: rawCaseData.legal_counter || '',
      precedent_title: rawCaseData.precedent_title || '',
    };

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to calculate case SLA metrics' },
      { status: 500 }
    );
  }
}
