import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Survey, SurveyResponse, DimensionAnswer, ParticipantInfo } from '../types';
import { submitToGoogleSheet, fetchFromGoogleSheet } from '../utils/googleSheets';
import { rawScoreToPercentages } from '../utils/calculations';

interface SurveyContextType {
  survey: Survey;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  addResponse: (response: { participantInfo: ParticipantInfo; answers: DimensionAnswer[] }) => Promise<boolean>;
  refreshResponses: () => Promise<void>;
}

const SurveyContext = createContext<SurveyContextType | null>(null);

// Default survey configuration
const DEFAULT_SURVEY: Survey = {
  id: 'default-survey',
  companyName: 'Mi2 JSC',
  title: 'Khảo sát Văn hóa Mi2',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2030-12-31'),
  status: 'active',
  anonymous: false,
  shareLink: 'survey',
  responses: [],
  createdAt: new Date()
};

export function SurveyProvider({ children }: { children: ReactNode }) {
  const [survey, setSurvey] = useState<Survey>(DEFAULT_SURVEY);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch responses from Google Sheets on mount
  const refreshResponses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchFromGoogleSheet();
      
      if (result.success && result.responses) {
        const mappedResponses: SurveyResponse[] = result.responses.map(r => ({
          id: r.id,
          surveyId: 'default-survey',
          participantInfo: {
            email: r.participantInfo.email,
            department: r.participantInfo.department,
            position: r.participantInfo.position,
            seniority: r.participantInfo.seniority,
            gender: r.participantInfo.gender,
            ageGroup: r.participantInfo.ageGroup
          },
          answers: r.answers.map(a => ({
            dimensionNumber: a.dimensionNumber,
            scoreA_current: a.scoreA_current,
            scoreB_current: a.scoreB_current,
            scoreC_current: a.scoreC_current,
            scoreD_current: a.scoreD_current,
            scoreA_preferred: a.scoreA_preferred,
            scoreB_preferred: a.scoreB_preferred,
            scoreC_preferred: a.scoreC_preferred,
            scoreD_preferred: a.scoreD_preferred
          })),
          submittedAt: new Date(r.submittedAt)
        }));
        
        setSurvey(prev => ({
          ...prev,
          responses: mappedResponses
        }));
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch responses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load responses on mount
  useEffect(() => {
    refreshResponses();
  }, [refreshResponses]);

  // Submit response to Google Sheets
  const addResponse = useCallback(async (response: { participantInfo: ParticipantInfo; answers: DimensionAnswer[] }): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Convert raw 1-10 scores to percentages for submission
      // Reuse the same field names (scoreA_current, etc.) so Apps Script works unchanged
      const answersAsPercent = response.answers.map(answer => {
        const currentPct = rawScoreToPercentages(
          answer.scoreA_current, answer.scoreB_current,
          answer.scoreC_current, answer.scoreD_current
        );
        const preferredPct = rawScoreToPercentages(
          answer.scoreA_preferred, answer.scoreB_preferred,
          answer.scoreC_preferred, answer.scoreD_preferred
        );
        return {
          dimensionNumber: answer.dimensionNumber,
          scoreA_current: currentPct.pctA,
          scoreB_current: currentPct.pctB,
          scoreC_current: currentPct.pctC,
          scoreD_current: currentPct.pctD,
          scoreA_preferred: preferredPct.pctA,
          scoreB_preferred: preferredPct.pctB,
          scoreC_preferred: preferredPct.pctC,
          scoreD_preferred: preferredPct.pctD,
        };
      });

      const result = await submitToGoogleSheet({
        participantInfo: response.participantInfo,
        answers: answersAsPercent
      });
      
      if (result.success) {
        // Add to local state immediately for UI feedback
        const newResponse: SurveyResponse = {
          id: result.id || crypto.randomUUID(),
          surveyId: 'default-survey',
          participantInfo: response.participantInfo,
          answers: response.answers,
          submittedAt: new Date()
        };
        
        setSurvey(prev => ({
          ...prev,
          responses: [...prev.responses, newResponse]
        }));
        
        return true;
      } else {
        setError(result.error || 'Failed to submit');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit response');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return (
    <SurveyContext.Provider value={{ 
      survey, 
      isLoading, 
      isSubmitting, 
      error, 
      addResponse,
      refreshResponses 
    }}>
      {children}
    </SurveyContext.Provider>
  );
}

export function useSurvey() {
  const context = useContext(SurveyContext);
  if (!context) {
    throw new Error('useSurvey must be used within a SurveyProvider');
  }
  return context;
}
