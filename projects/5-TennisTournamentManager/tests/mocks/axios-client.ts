/**
 * Mock for AxiosClient — replaces the real implementation in unit tests to avoid
 * import.meta.env which is Vite-specific and not supported by Jest/Node.
 */
export class AxiosClient {
  public async get<T>(_url: string, _config?: unknown): Promise<T> {
    return undefined as unknown as T;
  }
  public async post<T>(_url: string, _data?: unknown, _config?: unknown): Promise<T> {
    return undefined as unknown as T;
  }
  public async put<T>(_url: string, _data?: unknown, _config?: unknown): Promise<T> {
    return undefined as unknown as T;
  }
  public async delete<T>(_url: string, _config?: unknown): Promise<T> {
    return undefined as unknown as T;
  }
}
