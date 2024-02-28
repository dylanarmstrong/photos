declare module 'http' {
  // eslint-disable-next-line import/no-unused-modules
  export interface ServerResponse {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    locals: Record<string, any> &
      Partial<{
        nonce: string;
      }>;
  }
}
