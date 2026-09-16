/**
 * Xoá đối tượng khỏi ảnh bằng cách lấp vùng đã chọn từ màu xung quanh.
 *
 * CÁCH LÀM — "bóc vỏ hành":
 *   1. Tìm những điểm ảnh nằm trong vùng xoá nhưng có hàng xóm còn nguyên.
 *   2. Gán cho chúng màu trung bình của các hàng xóm đó, rồi coi như đã lành.
 *   3. Lặp lại: vùng xoá teo dần từ ngoài vào trong cho tới khi hết.
 *   4. Làm mịn lại phần vừa lấp để không thấy vệt loang.
 *
 * ĐIỂM MẠNH: xoá gọn vật thể nhỏ nằm trên nền trơn hoặc chuyển màu đều —
 * người đi lạc trên bãi cỏ, logo trên nền trời, vết bẩn trên tường.
 *
 * ĐIỂM YẾU: không dựng lại được hoa văn. Xoá vật thể nằm trên nền gạch hay
 * hàng chữ thì chỗ đó sẽ thành mảng mờ. Đây là giới hạn của mọi cách lấp
 * không dùng mô hình học máy, không phải lỗi cài đặt.
 */

/** Trả về true nếu có ít nhất một điểm cần xoá. */
export function hasMask(mask: Uint8Array): boolean {
  for (let i = 0; i < mask.length; i += 1) {
    if (mask[i] !== 0) return true;
  }
  return false;
}

/**
 * Nới rộng vùng xoá thêm vài điểm ảnh.
 * Viền vật thể thường còn sót màu của chính nó; không nới ra thì lấp xong
 * vẫn thấy một đường viền mờ đúng hình vật thể vừa xoá.
 */
export function dilateMask(
  mask: Uint8Array,
  width: number,
  height: number,
  radius: number
): Uint8Array {
  if (radius <= 0) return mask;

  let current = mask;

  for (let step = 0; step < radius; step += 1) {
    const next = new Uint8Array(current);

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const i = y * width + x;
        if (current[i]) continue;

        const up = y > 0 && current[i - width];
        const down = y < height - 1 && current[i + width];
        const left = x > 0 && current[i - 1];
        const right = x < width - 1 && current[i + 1];

        if (up || down || left || right) next[i] = 1;
      }
    }

    current = next;
  }

  return current;
}

/**
 * Lấp vùng đánh dấu. Sửa trực tiếp trên `data` (RGBA của canvas).
 *
 * @param data   dữ liệu điểm ảnh RGBA, dài width*height*4
 * @param width  chiều rộng ảnh
 * @param height chiều cao ảnh
 * @param mask   mảng width*height, khác 0 nghĩa là điểm cần xoá
 * @param smoothPasses số lần làm mịn sau khi lấp xong
 */
export function inpaint(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  mask: Uint8Array,
  smoothPasses = 3
): void {
  if (width <= 0 || height <= 0) return;
  if (mask.length !== width * height) return;

  // known[i] = 1 nghĩa là điểm đã có màu dùng được
  const known = new Uint8Array(width * height);
  const filled: number[] = [];

  for (let i = 0; i < known.length; i += 1) {
    if (mask[i]) filled.push(i);
    else known[i] = 1;
  }

  if (filled.length === 0) return;

  /* ---------- Bước 1: lấp dần từ ngoài vào trong ---------- */

  let remaining = filled.slice();
  // Chặn trên cho số vòng lặp: vùng xoá không bao giờ cần nhiều vòng hơn
  // nửa cạnh dài nhất, nhưng cứ để dư ra cho chắc.
  const maxRounds = Math.max(width, height) + 8;

  for (let round = 0; round < maxRounds && remaining.length > 0; round += 1) {
    const justFilled: number[] = [];
    const stillMissing: number[] = [];

    for (const i of remaining) {
      const x = i % width;
      const y = (i / width) | 0;

      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let count = 0;

      // Xét cả 8 hàng xóm: chỉ 4 hướng thì vùng lấp bị vuông vức
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (dx === 0 && dy === 0) continue;

          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;

          const ni = ny * width + nx;
          if (!known[ni]) continue;

          const p = ni * 4;
          r += data[p];
          g += data[p + 1];
          b += data[p + 2];
          a += data[p + 3];
          count += 1;
        }
      }

      if (count === 0) {
        stillMissing.push(i);
        continue;
      }

      const p = i * 4;
      data[p] = r / count;
      data[p + 1] = g / count;
      data[p + 2] = b / count;
      data[p + 3] = a / count;
      justFilled.push(i);
    }

    // Đánh dấu "đã lành" SAU khi quét xong cả lượt. Nếu đánh dấu ngay trong
    // vòng lặp, điểm lấp sau sẽ lấy màu của điểm vừa lấp trước đó và cả vùng
    // bị kéo lệch theo hướng quét.
    for (const i of justFilled) known[i] = 1;

    // Không lấp thêm được điểm nào: phần còn lại bị vây kín, thoát tránh treo
    if (justFilled.length === 0) break;

    remaining = stillMissing;
  }

  /* ---------- Bước 2: làm mịn phần vừa lấp ---------- */

  for (let pass = 0; pass < smoothPasses; pass += 1) {
    // Đọc từ bản sao để mọi điểm cùng dựa trên một trạng thái
    const snapshot = new Uint8ClampedArray(data);

    for (const i of filled) {
      const x = i % width;
      const y = (i / width) | 0;

      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let count = 0;

      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;

          const p = (ny * width + nx) * 4;
          r += snapshot[p];
          g += snapshot[p + 1];
          b += snapshot[p + 2];
          a += snapshot[p + 3];
          count += 1;
        }
      }

      const p = i * 4;
      data[p] = r / count;
      data[p + 1] = g / count;
      data[p + 2] = b / count;
      data[p + 3] = a / count;
    }
  }
}
