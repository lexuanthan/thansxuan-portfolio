import { describe, expect, it } from "vitest";
import {
  colorDistance,
  detectBackgroundColor,
  removeBackgroundBuffer,
} from "@/lib/composer/removeBg";

function solidImage(width: number, height: number, rgb: [number, number, number]): Uint8ClampedArray {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    data[i * 4] = rgb[0];
    data[i * 4 + 1] = rgb[1];
    data[i * 4 + 2] = rgb[2];
    data[i * 4 + 3] = 255;
  }
  return data;
}

function getPixel(data: Uint8ClampedArray, width: number, x: number, y: number) {
  const idx = (y * width + x) * 4;
  return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
}

describe("colorDistance", () => {
  it("trả về 0 cho hai màu giống hệt nhau", () => {
    expect(colorDistance(255, 255, 255, 255, 255, 255)).toBe(0);
  });

  it("tính đúng khoảng cách Euclidean giữa trắng và đen", () => {
    const dist = colorDistance(0, 0, 0, 255, 255, 255);
    expect(Math.round(dist)).toBe(442);
  });
});

describe("detectBackgroundColor", () => {
  it("tự nhận diện nền trắng từ viền ảnh", () => {
    const data = solidImage(10, 10, [255, 255, 255]);
    // Vẽ điểm đen ở tâm
    const centerIdx = (5 * 10 + 5) * 4;
    data[centerIdx] = 0;
    data[centerIdx + 1] = 0;
    data[centerIdx + 2] = 0;

    const bg = detectBackgroundColor(data, 10, 10);
    expect(bg).toEqual([255, 255, 255]);
  });

  it("tự nhận diện nền tối/đen", () => {
    const data = solidImage(8, 8, [20, 20, 20]);
    const bg = detectBackgroundColor(data, 8, 8);
    expect(bg).toEqual([20, 20, 20]);
  });
});

describe("removeBackgroundBuffer", () => {
  it("chế độ global xóa mọi pixel có màu nền tương tự", () => {
    const w = 4;
    const h = 4;
    const data = solidImage(w, h, [255, 255, 255]); // toàn bộ nền trắng
    // Vẽ 1 điểm màu đỏ ở giữa
    const center = (2 * w + 2) * 4;
    data[center] = 255;
    data[center + 1] = 0;
    data[center + 2] = 0;

    const result = removeBackgroundBuffer(data, w, h, {
      targetColor: [255, 255, 255],
      tolerance: 20,
      mode: "global",
      feather: 0,
    });

    // Điểm góc (0,0) phải trong suốt
    const corner = getPixel(result, w, 0, 0);
    expect(corner[3]).toBe(0);

    // Điểm đỏ ở giữa vẫn giữ nguyên màu và alpha = 255
    const centerPix = getPixel(result, w, 2, 2);
    expect(centerPix[0]).toBe(255);
    expect(centerPix[1]).toBe(0);
    expect(centerPix[2]).toBe(0);
    expect(centerPix[3]).toBe(255);
  });

  it("chế độ contiguous (lan viền) bảo vệ chi tiết cùng màu bên trong logo", () => {
    // Tạo lưới 7x7:
    // Nền ngoài: màu trắng (255, 255, 255)
    // Vòng bo khép kín: màu xanh (0, 0, 255) bao quanh (x từ 1 đến 5, y từ 1 đến 5)
    // Tâm bên trong: màu trắng (255, 255, 255) tại (3, 3)
    const w = 7;
    const h = 7;
    const data = solidImage(w, h, [255, 255, 255]);

    // Vẽ vòng vuông màu xanh kín
    for (let x = 1; x <= 5; x += 1) {
      for (const y of [1, 5]) {
        const idx = (y * w + x) * 4;
        data[idx] = 0;
        data[idx + 1] = 0;
        data[idx + 2] = 255;
      }
    }
    for (let y = 1; y <= 5; y += 1) {
      for (const x of [1, 5]) {
        const idx = (y * w + x) * 4;
        data[idx] = 0;
        data[idx + 1] = 0;
        data[idx + 2] = 255;
      }
    }

    const result = removeBackgroundBuffer(data, w, h, {
      targetColor: [255, 255, 255],
      tolerance: 20,
      mode: "contiguous",
      feather: 0,
    });

    // 1. Góc ngoài cùng (0, 0) bị xóa thành trong suốt
    expect(getPixel(result, w, 0, 0)[3]).toBe(0);

    // 2. Vòng bo màu xanh (1, 1) giữ nguyên
    expect(getPixel(result, w, 1, 1)[2]).toBe(255);
    expect(getPixel(result, w, 1, 1)[3]).toBe(255);

    // 3. Tâm bên trong (3, 3) DÙ CÓ MÀU TRẮNG nhưng được bao kín nên KHÔNG BỊ XÓA
    const innerWhite = getPixel(result, w, 3, 3);
    expect(innerWhite[0]).toBe(255);
    expect(innerWhite[1]).toBe(255);
    expect(innerWhite[2]).toBe(255);
    expect(innerWhite[3]).toBe(255);
  });
});
