// 人教版 2022 新课标 —— 口算课程标准数据表

export type SemesterKey = '1A' | '1B' | '2A' | '2B' | '3A' | '3B' | '4A' | '4B';

export type QuestionType = 'direct' | 'fill_blank' | 'comparison' | 'estimation';

export type OperationCategory =
  | 'addition' | 'subtraction' | 'multiplication' | 'division'
  | 'mixed' | 'decimal_add_sub' | 'decimal_mul';

export interface CurriculumEntry {
  key: SemesterKey;
  label: string;
  grade: number;
  semester: number;
  operations: OperationCategory[];
  questionTypes: QuestionType[];
  range: { min: number; max: number };
  allowCarry: boolean;
  allowBorrow: boolean;
  allowRemainder: boolean;
  allowDecimals: boolean;
  decimalPlaces: number;
  multiplicationTableMax: number;
}

export const CURRICULUM: Record<SemesterKey, CurriculumEntry> = {
  '1A': {
    key: '1A', label: '一年级上册', grade: 1, semester: 1,
    operations: ['addition', 'subtraction'],
    questionTypes: ['direct', 'fill_blank'],
    range: { min: 1, max: 10 },
    allowCarry: false, allowBorrow: false, allowRemainder: false,
    allowDecimals: false, decimalPlaces: 0,
    multiplicationTableMax: 0,
  },
  '1B': {
    key: '1B', label: '一年级下册', grade: 1, semester: 2,
    operations: ['addition', 'subtraction'],
    questionTypes: ['direct', 'fill_blank'],
    range: { min: 1, max: 20 },
    allowCarry: true, allowBorrow: true, allowRemainder: false,
    allowDecimals: false, decimalPlaces: 0,
    multiplicationTableMax: 0,
  },
  '2A': {
    key: '2A', label: '二年级上册', grade: 2, semester: 1,
    operations: ['addition', 'subtraction', 'multiplication'],
    questionTypes: ['direct', 'fill_blank'],
    range: { min: 1, max: 100 },
    allowCarry: true, allowBorrow: true, allowRemainder: false,
    allowDecimals: false, decimalPlaces: 0,
    multiplicationTableMax: 6,
  },
  '2B': {
    key: '2B', label: '二年级下册', grade: 2, semester: 2,
    operations: ['addition', 'subtraction', 'multiplication', 'division'],
    questionTypes: ['direct', 'fill_blank'],
    range: { min: 1, max: 100 },
    allowCarry: true, allowBorrow: true, allowRemainder: true,
    allowDecimals: false, decimalPlaces: 0,
    multiplicationTableMax: 9,
  },
  '3A': {
    key: '3A', label: '三年级上册', grade: 3, semester: 1,
    operations: ['addition', 'subtraction', 'multiplication'],
    questionTypes: ['direct', 'fill_blank', 'estimation'],
    range: { min: 1, max: 10000 },
    allowCarry: true, allowBorrow: true, allowRemainder: false,
    allowDecimals: false, decimalPlaces: 0,
    multiplicationTableMax: 9,
  },
  '3B': {
    key: '3B', label: '三年级下册', grade: 3, semester: 2,
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'decimal_add_sub'],
    questionTypes: ['direct', 'fill_blank', 'estimation'],
    range: { min: 1, max: 10000 },
    allowCarry: true, allowBorrow: true, allowRemainder: true,
    allowDecimals: true, decimalPlaces: 1,
    multiplicationTableMax: 9,
  },
  '4A': {
    key: '4A', label: '四年级上册', grade: 4, semester: 1,
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'decimal_add_sub'],
    questionTypes: ['direct', 'fill_blank', 'comparison', 'estimation'],
    range: { min: 1, max: 100000 },
    allowCarry: true, allowBorrow: true, allowRemainder: true,
    allowDecimals: true, decimalPlaces: 2,
    multiplicationTableMax: 9,
  },
  '4B': {
    key: '4B', label: '四年级下册', grade: 4, semester: 2,
    operations: ['addition', 'subtraction', 'multiplication', 'division',
                 'decimal_add_sub', 'decimal_mul', 'mixed'],
    questionTypes: ['direct', 'fill_blank', 'comparison', 'estimation'],
    range: { min: 1, max: 100000 },
    allowCarry: true, allowBorrow: true, allowRemainder: true,
    allowDecimals: true, decimalPlaces: 2,
    multiplicationTableMax: 9,
  },
};

export const SEMESTER_KEYS: SemesterKey[] = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B'];

export function getCurriculum(key: SemesterKey): CurriculumEntry {
  return CURRICULUM[key];
}

export function getSemesterKey(grade: number, semester: number): SemesterKey {
  return `${grade}${semester === 1 ? 'A' : 'B'}` as SemesterKey;
}
