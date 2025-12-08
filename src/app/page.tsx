'use client';

import { useState, useMemo, useEffect } from 'react';
import ConfigPanel from '@/components/ConfigPanel';
import PreviewPanel from '@/components/PreviewPanel';
import { 
  GeneratorConfig, 
  generateQuestions
} from '@/lib/questionGenerator';
import { PDFConfig, getDefaultPDFConfig, exportToPDF } from '@/lib/pdfExporter';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  
  // 生成器配置
  const [config, setConfig] = useState<GeneratorConfig>({
    grade: 1,
    difficulty: 'basic',
    operations: ['addition'],
    questionCount: 20,
    minValue: 1,
    maxValue: 20,
    allowCarry: true,
    allowBorrow: true,
    allowRemainder: false,
    allowNegative: false,
    uniqueQuestions: true,
    multiplicationTable: 9
  });

  // PDF配置
  const [pdfConfig, setPdfConfig] = useState<PDFConfig>(getDefaultPDFConfig());

  // 确保只在客户端生成题目 - 这是修复 hydration 的标准模式
  useEffect(() => {
    setMounted(true);
  }, []);

  // 生成的题目 - 只在客户端挂载后生成，避免 hydration 不匹配
  const questions = useMemo(() => {
    if (!mounted || config.operations.length === 0) {
      return [];
    }
    return generateQuestions(config);
  }, [mounted, config]);

  // 统计信息
  const stats = useMemo(() => {
    const duplicates = config.questionCount - questions.length;
    return { attempts: config.questionCount, duplicates };
  }, [config.questionCount, questions.length]);

  // 保留旧的 handleGenerate 用于手动重新生成
  const handleGenerate = () => {
    // 通过更新 config 来触发重新生成
    setConfig({ ...config });
  };

  const handleExport = () => {
    if (questions.length === 0) return;
    exportToPDF(questions, pdfConfig);
  };

  const handleResetConfig = () => {
    const range = { min: 1, max: 20 }; // 一年级默认范围
    setConfig({
      grade: 1,
      difficulty: 'basic',
      operations: ['addition'],
      questionCount: 20,
      minValue: range.min,
      maxValue: range.max,
      allowCarry: false,
      allowBorrow: true,
      allowRemainder: false,
      allowNegative: false,
      uniqueQuestions: true,
      multiplicationTable: 9
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                口算生成器
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                聚焦浅色体验：选题、排版、导出一站式完成
              </p>
            </div>
            
            <button
              onClick={handleResetConfig}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            >
              恢复默认配置
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Config Panel */}
          <aside className="lg:w-96 flex-shrink-0">
            <ConfigPanel config={config} onChange={setConfig} />
            
            {/* Stats */}
            {questions.length > 0 && (
              <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">✨</span>
                  <span className="text-sm font-semibold text-gray-700">生成统计</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span>尝试次数：</span>
                    <span className="font-semibold text-gray-900">{stats.attempts}</span>
                  </div>
                  {config.uniqueQuestions && stats.duplicates > 0 && (
                    <div className="flex justify-between items-center">
                      <span>去重：</span>
                      <span className="font-semibold text-orange-600">{stats.duplicates}</span>
                    </div>
                  )}
                  {questions.length < config.questionCount && (
                    <p className="text-xs text-orange-600 mt-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
                      ⚠️ 根据当前范围与去重限制，仅生成 {questions.length} 题
                    </p>
                  )}
                </div>
              </div>
            )}
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
          <p className="text-xs text-gray-500">
            © 2025 口算生成器. 使用 
            <span className="font-semibold text-gray-700"> Next.js</span> + 
            <span className="font-semibold text-gray-700"> Tailwind CSS</span> 构建
          </p>
        </div>
      </footer>
    </div>
  );
}
