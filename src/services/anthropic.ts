interface CreateStructuredParams {
  system: string;
  userContent: string;
  toolName: string;
  toolDescription: string;
  responseSchema: Record<string, unknown>;
  maxTokens?: number;
  temperature?: number;
}

export class AnthropicClient {
  private apiKey: string;
  private model: string;
  // 開発時は Vite proxy、本番は直接 Anthropic API を呼ぶ
  private baseUrl = import.meta.env.DEV ? '/api/anthropic' : 'https://api.anthropic.com';
  private maxRetries = 3;

  constructor(apiKey: string, model = 'claude-sonnet-4-20250514') {
    this.apiKey = apiKey;
    this.model = model;
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
          headers: {
            'content-type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
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
      headers: {
        'content-type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
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
