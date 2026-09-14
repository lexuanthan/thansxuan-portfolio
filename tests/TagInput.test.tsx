import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import TagInput from "@/components/admin/TagInput";

function setup(value: string[] = []) {
  const onChange = vi.fn();
  render(<TagInput value={value} onChange={onChange} />);
  return { onChange, input: screen.getByRole("textbox") };
}

function type(input: HTMLElement, text: string) {
  fireEvent.change(input, { target: { value: text } });
}

describe("TagInput", () => {
  it("hiển thị các tag hiện có", () => {
    setup(["AI", "Branding"]);
    expect(screen.getByText("AI")).toBeTruthy();
    expect(screen.getByText("Branding")).toBeTruthy();
  });

  it("báo trống khi chưa có tag nào", () => {
    setup([]);
    expect(screen.getByText("Chưa có tag nào")).toBeTruthy();
  });

  it("Enter thêm tag mới vào cuối danh sách", () => {
    const { onChange, input } = setup(["AI"]);
    type(input, "Design");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(["AI", "Design"]);
  });

  it("dấu phẩy cũng thêm tag", () => {
    const { onChange, input } = setup([]);
    type(input, "Video");
    fireEvent.keyDown(input, { key: "," });
    expect(onChange).toHaveBeenCalledWith(["Video"]);
  });

  it("tách nhiều tag khi dán chuỗi có dấu phẩy", () => {
    const { onChange, input } = setup([]);
    type(input, "AI, Content , Design");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(["AI", "Content", "Design"]);
  });

  it("không thêm tag trùng, kể cả khác hoa thường", () => {
    const { onChange, input } = setup(["AI"]);
    type(input, "ai");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(["AI"]);
  });

  it("bỏ qua chuỗi rỗng và khoảng trắng", () => {
    const { onChange, input } = setup(["AI"]);
    type(input, "   ");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("cắt khoảng trắng thừa quanh tag", () => {
    const { onChange, input } = setup([]);
    type(input, "  Thương hiệu  ");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(["Thương hiệu"]);
  });

  it("Backspace khi ô trống sẽ xoá tag cuối", () => {
    const { onChange, input } = setup(["AI", "Design"]);
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(onChange).toHaveBeenCalledWith(["AI"]);
  });

  it("Backspace khi đang gõ dở thì KHÔNG xoá tag", () => {
    const { onChange, input } = setup(["AI"]);
    type(input, "De");
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("rời khỏi ô nhập cũng lưu tag đang gõ dở", () => {
    const { onChange, input } = setup([]);
    type(input, "SEO");
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith(["SEO"]);
  });

  it("nút ✕ xoá đúng tag được bấm", () => {
    const onChange = vi.fn();
    render(<TagInput value={["AI", "Design", "Video"]} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Xoá tag Design"));
    expect(onChange).toHaveBeenCalledWith(["AI", "Video"]);
  });
});
