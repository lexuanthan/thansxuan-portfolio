import { redirect } from "next/navigation";

/**
 * Địa chỉ cũ. Giữ lại và chuyển hướng thay vì xoá, để các liên kết đã chia sẻ
 * ra ngoài không rơi vào trang 404.
 */
export default function AboutRedirect() {
  redirect("/gioi-thieu");
}
