// 题目生成器

export type OperationType = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed';
export type GradeLevel = 1 | 2 | 3 | 4;
export type DifficultyLevel = 'basic' | 'intermediate' | 'advanced';

export interface Question {
  id: number;
  question: string;
  answer: number;
  operands: number[];
  operator: string;
}

export interface GeneratorConfig {
  grade: GradeLevel;
  difficulty: DifficultyLevel;
  operations: OperationType[];
  questionCount: number;
  minValue: number;
  maxValue: number;
  // 新增配置项
  allowCarry?: boolean; // 加法是否允许进位
  allowBorrow?: boolean; // 减法是否允许借位
  allowRemainder?: boolean; // 除法是否允许余数
  allowNegative?: boolean; // 减法是否允许负数
  uniqueQuestions?: boolean; // 是否去重
  multiplicationTable?: number; // 指定乘法口诀表范围
}

// 根据年级获取默认数值范围和推荐配置
export function getDefaultRange(grade: GradeLevel): { min: number; max: number } {
  const ranges = {
    1: { min: 1, max: 20 },  // 一年级：20以内
    2: { min: 1, max: 100 }, // 二年级：100以内
    3: { min: 1, max: 1000 }, // 三年级：1000以内
    4: { min: 1, max: 10000 } // 四年级及以上
  };
  return ranges[grade];
}

// 根据年级和难度获取推荐配置
export function getRecommendedConfig(grade: GradeLevel, difficulty: DifficultyLevel): Partial<GeneratorConfig> {
  const baseConfig = {
    grade,
    difficulty,
    ...getDefaultRange(grade),
  };

  // 一年级
  if (grade === 1) {
    if (difficulty === 'basic') {
      return { ...baseConfig, operations: ['addition'], maxValue: 10, allowCarry: false };
    } else if (difficulty === 'intermediate') {
      return { ...baseConfig, operations: ['addition', 'subtraction'], maxValue: 20, allowCarry: true };
    } else {
      return { ...baseConfig, operations: ['addition', 'subtraction'], maxValue: 20 };
    }
  }

  // 二年级
  if (grade === 2) {
    if (difficulty === 'basic') {
      return { ...baseConfig, operations: ['addition', 'subtraction'], maxValue: 100, allowCarry: false };
    } else if (difficulty === 'intermediate') {
      return { ...baseConfig, operations: ['addition', 'subtraction', 'multiplication'], multiplicationTable: 5 };
    } else {
      return { ...baseConfig, operations: ['addition', 'subtraction', 'multiplication'], multiplicationTable: 9 };
    }
  }

  // 三年级
  if (grade === 3) {
    if (difficulty === 'basic') {
      return { ...baseConfig, operations: ['multiplication'], multiplicationTable: 9 };
    } else if (difficulty === 'intermediate') {
      return { ...baseConfig, operations: ['multiplication', 'division'], allowRemainder: false };
    } else {
      return { ...baseConfig, operations: ['mixed'], allowRemainder: true };
    }
  }

  // 四年级及以上
  return { ...baseConfig, operations: ['mixed'], allowRemainder: true };
}

// 生成随机整数
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成加法题
function generateAddition(min: number, max: number, config?: GeneratorConfig): Question {
  const allowCarry = config?.allowCarry !== false; // 默认允许进位
  
  let a: number, b: number;
  let attempts = 0;
  const maxAttempts = 100;
  
  do {
    a = randomInt(min, max);
    b = randomInt(min, max);
    attempts++;
    
    // 检查是否符合进位要求
    if (!allowCarry) {
      // 不允许进位时，个位相加不能超过10
      const onesA = a % 10;
      const onesB = b % 10;
      if (onesA + onesB >= 10) continue;
      
      // 十位相加也不能超过10（对于两位数）
      if (a >= 10 && b >= 10) {
        const tensA = Math.floor((a % 100) / 10);
        const tensB = Math.floor((b % 100) / 10);
        if (tensA + tensB >= 10) continue;
      }
    }
    
    break;
  } while (attempts < maxAttempts);
  
  return {
    id: Date.now() + Math.random(),
    question: `${a} + ${b} = `,
    answer: a + b,
    operands: [a, b],
    operator: '+'
  };
}

// 生成减法题（确保结果非负）
function generateSubtraction(min: number, max: number, config?: GeneratorConfig): Question {
  const allowBorrow = config?.allowBorrow !== false; // 默认允许借位
  const allowNegative = config?.allowNegative || false; // 默认不允许负数
  
  let a: number, b: number;
  let attempts = 0;
  const maxAttempts = 100;
  
  do {
    a = randomInt(min, max);
    b = randomInt(min, max);
    attempts++;
    
    // 确保不为负数（除非允许）
    if (!allowNegative && a < b) {
      [a, b] = [b, a];
    }
    
    // 检查是否符合借位要求
    if (!allowBorrow && a >= b) {
      // 不允许借位时，每位相减都要够
      const aStr = String(a);
      const bStr = String(b).padStart(aStr.length, '0');
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
  } while (attempts < maxAttempts);
  
  return {
    id: Date.now() + Math.random(),
    question: `${a} - ${b} = `,
    answer: a - b,
    operands: [a, b],
    operator: '-'
  };
}

// 生成乘法题
function generateMultiplication(min: number, max: number, config?: GeneratorConfig): Question {
  const tableLimit = config?.multiplicationTable || 9; // 默认9以内乘法表
  
  // 对于乘法，限制乘数范围
  const a = randomInt(Math.max(min, 1), Math.min(max, 100));
  const b = randomInt(2, Math.min(tableLimit, 9));
  
  return {
    id: Date.now() + Math.random(),
    question: `${a} × ${b} = `,
    answer: a * b,
    operands: [a, b],
    operator: '×'
  };
}

// 生成除法题
function generateDivision(min: number, max: number, config?: GeneratorConfig): Question {
  const allowRemainder = config?.allowRemainder || false; // 默认不允许余数
  
  if (allowRemainder) {
    // 允许余数
    const divisor = randomInt(2, Math.min(max, 20));
    const dividend = randomInt(divisor, Math.min(max, 100));
    const quotient = Math.floor(dividend / divisor);
    const remainder = dividend % divisor;
    
    return {
      id: Date.now() + Math.random(),
      question: remainder > 0 ? `${dividend} ÷ ${divisor} = ` : `${dividend} ÷ ${divisor} = `,
      answer: quotient,
      operands: [dividend, divisor],
      operator: '÷'
    };
  } else {
    // 不允许余数，确保整除
    const divisor = randomInt(2, Math.min(max, 20));
    const quotient = randomInt(1, Math.floor(max / divisor));
    const dividend = divisor * quotient;
    
    return {
      id: Date.now() + Math.random(),
      question: `${dividend} ÷ ${divisor} = `,
      answer: quotient,
      operands: [dividend, divisor],
      operator: '÷'
    };
  }
}

// 生成混合运算题（包含2-3个运算符）
function generateMixedOperation(min: number, max: number, config?: GeneratorConfig): Question {
  // 随机选择2-3个数字
  const numCount = Math.random() < 0.5 ? 2 : 3; // 50%概率2个数，50%概率3个数
  const numbers: number[] = [];
  
  for (let i = 0; i < numCount; i++) {
    numbers.push(randomInt(Math.max(min, 1), Math.min(max, 20))); // 混合运算使用较小的数字
  }
  
  // 随机选择运算符
  const operators = ['+', '-', '×', '÷'];
  const selectedOps: string[] = [];
  
  for (let i = 0; i < numCount - 1; i++) {
    // 确保至少有两种不同的运算符
    const op = operators[Math.floor(Math.random() * operators.length)];
    selectedOps.push(op);
  }
  
  // 如果所有运算符相同，随机替换一个
  if (selectedOps.length > 1 && selectedOps.every(op => op === selectedOps[0])) {
    const replaceIndex = Math.floor(Math.random() * selectedOps.length);
    const otherOps = operators.filter(op => op !== selectedOps[0]);
    selectedOps[replaceIndex] = otherOps[Math.floor(Math.random() * otherOps.length)];
  }
  
  // 构建表达式并计算结果
  let expression = numbers[0].toString();
  let result = numbers[0];
  
  for (let i = 0; i < selectedOps.length; i++) {
    const op = selectedOps[i];
    const num = numbers[i + 1];
    expression += ` ${op} ${num}`;
    
    // 按运算符优先级计算（先乘除后加减）
    switch (op) {
      case '+':
        result += num;
        break;
      case '-':
        result -= num;
        break;
      case '×':
        result *= num;
        break;
      case '÷':
        // 确保能整除
        if (result % num !== 0) {
          // 调整结果使其能整除
          result = Math.floor(result / num) * num;
        }
        result = result / num;
        break;
    }
  }
  
  // 确保结果为正整数
  result = Math.round(Math.max(0, result));
  
  return {
    id: Date.now() + Math.random(),
    question: `${expression} = `,
    answer: result,
    operands: numbers,
    operator: selectedOps.join(' ')
  };
}

// 根据题型生成单个题目
function generateSingleQuestion(
  operation: OperationType,
  min: number,
  max: number,
  config?: GeneratorConfig
): Question {
  const operations = {
    'addition': generateAddition,
    'subtraction': generateSubtraction,
    'multiplication': generateMultiplication,
    'division': generateDivision
  };

  if (operation === 'mixed') {
    return generateMixedOperation(min, max, config);
  }

  return operations[operation](min, max, config);
}

// 生成题目的字符串表示（用于去重）
function questionToString(q: Question): string {
  return `${q.operands.join(q.operator)}`;
}

// 生成题目列表
export function generateQuestions(config: GeneratorConfig): Question[] {
  const { operations, questionCount, minValue, maxValue, uniqueQuestions } = config;
  const questions: Question[] = [];
  const questionSet = new Set<string>();
  
  let attempts = 0;
  const maxAttempts = questionCount * 10; // 防止无限循环
  
  while (questions.length < questionCount && attempts < maxAttempts) {
    attempts++;
    
    // 如果有多种题型，随机选择一种
    const operation = operations[Math.floor(Math.random() * operations.length)];
    const question = generateSingleQuestion(operation, minValue, maxValue, config);
    
    // 如果需要去重
    if (uniqueQuestions) {
      const questionStr = questionToString(question);
      if (questionSet.has(questionStr)) {
        continue; // 跳过重复题目
      }
      questionSet.add(questionStr);
    }
    
    question.id = questions.length + 1;
    questions.push(question);
  }
  
  return questions;
}

// 验证答案
export function checkAnswer(question: Question, userAnswer: number): boolean {
  return question.answer === userAnswer;
}
