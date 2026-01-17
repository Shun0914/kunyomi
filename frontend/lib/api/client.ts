/**
 * APIクライアントのベース設定
 */

// 環境変数からAPIのベースURLを取得（デフォルトはローカル開発環境）
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * APIエラークラス
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * APIリクエストの共通処理
 */
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
  });

  // ---- エラー時処理 ----
  if (!response.ok) {
    let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
    let errorData: unknown;

    try {
      // エラー時はJSONのことが多い
      errorData = await response.json();
      if (errorData && typeof errorData === 'object' && 'detail' in errorData) {
        errorMessage = String((errorData as any).detail);
      }
    } catch {
      // JSONでなければtextを試す
      try {
        const text = await response.text();
        errorMessage = text || errorMessage;
      } catch {
        // 何もしない
      }
    }

    throw new ApiError(errorMessage, response.status, errorData);
  }

  // ---- 成功時処理 ----

  // 204 No Content（例: /view）は本文が空なのでここで終了
  if (response.status === 204) {
    return undefined as T;
  }

  // まず本文をテキストで取る（空ならundefined）
  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  // JSON前提。JSONでなければエラーにする
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError('Invalid JSON response', response.status, text);
  }
}

/**
 * GETリクエスト
 */
export async function get<T>(endpoint: string): Promise<T> {
  return fetchApi<T>(endpoint, { method: 'GET' });
}

/**
 * POSTリクエスト
 */
export async function post<T>(endpoint: string, data?: unknown): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUTリクエスト
 */
export async function put<T>(endpoint: string, data?: unknown): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PATCHリクエスト
 */
export async function patch<T>(endpoint: string, data?: unknown): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETEリクエスト
 */
export async function del<T>(endpoint: string): Promise<T> {
  return fetchApi<T>(endpoint, { method: 'DELETE' });
}
