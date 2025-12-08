// PDF导出工具

import jsPDF from 'jspdf';
import { Question } from './questionGenerator';

export interface PDFConfig {
  columns: number; // 列数
  rows?: number; // 每页行数（可选）
  showAnswers: boolean; // 是否显示答案
  separateAnswerPage: boolean; // 是否在独立页面显示答案
  orientation: 'portrait' | 'landscape'; // 纸张方向
  pageSize: 'a4' | 'a5' | 'letter'; // 纸张大小
  title: string; // 标题
  fontSize: number; // 字体大小
  showBorder: boolean; // 是否显示边框
}

// 获取默认配置
export function getDefaultPDFConfig(): PDFConfig {
  return {
    columns: 4,
    showAnswers: false,
    separateAnswerPage: true,
    orientation: 'portrait',
    pageSize: 'a4',
    title: '口算练习',
    fontSize: 12,
    showBorder: false
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
  
  // 创建临时 canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // 设置字体 - 使用更好的中文字体
  ctx.font = `bold ${fontSize * 3}px "PingFang SC", "Microsoft YaHei", "SimHei", "STHeiti", sans-serif`;
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  
  // 设置 canvas 大小
  const scale = 2; // 提高清晰度
  canvas.width = (textWidth + 20) * scale;
  canvas.height = fontSize * 5 * scale;
  
  // 重新设置字体（canvas 重置后需要）
  ctx.scale(scale, scale);
  ctx.font = `bold ${fontSize * 3}px "PingFang SC", "Microsoft YaHei", "SimHei", "STHeiti", sans-serif`;
  ctx.fillStyle = 'black';
  ctx.textBaseline = 'top';
  ctx.fillText(text, 10, 10);
  
  // 将 canvas 转换为图片并添加到 PDF
  const imgData = canvas.toDataURL('image/png');
  const imgWidth = textWidth / 3.5; // 转换为 mm
  const imgHeight = fontSize * 1.2; // 转换为 mm
  
  // 计算对齐位置
  let finalX = x;
  if (align === 'center') {
    finalX = x - imgWidth / 2;
  } else if (align === 'right') {
    finalX = x - imgWidth;
  }
  
  doc.addImage(imgData, 'PNG', finalX, y - imgHeight / 2, imgWidth, imgHeight);
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
    showBorder
  } = config;
  
  // 创建PDF文档
  const doc = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: pageSize
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const headerHeight = 30;
  const contentWidth = pageWidth - 2 * margin;
  const contentHeight = pageHeight - 2 * margin - headerHeight;

  // 计算布局
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
      // 绘制标题 - 使用 canvas 支持中文
      drawChineseText(doc, title, pageWidth / 2, margin + 8, { 
        align: 'center', 
        fontSize: fontSize - 4
      });

      // 绘制姓名和日期栏
      const nameY = margin + 18;
      const nameLabelWidth = 10; // 姓名：标签宽度
      const dateX = pageWidth - margin - 50; // 日期标签起始位置
      
      drawChineseText(doc, '姓名：', margin, nameY, { fontSize: fontSize - 4 });
      doc.setLineWidth(0.3);
      doc.line(margin + nameLabelWidth + 6, nameY + 3, margin + 50, nameY + 3);
      
      drawChineseText(doc, '日期：', dateX, nameY, { fontSize: fontSize - 4 });
      doc.line(dateX + nameLabelWidth + 6, nameY + 3, pageWidth - margin, nameY + 3);
    }

    // 绘制题目
    doc.setFontSize(fontSize);
    
    for (let i = 0; i < questionsPerPage && questionIndex < questions.length; i++) {
      const q = questions[questionIndex];
      const col = Math.floor(i / questionsPerColumn);
      const row = i % questionsPerColumn;
      
      const x = margin + col * columnWidth + 3;
      const y = margin + headerHeight + 5 + row * rowHeight;

      // 题目（不显示序号）
      const questionText = q.question;
      doc.text(questionText, x, y);

      // 答题线
      const lineStartX = x + doc.getTextWidth(questionText) + 2;
      const lineEndX = x + columnWidth - 8;
      doc.setLineWidth(0.3);
      doc.line(lineStartX, y, Math.min(lineEndX, x + columnWidth - 8), y);

      // 边框（可选）
      if (showBorder) {
        doc.setLineWidth(0.1);
        doc.setDrawColor(200, 200, 200);
        doc.rect(x - 2, y - rowHeight * 0.6, columnWidth - 2, rowHeight - 2);
        doc.setDrawColor(0, 0, 0);
      }

      questionIndex++;
    }
  }

  // 答案页（只在配置中显示答案时才导出）
  if (separateAnswerPage && config.showAnswers) {
    doc.addPage();
    
    // 答案页标题
    drawChineseText(doc, '参考答案', pageWidth / 2, margin + 8, { 
      align: 'center', 
      fontSize: fontSize - 2 
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
          fontSize: fontSize - 2 
        });
        doc.setFontSize(fontSize);
      }
      
      const pageIndex = index % answersPerPage;
      const row = Math.floor(pageIndex / answersPerRow);
      const col = pageIndex % answersPerRow;
      
      const x = margin + col * answerColumnWidth;
      const y = margin + headerHeight + row * answerRowHeight;
      
      doc.text(`${q.id}. ${q.answer}`, x, y);
    });
  }

  // 保存PDF
  const fileName = `${title}_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
}
