'use client'; // <-- Thêm dòng này ở đầu file
import { useState, useMemo } from 'react';
import rawUniversities from '../data/universities.json';

// Khai báo kiểu dữ liệu trực tiếp tại đây để tránh lỗi module
export interface Major {
  major_name: string;
  major_code?: string;
  cutoff_score: number;
}

export interface University {
  id: string;
  code: string;
  name: string;
  shortName: string;
  city: string;
  region: 'BAC' | 'TRUNG' | 'NAM';
  cutoff: number;
  tuition: number;
  employmentRate: number;
  type: 'Công lập' | 'Tư thục';
  highlight: string;
  majors: Major[];
}

const universities = (rawUniversities as unknown) as University[];

export const UniversityLookup = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const filteredList = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return universities.filter((uni) => {
      const name = uni.name?.toLowerCase() || '';
      const code = uni.code?.toLowerCase() || '';
      const city = uni.city?.toLowerCase() || '';

      const matchSearch = !term || name.includes(term) || code.includes(term) || city.includes(term);
      const matchRegion = selectedRegion === 'ALL' || uni.region === selectedRegion;
      const matchType = selectedType === 'ALL' || uni.type === selectedType;

      return matchSearch && matchRegion && matchType;
    });
  }, [searchTerm, selectedRegion, selectedType]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px', fontFamily: 'sans-serif' }}>
      {/* Tiêu đề */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
          Tra cứu Trường Đại học & Điểm chuẩn
        </h1>
        <p style={{ color: '#6b7280', fontSize: '15px' }}>
          Hệ thống tổng hợp dữ liệu {universities.length} trường đại học trên toàn quốc
        </p>
      </div>

      {/* Bộ lọc và Tìm kiếm */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}
      >
        <input
          type="text"
          placeholder="Nhập tên trường, mã trường (ví dụ: BKA, KHTN) hoặc thành phố..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: '1 1 300px',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
            outline: 'none'
          }}
        />

        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
            backgroundColor: '#fff',
            cursor: 'pointer'
          }}
        >
          <option value="ALL">Tất cả khu vực</option>
          <option value="BAC">Miền Bắc</option>
          <option value="TRUNG">Miền Trung</option>
          <option value="NAM">Miền Nam</option>
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
            backgroundColor: '#fff',
            cursor: 'pointer'
          }}
        >
          <option value="ALL">Tất cả loại hình</option>
          <option value="Công lập">Công lập</option>
          <option value="Tư thục">Tư thục</option>
        </select>
      </div>

      {/* Số lượng kết quả */}
      <div style={{ marginBottom: '16px', color: '#4b5563', fontSize: '14px' }}>
        Tìm thấy <strong>{filteredList.length}</strong> trường phù hợp:
      </div>

      {/* Danh sách thẻ */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}
      >
        {filteredList.map((uni, idx) => (
          <div
            key={`${uni.id || uni.code}-${idx}`}
            style={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span
                  style={{
                    backgroundColor: '#e0e7ff',
                    color: '#3730a3',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  {uni.code}
                </span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  📍 {uni.city} ({uni.region})
                </span>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827', margin: '8px 0 12px 0', lineHeight: 1.4 }}>
                {uni.name}
              </h3>

              <div style={{ backgroundColor: '#f3f4f6', padding: '10px 12px', borderRadius: '8px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                  <span style={{ color: '#4b5563' }}>Điểm chuẩn tiêu biểu:</span>
                  <strong style={{ color: '#dc2626' }}>{uni.cutoff} điểm</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#4b5563' }}>Loại hình:</span>
                  <span>{uni.type}</span>
                </div>
              </div>

              {uni.majors && uni.majors.length > 0 ? (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '6px' }}>
                    Một số ngành đào tạo:
                  </div>
                  <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '12px', color: '#6b7280' }}>
                    {uni.majors.slice(0, 3).map((m: Major, mIdx: number) => (
                      <li key={mIdx} style={{ marginBottom: '2px' }}>
                        {m.major_name} ({m.cutoff_score} đ)
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>
                  Đang cập nhật danh sách ngành
                </div>
              )}
            </div>

            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f3f4f6', fontSize: '12px', color: '#9ca3af' }}>
              {uni.highlight}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};