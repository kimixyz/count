'use client';

import { useState } from 'react';
import { Question } from '@/lib/questionGenerator';
import { PDFConfig } from '@/lib/pdfExporter';

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
  onRegenerate 
}: PreviewPanelProps) {
  const [showAnswers, setShowAnswers] = useState(false);
  
  const updatePDFConfig = (updates: Partial<PDFConfig>) => {
    // 同步 showAnswers 状态到 pdfConfig
    if (updates.showAnswers !== undefined) {
      setShowAnswers(updates.showAnswers);
    }
    onPDFConfigChange({ ...pdfConfig, ...updates });
  };

  return (
    <div className="flex-1 space-y-4">
      {/* 排版和导出控制 - 紧凑布局 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">排版与导出</h3>
        
        {/* 标题 */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            标题
          </label>
          <input
            type="text"
            value={pdfConfig.title}
            onChange={(e) => updatePDFConfig({ title: e.target.value })}
            className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50"
            placeholder="口算练习"
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {/* 列数 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              列数
            </label>
            <select
              value={pdfConfig.columns}
              onChange={(e) => updatePDFConfig({ columns: parseInt(e.target.value) })}
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50"
            >
              {[2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n}列</option>
              ))}
            </select>
          </div>

          {/* 字体大小 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              字体大小
            </label>
            <select
              value={pdfConfig.fontSize}
              onChange={(e) => updatePDFConfig({ fontSize: parseInt(e.target.value) })}
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50"
            >
              {[10, 11, 12, 13, 14, 15, 16].map(n => (
                <option key={n} value={n}>{n}pt</option>
              ))}
            </select>
          </div>

          {/* 纸张大小 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              纸张大小
            </label>
            <select
              value={pdfConfig.pageSize}
              onChange={(e) => updatePDFConfig({ pageSize: e.target.value as 'a4' | 'a5' | 'letter' })}
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50"
            >
              <option value="a4">A4</option>
              <option value="a5">A5</option>
              <option value="letter">Letter</option>
            </select>
          </div>

          {/* 方向 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              方向
            </label>
            <select
              value={pdfConfig.orientation}
              onChange={(e) => updatePDFConfig({ orientation: e.target.value as 'portrait' | 'landscape' })}
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50"
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
              onChange={(e) => updatePDFConfig({ separateAnswerPage: e.target.checked })}
              className="w-3.5 h-3.5 text-blue-500 rounded border-gray-300 focus:ring-2 focus:ring-blue-400 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors">导出时附加答案页</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={pdfConfig.showBorder}
              onChange={(e) => updatePDFConfig({ showBorder: e.target.checked })}
              className="w-3.5 h-3.5 text-blue-500 rounded border-gray-300 focus:ring-2 focus:ring-blue-400 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors">显示题目边框</span>
          </label>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onRegenerate}
            className="flex-1 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-all border border-gray-200 flex items-center justify-center gap-1.5"
          >
            <span>🔄</span>
            <span>重新生成</span>
          </button>
          <button
            onClick={onExport}
            disabled={questions.length === 0}
            className="flex-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>⬇️</span>
            <span>导出 PDF</span>
          </button>
        </div>
      </div>

      {/* 预览区 - 扩大展示 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">预览</h3>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">共 <span className="font-semibold text-gray-900">{questions.length}</span> 题</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500"><span className="font-semibold text-gray-900">{pdfConfig.columns}</span> 列</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500">纸张 <span className="font-semibold text-gray-900">{pdfConfig.pageSize.toUpperCase()}</span> · {pdfConfig.orientation === 'portrait' ? '竖向' : '横向'}</span>
            <button 
              onClick={() => {
                const newShowAnswers = !showAnswers;
                setShowAnswers(newShowAnswers);
                updatePDFConfig({ showAnswers: newShowAnswers });
              }}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showAnswers ? '🙈 隐藏答案' : '👁️ 显示答案'}
            </button>
          </div>
        </div>
        
        {questions.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-base">请配置并生成题目</p>
          </div>
        ) : (
          <div 
            className="grid gap-3 p-5 bg-gray-50 rounded-lg border border-gray-200 max-h-[800px] overflow-y-auto"
            style={{
              gridTemplateColumns: `repeat(${pdfConfig.columns}, minmax(0, 1fr))`
            }}
          >
            {questions.map((q) => (
              <div 
                key={q.id}
                className="p-3 bg-white rounded-md shadow-sm hover:shadow transition-shadow border border-gray-100"
                style={{ fontSize: `${pdfConfig.fontSize + 1}px` }}
              >
                {/* <span className="text-gray-500 font-medium">{q.id}.</span>
                <span> </span> */}
                <span className="font-medium text-gray-800">{q.question}</span>
                <span className="inline-block w-14 border-b border-gray-300 ml-1"></span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 答案区域 - 点击显示答案按钮后显示 */}
      {showAnswers && questions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 border-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-5">答案</h3>
          <div className="grid grid-cols-10 gap-x-8 gap-y-3 text-sm">
            {questions.map((q) => (
              <div key={q.id} className="flex gap-1.5 items-center">
                <span className="text-gray-500">{q.id}.</span>
                <span className="font-semibold text-gray-900">
                  {typeof q.answer === 'number' && !isNaN(q.answer) ? q.answer : '-'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
