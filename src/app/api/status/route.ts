import { NextResponse } from "next/server";
import { RAGEngine } from "@/lib/rag-engine";

export async function GET() {
  try {
    const documentCount = RAGEngine.getDocumentCount();

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      documentCount,
      message:
        documentCount > 0
          ? `${documentCount}개의 문서가 업로드되어 있습니다.`
          : "업로드된 문서가 없습니다.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 }
    );
  }
}
