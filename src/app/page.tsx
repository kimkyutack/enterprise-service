"use client";

import { useState, useEffect } from "react";
import DocumentUpload from "@/components/DocumentUpload";
import ChatInterface from "@/components/ChatInterface";
import { useRAGStore } from "@/lib/store";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"upload" | "chat">("upload");

  // Zustand 스토어에서 문서 수 가져오기
  const documentCount = useRAGStore((state) => state.documents.length);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                🚀 RAG 엔터프라이즈 서비스
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
        {activeTab === "upload" ? <DocumentUpload /> : <ChatInterface />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p className="mt-1">
              Next.js + TypeScript + Tailwind CSS + @xenova/transformers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
