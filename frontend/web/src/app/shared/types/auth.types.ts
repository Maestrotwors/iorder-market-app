export interface BetterAuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface BetterAuthSession {
  id: string;
  expiresAt: string;
  token: string;
  userId: string;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface SessionResponse {
  user: BetterAuthUser;
  session: BetterAuthSession;
}

export interface SignUpResponse {
  user: BetterAuthUser;
  session: BetterAuthSession;
}

export interface AuthError {
  message: string;
  code?: string;
  statusCode?: number;
}
