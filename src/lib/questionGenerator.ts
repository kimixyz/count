// 题目生成器 —— 对齐人教版 2022 新课标

import {
  SemesterKey,
  QuestionType,
  OperationCategory,
  CurriculumEntry,
  getCurriculum,
} from "./curriculum";

export type { SemesterKey, QuestionType, OperationCategory, CurriculumEntry };

export interface Question {
  id: number;
  question: string;
  answer: number;
  operands: number[];
  operator: string;
  questionType: QuestionType;
  blanks?: number[];
  comparisonTarget?: number;
  isDecimal: boolean;
  remainder?: number; // 有余数除法的余数
}

export interface GeneratorConfig {
  semester: SemesterKey;
  operations: OperationCategory[];
  questionTypes: QuestionType[];
  questionCount: number;
  minValue: number;
  maxValue: number;
  allowCarry: boolean;
  allowBorrow: boolean;
  allowRemainder: boolean;
  allowDecimals: boolean;
  decimalPlaces: number;
  uniqueQuestions: boolean;
  multiplicationTable: number;
}

// 从学期获取默认配置
export function getDefaultConfig(semester: SemesterKey): GeneratorConfig {
  const entry = getCurriculum(semester);
  return {
    semester,
    operations: entry.operations,
    questionTypes: entry.questionTypes,
    questionCount: 20,
    minValue: entry.range.min,
    maxValue: entry.range.max,
    allowCarry: entry.allowCarry,
    allowBorrow: entry.allowBorrow,
    allowRemainder: entry.allowRemainder,
    allowDecimals: entry.allowDecimals,
    decimalPlaces: entry.decimalPlaces,
    uniqueQuestions: true,
    multiplicationTable: entry.multiplicationTableMax,
  };
}

// 生成随机整数
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成随机一位小数 (x.0 ~ x.9)
function randomDecimal1(min: number, max: number): number {
  return randomInt(min, max) + randomInt(0, 9) / 10;
}

// 生成随机两位小数
function randomDecimal2(min: number, max: number): number {
  return randomInt(min, max) + randomInt(0, 99) / 100;
}

function randomNum(min: number, max: number, config: GeneratorConfig): number {
  if (config.allowDecimals && config.decimalPlaces === 1)
    return randomDecimal1(min, max);
  if (config.allowDecimals && config.decimalPlaces >= 2)
    return randomDecimal2(min, max);
  return randomInt(min, max);
}

// 四舍五入到 n 位小数
function roundTo(n: number, decimals: number): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

// ============ 基础运算生成器 ============

function generateAddition(config: GeneratorConfig): Question {
  const {
    minValue: min,
    maxValue: max,
    allowCarry,
    allowDecimals,
    decimalPlaces,
  } = config;
  let a: number, b: number;
  let attempts = 0;

  do {
    a = randomNum(min, max, config);
    b = randomNum(min, max, config);
    attempts++;

    if (!allowCarry && !allowDecimals) {
      if ((a % 10) + (b % 10) >= 10) continue;
      if (a >= 10 && b >= 10) {
        const tensA = Math.floor((a % 100) / 10);
        const tensB = Math.floor((b % 100) / 10);
        if (tensA + tensB >= 10) continue;
      }
    }
    break;
  } while (attempts < 200);

  const answer = roundTo(a + b, allowDecimals ? decimalPlaces : 0);
  return {
    id: Date.now() + Math.random(),
    question: `${a} + ${b} = `,
    answer,
    operands: [a, b],
    operator: "+",
    questionType: "direct",
    isDecimal: allowDecimals,
  };
}

function generateSubtraction(config: GeneratorConfig): Question {
  const { allowBorrow, allowDecimals, decimalPlaces } = config;
  let a: number, b: number;
  let attempts = 0;

  do {
    a = randomNum(config.minValue, config.maxValue, config);
    b = randomNum(config.minValue, config.maxValue, config);
    attempts++;

    if (a < b) [a, b] = [b, a]; // 确保非负

    if (!allowBorrow && !allowDecimals) {
      const aStr = String(Math.floor(a));
      const bStr = String(Math.floor(b)).padStart(aStr.length, "0");
      let needBorrow = false;
      for (let i = aStr.length - 1; i >= 0; i--) {
        if (parseInt(aStr[i]) < parseInt(bStr[i])) {
          needBorrow = true;
          break;
        }
      }
      if (needBorrow) continue;
    }
    break;
  } while (attempts < 200);

  const answer = roundTo(a - b, allowDecimals ? decimalPlaces : 0);
  return {
    id: Date.now() + Math.random(),
    question: `${a} − ${b} = `,
    answer,
    operands: [a, b],
    operator: "−",
    questionType: "direct",
    isDecimal: allowDecimals,
  };
}

function generateMultiplication(config: GeneratorConfig): Question {
  const tableMax = config.multiplicationTable || 9;
  const a = randomInt(
    Math.max(config.minValue, 1),
    Math.min(config.maxValue, 100),
  );
  const b = randomInt(2, Math.min(tableMax, 9));
  return {
    id: Date.now() + Math.random(),
    question: `${a} × ${b} = `,
    answer: a * b,
    operands: [a, b],
    operator: "×",
    questionType: "direct",
    isDecimal: false,
  };
}

function generateDivision(config: GeneratorConfig): Question {
  const { allowRemainder } = config;
  const divisor = randomInt(2, 9);
  if (allowRemainder) {
    const dividend = randomInt(divisor, Math.min(config.maxValue, 100));
    const quotient = Math.floor(dividend / divisor);
    const remainder = dividend % divisor;
    if (remainder > 0) {
      return {
        id: Date.now() + Math.random(),
        question: `${dividend} ÷ ${divisor} = `,
        answer: quotient,
        operands: [dividend, divisor],
        operator: "÷",
        questionType: "direct",
        isDecimal: false,
        remainder,
      };
    }
  }
  // 整除
  const quotient = randomInt(1, Math.floor(config.maxValue / divisor));
  const dividend = divisor * quotient;
  return {
    id: Date.now() + Math.random(),
    question: `${dividend} ÷ ${divisor} = `,
    answer: quotient,
    operands: [dividend, divisor],
    operator: "÷",
    questionType: "direct",
    isDecimal: false,
  };
}

// ============ 课程标准对齐的模式生成器 ============

// 1A: 10以内加减，不进位不退位
function generateWithin10(_config: GeneratorConfig): Question {
  const op = Math.random() < 0.5 ? "+" : "-";
  if (op === "+") {
    const a = randomInt(1, 9);
    const b = randomInt(1, 10 - a); // 保证和 ≤ 10
    return {
      id: Date.now() + Math.random(),
      question: `${a} + ${b} = `,
      answer: a + b,
      operands: [a, b],
      operator: "+",
      questionType: "direct",
      isDecimal: false,
    };
  } else {
    const a = randomInt(2, 10);
    const b = randomInt(1, a); // 保证差 ≥ 0
    return {
      id: Date.now() + Math.random(),
      question: `${a} − ${b} = `,
      answer: a - b,
      operands: [a, b],
      operator: "−",
      questionType: "direct",
      isDecimal: false,
    };
  }
}

// 1B: 20以内进位加法 (凑十法)
function generateWithin20Carry(): Question {
  const a = randomInt(8, 9);
  const b = randomInt(11 - a, 9); // 保证需要进位
  return {
    id: Date.now() + Math.random(),
    question: `${a} + ${b} = `,
    answer: a + b,
    operands: [a, b],
    operator: "+",
    questionType: "direct",
    isDecimal: false,
  };
}

// 1B: 20以内退位减法 (破十法)
function generateWithin20Borrow(): Question {
  const a = randomInt(11, 18);
  const b = randomInt((a % 10) + 1, 9); // 保证需要退位
  return {
    id: Date.now() + Math.random(),
    question: `${a} − ${b} = `,
    answer: a - b,
    operands: [a, b],
    operator: "−",
    questionType: "direct",
    isDecimal: false,
  };
}

// 整十数运算: 30+40, 80-20
function generateWholeTens(): Question {
  const op = Math.random() < 0.5 ? "+" : "-";
  const a = randomInt(1, 9) * 10;
  const b = randomInt(1, 9) * 10;
  if (op === "+" || a >= b) {
    return {
      id: Date.now() + Math.random(),
      question: op === "+" ? `${a} + ${b} = ` : `${a} − ${b} = `,
      answer: op === "+" ? a + b : a - b,
      operands: [a, b],
      operator: op === "+" ? "+" : "−",
      questionType: "direct",
      isDecimal: false,
    };
  }
  return {
    id: Date.now() + Math.random(),
    question: `${b} − ${a} = `,
    answer: b - a,
    operands: [b, a],
    operator: "−",
    questionType: "direct",
    isDecimal: false,
  };
}

// 2A: 连加连减 25+18+32, 72-25-19
function generateConsecutiveAddSub(): Question {
  const count = 3;
  const nums: number[] = [];
  for (let i = 0; i < count; i++) {
    nums.push(randomInt(1, 50));
  }
  const ops: string[] = [];
  for (let i = 0; i < count - 1; i++) {
    ops.push(Math.random() < 0.5 ? "+" : "−");
  }
  // 确保至少有一个 + 和一个 -
  if (ops.every((o) => o === ops[0])) {
    ops[randomInt(0, ops.length - 1)] = ops[0] === "+" ? "−" : "+";
  }

  // 按从左到右计算
  let result = nums[0];
  let expr = `${nums[0]}`;
  for (let i = 0; i < ops.length; i++) {
    expr += ` ${ops[i]} ${nums[i + 1]}`;
    if (ops[i] === "+") result += nums[i + 1];
    else result -= nums[i + 1];
  }

  // 确保结果非负
  if (result < 0) {
    // 重试：全部用加法
    return generateConsecutiveAddSub();
  }

  return {
    id: Date.now() + Math.random(),
    question: `${expr} = `,
    answer: result,
    operands: nums,
    operator: ops.join(" "),
    questionType: "direct",
    isDecimal: false,
  };
}

// 乘法口诀表范围
function generateMultTable(tableMax: number): Question {
  const a = randomInt(2, tableMax);
  const b = randomInt(2, tableMax);
  return {
    id: Date.now() + Math.random(),
    question: `${a} × ${b} = `,
    answer: a * b,
    operands: [a, b],
    operator: "×",
    questionType: "direct",
    isDecimal: false,
  };
}

// 表内除法: 24÷6, 45÷9
function generateTableDivision(): Question {
  const divisor = randomInt(2, 9);
  const quotient = randomInt(1, 9);
  const dividend = divisor * quotient;
  return {
    id: Date.now() + Math.random(),
    question: `${dividend} ÷ ${divisor} = `,
    answer: quotient,
    operands: [dividend, divisor],
    operator: "÷",
    questionType: "direct",
    isDecimal: false,
  };
}

// 有余数除法: 17÷5=3...2
function generateDivisionWithRemainder(): Question {
  const divisor = randomInt(2, 9);
  const quotient = randomInt(1, 9);
  const remainder = randomInt(1, divisor - 1);
  const dividend = divisor * quotient + remainder;
  return {
    id: Date.now() + Math.random(),
    question: `${dividend} ÷ ${divisor} = `,
    answer: quotient,
    operands: [dividend, divisor],
    operator: "÷",
    questionType: "direct",
    isDecimal: false,
    remainder,
  };
}

// 多位数乘一位数: 234×3
function generateMultiDigitBySingle(): Question {
  const a = randomInt(10, Math.min(config_max(), 999));
  const b = randomInt(2, 9);
  return {
    id: Date.now() + Math.random(),
    question: `${a} × ${b} = `,
    answer: a * b,
    operands: [a, b],
    operator: "×",
    questionType: "direct",
    isDecimal: false,
  };
}
function config_max() {
  return 999;
}

// 整十数乘一位数: 20×3, 300×2
function generateMultiplesOf10BySingle(): Question {
  const powers = [10, 100, 1000];
  const power = powers[randomInt(0, 2)];
  const a = randomInt(1, 9) * power;
  const b = randomInt(2, 9);
  return {
    id: Date.now() + Math.random(),
    question: `${a} × ${b} = `,
    answer: a * b,
    operands: [a, b],
    operator: "×",
    questionType: "direct",
    isDecimal: false,
  };
}

// 除数是一位数: 60÷3, 240÷6
function generateDivBySingle(): Question {
  const divisor = randomInt(2, 9);
  const quotient = randomInt(1, Math.floor(1000 / divisor));
  const dividend = divisor * quotient;
  return {
    id: Date.now() + Math.random(),
    question: `${dividend} ÷ ${divisor} = `,
    answer: quotient,
    operands: [dividend, divisor],
    operator: "÷",
    questionType: "direct",
    isDecimal: false,
  };
}

// 两位数乘两位数: 23×14
function generateTwoDigitByTwoDigit(): Question {
  const a = randomInt(10, 99);
  const b = randomInt(10, 99);
  return {
    id: Date.now() + Math.random(),
    question: `${a} × ${b} = `,
    answer: a * b,
    operands: [a, b],
    operator: "×",
    questionType: "direct",
    isDecimal: false,
  };
}

// 一位小数加减: 1.5+2.3
function generateSimpleDecimalAddSub(): Question {
  const op = Math.random() < 0.5 ? "+" : "−";
  const a = randomDecimal1(0, 10);
  const b = randomDecimal1(0, 10);
  if (op === "+") {
    return {
      id: Date.now() + Math.random(),
      question: `${a.toFixed(1)} + ${b.toFixed(1)} = `,
      answer: roundTo(a + b, 1),
      operands: [a, b],
      operator: "+",
      questionType: "direct",
      isDecimal: true,
    };
  }
  // 确保 a >= b
  const [big, small] = a >= b ? [a, b] : [b, a];
  return {
    id: Date.now() + Math.random(),
    question: `${big.toFixed(1)} − ${small.toFixed(1)} = `,
    answer: roundTo(big - small, 1),
    operands: [big, small],
    operator: "−",
    questionType: "direct",
    isDecimal: true,
  };
}

// 乘以 10/100/1000: 45×100
function generateMultiplyBy10s(): Question {
  const a = randomInt(2, 999);
  const powers = [10, 100, 1000];
  const b = powers[randomInt(0, 2)];
  return {
    id: Date.now() + Math.random(),
    question: `${a} × ${b} = `,
    answer: a * b,
    operands: [a, b],
    operator: "×",
    questionType: "direct",
    isDecimal: false,
  };
}

// 整十数乘整十数: 20×30
function generateMultiplesOf10ByMultiplesOf10(): Question {
  const a = randomInt(1, 99) * 10;
  const b = randomInt(1, 99) * 10;
  return {
    id: Date.now() + Math.random(),
    question: `${a} × ${b} = `,
    answer: a * b,
    operands: [a, b],
    operator: "×",
    questionType: "direct",
    isDecimal: false,
  };
}

// 三位数乘两位数: 145×23
function generate3DigitBy2Digit(): Question {
  const a = randomInt(100, 999);
  const b = randomInt(10, 99);
  return {
    id: Date.now() + Math.random(),
    question: `${a} × ${b} = `,
    answer: a * b,
    operands: [a, b],
    operator: "×",
    questionType: "direct",
    isDecimal: false,
  };
}

// 三位数除以两位数: 720÷24
function generate3DigitDiv2Digit(): Question {
  const divisor = randomInt(11, 99);
  const quotient = randomInt(2, Math.floor(999 / divisor));
  const dividend = divisor * quotient;
  return {
    id: Date.now() + Math.random(),
    question: `${dividend} ÷ ${divisor} = `,
    answer: quotient,
    operands: [dividend, divisor],
    operator: "÷",
    questionType: "direct",
    isDecimal: false,
  };
}

// 含括号运算: (12+8)÷4
function generateOrderOfOperations(): Question {
  const templates = [
    () => {
      const a = randomInt(1, 50),
        b = randomInt(1, 50);
      const c = randomInt(2, 9);
      const sum = a + b;
      if (sum % c === 0) {
        return {
          q: `(${a} + ${b}) ÷ ${c} = `,
          a: sum / c,
          ops: [a, b, c],
          op: "(+)÷",
        };
      }
      return null;
    },
    () => {
      const a = randomInt(1, 50),
        b = randomInt(1, 50);
      const c = randomInt(2, 9);
      const sum = a + b;
      if (sum % c === 0) {
        return {
          q: `${c} × (${a} + ${b}) = `,
          a: c * sum,
          ops: [a, b, c],
          op: "×(+)",
        };
      }
      return null;
    },
    () => {
      const a = randomInt(10, 50),
        b = randomInt(1, a - 1);
      const c = randomInt(2, 9);
      const diff = a - b;
      if (diff % c === 0 && diff > 0) {
        return {
          q: `(${a} − ${b}) × ${c} = `,
          a: diff * c,
          ops: [a, b, c],
          op: "(-)×",
        };
      }
      return null;
    },
  ];

  for (let attempt = 0; attempt < 50; attempt++) {
    const tpl = templates[randomInt(0, templates.length - 1)];
    const result = tpl();
    if (result) {
      return {
        id: Date.now() + Math.random(),
        question: result.q,
        answer: result.a,
        operands: result.ops,
        operator: result.op,
        questionType: "direct",
        isDecimal: false,
      };
    }
  }
  // fallback
  return generateMultiplesOf10ByMultiplesOf10();
}

// 运算定律简便计算: 25×4×8
function generateOperationProperty(): Question {
  const patterns = [
    // 25 × 4 × n
    () => {
      const n = randomInt(2, 50);
      return { q: `25 × 4 × ${n} = `, a: 100 * n, ops: [25, 4, n], op: "× ×" };
    },
    // 125 × 8 × n
    () => {
      const n = randomInt(2, 20);
      return {
        q: `125 × 8 × ${n} = `,
        a: 1000 * n,
        ops: [125, 8, n],
        op: "× ×",
      };
    },
    // a + b + c + d 凑整
    () => {
      const a = randomInt(10, 99) * 10;
      const b = randomInt(10, 99) * 10;
      const complement_a = Math.round((1000 - a) / 10) * 10;
      const complement_b = Math.round((1000 - b) / 10) * 10;
      return {
        q: `${a} + ${b} + ${complement_a} + ${complement_b} = `,
        a: a + b + complement_a + complement_b,
        ops: [a, b, complement_a, complement_b],
        op: "+ + +",
      };
    },
  ];

  const p = patterns[randomInt(0, patterns.length - 1)]();
  return {
    id: Date.now() + Math.random(),
    question: p.q,
    answer: p.a,
    operands: p.ops,
    operator: p.op,
    questionType: "direct",
    isDecimal: false,
  };
}

// 小数乘整数: 1.2×3
function generateDecimalMulWhole(): Question {
  const a = roundTo(randomInt(1, 20) / 10, 1); // 0.1 ~ 2.0
  const b = randomInt(2, 9);
  return {
    id: Date.now() + Math.random(),
    question: `${a.toFixed(1)} × ${b} = `,
    answer: roundTo(a * b, 1),
    operands: [a, b],
    operator: "×",
    questionType: "direct",
    isDecimal: true,
  };
}

// 估算题: 398+205≈?
function generateEstimation(config: GeneratorConfig): Question {
  const { minValue: min, maxValue: max } = config;
  const op = Math.random() < 0.5 ? "+" : "−";
  // 生成接近整十/整百的数
  const roundToNearest = max >= 1000 ? 100 : max >= 100 ? 10 : 10;
  const a = randomInt(min, max);
  const b = randomInt(min, max);

  const aRound = Math.round(a / roundToNearest) * roundToNearest;
  const bRound = Math.round(b / roundToNearest) * roundToNearest;
  const answer = op === "+" ? aRound + bRound : Math.max(aRound - bRound, 0);

  return {
    id: Date.now() + Math.random(),
    question: op === "+" ? `${a} + ${b} ≈ ` : `${a} − ${b} ≈ `,
    answer,
    operands: [a, b],
    operator: op === "+" ? "+" : "−",
    questionType: "estimation",
    isDecimal: false,
  };
}

// ============ 题型包装器 ============

function wrapAsFillBlank(q: Question): Question {
  if (q.operands.length < 2) return q;

  // 随机选择隐藏哪个操作数
  const blankIndex = randomInt(0, q.operands.length - 1);
  const displayOps = [...q.operands];

  let answer: number;
  if (q.operator === "+" || q.operator === "×") {
    // 加法/乘法: 隐藏任一操作数
    answer = q.operands[blankIndex];
    displayOps[blankIndex] = NaN;

    if (q.operator === "+") {
      return {
        ...q,
        question:
          blankIndex === 0
            ? `__ + ${displayOps[1]} = ${q.answer}`
            : `${displayOps[0]} + __ = ${q.answer}`,
        answer,
        blanks: [blankIndex],
        questionType: "fill_blank",
      };
    } else {
      return {
        ...q,
        question:
          blankIndex === 0
            ? `__ × ${displayOps[1]} = ${q.answer}`
            : `${displayOps[0]} × __ = ${q.answer}`,
        answer,
        blanks: [blankIndex],
        questionType: "fill_blank",
      };
    }
  } else if (q.operator === "−") {
    answer = q.operands[blankIndex];
    if (blankIndex === 0) {
      // __ - b = answer → __ = answer + b
      return {
        ...q,
        question: `__ − ${q.operands[1]} = ${q.answer}`,
        answer: q.operands[0],
        blanks: [0],
        questionType: "fill_blank",
      };
    } else {
      // a - __ = answer → __ = a - answer
      return {
        ...q,
        question: `${q.operands[0]} − __ = ${q.answer}`,
        answer: q.operands[1],
        blanks: [1],
        questionType: "fill_blank",
      };
    }
  } else if (q.operator === "÷") {
    if (blankIndex === 0) {
      return {
        ...q,
        question: `__ ÷ ${q.operands[1]} = ${q.answer}`,
        answer: q.operands[0],
        blanks: [0],
        questionType: "fill_blank",
      };
    } else {
      return {
        ...q,
        question: `${q.operands[0]} ÷ __ = ${q.answer}`,
        answer: q.operands[1],
        blanks: [1],
        questionType: "fill_blank",
      };
    }
  }

  return { ...q, questionType: "fill_blank" };
}

function wrapAsComparison(config: GeneratorConfig): Question {
  // 生成两个简单表达式并比较
  const maxVal = Math.min(config.maxValue, 100);
  const a = randomInt(config.minValue, maxVal);
  const b = randomInt(config.minValue, maxVal);
  const c = randomInt(config.minValue, maxVal);
  const d = randomInt(config.minValue, maxVal);

  // 用加减法
  const ops = ["+", "−"] as const;
  const op1 = ops[randomInt(0, 1)];
  const op2 = ops[randomInt(0, 1)];

  const left = op1 === "+" ? a + b : Math.max(a - b, 0);
  const right = op2 === "+" ? c + d : Math.max(c - d, 0);

  let answer: number;
  if (left < right) answer = -1;
  else if (left > right) answer = 1;
  else answer = 0;

  const opSymbols: Record<string, string> = { "+": "+", "−": "−" };
  const leftStr = `${a} ${opSymbols[op1]} ${b}`;
  const rightStr = `${c} ${opSymbols[op2]} ${d}`;

  return {
    id: Date.now() + Math.random(),
    question: `${leftStr} ○ ${rightStr}`,
    answer,
    operands: [left, right],
    operator: "○",
    questionType: "comparison",
    comparisonTarget: right,
    isDecimal: false,
  };
}

// ============ 主调度 ============

// 根据课程标准选择最适合的生成器
function getPatternGenerator(config: GeneratorConfig): () => Question {
  const entry = getCurriculum(config.semester);

  // 按学期和运算类型选择生成器
  const generators: (() => Question)[] = [];

  for (const op of config.operations) {
    switch (op) {
      case "addition":
        if (config.semester === "1A") {
          generators.push(() => generateWithin10(config));
        } else if (config.semester === "1B") {
          generators.push(
            () => generateWithin20Carry(),
            () => generateWholeTens(),
          );
        } else {
          generators.push(() => generateAddition(config));
        }
        break;
      case "subtraction":
        if (config.semester === "1A") {
          generators.push(() => generateWithin10(config));
        } else if (config.semester === "1B") {
          generators.push(
            () => generateWithin20Borrow(),
            () => generateWholeTens(),
          );
        } else {
          generators.push(() => generateSubtraction(config));
        }
        break;
      case "multiplication":
        if (
          entry.multiplicationTableMax > 0 &&
          entry.multiplicationTableMax <= 9
        ) {
          generators.push(() =>
            generateMultTable(entry.multiplicationTableMax),
          );
        }
        if (config.semester === "3A") {
          generators.push(
            () => generateMultiDigitBySingle(),
            () => generateMultiplesOf10BySingle(),
          );
        } else if (config.semester === "3B") {
          generators.push(
            () => generateTwoDigitByTwoDigit(),
            () => generateMultiplesOf10BySingle(),
          );
        } else if (config.semester === "4A") {
          generators.push(
            () => generateMultiplyBy10s(),
            () => generateMultiplesOf10ByMultiplesOf10(),
            () => generate3DigitBy2Digit(),
          );
        } else if (config.semester === "4B") {
          generators.push(
            () => generateMultiplyBy10s(),
            () => generateMultiplesOf10ByMultiplesOf10(),
            () => generate3DigitBy2Digit(),
          );
        } else if (config.semester === "2A" || config.semester === "2B") {
          // 乘法表已覆盖
        } else {
          generators.push(() => generateMultiplication(config));
        }
        break;
      case "division":
        if (config.semester === "2B") {
          generators.push(
            () => generateTableDivision(),
            config.allowRemainder
              ? () => generateDivisionWithRemainder()
              : () => generateTableDivision(),
          );
        } else if (config.semester === "3B") {
          generators.push(() => generateDivBySingle());
        } else if (config.semester === "4A" || config.semester === "4B") {
          generators.push(
            () => generate3DigitDiv2Digit(),
            () => generateDivBySingle(),
          );
        } else {
          generators.push(() => generateDivision(config));
        }
        break;
      case "decimal_add_sub":
        generators.push(() => generateSimpleDecimalAddSub());
        break;
      case "decimal_mul":
        generators.push(() => generateDecimalMulWhole());
        break;
      case "mixed":
        generators.push(
          () => generateOrderOfOperations(),
          () => generateOperationProperty(),
          () => generateConsecutiveAddSub(),
        );
        break;
    }
  }

  if (generators.length === 0) {
    generators.push(() => generateAddition(config));
  }

  return generators[randomInt(0, generators.length - 1)];
}

function generateSingleQuestion(config: GeneratorConfig): Question {
  // 随机选择题型
  const questionType =
    config.questionTypes[randomInt(0, config.questionTypes.length - 1)];

  if (questionType === "comparison") {
    return wrapAsComparison(config);
  }

  if (questionType === "estimation") {
    return generateEstimation(config);
  }

  // direct 或 fill_blank: 先用模式生成器生成基础题目
  const gen = getPatternGenerator(config);
  let q = gen();

  if (
    questionType === "fill_blank" &&
    q.operator !== "○" &&
    q.operator !== "(+)÷" &&
    q.operator !== "×(+)" &&
    q.operator !== "(-)×" &&
    !q.operator.includes(" ")
  ) {
    q = wrapAsFillBlank(q);
  }

  return q;
}

// 去重键
function questionToString(q: Question): string {
  if (q.questionType === "comparison") {
    return `cmp:${q.operands.join(",")}`;
  }
  if (q.questionType === "estimation") {
    return `est:${q.operands.join(q.operator)}:${q.questionType}`;
  }
  if (q.questionType === "fill_blank") {
    return `fb:${q.operands.join(q.operator)}:${q.blanks?.join(",")}`;
  }
  return `${q.operands.join(q.operator)}:${q.questionType}`;
}

export function generateQuestions(config: GeneratorConfig): Question[] {
  const { questionCount, uniqueQuestions } = config;
  const questions: Question[] = [];
  const questionSet = new Set<string>();

  let attempts = 0;
  const maxAttempts = questionCount * 20;

  while (questions.length < questionCount && attempts < maxAttempts) {
    attempts++;
    const question = generateSingleQuestion(config);

    if (uniqueQuestions) {
      const key = questionToString(question);
      if (questionSet.has(key)) continue;
      questionSet.add(key);
    }

    question.id = questions.length + 1;
    questions.push(question);
  }

  return questions;
}

// 验证答案
export function checkAnswer(question: Question, userAnswer: number): boolean {
  if (question.isDecimal) {
    return Math.abs(userAnswer - question.answer) < 0.01;
  }
  return question.answer === userAnswer;
}
