// PDF导出工具 — 支持多种题型

import jsPDF from 'jspdf';
import { Question } from './questionGenerator';

export interface PDFConfig {
  columns: number;
  rows?: number;
  showAnswers: boolean;
  separateAnswerPage: boolean;
  orientation: 'portrait' | 'landscape';
  pageSize: 'a4' | 'a5' | 'letter';
  title: string;
  fontSize: number;
  showBorder: boolean;
}

export function getDefaultPDFConfig(): PDFConfig {
  return {
    columns: 4,
    showAnswers: false,
    separateAnswerPage: true,
    orientation: 'portrait',
    pageSize: 'a4',
    title: '口算练习',
    fontSize: 12,
    showBorder: false,
  };
}

// 使用 canvas 绘制中文文本
function drawChineseText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options?: { align?: 'left' | 'center' | 'right'; fontSize?: number }
) {
  const fontSize = options?.fontSize || 12;
  const align = options?.align || 'left';

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.font = `bold ${fontSize * 3}px "PingFang SC", "Microsoft YaHei", "SimHei", "STHeiti", sans-serif`;
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;

  const scale = 2;
  canvas.width = (textWidth + 20) * scale;
  canvas.height = fontSize * 5 * scale;

  ctx.scale(scale, scale);
  ctx.font = `bold ${fontSize * 3}px "PingFang SC", "Microsoft YaHei", "SimHei", "STHeiti", sans-serif`;
  ctx.fillStyle = 'black';
  ctx.textBaseline = 'top';
  ctx.fillText(text, 10, 10);

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = textWidth / 3.5;
  const imgHeight = fontSize * 1.2;

  let finalX = x;
  if (align === 'center') {
    finalX = x - imgWidth / 2;
  } else if (align === 'right') {
    finalX = x - imgWidth;
  }

  doc.addImage(imgData, 'PNG', finalX, y - imgHeight / 2, imgWidth, imgHeight);
}

// 渲染单个题目到 PDF
function renderQuestionToPDF(
  doc: jsPDF,
  q: Question,
  x: number,
  y: number,
  columnWidth: number,
  fontSize: number,
  showBorder: boolean
) {
  doc.setFontSize(fontSize);

  if (q.questionType === 'comparison') {
    // 比较题: "a ○ b" 形式
    const leftPart = `${q.operands[0]}`;
    const rightPart = `${q.operands[1]}`;

    // 在中间绘制一个空心圆
    const questionText = q.question;
    doc.text(questionText, x, y);

    // 在 ○ 的位置画一个小圆圈
    const leftWidth = doc.getTextWidth(leftPart + ' ');
    const circleX = x + leftWidth + 2;
    const circleR = fontSize * 0.3;
    doc.setLineWidth(0.4);
    doc.circle(circleX, y - circleR * 0.3, circleR);

    // 恢复黑色
    doc.setDrawColor(0, 0, 0);
  } else if (q.questionType === 'fill_blank') {
    // 填空题: 渲染文本，空白处用方框替代
    const parts = q.question.split('__');
    let currentX = x;

    if (parts[0]) {
      doc.text(parts[0], currentX, y);
      currentX += doc.getTextWidth(parts[0]);
    }

    // 绘制空白方框
    const boxWidth = fontSize * 1.5;
    const boxHeight = fontSize * 0.8;
    doc.setLineWidth(0.3);
    doc.setDrawColor(180, 180, 180);
    doc.rect(currentX + 1, y - boxHeight + 1, boxWidth, boxHeight);
    doc.setDrawColor(0, 0, 0);
    currentX += boxWidth + 3;

    if (parts[1]) {
      doc.text(parts[1], currentX, y);
    }
  } else {
    // 直接计算 / 估算题
    const questionText = q.question;
    doc.text(questionText, x, y);
  }

  // 答题线
  const questionText = q.question;
  const lineStartX = x + doc.getTextWidth(questionText.replace('__', '    ')) + 2;
  const lineEndX = x + columnWidth - 8;
  doc.setLineWidth(0.3);
  doc.line(lineStartX, y, Math.min(lineEndX, x + columnWidth - 8), y);

  // 边框（可选）
  if (showBorder) {
    doc.setLineWidth(0.1);
    doc.setDrawColor(200, 200, 200);
    doc.rect(x - 2, y - fontSize * 0.6, columnWidth - 2, fontSize * 1.2);
    doc.setDrawColor(0, 0, 0);
  }
}

export function exportToPDF(questions: Question[], config: PDFConfig) {
  const {
    columns,
    rows,
    separateAnswerPage,
    orientation,
    pageSize,
    title,
    fontSize,
    showBorder,
  } = config;

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: pageSize,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const headerHeight = 30;
  const contentWidth = pageWidth - 2 * margin;
  const contentHeight = pageHeight - 2 * margin - headerHeight;

  const columnWidth = contentWidth / columns;
  const questionsPerColumn = rows || Math.floor(contentHeight / (fontSize * 1.8));
  const questionsPerPage = questionsPerColumn * columns;
  const rowHeight = contentHeight / questionsPerColumn;

  let questionIndex = 0;

  // 绘制题目页
  while (questionIndex < questions.length) {
    if (questionIndex > 0) {
      doc.addPage();
    }

    // 第一页显示标题和姓名日期
    if (questionIndex === 0) {
      drawChineseText(doc, title, pageWidth / 2, margin + 8, {
        align: 'center',
        fontSize: fontSize - 4,
      });

      const nameY = margin + 18;
      const nameLabelWidth = 10;
      const dateX = pageWidth - margin - 50;

      drawChineseText(doc, '姓名：', margin, nameY, { fontSize: fontSize - 4 });
      doc.setLineWidth(0.3);
      doc.line(margin + nameLabelWidth + 6, nameY + 3, margin + 50, nameY + 3);

      drawChineseText(doc, '日期：', dateX, nameY, { fontSize: fontSize - 4 });
      doc.line(dateX + nameLabelWidth + 6, nameY + 3, pageWidth - margin, nameY + 3);
    }

    doc.setFontSize(fontSize);

    for (let i = 0; i < questionsPerPage && questionIndex < questions.length; i++) {
      const q = questions[questionIndex];
      const col = Math.floor(i / questionsPerColumn);
      const row = i % questionsPerColumn;

      const x = margin + col * columnWidth + 3;
      const y = margin + headerHeight + 5 + row * rowHeight;

      renderQuestionToPDF(doc, q, x, y, columnWidth, fontSize, showBorder);
      questionIndex++;
    }
  }

  // 答案页
  if (separateAnswerPage && config.showAnswers) {
    doc.addPage();

    drawChineseText(doc, '参考答案', pageWidth / 2, margin + 8, {
      align: 'center',
      fontSize: fontSize - 2,
    });

    const answersPerRow = 10;
    const answerColumnWidth = contentWidth / answersPerRow;
    const answerRowHeight = fontSize * 1.5;
    const answersPerColumn = Math.floor((contentHeight - 5) / answerRowHeight);
    const answersPerPage = answersPerRow * answersPerColumn;

    doc.setFontSize(fontSize);

    questions.forEach((q, index) => {
      if (index > 0 && index % answersPerPage === 0) {
        doc.addPage();
        drawChineseText(doc, '参考答案（续）', pageWidth / 2, margin + 8, {
          align: 'center',
          fontSize: fontSize - 2,
        });
        doc.setFontSize(fontSize);
      }

      const pageIndex = index % answersPerPage;
      const row = Math.floor(pageIndex / answersPerRow);
      const col = pageIndex % answersPerRow;

      const x = margin + col * answerColumnWidth;
      const y = margin + headerHeight + row * answerRowHeight;

      // 根据题型格式化答案
      let answerStr: string;
      if (q.questionType === 'comparison') {
        const symbols: Record<number, string> = { [-1]: '<', [0]: '=', [1]: '>' };
        answerStr = `${q.id}. ${symbols[q.answer]}`;
      } else if (q.remainder !== undefined && q.remainder > 0) {
        answerStr = `${q.id}. ${q.answer}...${q.remainder}`;
      } else {
        answerStr = `${q.id}. ${q.answer}`;
      }

      doc.text(answerStr, x, y);
    });
  }

  // 保存PDF
  const fileName = `${title}_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
}
