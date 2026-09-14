import { describe, expect, it } from "vitest";
import { mipLevelFor, renderDocument, type ImageMap } from "@/lib/composer/render";
import type { ComposerDoc, ImageLayer, TextLayer } from "@/lib/composer/types";

/**
 * Đây là bài test quan trọng nhất của tool: chứng minh logo được vẽ ĐÚNG
 * vị trí và ĐÚNG kích thước người dùng đặt — không bị AI vẽ lại, không lệch.
 *
 * Dùng ctx giả để ghi lại mọi lệnh vẽ, nhờ vậy test chạy được mà không cần
 * canvas thật (jsdom không có canvas).
 */

type Call = { fn: string; args: unknown[] };

function fakeCtx() {
  const calls: Call[] = [];
  const rec =
    (fn: string) =>
    (...args: unknown[]) => {
      calls.push({ fn, args });
    };

  const ctx = {
    calls,
    save: rec("save"),
    restore: rec("restore"),
    clearRect: rec("clearRect"),
    fillRect: rec("fillRect"),
    translate: rec("translate"),
    rotate: rec("rotate"),
    drawImage: rec("drawImage"),
    fillText: rec("fillText"),
    strokeText: rec("strokeText"),
    measureText: (s: string) => ({ width: s.length * 10 }),
    globalAlpha: 1,
    fillStyle: "",
    strokeStyle: "",
    font: "",
    textAlign: "" as CanvasTextAlign,
    textBaseline: "" as CanvasTextBaseline,
    lineWidth: 0,
    lineJoin: "" as CanvasLineJoin,
    miterLimit: 0,
    shadowColor: "",
    shadowBlur: 0,
    shadowOffsetY: 0,
  };

  return ctx as unknown as CanvasRenderingContext2D & { calls: Call[] };
}

function imageLayer(over: Partial<ImageLayer> = {}): ImageLayer {
  return {
    id: "logo1",
    kind: "image",
    name: "Logo trường",
    src: "logo.png",
    aspect: 2,
    x: 0.5,
    y: 0.5,
    width: 0.2,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    ...over,
  };
}

function textLayer(over: Partial<TextLayer> = {}): TextLayer {
  return {
    id: "t1",
    kind: "text",
    name: "Chữ",
    text: "Xin chào",
    x: 0.5,
    y: 0.5,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    fontSize: 0.05,
    fontFamily: "Inter, sans-serif",
    fontWeight: 700,
    color: "#fff",
    align: "center",
    lineHeight: 1.2,
    maxWidth: 0.8,
    letterSpacing: 0,
    strokeWidth: 0,
    strokeColor: "#000",
    shadow: false,
    ...over,
  };
}

function baseDoc(over: Partial<ComposerDoc> = {}): ComposerDoc {
  return {
    width: 1000,
    height: 1000,
    backgroundColor: "#000000",
    background: null,
    layers: [],
    ...over,
  };
}

const fakeImage = {} as CanvasImageSource;
const images: ImageMap = new Map([["logo.png", fakeImage], ["bg.jpg", fakeImage]]);

describe("renderDocument — vị trí logo", () => {
  it("đặt logo đúng tâm người dùng chọn", () => {
    const ctx = fakeCtx();
    renderDocument(ctx, baseDoc({ layers: [imageLayer({ x: 0.25, y: 0.75 })] }), images);

    const translate = ctx.calls.find((c) => c.fn === "translate");
    expect(translate?.args).toEqual([250, 750]);
  });

  it("vẽ logo đúng kích thước và giữ nguyên tỉ lệ gốc", () => {
    const ctx = fakeCtx();
    // width 0.2 của canvas 1000px = 200px; aspect 2 → cao 100px
    renderDocument(ctx, baseDoc({ layers: [imageLayer()] }), images);

    const draw = ctx.calls.find((c) => c.fn === "drawImage");
    expect(draw?.args).toEqual([fakeImage, -100, -50, 200, 100]);
  });

  it("logo được vẽ từ ảnh gốc, không vẽ lại bằng đường nét", () => {
    const ctx = fakeCtx();
    renderDocument(ctx, baseDoc({ layers: [imageLayer()] }), images);

    expect(ctx.calls.filter((c) => c.fn === "drawImage")).toHaveLength(1);
    expect(ctx.calls.some((c) => c.fn === "fillText")).toBe(false);
  });

  it("xoay layer thì có lệnh rotate với đúng radian", () => {
    const ctx = fakeCtx();
    renderDocument(ctx, baseDoc({ layers: [imageLayer({ rotation: 90 })] }), images);

    const rotate = ctx.calls.find((c) => c.fn === "rotate");
    expect(rotate?.args[0]).toBeCloseTo(Math.PI / 2, 6);
  });

  it("không xoay thì bỏ hẳn lệnh rotate", () => {
    const ctx = fakeCtx();
    renderDocument(ctx, baseDoc({ layers: [imageLayer({ rotation: 0 })] }), images);
    expect(ctx.calls.some((c) => c.fn === "rotate")).toBe(false);
  });

  it("đổi kích thước canvas thì logo giữ nguyên vị trí tương đối", () => {
    const a = fakeCtx();
    const b = fakeCtx();
    const layer = imageLayer({ x: 0.25, y: 0.5 });

    renderDocument(a, baseDoc({ width: 1000, height: 1000, layers: [layer] }), images);
    renderDocument(b, baseDoc({ width: 2000, height: 2000, layers: [layer] }), images);

    expect(a.calls.find((c) => c.fn === "translate")?.args).toEqual([250, 500]);
    expect(b.calls.find((c) => c.fn === "translate")?.args).toEqual([500, 1000]);
  });
});

describe("renderDocument — lớp ẩn và thứ tự", () => {
  it("bỏ qua lớp đã ẩn", () => {
    const ctx = fakeCtx();
    renderDocument(ctx, baseDoc({ layers: [imageLayer({ visible: false })] }), images);
    expect(ctx.calls.some((c) => c.fn === "drawImage")).toBe(false);
  });

  it("bỏ qua lớp trong suốt hoàn toàn", () => {
    const ctx = fakeCtx();
    renderDocument(ctx, baseDoc({ layers: [imageLayer({ opacity: 0 })] }), images);
    expect(ctx.calls.some((c) => c.fn === "drawImage")).toBe(false);
  });

  it("vẽ nền trước rồi mới tới các lớp", () => {
    const ctx = fakeCtx();
    renderDocument(
      ctx,
      baseDoc({
        background: { src: "bg.jpg", aspect: 1, fit: "cover", zoom: 1, offsetX: 0, offsetY: 0 },
        layers: [imageLayer()],
      }),
      images
    );

    const draws = ctx.calls.filter((c) => c.fn === "drawImage");
    expect(draws).toHaveLength(2);
    // Nền phủ kín toàn khung 1000×1000
    expect(draws[0].args).toEqual([fakeImage, 0, 0, 1000, 1000]);
  });

  it("lớp thêm sau nằm đè lên lớp trước", () => {
    const ctx = fakeCtx();
    renderDocument(
      ctx,
      baseDoc({
        layers: [
          imageLayer({ id: "duoi", x: 0.1 }),
          imageLayer({ id: "tren", x: 0.9 }),
        ],
      }),
      images
    );

    const translates = ctx.calls.filter((c) => c.fn === "translate");
    expect(translates[0].args[0]).toBe(100);
    expect(translates[1].args[0]).toBe(900);
  });

  it("thiếu ảnh trong bộ nhớ thì bỏ qua chứ không làm hỏng cả ảnh", () => {
    const ctx = fakeCtx();
    renderDocument(
      ctx,
      baseDoc({ layers: [imageLayer({ src: "chua-tai.png" })] }),
      images
    );
    expect(ctx.calls.some((c) => c.fn === "drawImage")).toBe(false);
    expect(ctx.calls.some((c) => c.fn === "fillRect")).toBe(true);
  });
});

describe("renderDocument — chữ", () => {
  it("vẽ mỗi dòng một lệnh fillText", () => {
    const ctx = fakeCtx();
    // maxWidth 0.8 × 1000 = 800px; mỗi ký tự giả lập 10px
    renderDocument(
      ctx,
      baseDoc({ layers: [textLayer({ text: "dòng một\ndòng hai" })] }),
      images
    );
    expect(ctx.calls.filter((c) => c.fn === "fillText")).toHaveLength(2);
  });

  it("có bật viền thì vẽ strokeText trước fillText", () => {
    const ctx = fakeCtx();
    renderDocument(
      ctx,
      baseDoc({ layers: [textLayer({ strokeWidth: 0.05, text: "A" })] }),
      images
    );

    const iStroke = ctx.calls.findIndex((c) => c.fn === "strokeText");
    const iFill = ctx.calls.findIndex((c) => c.fn === "fillText");
    expect(iStroke).toBeGreaterThanOrEqual(0);
    expect(iStroke).toBeLessThan(iFill);
  });

  it("tắt viền thì không gọi strokeText", () => {
    const ctx = fakeCtx();
    renderDocument(ctx, baseDoc({ layers: [textLayer({ strokeWidth: 0 })] }), images);
    expect(ctx.calls.some((c) => c.fn === "strokeText")).toBe(false);
  });

  it("cỡ chữ 0 thì không vẽ gì", () => {
    const ctx = fakeCtx();
    renderDocument(ctx, baseDoc({ layers: [textLayer({ fontSize: 0 })] }), images);
    expect(ctx.calls.some((c) => c.fn === "fillText")).toBe(false);
  });

  it("save và restore luôn cân bằng — không rò trạng thái sang lớp sau", () => {
    const ctx = fakeCtx();
    renderDocument(
      ctx,
      baseDoc({ layers: [imageLayer(), textLayer({ strokeWidth: 0.03 })] }),
      images
    );
    const saves = ctx.calls.filter((c) => c.fn === "save").length;
    const restores = ctx.calls.filter((c) => c.fn === "restore").length;
    expect(saves).toBe(restores);
  });
});

describe("renderDocument — nền", () => {
  it("zoom làm ảnh nền to ra quanh tâm", () => {
    const ctx = fakeCtx();
    renderDocument(
      ctx,
      baseDoc({
        background: { src: "bg.jpg", aspect: 1, fit: "cover", zoom: 2, offsetX: 0, offsetY: 0 },
      }),
      images
    );

    const draw = ctx.calls.find((c) => c.fn === "drawImage");
    expect(draw?.args).toEqual([fakeImage, -500, -500, 2000, 2000]);
  });

  it("dịch nền theo tỉ lệ khung", () => {
    const ctx = fakeCtx();
    renderDocument(
      ctx,
      baseDoc({
        background: { src: "bg.jpg", aspect: 1, fit: "cover", zoom: 1, offsetX: 0.1, offsetY: 0 },
      }),
      images
    );

    const draw = ctx.calls.find((c) => c.fn === "drawImage");
    expect(draw?.args[1]).toBe(100);
  });

  it("zoom 0 không làm ảnh biến mất", () => {
    const ctx = fakeCtx();
    renderDocument(
      ctx,
      baseDoc({
        background: { src: "bg.jpg", aspect: 1, fit: "cover", zoom: 0, offsetX: 0, offsetY: 0 },
      }),
      images
    );

    const draw = ctx.calls.find((c) => c.fn === "drawImage");
    expect(draw?.args[3]).toBe(1000);
  });
});

describe("mipLevelFor — chống vỡ nét khi thu nhỏ logo", () => {
  it("không thu nhỏ trước khi vẽ nếu tỉ lệ dưới 2 lần", () => {
    expect(mipLevelFor(1000, 1000)).toBe(0);
    expect(mipLevelFor(1000, 600)).toBe(0);
    expect(mipLevelFor(1000, 501)).toBe(0);
  });

  it("thu nhỏ đúng 1 bước khi giảm 2 lần", () => {
    expect(mipLevelFor(1000, 500)).toBe(1);
  });

  it("logo 1000px vẽ ở 146px cần 2 bước thu nhỏ", () => {
    // 1000/146 ≈ 6.8 lần → 1000 → 500 → 250 rồi mới vẽ xuống 146
    expect(mipLevelFor(1000, 146)).toBe(2);
  });

  it("giảm càng nhiều thì càng nhiều bước", () => {
    expect(mipLevelFor(1000, 100)).toBe(3);
    expect(mipLevelFor(2000, 50)).toBe(5);
  });

  it("chặn trên 8 bước để không tạo vô số canvas tạm", () => {
    expect(mipLevelFor(100000, 1)).toBe(8);
  });

  it("kích thước không hợp lệ thì bỏ qua, không làm hỏng bản vẽ", () => {
    expect(mipLevelFor(0, 100)).toBe(0);
    expect(mipLevelFor(100, 0)).toBe(0);
    expect(mipLevelFor(Number.NaN, 100)).toBe(0);
    expect(mipLevelFor(-500, 100)).toBe(0);
  });

  it("phóng to thì không thu nhỏ", () => {
    expect(mipLevelFor(100, 1000)).toBe(0);
  });
});
