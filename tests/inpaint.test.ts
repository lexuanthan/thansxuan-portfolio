import { describe, expect, it } from "vitest";
import { dilateMask, hasMask, inpaint } from "@/lib/composer/inpaint";

/** Dựng ảnh một màu để dễ kiểm chứng kết quả lấp. */
function solid(width: number, height: number, rgb: [number, number, number]) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    data[i * 4] = rgb[0];
    data[i * 4 + 1] = rgb[1];
    data[i * 4 + 2] = rgb[2];
    data[i * 4 + 3] = 255;
  }
  return data;
}

function pixel(data: Uint8ClampedArray, width: number, x: number, y: number) {
  const p = (y * width + x) * 4;
  return [data[p], data[p + 1], data[p + 2], data[p + 3]];
}

describe("hasMask", () => {
  it("nhận ra vùng chọn rỗng", () => {
    expect(hasMask(new Uint8Array(100))).toBe(false);
  });

  it("nhận ra khi có dù chỉ một điểm", () => {
    const mask = new Uint8Array(100);
    mask[57] = 1;
    expect(hasMask(mask)).toBe(true);
  });
});

describe("dilateMask", () => {
  it("nới vùng chọn ra bốn phía", () => {
    const w = 5;
    const h = 5;
    const mask = new Uint8Array(w * h);
    mask[2 * w + 2] = 1; // đúng ô giữa

    const out = dilateMask(mask, w, h, 1);

    expect(out[2 * w + 2]).toBe(1);
    expect(out[1 * w + 2]).toBe(1); // trên
    expect(out[3 * w + 2]).toBe(1); // dưới
    expect(out[2 * w + 1]).toBe(1); // trái
    expect(out[2 * w + 3]).toBe(1); // phải
    expect(out[0]).toBe(0); // góc xa vẫn không đụng tới
  });

  it("bán kính 0 trả về đúng vùng chọn cũ", () => {
    const mask = new Uint8Array([0, 1, 0, 0]);
    expect(dilateMask(mask, 2, 2, 0)).toBe(mask);
  });

  it("không sửa vào mảng gốc", () => {
    const w = 3;
    const mask = new Uint8Array(w * w);
    mask[4] = 1;
    dilateMask(mask, w, w, 2);
    // Chỉ ô giữa được đánh dấu lúc đầu, sau khi nới mảng gốc phải y nguyên
    expect(Array.from(mask).filter(Boolean)).toHaveLength(1);
  });
});

describe("inpaint", () => {
  it("lấp vết trên nền một màu thì không còn thấy vết", () => {
    const w = 20;
    const h = 20;
    const data = solid(w, h, [200, 30, 30]);

    // Bôi đen một ô vuông giữa ảnh — giả làm vật thể cần xoá
    const mask = new Uint8Array(w * h);
    for (let y = 8; y < 12; y += 1) {
      for (let x = 8; x < 12; x += 1) {
        mask[y * w + x] = 1;
        const p = (y * w + x) * 4;
        data[p] = 0;
        data[p + 1] = 0;
        data[p + 2] = 0;
      }
    }

    inpaint(data, w, h, mask);

    // Giữa vùng vừa xoá phải trở lại gần đúng màu nền
    const [r, g, b] = pixel(data, w, 10, 10);
    expect(Math.abs(r - 200)).toBeLessThan(6);
    expect(Math.abs(g - 30)).toBeLessThan(6);
    expect(Math.abs(b - 30)).toBeLessThan(6);
  });

  it("không đụng tới điểm nằm ngoài vùng chọn", () => {
    const w = 10;
    const h = 10;
    const data = solid(w, h, [10, 20, 30]);

    // Một điểm ngoài vùng chọn mang màu riêng, phải còn nguyên sau khi lấp
    const keep = (2 * w + 2) * 4;
    data[keep] = 250;
    data[keep + 1] = 250;
    data[keep + 2] = 250;

    const mask = new Uint8Array(w * h);
    mask[7 * w + 7] = 1;

    inpaint(data, w, h, mask);

    expect(pixel(data, w, 2, 2)).toEqual([250, 250, 250, 255]);
  });

  it("vùng chọn rỗng thì ảnh không đổi", () => {
    const w = 6;
    const data = solid(w, w, [123, 45, 67]);
    const before = Array.from(data);

    inpaint(data, w, w, new Uint8Array(w * w));

    expect(Array.from(data)).toEqual(before);
  });

  it("lấp được cả khi vùng chọn chạm mép ảnh", () => {
    const w = 12;
    const h = 12;
    const data = solid(w, h, [90, 140, 200]);

    const mask = new Uint8Array(w * h);
    for (let y = 0; y < 3; y += 1) {
      for (let x = 0; x < 3; x += 1) {
        mask[y * w + x] = 1;
        const p = (y * w + x) * 4;
        data[p] = 0;
        data[p + 1] = 0;
        data[p + 2] = 0;
      }
    }

    expect(() => inpaint(data, w, h, mask)).not.toThrow();

    const [r, g, b] = pixel(data, w, 0, 0);
    expect(Math.abs(r - 90)).toBeLessThan(12);
    expect(Math.abs(g - 140)).toBeLessThan(12);
    expect(Math.abs(b - 200)).toBeLessThan(12);
  });

  it("chọn xoá toàn bộ ảnh cũng không treo vòng lặp", () => {
    const w = 8;
    const h = 8;
    const data = solid(w, h, [50, 50, 50]);
    const mask = new Uint8Array(w * h).fill(1);

    // Không có điểm nào còn nguyên để lấy màu — phải thoát chứ không lặp mãi
    expect(() => inpaint(data, w, h, mask)).not.toThrow();
  });

  it("vùng chọn sai kích thước bị bỏ qua thay vì đọc tràn bộ nhớ", () => {
    const w = 5;
    const data = solid(w, w, [1, 2, 3]);
    const before = Array.from(data);

    inpaint(data, w, w, new Uint8Array(3));

    expect(Array.from(data)).toEqual(before);
  });

  it("giữ nguyên độ mờ của ảnh nền đục", () => {
    const w = 10;
    const h = 10;
    const data = solid(w, h, [100, 100, 100]);

    const mask = new Uint8Array(w * h);
    mask[5 * w + 5] = 1;

    inpaint(data, w, h, mask);

    expect(pixel(data, w, 5, 5)[3]).toBe(255);
  });
});
