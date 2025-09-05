import { create } from "zustand";
import { persist } from "zustand/middleware";

// 문서 타입 정의
export interface Document {
  id: string;
  content: string;
  embedding: number[];
  similarity?: number;
  metadata: {
    filename: string;
    type: string;
    uploadedAt: string;
  };
}

// 검색 결과 타입 정의
export interface SearchResult {
  content: string;
  metadata: {
    filename: string;
    type: string;
    similarity: number;
  };
}

// RAG 상태 타입 정의
interface RAGState {
  // 상태
  documents: Document[];
  isLoading: boolean;
  error: string | null;

  // 액션
  addDocument: (
    content: string,
    embedding: number[],
    metadata: {
      filename: string;
      type: string;
      uploadedAt: Date;
    }
  ) => void;

  searchSimilar: (queryEmbedding: number[], topK?: number) => Document[];

  clearDocuments: () => void;

  setLoading: (loading: boolean) => void;

  setError: (error: string | null) => void;

  getDocumentCount: () => number;
}

// 코사인 유사도 계산 함수
const cosineSimilarity = (a: number[], b: number[]): number => {
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
};

// Zustand 스토어 생성
export const useRAGStore = create<RAGState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      documents: [],
      isLoading: false,
      error: null,

      // 문서 추가
      addDocument: (content: string, embedding: number[], metadata) => {
        const id = `${metadata.filename}_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        const newDocument: Document = {
          id,
          content,
          embedding,
          metadata: {
            ...metadata,
            uploadedAt: metadata.uploadedAt.toISOString(),
          },
        };

        set((state) => ({
          documents: [...state.documents, newDocument],
          error: null,
        }));

        console.log(
          `문서 저장 완료: ${metadata.filename}, 총 ${
            get().documents.length
          }개 문서`
        );
      },

      // 유사한 문서 검색
      searchSimilar: (queryEmbedding: number[], topK = 5) => {
        const { documents } = get();

        if (documents.length === 0) {
          console.log("검색할 문서가 없습니다.");
          return [];
        }

        // 코사인 유사도 계산
        const scoredDocuments = documents.map((doc) => {
          const similarity = cosineSimilarity(queryEmbedding, doc.embedding);
          return { ...doc, similarity };
        });

        const results = scoredDocuments
          .filter((doc) => doc.similarity > 0)
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, topK);

        console.log(`검색 결과: ${results.length}개 문서 발견`);
        return results;
      },

      // 모든 문서 삭제
      clearDocuments: () => {
        set({ documents: [], error: null });
        console.log("모든 문서가 삭제되었습니다.");
      },

      // 로딩 상태 설정
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // 에러 상태 설정
      setError: (error: string | null) => {
        set({ error });
      },

      // 문서 수 반환
      getDocumentCount: () => {
        return get().documents.length;
      },
    }),
    {
      name: "rag-store", // localStorage 키
      partialize: (state) => ({
        documents: state.documents,
      }), // documents만 영구 저장
    }
  )
);

// 편의 함수들
export const ragStore = {
  addDocument: (
    content: string,
    embedding: number[],
    metadata: {
      filename: string;
      type: string;
      uploadedAt: Date;
    }
  ) => useRAGStore.getState().addDocument(content, embedding, metadata),

  searchSimilar: (queryEmbedding: number[], topK?: number) =>
    useRAGStore.getState().searchSimilar(queryEmbedding, topK),

  clearDocuments: () => useRAGStore.getState().clearDocuments(),

  getDocumentCount: () => useRAGStore.getState().getDocumentCount(),

  getDocuments: () => useRAGStore.getState().documents,
};
