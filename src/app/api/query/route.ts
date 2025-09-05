import { NextRequest, NextResponse } from "next/server";
import { RAGEngine } from "@/lib/rag-engine";

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "질문이 필요합니다." },
        { status: 400 }
      );
    }

    if (query.trim().length === 0) {
      return NextResponse.json(
        { error: "질문을 입력해주세요." },
        { status: 400 }
      );
    }

    // RAG 엔진을 사용하여 답변 생성
    const response = await RAGEngine.generateAnswer(query);

    return NextResponse.json(response);
  } catch (error) {
    console.error("질의응답 오류:", error);
    return NextResponse.json(
      { error: "질의응답 처리에 실패했습니다." },
      { status: 500 }
    );
  }
}
