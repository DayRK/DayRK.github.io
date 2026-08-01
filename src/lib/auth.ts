import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

export function generateToken(data: Record<string, any>): string {
  return jwt.sign(data, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): Record<string, any> | null {
  try {
    return jwt.verify(token, JWT_SECRET) as Record<string, any>;
  } catch (error) {
    return null;
  }
}

export async function validateAdminPassword(password: string): Promise<boolean> {
  if (!password) return false;

  if (ADMIN_PASSWORD.startsWith('$2')) {
    return comparePassword(password, ADMIN_PASSWORD);
  }

  return password === ADMIN_PASSWORD;
}

export function getAdminToken(password: string): string | null {
  if (password === ADMIN_PASSWORD) {
    return generateToken({ isAdmin: true, iat: Date.now() });
  }
  return null;
}
