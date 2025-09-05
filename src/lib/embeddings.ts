import { pipeline } from "@xenova/transformers";

let embeddingPipeline: any = null;

export const getEmbedding = async (text: string): Promise<number[]> => {
  try {
    if (!embeddingPipeline) {
      console.log("임베딩 모델 로딩 중...");
      embeddingPipeline = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2"
      );
    }

    const result = await embeddingPipeline(text, {
      pooling: "mean",
      normalize: true,
    });
    return Array.from(result.data);
  } catch (error) {
    console.warn("임베딩 모델 로딩 실패, 간단한 해시 기반 임베딩 사용:", error);
    return simpleHashEmbedding(text);
  }
};

// 간단한 해시 기반 임베딩 (fallback)
function simpleHashEmbedding(text: string): number[] {
  const hash = text.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  const embedding = new Array(384).fill(0); // all-MiniLM-L6-v2 차원
  for (let i = 0; i < 384; i++) {
    embedding[i] = Math.sin(hash + i) * 0.1;
  }

  return embedding;
}
