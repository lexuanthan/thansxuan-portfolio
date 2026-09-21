/**
 * Tiện ích xuất và in báo cáo tư vấn hướng nghiệp & nguyện vọng đại học.
 * Hỗ trợ tạo giao diện in chuẩn khổ A4 sắc nét (Ctrl+P / Save as PDF)
 * và tải file HTML offline cho học sinh và phụ huynh.
 */

export function openPrintWindow(title: string, bodyHtml: string) {
  if (typeof window === "undefined") return;

  try {
    let printWindow: Window | null = null;
    try {
      printWindow = window.open("", "_blank");
    } catch {
      return;
    }
    if (!printWindow) {
      if (typeof window !== "undefined" && typeof window.alert === "function") {
        try {
          window.alert("Vui lòng cho phép trình duyệt mở cửa sổ bật lên (pop-up) để in báo cáo.");
        } catch {
          // Môi trường không hỗ trợ alert (headless / test)
        }
      }
      return;
    }

  const fullHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 15mm 15mm 15mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      margin: 0;
      padding: 24px;
      font-family: 'Be Vietnam Pro', system-ui, -apple-system, sans-serif;
      color: #1c1917;
      background: #ffffff;
      line-height: 1.5;
      font-size: 13px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #f5a524;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 900;
      color: #1c1917;
      margin: 0;
    }
    .brand-sub {
      font-size: 11px;
      color: #78716c;
      margin-top: 2px;
      font-weight: 500;
    }
    .report-badge {
      background: #fffaeb;
      border: 1px solid #ffe288;
      color: #b45c09;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .section-title {
      font-size: 14px;
      font-weight: 800;
      color: #1c1917;
      border-left: 4px solid #f5a524;
      padding-left: 8px;
      margin: 20px 0 10px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      background: #fdfaf3;
      border: 1px solid #f0e7d5;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
    }
    .info-item span {
      display: block;
      font-size: 10px;
      color: #78716c;
      text-transform: uppercase;
      font-weight: 700;
    }
    .info-item strong {
      font-size: 13px;
      color: #1c1917;
    }
    .major-card {
      border: 1px solid #f0e7d5;
      background: #ffffff;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 10px;
      page-break-inside: avoid;
    }
    .major-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .major-name {
      font-size: 14px;
      font-weight: 800;
      color: #1c1917;
    }
    .match-tag {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 12px;
    }
    .table th, .table td {
      border: 1px solid #f0e7d5;
      padding: 6px 10px;
      text-align: left;
    }
    .table th {
      background: #fdfaf3;
      font-weight: 700;
      color: #44403c;
    }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
    }
    .badge-safe { background: #ecfdf5; color: #065f46; }
    .badge-target { background: #fffbeb; color: #92400e; }
    .badge-reach { background: #fff1f2; color: #9f1239; }
    .footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #f0e7d5;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #a8a29e;
    }
    .no-print {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-bottom: 16px;
    }
    .btn {
      padding: 8px 16px;
      background: #f5a524;
      color: #1c1917;
      border: none;
      border-radius: 6px;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
    }
    @media print {
      .no-print { display: none; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn" onclick="window.print()">🖨️ In / Lưu file PDF</button>
  </div>
  ${bodyHtml}
  <div class="footer">
    <span>Báo cáo tự động từ nền tảng Lê Xuân Thân — Content Creator &amp; Tech Builder</span>
    <span>Trang 1/1</span>
  </div>
  <script>
    window.addEventListener('load', function() {
      // Cho phép font Be Vietnam Pro nạp xong trước khi mở hộp thoại in
      setTimeout(function() { window.print(); }, 400);
    });
  </script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(fullHtml);
    printWindow.document.close();
  } catch {
    // Trình duyệt chặn pop-up hoặc môi trường kiểm thử
  }
}

export function downloadHtmlFile(filename: string, bodyHtml: string) {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function") return;

  try {
    const fullHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${filename}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; padding: 24px; color: #1c1917; max-width: 900px; margin: 0 auto; }
    .header { border-bottom: 2px solid #f5a524; padding-bottom: 16px; margin-bottom: 20px; }
    .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #fdfaf3; padding: 12px; border-radius: 8px; border: 1px solid #f0e7d5; }
    .major-card { border: 1px solid #f0e7d5; padding: 12px; border-radius: 8px; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
    th, td { border: 1px solid #f0e7d5; padding: 8px; text-align: left; }
    th { background: #fdfaf3; }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch {
    // Tránh crash môi trường headless/test
  }
}
