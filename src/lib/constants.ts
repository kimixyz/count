import { QuestionType, OperationCategory } from './curriculum';

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  direct: '直接计算',
  fill_blank: '填空题',
  comparison: '比较大小',
  estimation: '估算题',
};

export const OPERATION_LABELS: Record<OperationCategory, { label: string; icon: string }> = {
  addition: { label: '加法', icon: '+' },
  subtraction: { label: '减法', icon: '−' },
  multiplication: { label: '乘法', icon: '×' },
  division: { label: '除法', icon: '÷' },
  mixed: { label: '混合运算', icon: '±' },
  decimal_add_sub: { label: '小数加减', icon: '.' },
  decimal_mul: { label: '小数乘法', icon: '.×' },
};
