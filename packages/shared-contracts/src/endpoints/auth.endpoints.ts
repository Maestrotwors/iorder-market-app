import type { IUser, ApiResponse } from '../types';
import type { LoginDto, RegisterDto, AuthTokens } from '../schemas';

// POST /api/auth/login
export interface LoginRequest extends LoginDto {}
export interface LoginResponse extends ApiResponse<AuthTokens & { user: IUser }> {}

// POST /api/auth/register
export interface RegisterRequest extends RegisterDto {}
export interface RegisterResponse extends ApiResponse<{ user: IUser; tokens: AuthTokens }> {}

// POST /api/auth/refresh
export interface RefreshTokenRequest {
  refreshToken: string;
}
export interface RefreshTokenResponse extends ApiResponse<AuthTokens> {}

// GET /api/auth/me
export interface GetMeResponse extends ApiResponse<IUser> {}
