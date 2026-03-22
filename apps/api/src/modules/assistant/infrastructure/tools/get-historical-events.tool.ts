import { historicalEventsAdapter } from '../historical-events.adapter.js';

// Parsea "MM-DD" o usa la fecha de hoy si no se provee
const resolveDate = (date?: string): { month: number; day: number } => {
  if (date) {
    const [m, d] = date.split('-').map(Number);
    if (!m || !d || m < 1 || m > 12 || d < 1 || d > 31) {
      throw new Error(`Invalid date "${date}". Expected format MM-DD (e.g. "03-20")`);
    }
    return { month: m, day: d };
  }

  const now = new Date();
  return { month: now.getMonth() + 1, day: now.getDate() };
};

export const getHistoricalEvents = async (date?: string): Promise<unknown> => {
  const { month, day } = resolveDate(date);
  const result = await historicalEventsAdapter.getByDate(month, day);

  // Return a pre-formatted string with ||| separators so the LLM just
  // repeats it verbatim without reformatting into prose.
  const formatted = result.events
    .map(e => `En ${e.year}, ${e.description.replace(/^[^:]+:\s*/, '')}`)
    .join('|||');

  return { formatted, date: result.date };
};
