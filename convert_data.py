import json
import os
import re

INPUT_FILE = "tuyensinh247_diemchuan.json"
OUTPUT_DIR = os.path.join("src", "data")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "universities.json")

# Danh sách từ khóa nhận diện tỉnh/thành phố và miền
REGIONS = {
    "TP. Hồ Chí Minh": ["TPHCM", "TP.HCM", "HỒ CHÍ MINH", "SÀI GÒN", "NAM SÀI GÒN", "GIA ĐỊNH"],
    "TP. Hà Nội": ["HÀ NỘI", "HN", "BÁCH KHOA HÀ NỘI", "QUỐC GIA HÀ NỘI"],
    "TP. Đà Nẵng": ["ĐÀ NẴNG", "VIỆT - HÀN", "MIỀN TRUNG"],
    "TP. Cần Thơ": ["CẦN THƠ", "TÂY ĐÔ", "NAM CẦN THƠ"],
    "TP. Huế": ["HUẾ"],
    "TP. Hải Phòng": ["HẢI PHÒNG", "HÀNG HẢI"],
    "Thái Nguyên": ["THÁI NGUYÊN"],
    "Bình Định": ["QUY NHƠN"],
    "Khánh Hoà": ["NHA TRANG", "KHÁNH HÒA"],
    "Lâm Đồng": ["ĐÀ LẠT", "YERSIN"],
}

def detect_city_and_region(name):
    upper = name.upper()
    city = "Khác"
    
    for c, keys in REGIONS.items():
        if any(k in upper for k in keys):
            city = c
            break
            
    if any(k in upper for k in ["HÀ NỘI", "HN", "BẮC", "HẢI PHÒNG", "THÁI NGUYÊN"]):
        region = "BAC"
    elif any(k in upper for k in ["ĐÀ NẴNG", "HUẾ", "TRUNG", "QUY NHƠN", "QUẢNG"]):
        region = "TRUNG"
    else:
        region = "NAM"
        
    return city, region

def parse_score(val):
    """Chuyển đổi điểm an toàn sang dạng float"""
    if val is None:
        return None
    try:
        return float(str(val).replace(",", ".").strip())
    except (ValueError, TypeError):
        return None

def main():
    if not os.path.exists(INPUT_FILE):
        print(f"❌ Không tìm thấy file {INPUT_FILE}")
        return

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    print(f"📊 Tổng số trường tìm thấy trong file nguồn ({INPUT_FILE}): {len(raw_data)}")

    cleaned_universities = []

    for idx, item in enumerate(raw_data, start=1):
        full_name = item.get("university_name", "").strip()
        majors = item.get("majors", [])
        
        # Tách mã trường và tên trường (hỗ trợ dấu -, –, —)
        parts = re.split(r"\s*[-–—]\s*", full_name, maxsplit=1)
        if len(parts) > 1 and parts[0].strip():
            code = parts[0].strip().upper()
            name = parts[1].strip()
        else:
            code = f"UNI_{idx:03d}"
            name = full_name if full_name else f"Trường đại học {idx}"
        
        city, region = detect_city_and_region(full_name)
        
        # Xử lý điểm chuẩn nếu trường có dữ liệu ngành
        tech_scores = []
        all_scores = []
        safe_majors = []

        if isinstance(majors, list) and len(majors) > 0:
            for m in majors:
                m_name = m.get("major_name", "")
                score = parse_score(m.get("cutoff_score"))
                
                safe_major = dict(m)
                if score is not None:
                    safe_major["cutoff_score"] = score
                    if any(k in m_name.lower() for k in ["công nghệ thông tin", "phần mềm", "máy tính", "dữ liệu", "tin học", "cntt"]):
                        tech_scores.append(score)
                    if score > 10:
                        all_scores.append(score)
                safe_majors.append(safe_major)

        # Tính điểm chuẩn đại diện
        if tech_scores:
            cutoff = round(max(tech_scores), 2)
        elif all_scores:
            cutoff = round(sum(all_scores) / len(all_scores), 2)
        else:
            cutoff = 20.0  # Điểm mặc định nếu trường chưa có dữ liệu điểm

        highlight_text = (
            f"Có {len(safe_majors)} ngành đào tạo theo công bố của Tuyển sinh 247"
            if len(safe_majors) > 0
            else "Đang cập nhật danh sách ngành và điểm chuẩn"
        )

        cleaned_universities.append({
            "id": code,
            "code": code,
            "name": name,
            "shortName": code,
            "city": city,
            "region": region,
            "cutoff": cutoff,
            "tuition": 28 if "công lập" in name.lower() or "đại học" in name.lower() else 55,
            "employmentRate": 95.0,
            "type": "Tư thục" if any(k in name.lower() for k in ["fpt", "hồng bàng", "văn lang", "hoa sen", "duy tân"]) else "Công lập",
            "highlight": highlight_text,
            "majors": safe_majors[:8]
        })

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(cleaned_universities, f, ensure_ascii=False, indent=2)

    print(f"✅ Đã chuẩn hóa thành công {len(cleaned_universities)} trường đại học!")
    print(f"📁 File xuất ra tại: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()