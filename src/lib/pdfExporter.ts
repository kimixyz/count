// PDF导出工具 — 支持多种题型

import jsPDF from "jspdf";
import { Question } from "./questionGenerator";

export interface PDFConfig {
  columns: number;
  rows?: number;
  showAnswers: boolean;
  separateAnswerPage: boolean;
  orientation: "portrait" | "landscape";
  pageSize: "a4" | "a5" | "letter";
  title: string;
  fontSize: number;
  showBorder: boolean;
}

export function getDefaultPDFConfig(): PDFConfig {
  return {
    columns: 3,
    showAnswers: false,
    separateAnswerPage: true,
    orientation: "portrait",
    pageSize: "a4",
    title: "口算练习",
    fontSize: 12,
    showBorder: false,
  };
}

const PT_TO_MM = 72 / 25.4; // ≈ 2.8346

// 把一道题完整渲染为一张 canvas 图片（文字 + 答题线/填空线）
// 返回 png data url 和 mm 尺寸
function renderQuestionToCanvas(
  q: Question,
  fontSizePt: number,
): { imgData: string; wMm: number; hMm: number } | null {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const scale = 3;
  const fontPx = fontSizePt * scale;
  const font = `bold ${fontPx}px "PingFang SC", "Microsoft YaHei", "SimHei", "STHeiti", sans-serif`;

  // 先测量整行的宽度
  ctx.font = font;

  // 根据题型构造绘制指令
  type DrawOp =
    | { type: "text"; text: string }
    | { type: "line"; lenMm: number; dark: boolean };
  const ops: DrawOp[] = [];

  // 答题线宽度(mm) — 用 areaWidthMm 的一部分
  const answerLineMm = Math.max(fontSizePt * 2.5, 15); // 至少 15mm

  if (q.questionType === "fill_blank") {
    // 填空题: "__ + 4 = 10" 或 "12 - __ = 8"
    // __ 位置画深色下划线(学生填写)，等号后面不再画线(答案已在题目中)
    const parts = q.question.split("__");
    if (parts[0] === "") {
      // "__ + 4 = 10" → [下划线] + 4 = 10
      ops.push({ type: "line", lenMm: answerLineMm, dark: true });
      ops.push({ type: "text", text: parts[1] });
    } else if (parts[1] === "") {
      // "12 + __ = " → 12 + [下划线] =
      ops.push({ type: "text", text: parts[0] });
      ops.push({ type: "line", lenMm: answerLineMm, dark: true });
    } else {
      // "12 - __ = 5" → 12 - [下划线] = 5
      ops.push({ type: "text", text: parts[0] });
      ops.push({ type: "line", lenMm: answerLineMm, dark: true });
      ops.push({ type: "text", text: parts[1] });
    }
  } else if (q.questionType === "comparison") {
    // 比较题: "32 + 15 ○ 50" → 渲染文本，○ 位置画空心圆
    ops.push({ type: "text", text: q.question });
  } else if (q.questionType === "estimation") {
    // 估算题: "398 + 205 ≈ " → 文本 + 答题线
    ops.push({ type: "text", text: q.question });
    ops.push({ type: "line", lenMm: answerLineMm, dark: true });
  } else {
    // 直接计算: "12 + 5 = " → 文本 + 答题线
    ops.push({ type: "text", text: q.question });
    ops.push({ type: "line", lenMm: answerLineMm, dark: true });
  }

  // 先测量总宽度
  const pxPerMm = (fontPx / fontSizePt) * PT_TO_MM;

  let totalW = 0;
  for (const op of ops) {
    if (op.type === "text") {
      totalW += ctx.measureText(op.text).width / pxPerMm;
    } else {
      totalW += op.lenMm;
    }
  }
  totalW += 4; // 右边留 4mm 余量

  // 设置 canvas 大小
  const pad = 4 * scale;
  const canvasW = Math.ceil(totalW * pxPerMm + pad * 2);
  const canvasH = Math.ceil(fontPx * 1.5 + pad * 2);
  canvas.width = canvasW;
  canvas.height = canvasH;

  // 重新设置（canvas resize 会重置状态）
  ctx.font = font;
  ctx.textBaseline = "middle";

  // 绘制
  let cursorPx = pad;
  const midY = canvasH / 2;

  for (const op of ops) {
    if (op.type === "text") {
      ctx.fillStyle = "#374151";
      ctx.fillText(op.text, cursorPx, midY);
      cursorPx += ctx.measureText(op.text).width;
    } else {
      // 画下划线
      const lineLenPx = op.lenMm * pxPerMm;
      const lineY = midY + fontPx * 0.35; // 文本基线偏下
      ctx.beginPath();
      ctx.strokeStyle = op.dark ? "#374151" : "#d1d5db";
      ctx.lineWidth = op.dark ? scale * 0.5 : scale * 0.3;
      ctx.moveTo(cursorPx + 2, lineY);
      ctx.lineTo(cursorPx + lineLenPx - 2, lineY);
      ctx.stroke();
      cursorPx += lineLenPx;
    }
  }

  // canvas → mm
  const wMm = canvas.width / pxPerMm;
  const hMm = canvas.height / pxPerMm;

  return {
    imgData: canvas.toDataURL("image/png"),
    wMm,
    hMm,
  };
}

// 用 canvas 渲染标题等纯文本
function textToImage(
  text: string,
  fontSizePt: number,
  color = "#374151",
): { imgData: string; wMm: number; hMm: number } | null {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const scale = 3;
  const fontPx = fontSizePt * scale;
  const font = `bold ${fontPx}px "PingFang SC", "Microsoft YaHei", "SimHei", "STHeiti", sans-serif`;
  ctx.font = font;
  const textW = ctx.measureText(text).width;

  const pad = 6 * scale;
  canvas.width = Math.ceil(textW + pad * 2);
  canvas.height = Math.ceil(fontPx * 1.4 + pad * 2);

  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textBaseline = "top";
  ctx.fillText(text, pad, pad);

  const pxPerMm = (fontPx / fontSizePt) * PT_TO_MM;
  return {
    imgData: canvas.toDataURL("image/png"),
    wMm: canvas.width / pxPerMm,
    hMm: canvas.height / pxPerMm,
  };
}

// 在 PDF 上绘制文本图片
function drawText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  fontSizePt: number,
  opts?: { align?: "left" | "center" | "right"; color?: string },
): number {
  const r = textToImage(text, fontSizePt, opts?.color);
  if (!r) return 0;
  const { imgData, wMm, hMm } = r;
  let fx = x;
  if (opts?.align === "center") fx = x - wMm / 2;
  else if (opts?.align === "right") fx = x - wMm;
  doc.addImage(imgData, "PNG", fx, y - hMm * 0.8, wMm, hMm);
  return wMm;
}

// 格式化答案
function formatAnswer(q: Question): string {
  if (q.questionType === "comparison") {
    const s: Record<number, string> = { [-1]: "<", [0]: "=", [1]: ">" };
    return `${q.id}. ${s[q.answer]}`;
  }
  if (q.remainder !== undefined && q.remainder > 0) {
    return `${q.id}. ${q.answer}...${q.remainder}`;
  }
  return `${q.id}. ${q.answer}`;
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
  } = config;

  const doc = new jsPDF({ orientation, unit: "mm", format: pageSize });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const headerH = 28;
  const contentW = pageW - 2 * margin;
  const contentH = pageH - 2 * margin - headerH;

  const colW = contentW / columns;
  const rowH = fontSize * 2.8;
  const rowsPerCol = rows || Math.floor(contentH / rowH);
  const qPerPage = rowsPerCol * columns;

  let qi = 0;

  while (qi < questions.length) {
    if (qi > 0) doc.addPage();

    // 第一页头部
    if (qi === 0) {
      drawText(doc, title, pageW / 2, margin + 8, fontSize + 2, {
        align: "center",
        color: "#1f2937",
      });
      const infoY = margin + 18;
      drawText(doc, "姓名：", margin, infoY, fontSize - 2, {
        color: "#6b7280",
      });
      doc.setLineWidth(0.2);
      doc.setDrawColor(180, 180, 180);
      doc.line(margin + 18, infoY + 0.5, margin + 52, infoY + 0.5);
      drawText(doc, "日期：", pageW - margin - 55, infoY, fontSize - 2, {
        color: "#6b7280",
      });
      doc.line(pageW - margin - 37, infoY + 0.5, pageW - margin, infoY + 0.5);
      doc.setDrawColor(0, 0, 0);
    }

    for (let i = 0; i < qPerPage && qi < questions.length; i++) {
      const q = questions[qi];
      const col = Math.floor(i / rowsPerCol);
      const row = i % rowsPerCol;
      const x = margin + col * colW + 4;
      const y = margin + headerH + 8 + row * rowH;

      // 整道题渲染为一张 canvas 图片
      const r = renderQuestionToCanvas(q, fontSize);
      if (r) {
        doc.addImage(r.imgData, "PNG", x, y - r.hMm * 0.8, r.wMm, r.hMm);
      }
      qi++;
    }
  }

  // 答案页
  if (separateAnswerPage && config.showAnswers) {
    doc.addPage();
    drawText(doc, "参考答案", pageW / 2, margin + 8, fontSize + 1, {
      align: "center",
      color: "#1f2937",
    });
    const ansCols = 10;
    const ansColW = contentW / ansCols;
    const ansRowH = fontSize * 1.8;
    const ansRowsPerCol = Math.floor((contentH - 5) / ansRowH);
    const ansPerPage = ansCols * ansRowsPerCol;

    questions.forEach((q, idx) => {
      if (idx > 0 && idx % ansPerPage === 0) {
        doc.addPage();
        drawText(doc, "参考答案（续）", pageW / 2, margin + 8, fontSize + 1, {
          align: "center",
          color: "#1f2937",
        });
      }
      const pi = idx % ansPerPage;
      const row = Math.floor(pi / ansCols);
      const col = pi % ansCols;
      const x = margin + col * ansColW;
      const y = margin + headerH + row * ansRowH;
      drawText(doc, formatAnswer(q), x, y, fontSize - 2, { color: "#374151" });
    });
  }

  const fileName = `${title}_${new Date().toLocaleDateString("zh-CN").replace(/\//g, "-")}.pdf`;
  doc.save(fileName);
}
