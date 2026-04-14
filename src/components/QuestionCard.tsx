'use client';

import { Question } from '@/lib/questionGenerator';

interface QuestionCardProps {
  question: Question;
  showAnswer: boolean;
}

export default function QuestionCard({ question, showAnswer }: QuestionCardProps) {
  const q = question;

  // 比较题
  if (q.questionType === 'comparison') {
    const symbols: Record<number, string> = { [-1]: '<', [0]: '=', [1]: '>' };
    return (
      <div className="question-card p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 group">
        <div className="flex items-center justify-center gap-1.5 text-gray-800 font-medium" style={{ fontSize: 'inherit' }}>
          <span>{q.operands[0]}</span>
          {showAnswer ? (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
              {symbols[q.answer]}
            </span>
          ) : (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-dashed border-amber-300 bg-amber-50 text-amber-400 text-xs">
              ○
            </span>
          )}
          <span>{q.operands[1]}</span>
        </div>
      </div>
    );
  }

  // 填空题
  if (q.questionType === 'fill_blank') {
    // 解析题目显示填空框
    const parts = q.question.split('__');
    return (
      <div className="question-card p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 group">
        <div className="flex items-center gap-1 flex-wrap text-gray-800 font-medium" style={{ fontSize: 'inherit' }}>
          {parts[0] && <span>{parts[0]}</span>}
          {showAnswer ? (
            <span className="inline-flex items-center justify-center min-w-[2rem] px-2 h-7 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-bold">
              {q.answer}{q.remainder !== undefined && q.remainder > 0 ? `...${q.remainder}` : ''}
            </span>
          ) : (
            <span className="inline-block min-w-[2rem] h-7 border-b-2 border-dashed border-amber-400 bg-amber-50/50 rounded"></span>
          )}
          {parts[1] && <span>{parts[1]}</span>}
        </div>
      </div>
    );
  }

  // 估算题
  if (q.questionType === 'estimation') {
    return (
      <div className="question-card p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 group">
        <div className="flex items-center gap-1 text-gray-800 font-medium" style={{ fontSize: 'inherit' }}>
          <span>{q.question}</span>
          {showAnswer ? (
            <span className="inline-flex items-center justify-center min-w-[2rem] px-2 h-7 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-bold">
              {q.answer}
            </span>
          ) : (
            <span className="inline-block min-w-[2rem] h-7 border-b-2 border-dashed border-amber-400 bg-amber-50/50 rounded"></span>
          )}
        </div>
      </div>
    );
  }

  // 直接计算题 (default)
  return (
    <div className="question-card p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 group">
      <div className="flex items-center gap-1 text-gray-800 font-medium" style={{ fontSize: 'inherit' }}>
        <span>{q.question}</span>
        {showAnswer ? (
          <span className="inline-flex items-center justify-center min-w-[2rem] px-2 h-7 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-bold">
            {q.answer}{q.remainder !== undefined && q.remainder > 0 ? `...${q.remainder}` : ''}
          </span>
        ) : (
          <span className="inline-block min-w-[2rem] h-7 border-b-2 border-dashed border-amber-400 bg-amber-50/50 rounded"></span>
        )}
      </div>
    </div>
  );
}
