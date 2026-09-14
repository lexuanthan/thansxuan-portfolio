import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import RichText from "@/components/RichText";

describe("RichText", () => {
  it("tách mỗi dòng trống thành một đoạn <p>", () => {
    const { container } = render(
      <RichText text={"Đoạn một.\n\nĐoạn hai.\n\n\nĐoạn ba."} />
    );
    expect(container.querySelectorAll("p")).toHaveLength(3);
  });

  it("bỏ qua đoạn trắng thừa", () => {
    const { container } = render(
      <RichText text={"\n\n  Chỉ một đoạn.  \n\n   \n\n"} />
    );
    const ps = container.querySelectorAll("p");
    expect(ps).toHaveLength(1);
    expect(ps[0].textContent).toBe("Chỉ một đoạn.");
  });

  it("chuyển **chữ** thành <strong> và bỏ dấu sao", () => {
    const { container } = render(
      <RichText text="Tôi là **Lê Xuân Thân**, nghiên cứu sinh." />
    );
    const strong = container.querySelector("strong");
    expect(strong?.textContent).toBe("Lê Xuân Thân");
    expect(container.textContent).toBe("Tôi là Lê Xuân Thân, nghiên cứu sinh.");
    expect(container.textContent).not.toContain("**");
  });

  it("xử lý nhiều cụm in đậm trong cùng một đoạn", () => {
    const { container } = render(
      <RichText text="**Sáng tạo** và **đổi mới** không ngừng." />
    );
    const strongs = container.querySelectorAll("strong");
    expect(strongs).toHaveLength(2);
    expect(strongs[0].textContent).toBe("Sáng tạo");
    expect(strongs[1].textContent).toBe("đổi mới");
  });

  it("dấu sao lẻ không tạo thẻ strong", () => {
    const { container } = render(<RichText text="5 ** 2 là phép nhân" />);
    expect(container.querySelector("strong")).toBeNull();
    expect(container.textContent).toBe("5 ** 2 là phép nhân");
  });

  it("KHÔNG chèn HTML thô — chống XSS", () => {
    const { container } = render(
      <RichText text={'<img src=x onerror="alert(1)"> và <b>đậm</b>'} />
    );
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("b")).toBeNull();
    expect(container.textContent).toContain("<img src=x");
    expect(container.textContent).toContain("<b>đậm</b>");
  });

  it("áp dụng className được truyền vào", () => {
    const { container } = render(
      <RichText text="Xin chào" className="space-y-4" paragraphClassName="text-lg" />
    );
    expect(container.firstElementChild?.className).toBe("space-y-4");
    expect(container.querySelector("p")?.className).toBe("text-lg");
  });

  it("chuỗi rỗng không render đoạn nào và không crash", () => {
    const { container } = render(<RichText text="" />);
    expect(container.querySelectorAll("p")).toHaveLength(0);
  });
});
