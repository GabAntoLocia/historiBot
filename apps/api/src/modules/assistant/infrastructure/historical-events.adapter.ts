import { httpGet } from '../../../lib/http-client.js';
import type { HistoricalEventsPort, HistoricalEventsResult } from '../domain/historical-events.port.js';
import { env } from '../../../config/env.js';

// ─── Day in History API (dayinhistory.dev) ────────────────────────────────────
interface DihEvent {
  year: string;
  title: string;
  description: string;
}

interface DihResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DihEvent[];
}

// ─── API Ninjas (fallback) ────────────────────────────────────────────────────
interface ApiNinjasEvent {
  year: string;
  month: string;
  day: string;
  event: string;
}

// ─── Wikipedia (enrichment) ───────────────────────────────────────────────────
interface WikiSummary {
  title: string;
  content_urls?: { desktop?: { page?: string } };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
] as const;

const DIH_BASE = 'https://api.dayinhistory.dev';

function dihHeaders(): Record<string, string> {
  return env.DAY_IN_HISTORY_API_KEY
    ? { Authorization: `Bearer ${env.DAY_IN_HISTORY_API_KEY}` }
    : {};
}

async function fetchDayInHistory(month: number, day: number): Promise<DihResponse> {
  const monthName = MONTH_NAMES[month - 1];
  return httpGet<DihResponse>(`${DIH_BASE}/v1/events/${monthName}/${day}/`, dihHeaders());
}

async function fetchTodayDayInHistory(): Promise<DihResponse> {
  return httpGet<DihResponse>(`${DIH_BASE}/v1/today/events/`, dihHeaders());
}

async function fetchApiNinjas(month: number, day: number): Promise<ApiNinjasEvent[]> {
  if (!env.API_NINJAS_KEY) throw new Error('API_NINJAS_KEY not configured');
  return httpGet<ApiNinjasEvent[]>(
    `https://api.api-ninjas.com/v1/historicalevents?month=${month}&day=${day}`,
    { 'X-Api-Key': env.API_NINJAS_KEY },
  );
}

// Enriches an event title with its Wikipedia article URL.
// Silent failure: if Wikipedia doesn't respond the event is still returned.
async function resolveWikipediaUrl(
  title: string,
): Promise<{ title: string; url: string } | null> {
  try {
    const data = await httpGet<WikiSummary>(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { 'User-Agent': 'HistoriBot/1.0 (educational project)' },
    );
    return { title: data.title, url: data.content_urls?.desktop?.page ?? '' };
  } catch {
    return null;
  }
}

// ─── Adapter ──────────────────────────────────────────────────────────────────
//
// Source priority:
//   1. Day in History API (dayinhistory.dev) — free tier, 10 req/h; premium with DAY_IN_HISTORY_API_KEY
//   2. API Ninjas — fallback, requires API_NINJAS_KEY
//   3. Wikipedia REST API — enriches each event title with its article URL (no key)

export const historicalEventsAdapter: HistoricalEventsPort = {
  async getByDate(month: number, day: number): Promise<HistoricalEventsResult> {
    const now = new Date();
    const isToday = month === now.getMonth() + 1 && day === now.getDate();
    const monthLabel = MONTH_NAMES[month - 1];
    const dateLabel = `${monthLabel.charAt(0).toUpperCase()}${monthLabel.slice(1)} ${day}`;

    // ── Primary: Day in History API ───────────────────────────────────────────
    try {
      const raw = isToday
        ? await fetchTodayDayInHistory()
        : await fetchDayInHistory(month, day);

      const events = await Promise.all(
        raw.results.slice(0, 5).map(async (e) => {
          const wiki = await resolveWikipediaUrl(e.title);
          return {
            year: Number(e.year) || 0,
            description: `${e.title}: ${e.description}`,
            relatedArticles: wiki ? [wiki] : [],
          };
        }),
      );

      return { date: dateLabel, events };
    } catch (primaryErr) {
      console.warn(
        '[historical-events] dayinhistory.dev failed, falling back to API Ninjas:',
        primaryErr,
      );
    }

    // ── Fallback: API Ninjas ──────────────────────────────────────────────────
    const ninjaEvents = await fetchApiNinjas(month, day);

    const events = ninjaEvents.slice(0, 5).map((e) => ({
      year: Number(e.year),
      description: e.event,
      relatedArticles: [] as { title: string; url: string }[],
    }));

    return { date: dateLabel, events };
  },
};
