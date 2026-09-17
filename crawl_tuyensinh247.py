import re
import json
import time
import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

BASE_URL = "https://diemthi.tuyensinh247.com"
MAIN_PAGE = f"{BASE_URL}/diem-chuan.html"

def get_all_university_links():
    """Lấy danh sách link của tất cả các trường đại học trên Tuyển sinh 247"""
    print("🔍 Đang quét danh sách các trường đại học...")
    res = requests.get(MAIN_PAGE, headers=HEADERS)
    res.encoding = "utf-8"
    soup = BeautifulSoup(res.text, "html.parser")
    
    uni_links = []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if "/diem-chuan/" in href and href.endswith(".html"):
            full_url = href if href.startswith("http") else f"{BASE_URL}{href}"
            title = a.get_text(strip=True)
            if title and full_url not in [u["url"] for u in uni_links]:
                uni_links.append({"name": title, "url": full_url})
                
    print(f"✅ Tìm thấy {len(uni_links)} trường đại học.")
    return uni_links

def crawl_university_scores(uni_url):
    """Cào bảng điểm chuẩn chi tiết từng ngành của một trường"""
    try:
        res = requests.get(uni_url, headers=HEADERS, timeout=10)
        res.encoding = "utf-8"
        soup = BeautifulSoup(res.text, "html.parser")
        
        majors_data = []
        tables = soup.find_all("table")
        
        for table in tables:
            rows = table.find_all("tr")
            for row in rows:
                tds = row.find_all(["td", "th"])
                if len(tds) >= 3:
                    cols = [c.get_text(strip=True) for c in tds]
                    major_name, admission_codes, score_str = cols[:3]
                    
                    # Bỏ qua dòng tiêu đề và dòng quảng cáo
                    if "Tên ngành" in major_name or "Tra cứu" in major_name:
                        continue
                    
                    # Lọc lấy số điểm thực (ví dụ 24.5 hoặc 27.25)
                    score_match = re.search(r"(\d+(\.\d+)?)", str(score_str))
                    if score_match:
                        score = float(score_match.group(1))
                        majors_data.append({
                            "major_name": major_name,
                            "admission_codes": admission_codes,
                            "cutoff_score": score
                        })
        return majors_data
    except Exception as e:
        print(f"⚠️ Lỗi khi cào {uni_url}: {e}")
        return []

def main():
    universities = get_all_university_links()
    
    # Bạn có thể chỉnh con số 30 này nếu muốn lấy nhiều trường hơn, hoặc đổi thành universities để lấy tất cả 300 trường
    test_limit = universities
    
    all_results = []
    
    print(f"🚀 Bắt đầu cào dữ liệu {len(test_limit)} trường đại học...")
    for idx, uni in enumerate(test_limit, 1):
        print(f"[{idx}/{len(test_limit)}] Đang lấy: {uni['name']}...")
        scores = crawl_university_scores(uni["url"])
        all_results.append({
            "university_name": uni["name"],
            "source_url": uni["url"],
            "majors_count": len(scores),
            "majors": scores
        })
        time.sleep(0.4) # Giãn cách nhẹ để kết nối ổn định
        
    # Xuất dữ liệu ra file JSON
    with open("tuyensinh247_diemchuan.json", "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)
        
    print("\n🎉 HOÀN THÀNH!")
    print(f"📁 Đã lưu toàn bộ điểm chuẩn vào file: tuyensinh247_diemchuan.json")

if __name__ == "__main__":
    main()