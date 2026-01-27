import { useState, useEffect } from 'react';
import { useSurvey } from '../hooks/useSurvey';
import type { ParticipantInfo, DimensionAnswer } from '../types';
import { DEPARTMENTS, POSITIONS, SENIORITIES, GENDERS, AGE_GROUPS } from '../types';
import { OCAI_QUESTIONS } from '../data/ocaiQuestions';
import { getDepartments } from '../utils/bitrix';
import './TakeSurveyPage.css';

type Step = 'info' | 'questions' | 'complete';

export default function TakeSurveyPage() {
  const { survey, addResponse, isSubmitting } = useSurvey();
  
  const [step, setStep] = useState<Step>('info');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [participantInfo, setParticipantInfo] = useState<ParticipantInfo>({
    department: '',
    position: '',
    seniority: '',
    name: '',
    email: '',
    gender: '',
    ageGroup: ''
  });
  
  const [answers, setAnswers] = useState<DimensionAnswer[]>(
    OCAI_QUESTIONS.map((_, index) => ({
      dimensionNumber: index + 1,
      scoreA_current: 25,
      scoreB_current: 25,
      scoreC_current: 25,
      scoreD_current: 25,
      scoreA_preferred: 25,
      scoreB_preferred: 25,
      scoreC_preferred: 25,
      scoreD_preferred: 25
    }))
  );


  // Dynamic departments from Bitrix24
  const [departments, setDepartments] = useState<string[]>(DEPARTMENTS);
  const [isLoadingDepts, setIsLoadingDepts] = useState(false);

  // Fetch departments from Bitrix24 on mount
  useEffect(() => {
    const loadDepartments = async () => {
      setIsLoadingDepts(true);
      try {
        const bitrixDepts = await getDepartments();
        if (bitrixDepts.length > 0) {
          setDepartments(bitrixDepts);
        }
      } catch (error) {
        console.error('Failed to load Bitrix departments:', error);
        // Keep using fallback DEPARTMENTS
      } finally {
        setIsLoadingDepts(false);
      }
    };
    loadDepartments();
  }, []);

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('questions');
  };

  const updateAnswer = (
    questionIndex: number,
    scoreType: 'current' | 'preferred',
    option: 'A' | 'B' | 'C' | 'D',
    value: number
  ) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      const answer = { ...newAnswers[questionIndex] };
      
      if (scoreType === 'current') {
        if (option === 'A') answer.scoreA_current = value;
        else if (option === 'B') answer.scoreB_current = value;
        else if (option === 'C') answer.scoreC_current = value;
        else if (option === 'D') answer.scoreD_current = value;
      } else {
        if (option === 'A') answer.scoreA_preferred = value;
        else if (option === 'B') answer.scoreB_preferred = value;
        else if (option === 'C') answer.scoreC_preferred = value;
        else if (option === 'D') answer.scoreD_preferred = value;
      }
      
      newAnswers[questionIndex] = answer;
      return newAnswers;
    });
  };

  const getCurrentTotal = (questionIndex: number, type: 'current' | 'preferred'): number => {
    const answer = answers[questionIndex];
    if (type === 'current') {
      return answer.scoreA_current + answer.scoreB_current + answer.scoreC_current + answer.scoreD_current;
    }
    return answer.scoreA_preferred + answer.scoreB_preferred + answer.scoreC_preferred + answer.scoreD_preferred;
  };

  const isQuestionValid = (questionIndex: number): boolean => {
    return getCurrentTotal(questionIndex, 'current') === 100 && 
           getCurrentTotal(questionIndex, 'preferred') === 100;
  };

  const handleNextQuestion = async () => {
    if (currentQuestion < OCAI_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Submit trực tiếp khi hoàn thành câu hỏi cuối
      await submitSurvey();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const submitSurvey = async () => {
    const success = await addResponse({
      participantInfo,
      answers
    });
    if (success) {
      setStep('complete');
    }
  };




  if (step === 'complete') {
    return (
      <div className="survey-complete">
        <div className="complete-content">
          <div className="complete-icon">✨</div>
          <h1>Cảm ơn bạn đã tham gia!</h1>
          <div className="complete-message">
            <p>Phản hồi của bạn đã được ghi nhận thành công.</p>
            <p className="complete-note">
              Ý kiến của bạn rất có giá trị trong việc xây dựng 
              văn hóa Mi2 ngày càng tốt đẹp hơn.
            </p>
          </div>
          <div className="complete-decoration">
            <span>🙏</span>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'info') {
    return (
      <div className="take-survey-page">
        <div className="survey-header">
          <h1>📊 {survey.title}</h1>
          <p>{survey.companyName}</p>
        </div>

        <form onSubmit={handleInfoSubmit} className="info-form">
          <div className="form-intro">
            <h2>Thông tin người tham gia</h2>
            <p>Vui lòng cung cấp một số thông tin để giúp phân tích kết quả</p>
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={participantInfo.email || ''}
              onChange={(e) => setParticipantInfo({ ...participantInfo, email: e.target.value })}
              placeholder="Nhập email của bạn"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phòng ban *</label>
              <select
                value={participantInfo.department}
                onChange={(e) => setParticipantInfo({ ...participantInfo, department: e.target.value })}
                required
                disabled={isLoadingDepts}
              >
                <option value="">{isLoadingDepts ? 'Đang tải...' : '-- Chọn phòng ban --'}</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Vị trí *</label>
              <select
                value={participantInfo.position}
                onChange={(e) => setParticipantInfo({ ...participantInfo, position: e.target.value })}
                required
              >
                <option value="">-- Chọn vị trí --</option>
                {POSITIONS.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Thâm niên công tác *</label>
              <select
                value={participantInfo.seniority}
                onChange={(e) => setParticipantInfo({ ...participantInfo, seniority: e.target.value })}
                required
              >
                <option value="">-- Chọn thâm niên --</option>
                {SENIORITIES.map(sen => (
                  <option key={sen} value={sen}>{sen}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Độ tuổi</label>
              <select
                value={participantInfo.ageGroup || ''}
                onChange={(e) => setParticipantInfo({ ...participantInfo, ageGroup: e.target.value })}
              >
                <option value="">-- Chọn độ tuổi --</option>
                {AGE_GROUPS.map(age => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Giới tính</label>
            <div className="radio-group">
              {GENDERS.map(gender => (
                <label key={gender} className="radio-label">
                  <input
                    type="radio"
                    name="gender"
                    value={gender}
                    checked={participantInfo.gender === gender}
                    onChange={(e) => setParticipantInfo({ ...participantInfo, gender: e.target.value })}
                  />
                  <span>{gender}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full">
            Bắt đầu khảo sát →
          </button>
        </form>
      </div>
    );
  }

  const question = OCAI_QUESTIONS[currentQuestion];
  const currentAnswer = answers[currentQuestion];

  return (
    <div className="take-survey-page">
      <div className="question-progress">
        <div className="progress-info">
          <span>Câu hỏi {currentQuestion + 1} / {OCAI_QUESTIONS.length}</span>
          <span className="progress-dimension">{question.dimensionName}</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentQuestion + 1) / OCAI_QUESTIONS.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="question-content">
        <div className="question-header">
          <h2>{question.dimensionNumber}. {question.dimensionName}</h2>
          <p className="question-hint">
            Phân chia 100 điểm cho 4 lựa chọn bên dưới. Điểm cao = mô tả phù hợp nhất với tổ chức.
          </p>
        </div>

        <div className="scoring-columns">
          <div className="column-header">
            <div className="column-label"></div>
            <div className="column-label current">Hiện tại</div>
            <div className="column-label preferred">Mong muốn</div>
          </div>

          {question.options.map((option) => {
            const currentKey = `score${option.key}_current` as keyof DimensionAnswer;
            const preferredKey = `score${option.key}_preferred` as keyof DimensionAnswer;
            
            return (
              <div key={option.key} className={`option-row culture-${option.cultureType.toLowerCase()}`}>
                <div className="option-info">
                  <span className="option-key">{option.key}</span>
                  <div className="option-text">
                    <span className="culture-type">{option.cultureTypeVi}</span>
                    <p>{option.description}</p>
                  </div>
                </div>
                <div className="option-inputs">
                  <div className="score-input">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={currentAnswer[currentKey] as number}
                      onChange={(e) => updateAnswer(currentQuestion, 'current', option.key, parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="score-input">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={currentAnswer[preferredKey] as number}
                      onChange={(e) => updateAnswer(currentQuestion, 'preferred', option.key, parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          <div className="total-row">
            <div className="total-label">Tổng điểm:</div>
            <div className="total-values">
              <span className={`total-value ${getCurrentTotal(currentQuestion, 'current') === 100 ? 'valid' : 'invalid'}`}>
                {getCurrentTotal(currentQuestion, 'current')} / 100
              </span>
              <span className={`total-value ${getCurrentTotal(currentQuestion, 'preferred') === 100 ? 'valid' : 'invalid'}`}>
                {getCurrentTotal(currentQuestion, 'preferred')} / 100
              </span>
            </div>
          </div>
        </div>

        <div className="question-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handlePrevQuestion}
            disabled={currentQuestion === 0}
          >
            ← Quay lại
          </button>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={handleNextQuestion}
            disabled={!isQuestionValid(currentQuestion) || isSubmitting}
          >
            {isSubmitting 
              ? '⏳ Đang gửi...' 
              : currentQuestion === OCAI_QUESTIONS.length - 1 
                ? 'Hoàn thành' 
                : 'Tiếp theo →'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
