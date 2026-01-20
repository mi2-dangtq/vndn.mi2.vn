// Google Sheets API Integration
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbytlVWB5GrcTlg8vjazSOYvUDGBprvsVKV8gq6NUXEp3GkM0RiwDvyFRs4piNBJMiu7Ow/exec';

export interface SurveySubmission {
  participantInfo: {
    email?: string;
    department: string;
    position: string;
    seniority: string;
    gender?: string;
    ageGroup?: string;
  };
  answers: {
    dimensionNumber: number;
    scoreA_current: number;
    scoreB_current: number;
    scoreC_current: number;
    scoreD_current: number;
    scoreA_preferred: number;
    scoreB_preferred: number;
    scoreC_preferred: number;
    scoreD_preferred: number;
  }[];
  // Câu hỏi bổ sung - Giá trị & Tầm nhìn Mi2
  additionalQuestions?: {
    whyMi2Exists: string;
    mi2Future: string;
    mi2Values: string;
  };
}

export interface GoogleSheetResponse {
  success: boolean;
  id?: string;
  error?: string;
}

export interface FetchResponsesResult {
  success: boolean;
  responses?: {
    id: string;
    submittedAt: string;
    participantInfo: {
      email: string;
      department: string;
      position: string;
      seniority: string;
      gender: string;
      ageGroup: string;
    };
    answers: {
      dimensionNumber: number;
      scoreA_current: number;
      scoreB_current: number;
      scoreC_current: number;
      scoreD_current: number;
      scoreA_preferred: number;
      scoreB_preferred: number;
      scoreC_preferred: number;
      scoreD_preferred: number;
    }[];
    // Câu hỏi bổ sung - Giá trị & Tầm nhìn Mi2
    additionalQuestions?: {
      whyMi2Exists: string;
      mi2Future: string;
      mi2Values: string;
    };
  }[];
  error?: string;
}

// Submit survey response to Google Sheets using form data approach
export async function submitToGoogleSheet(data: SurveySubmission): Promise<GoogleSheetResponse> {
  try {
    // Create form data - this avoids CORS preflight
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    
    // Use fetch with redirect: 'follow' to handle Google's redirect
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: formData,
      redirect: 'follow',
    });
    
    // Try to parse the response
    try {
      const result = await response.json();
      return result;
    } catch {
      // If we can't parse JSON, assume success based on status
      return { success: response.ok };
    }
  } catch (error) {
    console.error('Failed to submit to Google Sheet:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Fetch all responses from Google Sheets
export async function fetchFromGoogleSheet(): Promise<FetchResponsesResult> {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'GET',
      redirect: 'follow',
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to fetch from Google Sheet:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
