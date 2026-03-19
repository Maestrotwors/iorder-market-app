import type { IUser } from '../types';
import type { LoginDto, RegisterDto } from '../schemas';

// POST /api/auth/sign-in/email
export interface LoginRequest extends LoginDto {}
export interface LoginResponse {
  user: IUser;
  session: { id: string; token: string; expiresAt: string };
}

// POST /api/auth/sign-up/email
export interface RegisterRequest extends RegisterDto {}
export interface RegisterResponse {
  user: IUser;
  session: { id: string; token: string; expiresAt: string };
}

// GET /api/auth/get-session
export interface GetSessionResponse {
  user: IUser;
  session: { id: string; token: string; expiresAt: string };
}
