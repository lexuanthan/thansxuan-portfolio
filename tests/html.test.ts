import { describe, expect, it } from "vitest";
import {
  decodeEntities,
  htmlToText,
  looksLikeHtml,
  parseHtml,
  safeUrl,
  styleToObject,
  type HNode,
} from "@/lib/html";

/** Gom toàn bộ tên thẻ trong cây để kiểm tra nhanh. */
function tags(nodes: HNode[]): string[] {
  const out: string[] = [];
  const walk = (list: HNode[]) => {
    for (const n of list) {
      if (n.type === "element") {
        out.push(n.tag);
        walk(n.children);
      }
    }
  };
  walk(nodes);
  return out;
}

function text(nodes: HNode[]): string {
  const out: string[] = [];
  const walk = (list: HNode[]) => {
    for (const n of list) {
      if (n.type === "text") out.push(n.value);
      else walk(n.children);
    }
  };
  walk(nodes);
  return out.join("");
}

describe("parseHtml — cấu trúc cơ bản", () => {
  it("đọc được đoạn văn lồng thẻ in đậm", () => {
    const nodes = parseHtml("<p>Xin <strong>chào</strong> anh</p>");
    expect(tags(nodes)).toEqual(["p", "strong"]);
    expect(text(nodes)).toBe("Xin chào anh");
  });

  it("giữ nguyên tiếng Việt có dấu", () => {
    expect(text(parseHtml("<p>Trường Đại học Sư phạm Kỹ thuật</p>"))).toBe(
      "Trường Đại học Sư phạm Kỹ thuật"
    );
  });

  it("xử lý thẻ rỗng không cần đóng", () => {
    expect(tags(parseHtml("dòng một<br>dòng hai"))).toEqual(["br"]);
    expect(tags(parseHtml("<hr/>"))).toEqual(["hr"]);
  });

  it("chuỗi rỗng hoặc dữ liệu rác trả về mảng rỗng", () => {
    expect(parseHtml("")).toEqual([]);
    expect(parseHtml("   ")).toEqual([]);
    expect(parseHtml(null)).toEqual([]);
    expect(parseHtml(undefined)).toEqual([]);
    expect(parseHtml(123)).toEqual([]);
  });
});

describe("parseHtml — chặn mã độc", () => {
  it("xoá sạch thẻ script kể cả phần ruột", () => {
    const nodes = parseHtml("<p>trước</p><script>alert(1)</script><p>sau</p>");
    expect(tags(nodes)).toEqual(["p", "p"]);
    expect(text(nodes)).toBe("trướcsau");
    expect(text(nodes)).not.toContain("alert");
  });

  it("xoá iframe, object, style và svg", () => {
    for (const bad of ["iframe", "object", "embed", "style", "svg"]) {
      const nodes = parseHtml(`<${bad}>xxx</${bad}><p>ok</p>`);
      expect(tags(nodes)).toEqual(["p"]);
      expect(text(nodes)).toBe("ok");
    }
  });

  it("bỏ thuộc tính sự kiện onclick, onerror", () => {
    const nodes = parseHtml('<p onclick="alert(1)" onerror="x()">chào</p>');
    const p = nodes[0];
    expect(p.type).toBe("element");
    if (p.type === "element") {
      expect(p.attrs).toEqual({});
    }
  });

  it("href javascript: bị thay bằng liên kết vô hại", () => {
    const nodes = parseHtml('<a href="javascript:alert(1)">bấm</a>');
    const a = nodes[0];
    if (a.type === "element") expect(a.attrs.href).toBe("#");
  });

  it("chặn cả javascript: viết lách né bộ lọc", () => {
    for (const bad of [
      "JaVaScRiPt:alert(1)",
      "java\tscript:alert(1)",
      " javascript:alert(1)",
      "vbscript:msgbox(1)",
    ]) {
      expect(safeUrl(bad)).toBeNull();
    }
  });

  it("ảnh có src không hợp lệ thì bỏ hẳn thẻ", () => {
    expect(tags(parseHtml('<img src="javascript:alert(1)">'))).toEqual([]);
  });

  it("style chỉ giữ thuộc tính về chữ, bỏ url() và position", () => {
    const nodes = parseHtml(
      '<span style="color: red; position: fixed; background-image: url(http://x/a.png)">a</span>'
    );
    const span = nodes[0];
    if (span.type === "element") {
      expect(span.attrs.style).toBe("color: red");
      expect(span.attrs.style).not.toContain("position");
      expect(span.attrs.style).not.toContain("url");
    }
  });
});

describe("parseHtml — HTML viết ẩu", () => {
  it("thẻ không đóng vẫn dựng được cây", () => {
    const nodes = parseHtml("<p>một<p>hai");
    expect(tags(nodes)).toEqual(["p", "p"]);
    expect(text(nodes)).toBe("mộthai");
  });

  it("mục danh sách không đóng không lồng vào nhau", () => {
    const nodes = parseHtml("<ul><li>a<li>b<li>c</ul>");
    expect(tags(nodes)).toEqual(["ul", "li", "li", "li"]);
  });

  it("thẻ đóng thừa không làm sập bộ phân tích", () => {
    expect(() => parseHtml("</p></div>xin chào")).not.toThrow();
    expect(text(parseHtml("</p>xin chào"))).toBe("xin chào");
  });

  it("dấu < lạc lõng được coi là chữ thường", () => {
    // Trước khi sửa, đoạn giữa hai dấu < > bị nuốt sạch và bài viết mất chữ
    expect(text(parseHtml("2 < 3 và 5 > 4"))).toContain("2 < 3");
    expect(text(parseHtml("giá < 5 và > 2"))).toContain("< 5 và >");
  });

  it("dấu < đi kèm số không bị hiểu nhầm thành thẻ đóng", () => {
    expect(text(parseHtml("nhiệt độ </ 30 độ"))).toContain("30");
    expect(text(parseHtml("a </2> b"))).toContain("a");
    expect(text(parseHtml("a </2> b"))).toContain("b");
  });

  it("chữ nằm giữa vẫn còn sau khi bóc dấu < > lạc", () => {
    const out = text(parseHtml("Giá bán < 5 triệu cho sản phẩm > loại A"));
    expect(out).toContain("5 triệu cho sản phẩm");
    expect(out).toContain("loại A");
  });

  it("thẻ lạ bị bóc vỏ nhưng chữ bên trong còn nguyên", () => {
    const nodes = parseHtml("<marquee><p>nội dung</p></marquee>");
    expect(tags(nodes)).toEqual(["p"]);
    expect(text(nodes)).toBe("nội dung");
  });

  it("bỏ qua chú thích HTML", () => {
    expect(text(parseHtml("<!-- ghi chú --><p>thật</p>"))).toBe("thật");
  });
});

describe("decodeEntities", () => {
  it("đổi các ký tự thoát thường gặp", () => {
    expect(decodeEntities("a &amp; b &lt; c &gt; d")).toBe("a & b < c > d");
    expect(decodeEntities("&quot;trích&quot;")).toBe('"trích"');
  });

  it("đổi mã số và mã hex", () => {
    expect(decodeEntities("&#272;&#7841;i")).toBe("Đại");
    expect(decodeEntities("&#x110;")).toBe("Đ");
  });

  it("mã hỏng giữ nguyên thay vì ném lỗi", () => {
    expect(() => decodeEntities("&#99999999999;")).not.toThrow();
    expect(decodeEntities("&khongcothat;")).toBe("&khongcothat;");
  });
});

describe("safeUrl", () => {
  it("cho qua liên kết thường", () => {
    expect(safeUrl("https://example.com")).toBe("https://example.com");
    expect(safeUrl("mailto:a@b.com")).toBe("mailto:a@b.com");
    expect(safeUrl("/bai-viet/abc")).toBe("/bai-viet/abc");
    expect(safeUrl("#phan-2")).toBe("#phan-2");
  });

  it("chỉ cho data: khi là ảnh và được phép", () => {
    const img = "data:image/png;base64,iVBORw0KGgo=";
    expect(safeUrl(img)).toBeNull();
    expect(safeUrl(img, true)).toBe(img);
    expect(safeUrl("data:text/html;base64,PHNjcmlwdD4=", true)).toBeNull();
  });
});

describe("styleToObject", () => {
  it("đổi tên thuộc tính sang kiểu React", () => {
    expect(styleToObject("font-size: 18px; color: red")).toEqual({
      fontSize: "18px",
      color: "red",
    });
  });

  it("thuộc tính một chữ giữ nguyên", () => {
    expect(styleToObject("color: #d97d06")).toEqual({ color: "#d97d06" });
  });

  it("bỏ qua mảnh không có dấu hai chấm", () => {
    expect(styleToObject("color: red; ; rác")).toEqual({ color: "red" });
  });

  it("không có style thì trả object rỗng", () => {
    expect(styleToObject(undefined)).toEqual({});
    expect(styleToObject("")).toEqual({});
  });
});

describe("htmlToText & looksLikeHtml", () => {
  it("rút chữ thuần từ HTML", () => {
    expect(htmlToText("<p>Đoạn một</p><p>Đoạn hai</p>")).toBe("Đoạn một Đoạn hai");
  });

  it("phân biệt được nội dung HTML và chữ thuần kiểu cũ", () => {
    expect(looksLikeHtml("<p>xin chào</p>")).toBe(true);
    expect(looksLikeHtml("Xin chào\n\nĐoạn hai")).toBe(false);
    expect(looksLikeHtml("giá < 5 và > 2")).toBe(false);
    expect(looksLikeHtml(null)).toBe(false);
  });
});
