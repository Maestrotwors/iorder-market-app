import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { BetterAuthUser, SessionResponse, SignUpResponse } from '../types/auth.types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/auth';

  readonly currentUser = signal<BetterAuthUser | null>(null);
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly userRole = computed(() => this.currentUser()?.role ?? null);

  login(email: string, password: string): Observable<SessionResponse> {
    return this.http
      .post<SessionResponse>(
        `${this.apiUrl}/sign-in/email`,
        { email, password },
        { withCredentials: true },
      )
      .pipe(tap((res) => this.currentUser.set(res.user)));
  }

  register(name: string, email: string, password: string): Observable<SignUpResponse> {
    return this.http
      .post<SignUpResponse>(
        `${this.apiUrl}/sign-up/email`,
        { name, email, password, role: 'customer' },
        { withCredentials: true },
      )
      .pipe(tap((res) => this.currentUser.set(res.user)));
  }

  logout(): Observable<{ success: boolean }> {
    return this.http
      .post<{ success: boolean }>(`${this.apiUrl}/sign-out`, {}, { withCredentials: true })
      .pipe(tap(() => this.currentUser.set(null)));
  }

  getSession(): Observable<SessionResponse | null> {
    return this.http
      .get<SessionResponse>(`${this.apiUrl}/get-session`, { withCredentials: true })
      .pipe(
        tap((res) => this.currentUser.set(res.user)),
        catchError(() => {
          this.currentUser.set(null);
          return of(null);
        }),
      );
  }
}
