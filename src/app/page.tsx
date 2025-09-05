"use client";

import { useState, useEffect } from "react";
import DocumentUpload from "@/components/DocumentUpload";
import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"upload" | "chat">("upload");
  const [documentCount, setDocumentCount] = useState(0);

  useEffect(() => {
    checkDocumentCount();
  }, []);

  const checkDocumentCount = async () => {
    try {
      const response = await fetch("/api/status");
      const data = await response.json();
      setDocumentCount(data.documentCount || 0);
    } catch (error) {
      console.error("문서 수 확인 실패:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                🚀 무료 RAG 엔터프라이즈 서비스
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                업로드된 문서:{" "}
                <span className="font-semibold text-blue-600">
                  {documentCount}개
                </span>
              </div>
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === "upload"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  📄 문서 업로드
                </button>
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === "chat"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  💬 질의응답
                </button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Features */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            ✨ 무료 RAG 서비스 특징
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div className="flex items-center">
              <span className="mr-2">🆓</span>
              <span>완전 무료 - API 키 불필요</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">⚡</span>
              <span>로컬 AI 모델 사용</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">📚</span>
              <span>PDF, DOCX, TXT 지원</span>
            </div>
          </div>
        </div>

        {activeTab === "upload" ? <DocumentUpload /> : <ChatInterface />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>무료 RAG 엔터프라이즈 서비스 - 테스트용</p>
            <p className="mt-1">
              Next.js + TypeScript + Tailwind CSS + @xenova/transformers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
