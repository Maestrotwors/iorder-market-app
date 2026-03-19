import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { SessionResponse, SignUpResponse } from '../types/auth.types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/auth';

  login(email: string, password: string): Observable<SessionResponse> {
    return this.http.post<SessionResponse>(
      `${this.apiUrl}/sign-in/email`,
      { email, password },
      { withCredentials: true },
    );
  }

  register(name: string, email: string, password: string): Observable<SignUpResponse> {
    return this.http.post<SignUpResponse>(
      `${this.apiUrl}/sign-up/email`,
      { name, email, password, role: 'customer' },
      { withCredentials: true },
    );
  }

  logout(): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${this.apiUrl}/sign-out`,
      {},
      { withCredentials: true },
    );
  }

  getSession(): Observable<SessionResponse | null> {
    return this.http
      .get<SessionResponse>(`${this.apiUrl}/get-session`, { withCredentials: true })
      .pipe(catchError(() => of(null)));
  }
}
