import { Capsule, ConvoData, SectionInfo } from '../types/capsule';

const CAPSULES_DAY_CACHE_PREFIX = '@capsules_day_cache_';
const CONVO_CACHE_PREFIX = '@convo_cache_';
const REMOTE_FOLDER_URL = 'https://raw.githubusercontent.com/satyam-x10/capsule/dev/data/capsules';
const CONVO_REMOTE_FOLDER_URL = 'https://raw.githubusercontent.com/satyam-x10/capsule/dev/data/convo';

// Safe localStorage wrapper for Next.js SSR
const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        console.warn('[capsuleApi] Failed to read from localStorage:', e);
      }
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, value);
      } catch (e) {
        console.warn('[capsuleApi] Failed to write to localStorage:', e);
      }
    }
  }
};

/**
 * Returns the current date in YYYY-MM-DD format (local time zone)
 */
export function getTodayDateStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses YYYY-MM-DD to extract the month ID in MM-YY format
 */
export function getMonthIdFromDate(dateStr: string): string {
  if (!dateStr || !dateStr.includes('-')) return '';
  const [yearStr, monthStr] = dateStr.split('-');
  const yearShort = yearStr.slice(-2);
  return `${monthStr}-${yearShort}`;
}

/**
 * Parses YYYY-MM-DD to extract the day ID in DD format
 */
export function getDayIdFromDate(dateStr: string): string {
  if (!dateStr || !dateStr.includes('-')) return '';
  const parts = dateStr.split('-');
  return parts[2] || '';
}

/**
 * Formats a YYYY-MM-DD date string into a human-readable format, e.g. "May 27, 2026"
 */
export function formatDateString(dateStr: string): string {
  if (!dateStr || !dateStr.includes('-')) return dateStr;
  
  try {
    const [yearStr, monthStr, dayStr] = dateStr.split('-');
    const year = parseInt(yearStr, 10);
    const monthIndex = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);
    
    const date = new Date(year, monthIndex, day);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Fetches the capsules for a specific day from the remote directory or reads from cache.
 */
export async function getDayCapsules(dateStr: string): Promise<Capsule[]> {
  const cacheKey = `${CAPSULES_DAY_CACHE_PREFIX}${dateStr}`;

  // Check cache first
  const cachedData = safeStorage.getItem(cacheKey);
  if (cachedData) {
    try {
      const parsed = JSON.parse(cachedData);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      console.warn('[capsuleApi] Failed to parse cached day capsules:', e);
    }
  }

  // Parse month and day IDs
  const monthId = getMonthIdFromDate(dateStr);
  const dayId = getDayIdFromDate(dateStr);

  if (!monthId || !dayId) {
    throw new Error(`Invalid date string: ${dateStr}`);
  }

  // Fetch from remote folder: e.g. REMOTE_FOLDER_URL/05-26/27.json
  const targetUrl = `${REMOTE_FOLDER_URL}/${monthId}/${dayId}.json`;
  const response = await fetch(targetUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch day ${dateStr} from ${targetUrl}: status ${response.status}`);
  }

  const fetchedData = await response.json();
  if (Array.isArray(fetchedData)) {
    // Store to cache
    safeStorage.setItem(cacheKey, JSON.stringify(fetchedData));
    return fetchedData;
  } else {
    throw new Error('Fetched data is not a valid array');
  }
}

/**
 * Fetches sections metadata directly from raw GitHub URL.
 */
export async function getSections(): Promise<SectionInfo[]> {
  const targetUrl = `${REMOTE_FOLDER_URL}/sections.json`;
  const response = await fetch(targetUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch sections from ${targetUrl}: status ${response.status}`);
  }

  const fetchedData = await response.json();
  if (Array.isArray(fetchedData)) {
    return fetchedData;
  } else {
    throw new Error('Fetched sections data is not a valid array');
  }
}

/**
 * Fetches the daily conversation (dialogue, vocabulary, takeaways) for a specific day.
 */
export async function getConvo(dateStr: string): Promise<ConvoData | null> {
  const cacheKey = `${CONVO_CACHE_PREFIX}${dateStr}`;

  // Check cache first
  const cachedData = safeStorage.getItem(cacheKey);
  if (cachedData) {
    try {
      const parsed = JSON.parse(cachedData);
      if (parsed && typeof parsed === 'object' && parsed.conversation) {
        return parsed as ConvoData;
      }
    } catch (e) {
      console.warn('[capsuleApi] Failed to parse cached convo:', e);
    }
  }

  const monthId = getMonthIdFromDate(dateStr);
  const dayId = getDayIdFromDate(dateStr);

  if (!monthId || !dayId) {
    throw new Error(`Invalid date string for convo: ${dateStr}`);
  }

  const targetUrl = `${CONVO_REMOTE_FOLDER_URL}/${monthId}/${dayId}.json`;
  const response = await fetch(targetUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      console.log(`[capsuleApi] Convo not found for ${dateStr} at ${targetUrl}`);
      return null;
    }
    throw new Error(`Failed to fetch convo for ${dateStr} from ${targetUrl}: status ${response.status}`);
  }

  const fetchedData = await response.json();
  if (fetchedData && typeof fetchedData === 'object' && fetchedData.conversation) {
    // Cache the loaded convo data
    safeStorage.setItem(cacheKey, JSON.stringify(fetchedData));
    return fetchedData as ConvoData;
  } else {
    throw new Error('Fetched convo data is not valid JSON object');
  }
}

/**
 * Generates available daily date strings (YYYY-MM-DD) for a given month ID (MM-YY).
 */
export function generateDatesForMonth(monthId: string): string[] {
  if (!monthId || !monthId.includes('-')) return [];
  const [monthStr, yearStr] = monthId.split('-');
  const month = parseInt(monthStr, 10);
  const year = 2000 + parseInt(yearStr, 10);
  
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYearShort = String(now.getFullYear()).slice(-2);
  const currentMonthId = `${String(currentMonth).padStart(2, '0')}-${currentYearShort}`;
  
  const totalDays = new Date(year, month, 0).getDate();
  const maxDay = (monthId === currentMonthId) ? now.getDate() : totalDays;
  
  const dates: string[] = [];
  const startDay = Math.max(1, maxDay - 2); // default to trailing 3 days
  
  for (let d = startDay; d <= maxDay; d++) {
    const dayStr = String(d).padStart(2, '0');
    const monthStrPadded = String(month).padStart(2, '0');
    dates.push(`${year}-${monthStrPadded}-${dayStr}`);
  }
  return dates;
}
