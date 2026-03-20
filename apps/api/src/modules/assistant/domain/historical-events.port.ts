// Tipos del dominio — no conocen Wikipedia ni ningún proveedor externo

export interface HistoricalEvent {
  year: number;
  description: string;
  relatedArticles: { title: string; url: string }[];
}

export interface HistoricalEventsResult {
  date: string; // ej: "March 20"
  events: HistoricalEvent[];
}

export interface HistoricalEventsPort {
  getByDate(month: number, day: number): Promise<HistoricalEventsResult>;
}
