"use client";

import { useState } from "react";
import { Question } from "@/lib/questionGenerator";
import { PDFConfig } from "@/lib/pdfExporter";
import QuestionCard from "./QuestionCard";

interface PreviewPanelProps {
  questions: Question[];
  pdfConfig: PDFConfig;
  onPDFConfigChange: (config: PDFConfig) => void;
  onExport: () => void;
  onRegenerate: () => void;
}

export default function PreviewPanel({
  questions,
  pdfConfig,
  onPDFConfigChange,
  onExport,
  onRegenerate,
}: PreviewPanelProps) {
  const [showAnswers, setShowAnswers] = useState(false);

  const updatePDFConfig = (updates: Partial<PDFConfig>) => {
    if (updates.showAnswers !== undefined) {
      setShowAnswers(updates.showAnswers);
    }
    onPDFConfigChange({ ...pdfConfig, ...updates });
  };

  return (
    <div className="flex-1 space-y-4">
      {/* 排版和导出控制 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">排版与导出</h3>

        {/* 标题 */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            标题
          </label>
          <input
            type="text"
            value={pdfConfig.title}
            onChange={(e) => updatePDFConfig({ title: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-gray-50"
            placeholder="口算练习"
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              列数
            </label>
            <select
              value={pdfConfig.columns}
              onChange={(e) =>
                updatePDFConfig({ columns: parseInt(e.target.value) })
              }
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-gray-50"
            >
              {[2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}列
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              字体
            </label>
            <select
              value={pdfConfig.fontSize}
              onChange={(e) =>
                updatePDFConfig({ fontSize: parseInt(e.target.value) })
              }
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-gray-50"
            >
              {[10, 11, 12, 13, 14, 15, 16].map((n) => (
                <option key={n} value={n}>
                  {n}pt
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              纸张
            </label>
            <select
              value={pdfConfig.pageSize}
              onChange={(e) =>
                updatePDFConfig({
                  pageSize: e.target.value as "a4" | "a5" | "letter",
                })
              }
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-gray-50"
            >
              <option value="a4">A4</option>
              <option value="a5">A5</option>
              <option value="letter">Letter</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              方向
            </label>
            <select
              value={pdfConfig.orientation}
              onChange={(e) =>
                updatePDFConfig({
                  orientation: e.target.value as "portrait" | "landscape",
                })
              }
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-gray-50"
            >
              <option value="portrait">竖向</option>
              <option value="landscape">横向</option>
            </select>
          </div>
        </div>

        {/* 答案设置 */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={pdfConfig.separateAnswerPage}
              onChange={(e) =>
                updatePDFConfig({ separateAnswerPage: e.target.checked })
              }
              className="w-3.5 h-3.5 rounded border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-0 cursor-pointer accent-emerald-500"
            />
            <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors">
              导出时附加答案页
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={pdfConfig.showBorder}
              onChange={(e) =>
                updatePDFConfig({ showBorder: e.target.checked })
              }
              className="w-3.5 h-3.5 rounded border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-0 cursor-pointer accent-emerald-500"
            />
            <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors">
              显示题目边框
            </span>
          </label>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onRegenerate}
            className="flex-1 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-medium transition-all border border-gray-200/80 flex items-center justify-center gap-1.5 active:scale-95"
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
            <span>重新生成</span>
          </button>
          <button
            onClick={onExport}
            disabled={questions.length === 0}
            className="flex-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>导出 PDF</span>
          </button>
        </div>
      </div>

      {/* 预览区 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">预览</h3>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500">
              共{" "}
              <span className="font-semibold text-gray-900">
                {questions.length}
              </span>{" "}
              题
            </span>
            <span className="text-gray-200">|</span>
            <span className="text-gray-500">
              <span className="font-semibold text-gray-900">
                {pdfConfig.columns}
              </span>{" "}
              列
            </span>
            <span className="text-gray-200">|</span>
            <button
              onClick={() => {
                const newShowAnswers = !showAnswers;
                setShowAnswers(newShowAnswers);
                updatePDFConfig({ showAnswers: newShowAnswers });
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                showAnswers
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {showAnswers ? "隐藏答案" : "显示答案"}
            </button>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-24 text-gray-300">
            <div className="text-5xl mb-4">
              <svg
                className="w-16 h-16 mx-auto text-gray-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-base text-gray-400">请配置并生成题目</p>
          </div>
        ) : (
          <div
            className="grid gap-2.5 p-4 bg-linear-to-br from-slate-50 to-gray-50 rounded-xl border border-gray-100 max-h-[800px] overflow-y-auto"
            style={{
              gridTemplateColumns: `repeat(${pdfConfig.columns}, minmax(0, 1fr))`,
              fontSize: `${pdfConfig.fontSize + 2}px`,
            }}
          >
            {questions.map((q) => (
              <QuestionCard key={q.id} question={q} showAnswer={showAnswers} />
            ))}
          </div>
        )}
      </div>

      {/* 答案区域 */}
      {showAnswers && questions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            参考答案
          </h3>
          <div className="grid grid-cols-10 gap-x-4 gap-y-2 text-sm">
            {questions.map((q) => (
              <div key={q.id} className="flex gap-1 items-center">
                <span className="text-gray-400 text-xs">{q.id}.</span>
                <span className="font-semibold text-gray-800">
                  {q.questionType === "comparison"
                    ? q.answer === -1
                      ? "<"
                      : q.answer === 0
                        ? "="
                        : ">"
                    : q.questionType === "fill_blank"
                      ? `${q.answer}`
                      : `${q.answer}${q.remainder !== undefined && q.remainder > 0 ? `...${q.remainder}` : ""}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
