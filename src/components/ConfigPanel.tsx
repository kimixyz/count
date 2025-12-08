'use client';

import { useState } from 'react';
import { GeneratorConfig, GradeLevel, DifficultyLevel, OperationType, getDefaultRange, getRecommendedConfig } from '@/lib/questionGenerator';

interface ConfigPanelProps {
  config: GeneratorConfig;
  onChange: (config: GeneratorConfig) => void;
}

export default function ConfigPanel({ config, onChange }: ConfigPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateConfig = (updates: Partial<GeneratorConfig>) => {
    onChange({ ...config, ...updates });
  };

  const handleGradeChange = (grade: GradeLevel) => {
    const range = getDefaultRange(grade);
    updateConfig({ 
      grade, 
      minValue: range.min, 
      maxValue: range.max 
    });
  };

  const handleDifficultyChange = (difficulty: DifficultyLevel) => {
    const recommended = getRecommendedConfig(config.grade, difficulty);
    updateConfig({ ...recommended, questionCount: config.questionCount });
  };

  const toggleOperation = (op: OperationType) => {
    // 如果点击混合运算
    if (op === 'mixed') {
      const operations: OperationType[] = config.operations.includes('mixed')
        ? [] // 取消选择混合运算
        : ['mixed']; // 选择混合运算时，只保留mixed
      
      if (operations.length > 0) {
        updateConfig({ operations });
      }
      return;
    }
    
    // 如果点击其他运算类型，移除mixed
    const currentOps = config.operations.filter((o): o is Exclude<OperationType, 'mixed'> => o !== 'mixed');
    const operations: OperationType[] = currentOps.includes(op)
      ? currentOps.filter(o => o !== op) // 取消当前选择
      : [...currentOps, op]; // 添加当前选择
    
    if (operations.length > 0) {
      updateConfig({ operations });
    }
  };

  return (
    <div className="w-full max-w-md space-y-5 p-5 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">配置</h2>
      </div>
      
      {/* 年级与难度 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            年级与难度
          </label>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {([1, 2, 3, 4] as GradeLevel[]).map(grade => (
            <button
              key={grade}
              onClick={() => handleGradeChange(grade)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                config.grade === grade
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {grade}年级
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(['basic', 'intermediate', 'advanced'] as DifficultyLevel[]).map(diff => (
            <button
              key={diff}
              onClick={() => handleDifficultyChange(diff)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                config.difficulty === diff
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {diff === 'basic' ? '基础' : diff === 'intermediate' ? '进阶' : '挑战'}
            </button>
          ))}
        </div>
      </div>

      {/* 题型选择 */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          题型 <span className="text-gray-400 text-xs ml-1">至少选择1个</span>
        </label>
        
        <div className="grid grid-cols-2 gap-2">
          {[
            { type: 'addition' as OperationType, label: '加法', icon: '+' },
            { type: 'subtraction' as OperationType, label: '减法', icon: '-' },
            { type: 'multiplication' as OperationType, label: '乘法', icon: '×' },
            { type: 'division' as OperationType, label: '除法', icon: '÷' },
          ].map(({ type, label, icon }) => (
            <button
              key={type}
              onClick={() => toggleOperation(type)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                config.operations.includes(type)
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span className="text-base">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => toggleOperation('mixed')}
          className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            config.operations.includes('mixed')
              ? 'bg-purple-500 text-white shadow-sm'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          混合运算
        </button>
      </div>

      {/* 数值范围 */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          数值范围
        </label>
        
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1.5">最小值</label>
            <input
              type="number"
              value={config.minValue || 1}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                updateConfig({ minValue: isNaN(val) ? 1 : val });
              }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50"
            />
          </div>
          <span className="text-gray-300 mt-6 text-lg">~</span>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1.5">最大值</label>
            <input
              type="number"
              value={config.maxValue || 100}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                updateConfig({ maxValue: isNaN(val) ? 100 : val });
              }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* 题量 */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          题量
        </label>
        
        <input
          type="number"
          value={config.questionCount || 20}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            updateConfig({ questionCount: isNaN(val) ? 20 : Math.max(1, Math.min(200, val)) });
          }}
          min={1}
          max={200}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50"
        />
        
        <div className="flex gap-2">
          {[20, 40, 60, 100].map(count => (
            <button
              key={count}
              onClick={() => updateConfig({ questionCount: count })}
              className="flex-1 px-3 py-1.5 text-xs font-medium bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors"
            >
              {count}题
            </button>
          ))}
        </div>
      </div>

      {/* 高级选项 */}
      <div className="space-y-3">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          <span>高级选项</span>
          <span className="text-gray-400 text-xs">{showAdvanced ? '▼' : '▶'}</span>
        </button>
        
        {showAdvanced && (
          <div className="space-y-2.5 pl-3 border-l-2 border-gray-100">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={config.uniqueQuestions}
                onChange={(e) => updateConfig({ uniqueQuestions: e.target.checked })}
                className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-2 focus:ring-blue-400 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">题目去重</span>
            </label>
            
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={config.allowCarry !== false}
                onChange={(e) => updateConfig({ allowCarry: e.target.checked })}
                className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-2 focus:ring-blue-400 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">加法允许进位</span>
            </label>
            
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={config.allowBorrow !== false}
                onChange={(e) => updateConfig({ allowBorrow: e.target.checked })}
                className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-2 focus:ring-blue-400 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">减法允许借位</span>
            </label>
            
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={config.allowRemainder || false}
                onChange={(e) => updateConfig({ allowRemainder: e.target.checked })}
                className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-2 focus:ring-blue-400 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">除法允许余数</span>
            </label>

            {config.operations.includes('multiplication') && (
              <div className="pt-2">
                <label className="block text-xs text-gray-500 mb-1.5">乘法口诀表范围</label>
                <select
                  value={config.multiplicationTable || 9}
                  onChange={(e) => updateConfig({ multiplicationTable: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50"
                >
                  {[2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                    <option key={n} value={n}>{n}以内</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
