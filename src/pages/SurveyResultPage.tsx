import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSurvey } from '../hooks/useSurvey';
import { calculateSurveyStatistics, getDominantCulture } from '../utils/calculations';
import { exportToPdf } from '../utils/exportPdf';
import { exportToExcel } from '../utils/exportExcel';
import { CULTURE_LABELS, CULTURE_COLORS, OCAI_QUESTIONS } from '../data/ocaiQuestions';
import RadarChartComponent from '../components/RadarChartComponent';
import type { CultureScores } from '../types';
import './SurveyResultPage.css';

// Admin password from environment variable
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD_RESULT || 'admin2024';

export default function SurveyResultPage() {
  const { survey, isLoading, refreshResponses } = useSurvey();
  const [activeTab, setActiveTab] = useState<'overview' | 'dimensions' | 'segments' | 'rawdata' | 'feedback'>('overview');
  const [isExporting, setIsExporting] = useState<'pdf' | 'excel' | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Password protection state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  });
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Refresh data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshResponses();
    }
  }, [isAuthenticated, refreshResponses]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      setPasswordError('');
    } else {
      setPasswordError('Mật khẩu không đúng');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
  };

  const statistics = useMemo(() => {
    return calculateSurveyStatistics(survey.responses);
  }, [survey.responses]);

  // Show password form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="result-page">
        <div className="result-header">
          <Link to="/" className="back-link">← Quay lại Trang chủ</Link>
          <h1>🔐 Xem Kết quả Khảo sát</h1>
        </div>
        
        <div className="password-form-container">
          <div className="password-form-card">
            <h2>Xác thực Admin</h2>
            <p>Vui lòng nhập mật khẩu để xem kết quả khảo sát</p>
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label>Mật khẩu</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu admin"
                  autoFocus
                />
              </div>
              {passwordError && (
                <div className="password-error">{passwordError}</div>
              )}
              <button type="submit" className="btn btn-primary btn-full">
                Xác nhận
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="result-page">
        <div className="result-header">
          <Link to="/" className="back-link">← Quay lại Trang chủ</Link>
          <h1>{survey.title}</h1>
        </div>
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (survey.responses.length === 0) {
    return (
      <div className="result-page">
        <div className="result-header">
          <Link to="/" className="back-link">← Quay lại Trang chủ</Link>
          <div className="header-content">
            <div className="header-text">
              <h1>{survey.title}</h1>
              <p>{survey.companyName}</p>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary btn-small">
              🔓 Đăng xuất
            </button>
          </div>
        </div>
        
        <div className="no-responses">
          <span className="empty-icon">📭</span>
          <h2>Chưa có phản hồi nào</h2>
          <p>Hãy chia sẻ link khảo sát để thu thập phản hồi</p>
          <div className="share-box">
            <code>{window.location.origin}/survey</code>
            <button 
              className="btn btn-primary"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/survey`);
                alert('Đã sao chép link!');
              }}
            >
              Sao chép link
            </button>
          </div>
          <button onClick={refreshResponses} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
            🔄 Tải lại dữ liệu
          </button>
        </div>
      </div>
    );
  }

  const renderCultureBar = (scores: CultureScores) => {
    const cultures = [
      { key: 'clan', label: 'Hợp tác', color: CULTURE_COLORS.clan },
      { key: 'adhocracy', label: 'Sáng tạo', color: CULTURE_COLORS.adhocracy },
      { key: 'market', label: 'Cạnh tranh', color: CULTURE_COLORS.market },
      { key: 'hierarchy', label: 'Kiểm soát', color: CULTURE_COLORS.hierarchy }
    ];

    return (
      <div className="culture-bars">
        {cultures.map(culture => (
          <div key={culture.key} className="culture-bar-item">
            <div className="bar-header">
              <span className="bar-label">{culture.label}</span>
              <span className="bar-value">{scores[culture.key as keyof CultureScores].toFixed(1)}</span>
            </div>
            <div className="bar-track">
              <div 
                className="bar-fill"
                style={{ 
                  width: `${Math.min(scores[culture.key as keyof CultureScores], 50) * 2}%`,
                  background: culture.color
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleExportPdf = async () => {
    if (!statistics) return;
    setIsExporting('pdf');
    try {
      await exportToPdf(survey, statistics, chartRef.current);
    } catch (error) {
      console.error('Export PDF failed:', error);
      alert('Xuất PDF thất bại. Vui lòng thử lại.');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportExcel = () => {
    if (!statistics) return;
    setIsExporting('excel');
    try {
      exportToExcel(survey, statistics);
    } catch (error) {
      console.error('Export Excel failed:', error);
      alert('Xuất Excel thất bại. Vui lòng thử lại.');
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="result-page">
      <div className="result-header">
        <Link to="/" className="back-link">← Quay lại Trang chủ</Link>
        <div className="header-content">
          <div className="header-text">
            <h1>{survey.title}</h1>
            <p>{survey.companyName}</p>
          </div>
          <div className="header-actions">
            <button 
              className={`btn btn-export pdf ${isExporting === 'pdf' ? 'loading' : ''}`}
              onClick={handleExportPdf}
              disabled={isExporting !== null}
            >
              {isExporting === 'pdf' ? '⏳ Đang xuất...' : '📄 Xuất PDF'}
            </button>
            <button 
              className={`btn btn-export excel ${isExporting === 'excel' ? 'loading' : ''}`}
              onClick={handleExportExcel}
              disabled={isExporting !== null}
            >
              {isExporting === 'excel' ? '⏳ Đang xuất...' : '📊 Xuất Excel'}
            </button>
            <button onClick={refreshResponses} className="btn btn-secondary">
              🔄 Tải lại
            </button>
            <button onClick={handleLogout} className="btn btn-secondary">
              🔓 Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="summary-card">
          <span className="summary-icon">👥</span>
          <div className="summary-content">
            <span className="summary-value">{statistics.totalResponses}</span>
            <span className="summary-label">Người tham gia</span>
          </div>
        </div>
        <div className="summary-card highlight">
          <span className="summary-icon">🎯</span>
          <div className="summary-content">
            <span className="summary-value">{getDominantCulture(statistics.averageCurrent)}</span>
            <span className="summary-label">Văn hóa hiện tại</span>
          </div>
        </div>
        <div className="summary-card">
          <span className="summary-icon">✨</span>
          <div className="summary-content">
            <span className="summary-value">{getDominantCulture(statistics.averagePreferred)}</span>
            <span className="summary-label">Văn hóa mong muốn</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="result-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Tổng quan
        </button>
        <button 
          className={`tab ${activeTab === 'dimensions' ? 'active' : ''}`}
          onClick={() => setActiveTab('dimensions')}
        >
          📋 Chi tiết 6 khía cạnh
        </button>
        <button 
          className={`tab ${activeTab === 'segments' ? 'active' : ''}`}
          onClick={() => setActiveTab('segments')}
        >
          👥 Phân tích theo nhóm
        </button>
        <button 
          className={`tab ${activeTab === 'rawdata' ? 'active' : ''}`}
          onClick={() => setActiveTab('rawdata')}
        >
          📋 Dữ liệu chi tiết
        </button>
        <button 
          className={`tab ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          💡 Ý kiến bổ sung
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="chart-section" ref={chartRef}>
              <RadarChartComponent 
                currentScores={statistics.averageCurrent}
                preferredScores={statistics.averagePreferred}
                title="Biểu đồ Radar - Văn hóa doanh nghiệp"
              />
            </div>

            <div className="comparison-section">
              <div className="comparison-card">
                <h3>🟢 Văn hóa Hiện tại</h3>
                {renderCultureBar(statistics.averageCurrent)}
              </div>
              <div className="comparison-card">
                <h3>🟡 Văn hóa Mong muốn</h3>
                {renderCultureBar(statistics.averagePreferred)}
              </div>
            </div>

            <div className="change-analysis">
              <h3>📈 Phân tích xu hướng thay đổi</h3>
              <div className="change-grid">
                {(['clan', 'adhocracy', 'market', 'hierarchy'] as const).map(culture => {
                  const current = statistics.averageCurrent[culture];
                  const preferred = statistics.averagePreferred[culture];
                  const change = preferred - current;
                  return (
                    <div key={culture} className="change-item">
                      <span className="change-label">{CULTURE_LABELS[culture]}</span>
                      <div className="change-values">
                        <span>{current.toFixed(1)}</span>
                        <span className={`change-arrow ${change > 0 ? 'up' : change < 0 ? 'down' : ''}`}>
                          {change > 0 ? '↑' : change < 0 ? '↓' : '→'}
                        </span>
                        <span>{preferred.toFixed(1)}</span>
                      </div>
                      <span className={`change-diff ${change > 0 ? 'positive' : change < 0 ? 'negative' : ''}`}>
                        {change > 0 ? '+' : ''}{change.toFixed(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dimensions' && (
          <div className="dimensions-content">
            <div className="dimensions-grid">
              {statistics.dimensionResults.map(dim => (
                <div key={dim.dimensionNumber} className="dimension-card">
                  <h4>{dim.dimensionNumber}. {dim.dimensionName}</h4>
                  <div className="dimension-scores">
                    <div className="score-section">
                      <span className="score-title">Hiện tại</span>
                      <div className="mini-bars">
                        {(['clan', 'adhocracy', 'market', 'hierarchy'] as const).map(culture => (
                          <div key={culture} className="mini-bar">
                            <span style={{ color: CULTURE_COLORS[culture] }}>
                              {culture.charAt(0).toUpperCase()}
                            </span>
                            <div className="mini-track">
                              <div 
                                className="mini-fill"
                                style={{ 
                                  width: `${dim.current[culture] * 2}%`,
                                  background: CULTURE_COLORS[culture]
                                }}
                              ></div>
                            </div>
                            <span className="mini-value">{dim.current[culture].toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="score-section">
                      <span className="score-title">Mong muốn</span>
                      <div className="mini-bars">
                        {(['clan', 'adhocracy', 'market', 'hierarchy'] as const).map(culture => (
                          <div key={culture} className="mini-bar">
                            <span style={{ color: CULTURE_COLORS[culture] }}>
                              {culture.charAt(0).toUpperCase()}
                            </span>
                            <div className="mini-track">
                              <div 
                                className="mini-fill"
                                style={{ 
                                  width: `${dim.preferred[culture] * 2}%`,
                                  background: CULTURE_COLORS[culture]
                                }}
                              ></div>
                            </div>
                            <span className="mini-value">{dim.preferred[culture].toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'segments' && (
          <div className="segments-content">
            <div className="segment-section">
              <h3>📁 Theo Phòng ban</h3>
              <div className="segment-table">
                <div className="table-header">
                  <span>Phòng ban</span>
                  <span>Clan</span>
                  <span>Adhocracy</span>
                  <span>Market</span>
                  <span>Hierarchy</span>
                </div>
                {Object.entries(statistics.byDepartment).map(([dept, scores]) => (
                  <div key={dept} className="table-row">
                    <span className="segment-name">{dept}</span>
                    <span style={{ color: CULTURE_COLORS.clan }}>{scores.clan.toFixed(1)}</span>
                    <span style={{ color: CULTURE_COLORS.adhocracy }}>{scores.adhocracy.toFixed(1)}</span>
                    <span style={{ color: CULTURE_COLORS.market }}>{scores.market.toFixed(1)}</span>
                    <span style={{ color: CULTURE_COLORS.hierarchy }}>{scores.hierarchy.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="segment-section">
              <h3>💼 Theo Vị trí</h3>
              <div className="segment-table">
                <div className="table-header">
                  <span>Vị trí</span>
                  <span>Clan</span>
                  <span>Adhocracy</span>
                  <span>Market</span>
                  <span>Hierarchy</span>
                </div>
                {Object.entries(statistics.byPosition).map(([pos, scores]) => (
                  <div key={pos} className="table-row">
                    <span className="segment-name">{pos}</span>
                    <span style={{ color: CULTURE_COLORS.clan }}>{scores.clan.toFixed(1)}</span>
                    <span style={{ color: CULTURE_COLORS.adhocracy }}>{scores.adhocracy.toFixed(1)}</span>
                    <span style={{ color: CULTURE_COLORS.market }}>{scores.market.toFixed(1)}</span>
                    <span style={{ color: CULTURE_COLORS.hierarchy }}>{scores.hierarchy.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="segment-section">
              <h3>⏱️ Theo Thâm niên</h3>
              <div className="segment-table">
                <div className="table-header">
                  <span>Thâm niên</span>
                  <span>Clan</span>
                  <span>Adhocracy</span>
                  <span>Market</span>
                  <span>Hierarchy</span>
                </div>
                {Object.entries(statistics.bySeniority).map(([sen, scores]) => (
                  <div key={sen} className="table-row">
                    <span className="segment-name">{sen}</span>
                    <span style={{ color: CULTURE_COLORS.clan }}>{scores.clan.toFixed(1)}</span>
                    <span style={{ color: CULTURE_COLORS.adhocracy }}>{scores.adhocracy.toFixed(1)}</span>
                    <span style={{ color: CULTURE_COLORS.market }}>{scores.market.toFixed(1)}</span>
                    <span style={{ color: CULTURE_COLORS.hierarchy }}>{scores.hierarchy.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rawdata' && (
          <div className="rawdata-content">
            <div className="rawdata-info">
              <p>📊 Tổng cộng <strong>{survey.responses.length}</strong> phản hồi</p>
            </div>
            <div className="rawdata-table-wrapper">
              <table className="rawdata-table">
                <thead>
                  <tr>
                    <th rowSpan={2}>STT</th>
                    <th rowSpan={2}>Email</th>
                    <th rowSpan={2}>Phòng ban</th>
                    <th rowSpan={2}>Vị trí</th>
                    <th rowSpan={2}>Thâm niên</th>
                    <th rowSpan={2}>Giới tính</th>
                    <th rowSpan={2}>Độ tuổi</th>
                    {OCAI_QUESTIONS.map(q => (
                      <th key={q.dimensionNumber} colSpan={8} className="dimension-header">
                        {q.dimensionNumber}. {q.dimensionName}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    {OCAI_QUESTIONS.map(q => (
                      <>
                        <th key={`${q.dimensionNumber}-A-cur`} className="score-header clan">A-HT</th>
                        <th key={`${q.dimensionNumber}-B-cur`} className="score-header adhocracy">B-HT</th>
                        <th key={`${q.dimensionNumber}-C-cur`} className="score-header market">C-HT</th>
                        <th key={`${q.dimensionNumber}-D-cur`} className="score-header hierarchy">D-HT</th>
                        <th key={`${q.dimensionNumber}-A-pref`} className="score-header clan">A-MM</th>
                        <th key={`${q.dimensionNumber}-B-pref`} className="score-header adhocracy">B-MM</th>
                        <th key={`${q.dimensionNumber}-C-pref`} className="score-header market">C-MM</th>
                        <th key={`${q.dimensionNumber}-D-pref`} className="score-header hierarchy">D-MM</th>
                      </>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {survey.responses.map((response, index) => (
                    <tr key={response.id}>
                      <td className="row-number">{index + 1}</td>
                      <td className="email-cell">{response.participantInfo.email || '-'}</td>
                      <td>{response.participantInfo.department}</td>
                      <td>{response.participantInfo.position}</td>
                      <td>{response.participantInfo.seniority}</td>
                      <td>{response.participantInfo.gender || '-'}</td>
                      <td>{response.participantInfo.ageGroup || '-'}</td>
                      {response.answers.map((answer, ansIdx) => (
                        <>
                          <td key={`${ansIdx}-A-cur`} className="score-cell">{answer.scoreA_current}</td>
                          <td key={`${ansIdx}-B-cur`} className="score-cell">{answer.scoreB_current}</td>
                          <td key={`${ansIdx}-C-cur`} className="score-cell">{answer.scoreC_current}</td>
                          <td key={`${ansIdx}-D-cur`} className="score-cell">{answer.scoreD_current}</td>
                          <td key={`${ansIdx}-A-pref`} className="score-cell preferred">{answer.scoreA_preferred}</td>
                          <td key={`${ansIdx}-B-pref`} className="score-cell preferred">{answer.scoreB_preferred}</td>
                          <td key={`${ansIdx}-C-pref`} className="score-cell preferred">{answer.scoreC_preferred}</td>
                          <td key={`${ansIdx}-D-pref`} className="score-cell preferred">{answer.scoreD_preferred}</td>
                        </>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rawdata-legend">
              <h4>Chú thích:</h4>
              <div className="legend-grid">
                <div className="legend-section">
                  <strong>Văn hóa:</strong>
                  <span className="legend-item"><span className="legend-color clan"></span>A = Hợp tác (Clan)</span>
                  <span className="legend-item"><span className="legend-color adhocracy"></span>B = Sáng tạo (Adhocracy)</span>
                  <span className="legend-item"><span className="legend-color market"></span>C = Cạnh tranh (Market)</span>
                  <span className="legend-item"><span className="legend-color hierarchy"></span>D = Kiểm soát (Hierarchy)</span>
                </div>
                <div className="legend-section">
                  <strong>Loại điểm:</strong>
                  <span className="legend-item">HT = Hiện tại (Current)</span>
                  <span className="legend-item">MM = Mong muốn (Preferred)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="feedback-content">
            <div className="feedback-info">
              <p>💡 Tổng cộng <strong>{survey.responses.filter(r => r.additionalQuestions?.whyMi2Exists || r.additionalQuestions?.mi2Future || r.additionalQuestions?.mi2Values).length}</strong> phản hồi có ý kiến bổ sung</p>
            </div>
            
            <div className="feedback-sections">
              {/* Vì sao Mi2 tồn tại */}
              <div className="feedback-section">
                <h3>🎯 Vì sao Mi2 tồn tại?</h3>
                <div className="feedback-list">
                  {survey.responses
                    .filter(r => r.additionalQuestions?.whyMi2Exists)
                    .map((response, index) => (
                      <div key={response.id} className="feedback-item">
                        <div className="feedback-meta">
                          <span className="feedback-index">#{index + 1}</span>
                          <span className="feedback-dept">{response.participantInfo.department}</span>
                        </div>
                        <p className="feedback-text">{response.additionalQuestions?.whyMi2Exists}</p>
                      </div>
                    ))}
                  {survey.responses.filter(r => r.additionalQuestions?.whyMi2Exists).length === 0 && (
                    <p className="no-feedback">Chưa có phản hồi nào</p>
                  )}
                </div>
              </div>

              {/* 5-10 năm sau Mi2 */}
              <div className="feedback-section">
                <h3>🔮 5-10 năm sau Mi2 sẽ như thế nào?</h3>
                <div className="feedback-list">
                  {survey.responses
                    .filter(r => r.additionalQuestions?.mi2Future)
                    .map((response, index) => (
                      <div key={response.id} className="feedback-item">
                        <div className="feedback-meta">
                          <span className="feedback-index">#{index + 1}</span>
                          <span className="feedback-dept">{response.participantInfo.department}</span>
                        </div>
                        <p className="feedback-text">{response.additionalQuestions?.mi2Future}</p>
                      </div>
                    ))}
                  {survey.responses.filter(r => r.additionalQuestions?.mi2Future).length === 0 && (
                    <p className="no-feedback">Chưa có phản hồi nào</p>
                  )}
                </div>
              </div>

              {/* Giá trị Mi2 */}
              <div className="feedback-section">
                <h3>💎 Giá trị rõ nhất ở Mi2 & Giá trị cần tăng cường</h3>
                <div className="feedback-list">
                  {survey.responses
                    .filter(r => r.additionalQuestions?.mi2Values)
                    .map((response, index) => (
                      <div key={response.id} className="feedback-item">
                        <div className="feedback-meta">
                          <span className="feedback-index">#{index + 1}</span>
                          <span className="feedback-dept">{response.participantInfo.department}</span>
                        </div>
                        <p className="feedback-text">{response.additionalQuestions?.mi2Values}</p>
                      </div>
                    ))}
                  {survey.responses.filter(r => r.additionalQuestions?.mi2Values).length === 0 && (
                    <p className="no-feedback">Chưa có phản hồi nào</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
