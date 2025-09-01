import { NextResponse } from 'next/server';
import { getServiceRoleClient } from '../../../lib/supabase/server.js';

export async function GET() {
  try {
    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from('articles')
      .select('provider')
      .not('provider', 'is', null)
      .limit(10000);
    if (error) throw error;
    const set = new Set((data || []).map((r) => (r.provider || '').trim()).filter(Boolean));
    const sources = Array.from(set).sort((a, b) => a.localeCompare(b));
    return NextResponse.json({ sources });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to list sources' }, { status: 500 });
  }
}
