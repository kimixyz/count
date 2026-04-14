"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import ConfigPanel from "@/components/ConfigPanel";
import PreviewPanel from "@/components/PreviewPanel";
import {
  GeneratorConfig,
  generateQuestions,
  getDefaultConfig,
} from "@/lib/questionGenerator";
import { PDFConfig, getDefaultPDFConfig, exportToPDF } from "@/lib/pdfExporter";
import { saveConfig, loadConfig } from "@/lib/storage";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [configCollapsed, setConfigCollapsed] = useState(false);

  // 生成器配置
  const [config, setConfig] = useState<GeneratorConfig>(() =>
    getDefaultConfig("1A"),
  );

  // PDF配置
  const [pdfConfig, setPdfConfig] = useState<PDFConfig>(getDefaultPDFConfig());

  // 客户端挂载后从 localStorage 恢复配置
  useEffect(() => {
    setMounted(true);
    const saved = loadConfig();
    if (saved) {
      setConfig(saved);
    }
  }, []);

  // 配置变化时持久化
  useEffect(() => {
    if (mounted) {
      saveConfig(config);
    }
  }, [config, mounted]);

  // 生成的题目
  const questions = useMemo(() => {
    if (!mounted || config.operations.length === 0) return [];
    return generateQuestions(config);
  }, [mounted, config]);

  const handleGenerate = useCallback(() => {
    setConfig((prev) => ({ ...prev }));
  }, []);

  const handleExport = () => {
    if (questions.length === 0) return;
    exportToPDF(questions, pdfConfig);
  };

  const handleResetConfig = () => {
    setConfig(getDefaultConfig("1A"));
  };

  // 键盘快捷键: Ctrl+R / Cmd+R 重新生成
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "r") {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleGenerate]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-emerald-50/30 to-slate-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* 移动端折叠按钮 */}
              <button
                onClick={() => setConfigCollapsed(!configCollapsed)}
                className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {configCollapsed ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  )}
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  口算生成器
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  人教版 2022 新课标 · 一至四年级
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetConfig}
                className="hidden sm:flex px-4 py-2 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all items-center gap-1.5"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                重置
              </button>
              <button
                onClick={handleGenerate}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                生成题目
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Config Panel — 移动端可折叠 */}
          <aside
            className={`lg:w-96 shrink-0 ${configCollapsed ? "hidden lg:block" : ""}`}
          >
            <div className="lg:sticky lg:top-24">
              <ConfigPanel config={config} onChange={setConfig} />

              {/* 统计 */}
              {questions.length > 0 && (
                <div className="mt-4 p-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100/60">
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      className="w-4 h-4 text-emerald-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">
                      生成统计
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between items-center">
                      <span>题目数</span>
                      <span className="font-semibold text-gray-900">
                        {questions.length}
                      </span>
                    </div>
                    {questions.length < config.questionCount && (
                      <p className="text-xs text-amber-600 mt-1.5 p-2 bg-amber-50 rounded-lg border border-amber-200/60">
                        根据当前范围与去重限制，仅生成 {questions.length} 题
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 快捷键提示 */}
              <div className="mt-3 hidden lg:flex items-center gap-1.5 px-1 text-xs text-gray-400">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono">
                  ⌘
                </kbd>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono">
                  R
                </kbd>
                <span className="ml-1">重新生成</span>
              </div>
            </div>
          </aside>

          {/* Right: Preview and Export */}
          <PreviewPanel
            questions={questions}
            pdfConfig={pdfConfig}
            onPDFConfigChange={setPdfConfig}
            onExport={handleExport}
            onRegenerate={handleGenerate}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-400">
            口算生成器 · 人教版 2022 新课标
          </p>
        </div>
      </footer>
    </div>
  );
}
