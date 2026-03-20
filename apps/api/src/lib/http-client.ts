export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export async function httpGet<T>(
  url: string,
  headers?: Record<string, string>,
): Promise<T> {
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new HttpError(response.status, `GET ${url} → ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function httpPost<T>(
  url: string,
  body: unknown,
  headers?: Record<string, string>,
): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new HttpError(response.status, `POST ${url} → ${response.status}`);
  }

  return response.json() as Promise<T>;
}
