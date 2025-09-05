import { getEmbedding } from "./embeddings";
import { vectorStore } from "./vector-store";

export interface SearchResult {
  content: string;
  metadata: {
    filename: string;
    type: string;
    similarity: number;
  };
}

export interface RAGResponse {
  answer: string;
  sources: SearchResult[];
  query: string;
}

export class RAGEngine {
  static async generateAnswer(query: string): Promise<RAGResponse> {
    try {
      // 1. 쿼리 임베딩 생성
      const queryEmbedding = await getEmbedding(query);

      // 2. 유사한 문서 검색
      const similarDocs = vectorStore.searchSimilar(queryEmbedding, 5);

      if (similarDocs.length === 0) {
        return {
          answer: "관련 문서를 찾을 수 없습니다. 먼저 문서를 업로드해주세요.",
          sources: [],
          query,
        };
      }

      // 3. 컨텍스트 구성
      const context = similarDocs
        .map((doc) => `문서: ${doc.metadata.filename}\n내용: ${doc.content}`)
        .join("\n\n");

      // 4. 간단한 답변 생성 (무료 버전)
      const answer = this.generateSimpleAnswer(query, similarDocs);

      return {
        answer,
        sources: similarDocs.map((doc) => ({
          content: doc.content,
          metadata: {
            filename: doc.metadata.filename,
            type: doc.metadata.type,
            similarity: doc.similarity,
          },
        })),
        query,
      };
    } catch (error) {
      console.error("RAG 답변 생성 중 오류:", error);
      return {
        answer: "답변 생성 중 오류가 발생했습니다.",
        sources: [],
        query,
      };
    }
  }

  private static generateSimpleAnswer(query: string, sources: any[]): string {
    // 간단한 규칙 기반 답변 생성
    const queryLower = query.toLowerCase();

    // 인사말 처리
    if (
      queryLower.includes("안녕") ||
      queryLower.includes("hello") ||
      queryLower.includes("hi")
    ) {
      return `안녕하세요! 업로드된 문서에서 관련 내용을 찾았습니다.\n\n${
        sources[0]?.content || ""
      }`;
    }

    // 질문 처리
    if (
      queryLower.includes("?") ||
      queryLower.includes("무엇") ||
      queryLower.includes("어떤")
    ) {
      return `질문에 대한 답변을 찾았습니다:\n\n${sources[0]?.content || ""}`;
    }

    // 기본 답변
    return `"${query}"에 대한 관련 문서를 찾았습니다:\n\n${
      sources[0]?.content || ""
    }`;
  }

  static async addDocument(
    content: string,
    metadata: { filename: string; type: string; uploadedAt: Date }
  ): Promise<void> {
    try {
      // 문서를 청크로 분할
      const chunks = content
        .split("\n\n")
        .filter((chunk) => chunk.trim().length > 0);

      // 각 청크를 벡터화하여 저장
      for (const chunk of chunks) {
        const embedding = await getEmbedding(chunk);
        vectorStore.addDocument(chunk, embedding, metadata);
      }

      console.log(
        `문서 처리 완료: ${metadata.filename}, ${chunks.length}개 청크`
      );
    } catch (error) {
      console.error("문서 저장 중 오류:", error);
      throw new Error("문서 저장에 실패했습니다.");
    }
  }

  static getDocumentCount(): number {
    return vectorStore.getDocumentCount();
  }

  static clearDocuments(): void {
    vectorStore.clearDocuments();
  }
}
