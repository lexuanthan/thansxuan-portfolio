import os
import re
import json
import requests
from bs4 import BeautifulSoup

URL = "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/ho-tro-phap-luat/tu-van-phap-luat/55582/tong-hop-danh-muc-nganh-dao-tao-trinh-do-dai-hoc-moi-nhat"
OUTPUT_DIR = os.path.join("src", "data")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "majors.json")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": "https://www.google.com/",
}

def crawl_majors():
    print(f"🔄 Đang kết nối tới Thư Viện Pháp Luật...")
    try:
        response = requests.get(URL, headers=HEADERS, timeout=20)
        response.encoding = "utf-8"
        if response.status_code != 200:
            print(f"❌ Lỗi truy cập: Mã phản hồi {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Lỗi kết nối mạng: {e}")
        return

    soup = BeautifulSoup(response.text, "html.parser")
    majors_list = []
    seen_codes = set()
    current_group = "Khối ngành chung"

    # Cách 1: Bóc tách dữ liệu từ các bảng HTML (<table>)
    tables = soup.find_all("table")
    print(f"📋 Tìm thấy {len(tables)} bảng dữ liệu trên bài viết. Đang trích xuất...")

    for table in tables:
        for tr in table.find_all("tr"):
            row_text = tr.get_text(" ", strip=True)
            cells = [td.get_text(strip=True) for td in tr.find_all(["td", "th"])]

            if not cells:
                continue

            # Nhận diện dòng tiêu đề lĩnh vực/nhóm ngành (thường có 3 số hoặc 5 số đầu, vd: 748 Máy tính...)
            if len(cells) == 1 or "colspan" in str(tr):
                if any(k in row_text.lower() for k in ["khoa học", "nghệ thuật", "kinh doanh", "sức khỏe", "kỹ thuật", "máy tính", "giáo dục"]):
                    current_group = re.sub(r"^\d+\s*[-.]?\s*", "", row_text).strip()
                continue

            # Tìm mã ngành 7 chữ số bắt đầu bằng số 7 (quy chuẩn ngành đại học)
            code = None
            name = None

            for c in cells:
                c_clean = c.replace(".", "").replace(" ", "")
                if re.match(r"^7\d{6}$", c_clean):
                    code = c_clean
                elif len(c) > 3 and not re.match(r"^\d+$", c) and c.lower() not in ["stt", "mã ngành", "tên ngành", "ghi chú"]:
                    name = c.strip()

            if code and name and code not in seen_codes:
                seen_codes.add(code)
                majors_list.append({
                    "id": code,
                    "code": code,
                    "name": name,
                    "group": current_group
                })

    # Cách 2: Dự phòng nếu nội dung dạng đoạn văn bản (Regex)
    if not majors_list:
        print("⚠️ Không đọc được qua bảng, đang chuyển sang chế độ quét văn bản...")
        pattern = re.compile(r"(7\d{6})\s*[-:–—\t.]\s*([^\n\r\d]{4,60})")
        for match in pattern.finditer(response.text):
            code, name = match.group(1), match.group(2).strip()
            if code not in seen_codes:
                seen_codes.add(code)
                majors_list.append({
                    "id": code,
                    "code": code,
                    "name": name,
                    "group": current_group
                })

    if not majors_list:
        print("❌ Không tìm thấy dữ liệu ngành. Vui lòng kiểm tra lại cấu trúc bài viết.")
        return

    # Lưu kết quả ra file JSON
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(majors_list, f, ensure_ascii=False, indent=2)

    print(f"✅ Đã trích xuất thành công {len(majors_list)} ngành đào tạo đại học chuẩn Bộ GD&ĐT!")
    print(f"📁 Dữ liệu được lưu tại: {OUTPUT_FILE}")

if __name__ == "__main__":
    crawl_majors()