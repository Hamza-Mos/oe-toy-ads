import { NextResponse } from "next/server";
import { classifyQuestion } from "@/lib/ads/classifier";
import { creatives } from "@/lib/ads/config";

export async function POST(request: Request) {
  try {
    const { question } = await request.json();
    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Invalid question" }, { status: 400 });
    }
    const result = await classifyQuestion(question);
    const creative = result.creativeId
      ? creatives[result.creativeId]
      : undefined;
    if (result.blocked) {
      return NextResponse.json({ ...result, creative: undefined });
    }
    return NextResponse.json({ ...result, creative: creative || undefined });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
