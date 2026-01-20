import { Link } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🏢 Công cụ OCAI chuẩn quốc tế</div>
          <h1 className="hero-title">
            Khảo Sát <span className="gradient-text">Văn Hóa Doanh Nghiệp</span>
          </h1>
          <p className="hero-subtitle">
            Đánh giá và phân tích văn hóa doanh nghiệp theo mô hình 
            <strong> Robert Quinn &amp; Kim Cameron</strong>. 
            Hiểu rõ văn hóa hiện tại và định hướng thay đổi trong tương lai.
          </p>
          <div className="hero-buttons">
            <Link to="/survey" className="btn btn-primary">
              <span>🚀</span> Làm khảo sát ngay
            </Link>
            <Link to="/results" className="btn btn-secondary">
              <span>📊</span> Xem kết quả
            </Link>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="culture-grid">
            <div className="culture-card clan">
              <span className="culture-icon">🏠</span>
              <h3>Văn hóa Hợp tác</h3>
              <p>Clan Culture</p>
            </div>
            <div className="culture-card adhocracy">
              <span className="culture-icon">💡</span>
              <h3>Văn hóa Sáng tạo</h3>
              <p>Adhocracy Culture</p>
            </div>
            <div className="culture-card market">
              <span className="culture-icon">🎯</span>
              <h3>Văn hóa Cạnh tranh</h3>
              <p>Market Culture</p>
            </div>
            <div className="culture-card hierarchy">
              <span className="culture-icon">📋</span>
              <h3>Văn hóa Kiểm soát</h3>
              <p>Hierarchy Culture</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title">Tính Năng Nổi Bật</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Bộ câu hỏi OCAI chuẩn</h3>
            <p>6 khía cạnh đánh giá với 24 câu hỏi được thiết kế theo chuẩn quốc tế</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Biểu đồ Radar trực quan</h3>
            <p>So sánh văn hóa hiện tại và mong muốn một cách trực quan</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Phân tích chi tiết</h3>
            <p>Thống kê theo phòng ban, vị trí, thâm niên và nhiều tiêu chí khác</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>Xuất báo cáo</h3>
            <p>Xuất kết quả ra PDF hoặc Excel để chia sẻ và lưu trữ</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <h2 className="section-title">Cách Thức Hoạt Động</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Mở khảo sát</h3>
            <p>Nhấn vào nút "Làm khảo sát" để bắt đầu</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Điền thông tin</h3>
            <p>Cung cấp thông tin cơ bản về phòng ban và vị trí</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Trả lời khảo sát</h3>
            <p>Phân chia 100 điểm cho 4 loại văn hóa</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Xem kết quả</h3>
            <p>Xem biểu đồ và phân tích tổng hợp</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-content">
          <h2>Sẵn sàng khám phá văn hóa doanh nghiệp?</h2>
          <p>Bắt đầu khảo sát miễn phí ngay hôm nay</p>
          <Link to="/survey" className="btn btn-primary btn-large">
            Bắt đầu khảo sát
          </Link>
        </div>
      </section>
    </div>
  );
}
