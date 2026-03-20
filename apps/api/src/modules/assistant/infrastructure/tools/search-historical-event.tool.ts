import { httpGet, HttpError } from '../../../../lib/http-client.js';

interface WikipediaSummary {
  title: string;
  extract: string;
  content_urls?: { desktop?: { page?: string } };
}

// Usa la Wikipedia REST API (sin API key) para buscar eventos históricos.
export const searchHistoricalEvent = async (query: string): Promise<unknown> => {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;

  try {
    const data = await httpGet<WikipediaSummary>(url, {
      'User-Agent': 'HistoriBot/1.0 (educational project)',
    });

    return {
      title: data.title,
      summary: data.extract,
      url: data.content_urls?.desktop?.page,
    };
  } catch (err) {
    if (err instanceof HttpError && err.status === 404) {
      throw new Error(`No Wikipedia article found for: "${query}"`);
    }
    throw err;
  }
};
