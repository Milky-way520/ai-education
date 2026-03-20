const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        Header, Footer, AlignmentType, PageOrientation, LevelFormat, 
        TableOfContents, HeadingLevel, BorderStyle, WidthType, 
        ShadingType, VerticalAlign, PageNumber, PageBreak } = require('docx');
const fs = require('fs');

// 颜色方案 - 学术风格
const colors = {
  primary: "#1A1F16",
  body: "#2D3329",
  secondary: "#4A5548",
  accent: "#94A3B8",
  tableBg: "#F8FAF7",
  headerBg: "#E8EDE6"
};

// 表格边框
const tableBorder = { style: BorderStyle.SINGLE, size: 12, color: colors.primary };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL } };

const doc = new Document({
  styles: {
    default: { document: { run: { font: "SimSun", size: 24 } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal",
        run: { size: 56, bold: true, color: colors.primary, font: "SimHei" },
        paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.CENTER } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, color: colors.primary, font: "SimHei" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, color: colors.secondary, font: "SimHei" },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: colors.body, font: "SimHei" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } }
    ]
  },
  numbering: {
    config: [
      { reference: "bullet-list", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "num-1", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "num-2", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "num-3", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "num-4", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "num-5", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }
    ]
  },
  sections: [{
    properties: {
      page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
    },
    headers: {
      default: new Header({ children: [new Paragraph({ 
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "\u7231\u7684\u6559\u80b2 - \u9879\u76ee\u89c4\u5212\u6587\u6863", font: "SimSun", size: 18, color: colors.secondary })]
      })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({ 
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "\u2014 ", font: "SimSun", size: 20 }), new TextRun({ children: [PageNumber.CURRENT], font: "SimSun", size: 20 }), new TextRun({ text: " \u2014", font: "SimSun", size: 20 })]
      })] })
    },
    children: [
      // 标题
      new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun("\u7231\uff08AI\uff09\u7684\u6559\u80b2")] }),
      new Paragraph({ 
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [new TextRun({ text: "\u9879\u76ee\u89c4\u5212\u4e66", font: "SimHei", size: 28, color: colors.secondary })]
      }),
      new Paragraph({ 
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
        children: [new TextRun({ text: "AI\u9a71\u52a8\u7684\u667a\u80fd\u5b66\u4e60\u52a9\u624b\u5f00\u6e90\u9879\u76ee", font: "SimSun", size: 22, color: colors.accent })]
      }),

      // 目录
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("\u76ee\u5f55")] }),
      new TableOfContents("\u76ee\u5f55", { hyperlink: true, headingStyleRange: "1-3" }),
      new Paragraph({ 
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "\uff08\u53f3\u952e\u70b9\u51fb\u76ee\u5f55\uff0c\u9009\u62e9\u201c\u66f4\u65b0\u57df\u201d\u4ee5\u663e\u793a\u6b63\u786e\u9875\u7801\uff09", font: "SimSun", size: 18, color: "999999" })]
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // 第一章
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("\u4e00\u3001\u9879\u76ee\u6982\u8ff0")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.1 \u9879\u76ee\u80cc\u666f")] }),
      new Paragraph({ 
        indent: { firstLine: 480 },
        spacing: { line: 250 },
        children: [new TextRun({ text: "\u5728\u5f53\u4eca\u6570\u5b57\u5316\u65f6\u4ee3\uff0c\u4eba\u5de5\u667a\u80fd\u6280\u672f\u6b63\u5728\u6df1\u523b\u5730\u6539\u53d8\u7740\u6211\u4eec\u7684\u5b66\u4e60\u65b9\u5f0f\u3002\u4f20\u7edf\u7684\u6559\u80b2\u6a21\u5f0f\u5f80\u5f80\u9762\u4e34\u7740\u4e2a\u6027\u5316\u4e0d\u8db3\u3001\u89e3\u611f\u7387\u4f4e\u3001\u8d44\u6e90\u5206\u914d\u4e0d\u5747\u7b49\u95ee\u9898\u3002\u5f53\u5b66\u4e60\u8005\u5728\u5b66\u4e60\u8fc7\u7a0b\u4e2d\u9047\u5230\u96be\u4ee5\u7406\u89e3\u7684\u77e5\u8bc6\u70b9\u6216\u9898\u76ee\u65f6\uff0c\u5f80\u5f80\u96be\u4ee5\u83b7\u5f97\u53ca\u65f6\u3001\u4e13\u4e1a\u7684\u89e3\u7b54\u3002\u201c\u7231\u7684\u6559\u80b2\u201d\u9879\u76ee\u5e94\u8fd0\u800c\u751f\uff0c\u81f4\u529b\u4e8e\u5229\u7528AI\u6280\u672f\u4e3a\u5b66\u4e60\u8005\u63d0\u4f9b\u4e2a\u6027\u5316\u3001\u9ad8\u6548\u7684\u5b66\u4e60\u8f85\u52a9\u670d\u52a1\u3002", font: "SimSun", size: 24 })]
      }),
      new Paragraph({ 
        indent: { firstLine: 480 },
        spacing: { line: 250 },
        children: [new TextRun({ text: "\u672c\u9879\u76ee\u7684\u6838\u5fc3\u7406\u5ff5\u662f\u5c06AI\u7684\u6587\u5b57\u7406\u89e3\u80fd\u529b\u4e0e\u89c6\u9891\u751f\u6210\u80fd\u529b\u76f8\u7ed3\u5408\uff0c\u521b\u9020\u4e00\u79cd\u5168\u65b0\u7684\u5b66\u4e60\u4f53\u9a8c\u3002\u5f53\u7528\u6237\u4e0a\u4f20\u96be\u9898\u3001\u77e5\u8bc6\u70b9\u6216\u5176\u4ed6\u5b66\u4e60\u5185\u5bb9\u65f6\uff0c\u7cfb\u7edf\u9996\u5148\u901a\u8fc7\u7406\u89e3\u578bAI\uff081.AI\uff09\u8fdb\u884c\u6df1\u5ea6\u5206\u6790\u548c\u89e3\u8bfb\uff0c\u7136\u540e\u5c06\u7406\u89e3\u7ed3\u679c\u4f20\u9012\u7ed9\u89c6\u9891\u751f\u6210\u578bAI\uff082.AI\uff09\uff0c\u6700\u7ec8\u751f\u6210\u76f4\u89c2\u3001\u6613\u61c2\u7684\u6559\u5b66\u89c6\u9891\u3002\u8fd9\u79cd\u53ccAI\u534f\u4f5c\u6a21\u5f0f\u80fd\u591f\u6700\u5927\u7a0b\u5ea6\u5730\u63d0\u5347\u5b66\u4e60\u6548\u7387\u548c\u7406\u89e3\u6df1\u5ea6\u3002", font: "SimSun", size: 24 })]
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.2 \u9879\u76ee\u76ee\u6807")] }),
      new Paragraph({ numbering: { reference: "num-1", level: 0 }, spacing: { line: 250 }, children: [new TextRun({ text: "\u6784\u5efa\u4e00\u4e2a\u5f00\u6e90\u7684\u3001\u6613\u4e8e\u6269\u5c55\u7684AI\u6559\u80b2\u5e73\u53f0\uff0c\u652f\u6301\u591a\u79cdAI\u6a21\u578b\u7684\u63a5\u5165\u548c\u5207\u6362", font: "SimSun", size: 24 })] }),
      new Paragraph({ numbering: { reference: "num-1", level: 0 }, spacing: { line: 250 }, children: [new TextRun({ text: "\u5b9e\u73b0\u591a\u6a21\u6001\u5185\u5bb9\u8f93\u5165\uff08\u6587\u5b57\u3001\u56fe\u7247\u3001PDF\u7b49\uff09\u7684\u5168\u9762\u652f\u6301", font: "SimSun", size: 24 })] }),
      new Paragraph({ numbering: { reference: "num-1", level: 0 }, spacing: { line: 250 }, children: [new TextRun({ text: "\u786e\u4fdd\u751f\u6210\u5185\u5bb9\u7684\u5408\u89c4\u6027\u548c\u6559\u80b2\u4ef7\u503c\uff0c\u7b26\u5408\u4f26\u7406\u9053\u5fb7\u6807\u51c6", font: "SimSun", size: 24 })] }),
      new Paragraph({ numbering: { reference: "num-1", level: 0 }, spacing: { line: 250 }, children: [new TextRun({ text: "\u63d0\u4f9b\u7b80\u6d01\u3001\u76f4\u89c2\u7684\u7528\u6237\u754c\u9762\uff0c\u964d\u4f4e\u4f7f\u7528\u95e8\u69db", font: "SimSun", size: 24 })] }),
      new Paragraph({ numbering: { reference: "num-1", level: 0 }, spacing: { line: 250 }, children: [new TextRun({ text: "\u652f\u6301\u751f\u6210\u5185\u5bb9\u7684\u672c\u5730\u4e0b\u8f7d\u548c\u5386\u53f2\u8bb0\u5f55\u7ba1\u7406", font: "SimSun", size: 24 })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.3 \u76ee\u6807\u7528\u6237")] }),
      new Paragraph({ 
        indent: { firstLine: 480 },
        spacing: { line: 250 },
        children: [new TextRun({ text: "\u672c\u9879\u76ee\u7684\u76ee\u6807\u7528\u6237\u5305\u62ec\uff1a\u5728\u6821\u5b66\u751f\uff08\u5c0f\u5b66\u3001\u521d\u4e2d\u3001\u9ad8\u4e2d\u3001\u5927\u5b66\uff09\u3001\u81ea\u5b66\u8005\u3001\u7ec8\u8eab\u5b66\u4e60\u8005\u3001\u6559\u5e08\u548c\u6559\u80b2\u5de5\u4f5c\u8005\u3001\u5bb6\u957f\u53ca\u5176\u4ed6\u9700\u8981\u4e3a\u5b69\u5b50\u63d0\u4f9b\u5b66\u4e60\u8f85\u52a9\u7684\u4eba\u7fa4\u3002\u8fd9\u4e9b\u7528\u6237\u7fa4\u4f53\u5728\u5b66\u4e60\u8fc7\u7a0b\u4e2d\u90fd\u53ef\u80fd\u9047\u5230\u5404\u79cd\u5404\u6837\u7684\u77e5\u8bc6\u96be\u70b9\uff0c\u9700\u8981\u4e13\u4e1a\u7684\u89e3\u7b54\u548c\u6307\u5bfc\u3002\u672c\u9879\u76ee\u81f4\u529b\u4e8e\u4e3a\u8fd9\u4e9b\u7528\u6237\u63d0\u4f9b\u4e00\u4e2a\u4fbf\u6377\u3001\u9ad8\u6548\u3001\u4e2a\u6027\u5316\u7684\u5b66\u4e60\u5de5\u5177\u3002", font: "SimSun", size: 24 })]
      }),

      // 第二章
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("\u4e8c\u3001\u7cfb\u7edf\u67b6\u6784")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.1 \u6574\u4f53\u67b6\u6784")] }),
      new Paragraph({ 
        indent: { firstLine: 480 },
        spacing: { line: 250 },
        children: [new TextRun({ text: "\u672c\u9879\u76ee\u91c7\u7528\u73b0\u4ee3\u5316\u7684\u5168\u6808Web\u5e94\u7528\u67b6\u6784\uff0c\u524d\u540e\u7aef\u5206\u79bb\uff0c\u91c7\u7528\u7ec4\u4ef6\u5316\u8bbe\u8ba1\u7406\u5ff5\u3002\u6574\u4f53\u67b6\u6784\u5206\u4e3a\u56db\u4e2a\u4e3b\u8981\u5c42\u6b21\uff1a\u8868\u793a\u5c42\uff08\u524d\u7aef\u754c\u9762\uff09\u3001\u4e1a\u52a1\u5c42\uff08API\u670d\u52a1\uff09\u3001AI\u5904\u7406\u5c42\uff08AI\u6a21\u578b\u8c03\u7528\uff09\u548c\u6570\u636e\u5c42\uff08\u6570\u636e\u5b58\u50a8\uff09\u3002\u8fd9\u79cd\u5206\u5c42\u67b6\u6784\u4fdd\u8bc1\u4e86\u7cfb\u7edf\u7684\u53ef\u6269\u5c55\u6027\u548c\u53ef\u7ef4\u62a4\u6027\uff0c\u5404\u5c42\u4e4b\u95f4\u901a\u8fc7\u6807\u51c6\u63a5\u53e3\u8fdb\u884c\u901a\u4fe1\uff0c\u964d\u4f4e\u4e86\u8026\u5408\u5ea6\u3002", font: "SimSun", size: 24 })]
      }),

      // 架构图表格
      new Paragraph({ 
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [new TextRun({ text: "\u8868 1\uff1a\u7cfb\u7edf\u5206\u5c42\u67b6\u6784", font: "SimHei", size: 20 })]
      }),
      new Table({
        columnWidths: [2340, 7020],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, shading: { fill: colors.headerBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u5c42\u6b21", bold: true, font: "SimHei", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: colors.headerBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u4e3b\u8981\u529f\u80fd\u4e0e\u6280\u672f", bold: true, font: "SimHei", size: 22 })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u8868\u793a\u5c42", font: "SimSun", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Next.js 16 + React 19 + TypeScript + Tailwind CSS + shadcn/ui", font: "SimSun", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u4e1a\u52a1\u5c42", font: "SimSun", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Next.js API Routes + RESTful API \u8bbe\u8ba1", font: "SimSun", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "AI\u5904\u7406\u5c42", font: "SimSun", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "z-ai-web-dev-sdk \u7edf\u4e00\u63a5\u53e3 + \u591a\u6a21\u578b\u9002\u914d", font: "SimSun", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u6570\u636e\u5c42", font: "SimSun", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Prisma ORM + SQLite \u8f7b\u91cf\u7ea7\u6570\u636e\u5e93", font: "SimSun", size: 22 })] })] })
          ]})
        ]
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.2 \u6838\u5fc3\u6a21\u5757")] }),
      new Paragraph({ 
        indent: { firstLine: 480 },
        spacing: { line: 250 },
        children: [new TextRun({ text: "\u7cfb\u7edf\u7531\u56db\u4e2a\u6838\u5fc3\u6a21\u5757\u7ec4\u6210\uff0c\u6bcf\u4e2a\u6a21\u5757\u627f\u62c5\u7279\u5b9a\u7684\u529f\u80fd\u804c\u8d23\uff0c\u5171\u540c\u5b9e\u73b0\u5b8c\u6574\u7684\u5b66\u4e60\u8f85\u52a9\u6d41\u7a0b\u3002\u5185\u5bb9\u4e0a\u4f20\u6a21\u5757\u8d1f\u8d23\u63a5\u6536\u7528\u6237\u7684\u591a\u6a21\u6001\u8f93\u5165\uff1bAI\u7406\u89e3\u6a21\u5757\u8d1f\u8d23\u8c03\u75281.AI\u8fdb\u884c\u5185\u5bb9\u5206\u6790\u548c\u89e3\u8bfb\uff1b\u5185\u5bb9\u5ba1\u6838\u6a21\u5757\u786e\u4fdd\u6240\u6709\u751f\u6210\u5185\u5bb9\u7b26\u5408\u89c4\u8303\uff1b\u89c6\u9891\u751f\u6210\u6a21\u5757\u8d1f\u8d23\u8c03\u75282.AI\u751f\u6210\u6559\u5b66\u8d44\u6e90\u3002\u5404\u6a21\u5757\u76f8\u4e92\u72ec\u7acb\u53c8\u7d27\u5bc6\u534f\u4f5c\uff0c\u5f62\u6210\u5b8c\u6574\u7684\u4e1a\u52a1\u95ed\u73af\u3002", font: "SimSun", size: 24 })]
      }),

      // 模块表格
      new Paragraph({ 
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [new TextRun({ text: "\u8868 2\uff1a\u6838\u5fc3\u6a21\u5757\u5212\u5206", font: "SimHei", size: 20 })]
      }),
      new Table({
        columnWidths: [2000, 3500, 3860],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, shading: { fill: colors.headerBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u6a21\u5757", bold: true, font: "SimHei", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: colors.headerBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u4e3b\u8981\u529f\u80fd", bold: true, font: "SimHei", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: colors.headerBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u5173\u952e\u7279\u6027", bold: true, font: "SimHei", size: 22 })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u5185\u5bb9\u4e0a\u4f20", font: "SimSun", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "\u6587\u5b57\u3001\u56fe\u7247\u3001PDF\u4e0a\u4f20", font: "SimSun", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "\u591a\u6a21\u6001\u8f93\u5165\u3001OCR\u8bc6\u522b", font: "SimSun", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "AI\u7406\u89e3", font: "SimSun", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "\u8c03\u75281.AI\u8fdb\u884c\u5185\u5bb9\u89e3\u8bfb", font: "SimSun", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "\u591a\u6a21\u578b\u53ef\u9009\u3001\u667a\u80fd\u8c03\u5ea6", font: "SimSun", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u5185\u5bb9\u5ba1\u6838", font: "SimSun", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "\u654f\u611f\u8bcd\u8fc7\u6ee4\u3001AI\u5ba1\u6838", font: "SimSun", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "\u4f26\u7406\u9053\u5fb7\u3001\u5408\u89c4\u68c0\u67e5", font: "SimSun", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u89c6\u9891\u751f\u6210", font: "SimSun", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "\u8c03\u75282.AI\u751f\u6210\u6559\u5b66\u89c6\u9891", font: "SimSun", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "\u591a\u5e73\u53f0\u652f\u6301\u3001\u672c\u5730\u4e0b\u8f7d", font: "SimSun", size: 22 })] })] })
          ]})
        ]
      }),

      // 第三章
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("\u4e09\u3001AI\u6a21\u578b\u652f\u6301")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.1 \u7406\u89e3\u578bAI\uff081.AI\uff09")] }),
      new Paragraph({ 
        indent: { firstLine: 480 },
        spacing: { line: 250 },
        children: [new TextRun({ text: "1.AI\u8d1f\u8d23\u7406\u89e3\u7528\u6237\u4e0a\u4f20\u7684\u5b66\u4e60\u5185\u5bb9\uff0c\u8fdb\u884c\u6df1\u5ea6\u5206\u6790\u548c\u89e3\u8bfb\u3002\u7cfb\u7edf\u652f\u6301\u591a\u79cd\u4e3b\u6d41\u7684\u5927\u8bed\u8a00\u6a21\u578b\uff0c\u5305\u62ec\u56fd\u9645\u9886\u5148\u7684GPT\u7cfb\u5217\u3001Claude\u7cfb\u5217\uff0c\u4ee5\u53ca\u56fd\u5185\u4f18\u79c0\u7684DeepSeek\u3001\u901a\u4e49\u5343\u95ee\u7b49\u3002\u8fd9\u4e9b\u6a21\u578b\u5728\u6587\u5b57\u7406\u89e3\u3001\u903b\u8f91\u63a8\u7406\u3001\u591a\u6a21\u6001\u5904\u7406\u7b49\u65b9\u9762\u5404\u6709\u7279\u70b9\uff0c\u7528\u6237\u53ef\u4ee5\u6839\u636e\u81ea\u5df1\u7684\u9700\u6c42\u548c\u504f\u597d\u9009\u62e9\u5408\u9002\u7684\u6a21\u578b\u3002", font: "SimSun", size: 24 })]
      }),

      // 理解型AI表格
      new Paragraph({ 
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [new TextRun({ text: "\u8868 3\uff1a\u7406\u89e3\u578bAI\u6a21\u578b\u5217\u8868", font: "SimHei", size: 20 })]
      }),
      new Table({
        columnWidths: [2400, 2400, 4560],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, shading: { fill: colors.headerBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u6a21\u578b\u540d\u79f0", bold: true, font: "SimHei", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: colors.headerBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u63d0\u4f9b\u5546", bold: true, font: "SimHei", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: colors.headerBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u4e3b\u8981\u7279\u70b9", bold: true, font: "SimHei", size: 22 })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "GPT-4o", font: "SimSun", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "OpenAI", font: "SimSun", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "\u6700\u5f3a\u591a\u6a21\u6001\u80fd\u529b\uff0c\u652f\u6301\u56fe\u7247\u76f4\u63a5\u5206\u6790", font: "SimSun", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Claude 3.5", font: "SimSun", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Anthropic", font: "SimSun", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "\u957f\u6587\u672c\u7406\u89e3\u4f18\u79c0\uff0c\u903b\u8f91\u63a8\u7406\u5f3a", font: "SimSun", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Gemini Pro", font: "SimSun", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Google", font: "SimSun", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "\u591a\u6a21\u6001\uff0c\u514d\u8d39\u989d\u5ea6\u8f83\u591a", font: "SimSun", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "DeepSeek", font: "SimSun", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u56fd\u4ea7", font: "SimSun", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "\u56fd\u4ea7\u6a21\u578b\uff0c\u6027\u4ef7\u6bd4\u6781\u9ad8", font: "SimSun", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u901a\u4e49\u5343\u95ee", font: "SimSun", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u963f\u91cc\u4e91", font: "SimSun", size: 22 })] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "\u4e2d\u6587\u7406\u89e3\u4f18\u79c0\uff0c\u4f01\u4e1a\u7ea7\u652f\u6301", font: "SimSun", size: 22 })] })] })
          ]})
        ]
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.2 \u89c6\u9891\u751f\u6210\u578bAI\uff082.AI\uff09")] }),
      new Paragraph({ 
        indent: { firstLine: 480 },
        spacing: { line: 250 },
        children: [new TextRun({ text: "2.AI\u8d1f\u8d23\u6839\u636e1.AI\u7684\u7406\u89e3\u7ed3\u679c\u751f\u6210\u6559\u5b66\u89c6\u9891\u6216\u76f8\u5173\u8d44\u6e90\u3002\u76ee\u524d\u652f\u6301\u7684\u89c6\u9891\u751f\u6210\u5e73\u53f0\u5305\u62ec\u53ef\u7075AI(Kling)\u3001Runway Gen-3\u3001Pika Labs\u7b49\u56fd\u9645\u9886\u5148\u5e73\u53f0\u3002\u8fd9\u4e9b\u5e73\u53f0\u80fd\u591f\u6839\u636e\u6587\u5b57\u63cf\u8ff0\u751f\u6210\u9ad8\u8d28\u91cf\u7684\u89c6\u9891\u5185\u5bb9\uff0c\u7528\u4e8e\u6559\u5b66\u573a\u666f\u5177\u6709\u5f88\u597d\u7684\u6548\u679c\u3002\u7cfb\u7edf\u4f1a\u81ea\u52a8\u5c061.AI\u751f\u6210\u7684\u89e3\u91ca\u8f6c\u6362\u4e3a\u9002\u5408\u89c6\u9891\u751f\u6210\u7684\u63d0\u793a\u8bcd\uff0c\u786e\u4fdd\u751f\u6210\u5185\u5bb9\u7684\u51c6\u786e\u6027\u3002", font: "SimSun", size: 24 })]
      }),

      // 第四章
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("\u56db\u3001\u5f00\u53d1\u8def\u7ebf\u56fe")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.1 \u7b2c\u4e00\u9636\u6bb5\uff1a\u57fa\u7840\u529f\u80fd\u5f00\u53d1\uff081-2\u5468\uff09")] }),
      new Paragraph({ numbering: { reference: "num-2", level: 0 }, spacing: { line: 250 }, children: [new TextRun({ text: "\u5b8c\u6210\u9879\u76ee\u57fa\u7840\u67b6\u6784\u642d\u5efa\uff0c\u5305\u62ec\u524d\u540e\u7aef\u73af\u5883\u914d\u7f6e", font: "SimSun", size: 24 })] }),
      new Paragraph({ numbering: { reference: "num-2", level: 0 }, spacing: { line: 250 }, children: [new TextRun({ text: "\u5b9e\u73b0\u57fa\u672c\u7684\u7528\u6237\u754c\u9762\u548c\u5185\u5bb9\u4e0a\u4f20\u529f\u80fd", font: "SimSun", size: 24 })] }),
      new Paragraph({ numbering: { reference: "num-2", level: 0 }, spacing: { line: 250 }, children: [new TextRun({ text: "\u5b9e\u73b0\u5355\u4e00AI\u6a21\u578b\u7684\u8c03\u7528\u548c\u57fa\u672c\u7406\u89e3\u529f\u80fd", font: "SimSun", size: 24 })] }),
      new Paragraph({ numbering: { reference: "num-2", level: 0 }, spacing: { line: 250 }, children: [new TextRun({ text: "\u5b8c\u6210\u57fa\u7840\u6570\u636e\u5e93\u8bbe\u8ba1\u548cAPI\u63a5\u53e3", font: "SimSun", size: 24 })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.2 \u7b2c\u4e8c\u9636\u6bb5\uff1a\u6838\u5fc3\u529f\u80fd\u5b8c\u5584\uff082-3\u5468\uff09")] }),
      new Paragraph({ numbering: { reference: "num-3", level: 0 }, spacing: { line: 250 }, children: [new TextRun({ text: "\u5b9e\u73b0\u591aAI\u6a21\u578b\u652f\u6301\u548c\u52a8\u6001\u5207\u6362", font: "SimSun", size: 24 })] }),
      new Paragraph({ numbering: { reference: "num-3", level: 0 }, spacing: { line: 250 }, children: [new TextRun({ text: "\u6dfb\u52a0\u5185\u5bb9\u5ba1\u6838\u548c\u5b89\u5168\u8fc7\u6ee4\u673a\u5236", font: "SimSun", size: 24 })] }),
      new Paragraph({ numbering: { reference: "num-3", level: 0 }, spacing: { line: 250 }, children: [new TextRun({ text: "\u5b9e\u73b0\u89c6\u9891\u751f\u6210\u529f\u80fd\u96c6\u6210", font: "SimSun", size: 24 })] }),
      new Paragraph({ numbering: { reference: "num-3", level: 0 }, spacing: { line: 250 }, children: [new TextRun({ text: "\u6dfb\u52a0\u89c6\u9891\u4e0b\u8f7d\u548c\u5386\u53f2\u8bb0\u5f55\u529f\u80fd", font: "SimSun", size: 24 })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.3 \u7b2c\u4e09\u9636\u6bb5\uff1a\u4f18\u5316\u4e0e\u6269\u5c55\uff083-4\u5468\uff09")] }),
      new Paragraph({ numbering: { reference: "num-4", level: 0 }, spacing: { line: 250 }, children: [new TextRun({ text: "\u4f18\u5316\u7528\u6237\u754c\u9762\u548c\u7528\u6237\u4f53\u9a8c", font: "SimSun", size: 24 })] }),
      new Paragraph({ numbering: { reference: "num-4", level: 0 }, spacing: { line: 250 }, children: [new TextRun({ text: "\u6dfb\u52a0\u66f4\u591aAI\u6a21\u578b\u652f\u6301", font: "SimSun", size: 24 })] }),
      new Paragraph({ numbering: { reference: "num-4", level: 0 }, spacing: { line: 250 }, children: [new TextRun({ text: "\u5b9e\u73b0\u591a\u8bed\u8a00\u56fd\u9645\u5316\u652f\u6301", font: "SimSun", size: 24 })] }),
      new Paragraph({ numbering: { reference: "num-4", level: 0 }, spacing: { line: 250 }, children: [new TextRun({ text: "\u7f16\u5199\u5b8c\u6574\u6587\u6863\u5e76\u53d1\u5e03\u5230GitHub", font: "SimSun", size: 24 })] }),

      // 第五章
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("\u4e94\u3001\u9879\u76ee\u76ee\u5f55\u7ed3\u6784")] }),
      new Paragraph({ 
        indent: { firstLine: 480 },
        spacing: { line: 250 },
        children: [new TextRun({ text: "\u9879\u76ee\u91c7\u7528\u6e05\u6670\u7684\u76ee\u5f55\u7ed3\u6784\u7ec4\u7ec7\uff0c\u65b9\u4fbf\u5f00\u53d1\u8005\u5feb\u901f\u4e0a\u624b\u548c\u8d21\u732e\u4ee3\u7801\u3002\u4e3b\u8981\u76ee\u5f55\u5305\u62ec\uff1a", font: "SimSun", size: 24 })]
      }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { line: 250 }, children: [new TextRun({ text: "/src/app - Next.js\u5e94\u7528\u4e3b\u76ee\u5f55\uff0c\u5305\u542b\u9875\u9762\u548cAPI\u8def\u7531", font: "SimSun", size: 24 })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { line: 250 }, children: [new TextRun({ text: "/src/components - \u53ef\u590d\u7528\u7684React\u7ec4\u4ef6", font: "SimSun", size: 24 })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { line: 250 }, children: [new TextRun({ text: "/src/lib - \u5de5\u5177\u51fd\u6570\u548c\u516c\u5171\u903b\u8f91", font: "SimSun", size: 24 })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { line: 250 }, children: [new TextRun({ text: "/src/store - Zustand\u72b6\u6001\u7ba1\u7406", font: "SimSun", size: 24 })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { line: 250 }, children: [new TextRun({ text: "/src/types - TypeScript\u7c7b\u578b\u5b9a\u4e49", font: "SimSun", size: 24 })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { line: 250 }, children: [new TextRun({ text: "/prisma - \u6570\u636e\u5e93schema\u5b9a\u4e49", font: "SimSun", size: 24 })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { line: 250 }, children: [new TextRun({ text: "/public - \u9759\u6001\u8d44\u6e90\u6587\u4ef6", font: "SimSun", size: 24 })] }),

      // 第六章
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("\u516d\u3001\u5f00\u6e90\u534f\u8bae")] }),
      new Paragraph({ 
        indent: { firstLine: 480 },
        spacing: { line: 250 },
        children: [new TextRun({ text: "\u672c\u9879\u76ee\u91c7\u7528MIT\u5f00\u6e90\u534f\u8bae\uff0c\u5141\u8bb8\u4efb\u4f55\u4eba\u81ea\u7531\u5730\u4f7f\u7528\u3001\u4fee\u6539\u548c\u5206\u53d1\u672c\u9879\u76ee\u7684\u4ee3\u7801\u3002\u6211\u4eec\u6b22\u8fce\u793e\u533a\u8d21\u732e\u8005\u63d0\u4ea4Pull Request\u3001\u62a5\u544aBug\u3001\u63d0\u51fa\u65b0\u529f\u80fd\u5efa\u8bae\u7b49\u3002\u5728\u8d21\u732e\u4ee3\u7801\u524d\uff0c\u8bf7\u52a1\u5fc5\u9605\u8bfbCONTRIBUTING.md\u6587\u4ef6\u4e86\u89e3\u8d21\u732e\u6307\u5357\u3002", font: "SimSun", size: 24 })]
      }),

      // 第七章
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("\u4e03\u3001\u672a\u6765\u5c55\u671b")] }),
      new Paragraph({ 
        indent: { firstLine: 480 },
        spacing: { line: 250 },
        children: [new TextRun({ text: "\u201c\u7231\u7684\u6559\u80b2\u201d\u9879\u76ee\u5c06\u6301\u7eed\u8fed\u4ee3\u66f4\u65b0\uff0c\u6211\u4eec\u8ba1\u5212\u5728\u672a\u6765\u6dfb\u52a0\u66f4\u591a\u529f\u80fd\uff0c\u5305\u62ec\uff1a\u652f\u6301\u66f4\u591a\u7684AI\u6a21\u578b\u548c\u89c6\u9891\u751f\u6210\u5e73\u53f0\uff1b\u6dfb\u52a0PDF\u6587\u6863\u89e3\u6790\u529f\u80fd\uff1b\u5b9e\u73b0\u77e5\u8bc6\u70b9\u5173\u8054\u63a8\u8350\uff1b\u6dfb\u52a0\u5b66\u4e60\u8fdb\u5ea6\u8ddf\u8e2a\uff1b\u652f\u6301\u591a\u4eba\u534f\u4f5c\u5b66\u4e60\uff1b\u5f00\u53d1\u79fb\u52a8\u7aef\u5e94\u7528\u7b49\u3002\u6211\u4eec\u76f8\u4fe1\uff0c\u901a\u8fc7\u793e\u533a\u7684\u5171\u540c\u52aa\u529b\uff0c\u8fd9\u4e2a\u9879\u76ee\u5c06\u80fd\u591f\u5e2e\u52a9\u66f4\u591a\u7684\u5b66\u4e60\u8005\u83b7\u5f97\u66f4\u597d\u7684\u5b66\u4e60\u4f53\u9a8c\u3002", font: "SimSun", size: 24 })]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/home/z/my-project/download/爱的教育-项目规划书.docx", buffer);
  console.log("Document created successfully!");
});
