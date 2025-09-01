import { NextResponse } from "next/server";
import { getInterest } from "../../../../lib/mockData";

export async function GET(_req, { params }) {
  const data = getInterest(params.slug);
  return NextResponse.json({ interest: data });
}
