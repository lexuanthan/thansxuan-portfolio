import { redirect } from "next/navigation";

/** Địa chỉ cũ của trang dự án — chuyển sang đường dẫn tiếng Việt. */
export default function ProjectsRedirect() {
  redirect("/du-an");
}
