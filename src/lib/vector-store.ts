// 간단한 메모리 기반 벡터 저장소
interface VectorDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    filename: string;
    type: string;
    uploadedAt: string;
  };
}

class VectorStore {
  private documents: VectorDocument[] = [];

  addDocument(
    content: string,
    embedding: number[],
    metadata: { filename: string; type: string; uploadedAt: Date }
  ): void {
    const id = `${metadata.filename}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    this.documents.push({
      id,
      content,
      embedding,
      metadata: {
        ...metadata,
        uploadedAt: metadata.uploadedAt.toISOString(),
      },
    });

    console.log(
      `문서 저장 완료: ${metadata.filename}, 총 ${this.documents.length}개 문서`
    );
  }

  searchSimilar(queryEmbedding: number[], topK: number = 5): VectorDocument[] {
    if (this.documents.length === 0) {
      return [];
    }

    // 코사인 유사도 계산
    const scoredDocuments = this.documents.map((doc) => {
      const similarity = this.cosineSimilarity(queryEmbedding, doc.embedding);
      return { ...doc, similarity };
    });

    return scoredDocuments
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  getAllDocuments(): VectorDocument[] {
    return this.documents;
  }

  clearDocuments(): void {
    this.documents = [];
  }

  getDocumentCount(): number {
    return this.documents.length;
  }
}

// 싱글톤 인스턴스
export const vectorStore = new VectorStore();
