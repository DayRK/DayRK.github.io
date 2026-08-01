declare module 'jsonwebtoken' {
  export interface JwtPayload {
    [key: string]: any;
    iat?: number;
    exp?: number;
  }

  export function sign(payload: string | object | Buffer, secretOrPrivateKey: string, options?: { expiresIn?: string | number }): string;
  export function verify(token: string, secretOrPrivateKey: string): string | JwtPayload;
}
