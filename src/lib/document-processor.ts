import mammoth from "mammoth";

export interface ProcessedDocument {
  content: string;
  metadata: {
    filename: string;
    type: string;
    size: number;
    uploadedAt: Date;
  };
}

export class DocumentProcessor {
  static async processPDF(
    buffer: Buffer,
    filename: string
  ): Promise<ProcessedDocument> {
    // PDF 처리를 위한 간단한 구현
    // 실제로는 @xenova/transformers의 PDF 처리 기능을 사용할 수 있음
    return {
      content: `PDF 파일: ${filename}\n\nPDF 파일이 업로드되었습니다. PDF 텍스트 추출을 위해서는 추가 설정이 필요합니다.`,
      metadata: {
        filename,
        type: "pdf",
        size: buffer.length,
        uploadedAt: new Date(),
      },
    };
  }

  static async processWord(
    buffer: Buffer,
    filename: string
  ): Promise<ProcessedDocument> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return {
        content: result.value,
        metadata: {
          filename,
          type: "docx",
          size: buffer.length,
          uploadedAt: new Date(),
        },
      };
    } catch (error) {
      throw new Error(`Word 문서 처리 중 오류 발생: ${error}`);
    }
  }

  static async processText(
    text: string,
    filename: string
  ): Promise<ProcessedDocument> {
    return {
      content: text,
      metadata: {
        filename,
        type: "txt",
        size: Buffer.byteLength(text, "utf8"),
        uploadedAt: new Date(),
      },
    };
  }

  static chunkText(
    text: string,
    chunkSize: number = 500,
    overlap: number = 100
  ): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      let chunk = text.slice(start, end);

      // 문장 경계에서 자르기 시도
      if (end < text.length) {
        const lastSentenceEnd = chunk.lastIndexOf(".");
        const lastNewline = chunk.lastIndexOf("\n");
        const lastSpace = chunk.lastIndexOf(" ");

        const cutPoint = Math.max(lastSentenceEnd, lastNewline, lastSpace);
        if (cutPoint > start + chunkSize * 0.5) {
          chunk = text.slice(start, start + cutPoint + 1);
        }
      }

      chunks.push(chunk.trim());
      start += chunk.length - overlap;
    }

    return chunks.filter((chunk) => chunk.length > 0);
  }
}
