interface CreateStructuredParams {
  system: string;
  userContent: string;
  toolName: string;
  toolDescription: string;
  responseSchema: Record<string, unknown>;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Anthropic API クライアント
 *
 * - 開発時: Vite proxy (/api/anthropic) → api.anthropic.com（apiKey をヘッダーに付与）
 * - 本番時: Netlify Functions (/api/anthropic) → サーバーサイドで apiKey 注入
 */
export class AnthropicClient {
  private apiKey: string;
  private model: string;
  private maxRetries = 3;
  private isDev = import.meta.env.DEV;

  constructor(apiKey: string, model = 'claude-sonnet-4-20250514') {
    this.apiKey = apiKey;
    this.model = model;
  }

  private get baseUrl(): string {
    // 開発環境・本番環境どちらも /api/anthropic を使う
    // 開発: Vite proxy → api.anthropic.com
    // 本番: Netlify redirects → /.netlify/functions/anthropic-proxy
    return '/api/anthropic';
  }

  private get headers(): Record<string, string> {
    const h: Record<string, string> = {
      'content-type': 'application/json',
    };
    if (this.isDev) {
      // 開発時のみ直接 API キーを送る（Vite proxy 経由）
      h['x-api-key'] = this.apiKey;
      h['anthropic-version'] = '2023-06-01';
      h['anthropic-dangerous-direct-browser-access'] = 'true';
    }
    // 本番時は Netlify Function がサーバーサイドで apiKey を付与
    return h;
  }

  async createStructured<T = unknown>(params: CreateStructuredParams): Promise<T> {
    const body = {
      model: this.model,
      max_tokens: params.maxTokens ?? 16384,
      temperature: params.temperature ?? 0.3,
      system: params.system,
      messages: [{ role: 'user', content: params.userContent }],
      tools: [
        {
          name: params.toolName,
          description: params.toolDescription,
          input_schema: params.responseSchema,
        },
      ],
      tool_choice: { type: 'tool', name: params.toolName },
    };

    let lastError: Error | null = null;
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/v1/messages`, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(body),
        });

        if (response.status === 429 || response.status >= 500) {
          const delay = Math.pow(2, attempt + 1) * 1000;
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Anthropic API error ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        const toolUseBlock = data.content?.find(
          (block: { type: string }) => block.type === 'tool_use'
        );

        if (!toolUseBlock) {
          throw new Error('No tool_use block in response');
        }

        return toolUseBlock.input as T;
      } catch (e) {
        lastError = e as Error;
        if (attempt < this.maxRetries - 1) {
          const delay = Math.pow(2, attempt + 1) * 1000;
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }

    throw lastError ?? new Error('API call failed');
  }

  async createMessage(system: string, userContent: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        model: this.model,
        max_tokens: 8192,
        system,
        messages: [{ role: 'user', content: userContent }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const textBlock = data.content?.find(
      (block: { type: string }) => block.type === 'text'
    );
    return textBlock?.text ?? '';
  }
}
