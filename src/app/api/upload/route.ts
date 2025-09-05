import { NextRequest, NextResponse } from "next/server";
import { DocumentProcessor } from "@/lib/document-processor";
import { addDocument, getDocumentCount } from "@/lib/rag-engine";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "파일이 필요합니다." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name;
    const fileType = file.type;

    let processedDoc;

    // 파일 타입에 따른 처리
    if (fileType === "application/pdf") {
      processedDoc = await DocumentProcessor.processPDF(buffer, filename);
    } else if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      processedDoc = await DocumentProcessor.processWord(buffer, filename);
    } else if (fileType === "text/plain") {
      const text = buffer.toString("utf-8");
      processedDoc = await DocumentProcessor.processText(text, filename);
    } else {
      return NextResponse.json(
        { error: "지원하지 않는 파일 형식입니다. (PDF, DOCX, TXT만 지원)" },
        { status: 400 }
      );
    }

    // RAG 엔진에 문서 추가
    await addDocument(processedDoc.content, processedDoc.metadata);

    return NextResponse.json({
      message: "문서가 성공적으로 업로드되었습니다.",
      filename: processedDoc.metadata.filename,
      type: processedDoc.metadata.type,
      size: processedDoc.metadata.size,
      documentCount: getDocumentCount(),
    });
  } catch (error) {
    console.error("문서 업로드 오류:", error);
    return NextResponse.json(
      { error: "문서 업로드에 실패했습니다." },
      { status: 500 }
    );
  }
}
