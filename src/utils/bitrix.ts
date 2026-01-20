// Bitrix24 API Integration
const BITRIX_WEBHOOK_URL = import.meta.env.VITE_BITRIX_WEBHOOK_URL || '';

export interface BitrixDepartment {
  ID: string;
  NAME: string;
  SORT: number;
  PARENT: string;
  UF_HEAD?: string;
}

export interface BitrixDepartmentsResponse {
  result: BitrixDepartment[];
  total: number;
}

// Fetch all departments from Bitrix24
export async function fetchBitrixDepartments(): Promise<string[]> {
  if (!BITRIX_WEBHOOK_URL) {
    console.warn('Bitrix24 webhook URL not configured');
    return [];
  }

  try {
    const response = await fetch(`${BITRIX_WEBHOOK_URL}department.get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sort: 'NAME',
        order: 'ASC'
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: BitrixDepartmentsResponse = await response.json();
    
    // Extract department names only
    const departmentNames = data.result
      .map(dept => dept.NAME)
      .filter(name => name && name.trim() !== '');
    
    return departmentNames;
  } catch (error) {
    console.error('Failed to fetch Bitrix24 departments:', error);
    return [];
  }
}

// Cache departments to avoid repeated API calls
let cachedDepartments: string[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getDepartments(): Promise<string[]> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cachedDepartments && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedDepartments;
  }
  
  // Fetch fresh data
  const departments = await fetchBitrixDepartments();
  
  if (departments.length > 0) {
    cachedDepartments = departments;
    cacheTimestamp = now;
    return departments;
  }
  
  // Return cached data even if expired, as fallback
  if (cachedDepartments) {
    return cachedDepartments;
  }
  
  return [];
}
