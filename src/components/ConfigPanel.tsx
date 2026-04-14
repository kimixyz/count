"use client";

import {
  GeneratorConfig,
  QuestionType,
  OperationCategory,
  SemesterKey,
} from "@/lib/questionGenerator";
import { CURRICULUM, SEMESTER_KEYS, getCurriculum } from "@/lib/curriculum";
import { QUESTION_TYPE_LABELS, OPERATION_LABELS } from "@/lib/constants";

interface ConfigPanelProps {
  config: GeneratorConfig;
  onChange: (config: GeneratorConfig) => void;
}

const SEMESTER_SHORT: Record<SemesterKey, string> = {
  "1A": "1上",
  "1B": "1下",
  "2A": "2上",
  "2B": "2下",
  "3A": "3上",
  "3B": "3下",
  "4A": "4上",
  "4B": "4下",
};

export default function ConfigPanel({ config, onChange }: ConfigPanelProps) {
  const updateConfig = (updates: Partial<GeneratorConfig>) => {
    onChange({ ...config, ...updates });
  };

  const handleSemesterChange = (semester: SemesterKey) => {
    const entry = getCurriculum(semester);
    onChange({
      ...config,
      semester,
      operations: entry.operations,
      questionTypes: entry.questionTypes,
      minValue: entry.range.min,
      maxValue: entry.range.max,
      allowCarry: entry.allowCarry,
      allowBorrow: entry.allowBorrow,
      allowRemainder: entry.allowRemainder,
      allowDecimals: entry.allowDecimals,
      decimalPlaces: entry.decimalPlaces,
      multiplicationTable: entry.multiplicationTableMax,
    });
  };

  const toggleQuestionType = (qt: QuestionType) => {
    const entry = getCurriculum(config.semester);
    if (!entry.questionTypes.includes(qt)) return; // 该学期不支持

    const types = config.questionTypes.includes(qt)
      ? config.questionTypes.filter((t) => t !== qt)
      : [...config.questionTypes, qt];
    if (types.length > 0) updateConfig({ questionTypes: types });
  };

  const toggleOperation = (op: OperationCategory) => {
    const entry = getCurriculum(config.semester);
    if (!entry.operations.includes(op)) return;

    if (op === "mixed") {
      const ops: OperationCategory[] = config.operations.includes("mixed")
        ? []
        : ["mixed"];
      if (ops.length > 0) updateConfig({ operations: ops });
      return;
    }

    const currentOps = config.operations.filter((o) => o !== "mixed");
    const ops: OperationCategory[] = currentOps.includes(op)
      ? currentOps.filter((o) => o !== op)
      : [...currentOps, op];
    if (ops.length > 0) updateConfig({ operations: ops });
  };

  // 快捷预设
  const applyPreset = (
    preset: "daily" | "multiplication" | "mixed_challenge",
  ) => {
    const entry = getCurriculum(config.semester);
    switch (preset) {
      case "daily":
        onChange({
          ...config,
          operations: entry.operations,
          questionTypes: entry.questionTypes,
          questionCount: 40,
          minValue: entry.range.min,
          maxValue: entry.range.max,
          allowCarry: entry.allowCarry,
          allowBorrow: entry.allowBorrow,
          allowRemainder: entry.allowRemainder,
        });
        break;
      case "multiplication":
        onChange({
          ...config,
          operations: ["multiplication"],
          questionTypes: ["direct", "fill_blank"],
          questionCount: 30,
        });
        break;
      case "mixed_challenge": {
        const mixOps: OperationCategory[] = ["addition", "subtraction"];
        if (entry.operations.includes("multiplication"))
          mixOps.push("multiplication");
        if (entry.operations.includes("division")) mixOps.push("division");
        onChange({
          ...config,
          operations: mixOps,
          questionTypes: config.questionTypes,
          questionCount: 60,
        });
        break;
      }
    }
  };

  const entry = getCurriculum(config.semester);

  return (
    <div className="w-full max-w-md space-y-5 p-5 bg-white rounded-2xl shadow-sm border border-gray-100/80">
      {/* 快捷预设 */}
      <div className="space-y-2.5">
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
          快捷预设
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => applyPreset("daily")}
            className="px-3 py-2 rounded-xl text-xs font-medium bg-linear-to-br from-emerald-50 to-emerald-100/60 text-emerald-700 hover:from-emerald-100 hover:to-emerald-200/60 border border-emerald-200/50 transition-all active:scale-95"
          >
            每日口算
          </button>
          {entry.operations.includes("multiplication") && (
            <button
              onClick={() => applyPreset("multiplication")}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-linear-to-br from-blue-50 to-blue-100/60 text-blue-700 hover:from-blue-100 hover:to-blue-200/60 border border-blue-200/50 transition-all active:scale-95"
            >
              乘法专项
            </button>
          )}
          <button
            onClick={() => applyPreset("mixed_challenge")}
            className="px-3 py-2 rounded-xl text-xs font-medium bg-linear-to-br from-purple-50 to-purple-100/60 text-purple-700 hover:from-purple-100 hover:to-purple-200/60 border border-purple-200/50 transition-all active:scale-95"
          >
            混合挑战
          </button>
        </div>
      </div>

      {/* 学期选择 */}
      <div className="space-y-2.5">
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
          选择学期
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {SEMESTER_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => handleSemesterChange(key)}
              className={`px-2 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                config.semester === key
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/80"
              }`}
            >
              {SEMESTER_SHORT[key]}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400">{entry.label}</p>
      </div>

      {/* 题型选择 */}
      <div className="space-y-2.5">
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
          题目类型
        </label>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              "direct",
              "fill_blank",
              "comparison",
              "estimation",
            ] as QuestionType[]
          ).map((qt) => {
            const enabled = entry.questionTypes.includes(qt);
            const active = config.questionTypes.includes(qt);
            return (
              <button
                key={qt}
                onClick={() => toggleQuestionType(qt)}
                disabled={!enabled}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 ${
                  !enabled
                    ? "bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100"
                    : active
                      ? "bg-blue-500 text-white shadow-sm"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/80"
                }`}
              >
                {QUESTION_TYPE_LABELS[qt]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 运算类型 */}
      <div className="space-y-2.5">
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
          运算类型{" "}
          <span className="normal-case tracking-normal">至少选1个</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {(
            [
              "addition",
              "subtraction",
              "multiplication",
              "division",
            ] as OperationCategory[]
          ).map((op) => {
            const enabled = entry.operations.includes(op);
            const active = config.operations.includes(op);
            const info = OPERATION_LABELS[op];
            return (
              <button
                key={op}
                onClick={() => toggleOperation(op)}
                disabled={!enabled}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                  !enabled
                    ? "bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100"
                    : active
                      ? "bg-blue-500 text-white shadow-sm"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/80"
                }`}
              >
                <span className="text-base">{info.icon}</span>
                <span>{info.label}</span>
              </button>
            );
          })}
        </div>

        {entry.operations.includes("mixed") && (
          <button
            onClick={() => toggleOperation("mixed")}
            className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${
              config.operations.includes("mixed")
                ? "bg-purple-500 text-white shadow-sm"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/80"
            }`}
          >
            ± 混合运算
          </button>
        )}
        {entry.operations.includes("decimal_add_sub") && (
          <button
            onClick={() => toggleOperation("decimal_add_sub")}
            disabled={!entry.operations.includes("decimal_add_sub")}
            className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${
              config.operations.includes("decimal_add_sub")
                ? "bg-teal-500 text-white shadow-sm"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/80"
            }`}
          >
            . 小数加减
          </button>
        )}
        {entry.operations.includes("decimal_mul") && (
          <button
            onClick={() => toggleOperation("decimal_mul")}
            disabled={!entry.operations.includes("decimal_mul")}
            className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${
              config.operations.includes("decimal_mul")
                ? "bg-teal-500 text-white shadow-sm"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/80"
            }`}
          >
            .× 小数乘法
          </button>
        )}
      </div>

      {/* 数值范围 */}
      <div className="space-y-2.5">
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
          数值范围
        </label>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">最小值</label>
            <input
              type="number"
              value={config.minValue || 1}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                updateConfig({ minValue: isNaN(val) ? 1 : val });
              }}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-gray-50 text-sm"
            />
          </div>
          <span className="text-gray-300 mt-5 text-lg">~</span>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">最大值</label>
            <input
              type="number"
              value={config.maxValue || 100}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                updateConfig({ maxValue: isNaN(val) ? 100 : val });
              }}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-gray-50 text-sm"
            />
          </div>
        </div>
      </div>

      {/* 题量 */}
      <div className="space-y-2.5">
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
          题量
        </label>
        <input
          type="number"
          value={config.questionCount || 20}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            updateConfig({
              questionCount: isNaN(val) ? 20 : Math.max(1, Math.min(200, val)),
            });
          }}
          min={1}
          max={200}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-gray-50 text-sm"
        />
        <div className="flex gap-2">
          {[20, 40, 60, 100].map((count) => (
            <button
              key={count}
              onClick={() => updateConfig({ questionCount: count })}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all active:scale-95 ${
                config.questionCount === count
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                  : "bg-gray-50 hover:bg-gray-100 border border-gray-200/80 text-gray-600"
              }`}
            >
              {count}题
            </button>
          ))}
        </div>
      </div>

      {/* 高级选项 */}
      <details className="space-y-2.5 group">
        <summary className="flex items-center justify-between text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 transition-colors list-none">
          <span>高级选项</span>
          <span className="text-gray-300 transition-transform group-open:rotate-180">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M2.5 4.5L6 8l3.5-3.5" />
            </svg>
          </span>
        </summary>
        <div className="space-y-2 pl-3 border-l-2 border-gray-100">
          <label className="flex items-center gap-2.5 cursor-pointer group/item">
            <input
              type="checkbox"
              checked={config.uniqueQuestions}
              onChange={(e) =>
                updateConfig({ uniqueQuestions: e.target.checked })
              }
              className="w-4 h-4 text-emerald-500 rounded border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-0 cursor-pointer accent-emerald-500"
            />
            <span className="text-sm text-gray-600 group-hover/item:text-gray-900 transition-colors">
              题目去重
            </span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer group/item">
            <input
              type="checkbox"
              checked={config.allowCarry}
              onChange={(e) => updateConfig({ allowCarry: e.target.checked })}
              className="w-4 h-4 text-emerald-500 rounded border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-0 cursor-pointer accent-emerald-500"
            />
            <span className="text-sm text-gray-600 group-hover/item:text-gray-900 transition-colors">
              加法允许进位
            </span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer group/item">
            <input
              type="checkbox"
              checked={config.allowBorrow}
              onChange={(e) => updateConfig({ allowBorrow: e.target.checked })}
              className="w-4 h-4 text-emerald-500 rounded border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-0 cursor-pointer accent-emerald-500"
            />
            <span className="text-sm text-gray-600 group-hover/item:text-gray-900 transition-colors">
              减法允许借位
            </span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer group/item">
            <input
              type="checkbox"
              checked={config.allowRemainder}
              onChange={(e) =>
                updateConfig({ allowRemainder: e.target.checked })
              }
              className="w-4 h-4 text-emerald-500 rounded border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-0 cursor-pointer accent-emerald-500"
            />
            <span className="text-sm text-gray-600 group-hover/item:text-gray-900 transition-colors">
              除法允许余数
            </span>
          </label>

          {config.operations.includes("multiplication") &&
            entry.multiplicationTableMax > 0 && (
              <div className="pt-1">
                <label className="block text-xs text-gray-500 mb-1">
                  乘法口诀表范围
                </label>
                <select
                  value={config.multiplicationTable || 9}
                  onChange={(e) =>
                    updateConfig({
                      multiplicationTable: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-gray-50"
                >
                  {[2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <option key={n} value={n}>
                      {n}以内
                    </option>
                  ))}
                </select>
              </div>
            )}
        </div>
      </details>
    </div>
  );
}
