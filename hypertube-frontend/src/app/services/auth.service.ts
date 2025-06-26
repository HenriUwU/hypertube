import {Injectable, Injector} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, map, Observable, switchMap} from "rxjs";
import {UserModel} from "../models/user.model";
import {UserService} from "./user.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrlAuth = 'http://localhost:8080/auth';
  private currentUserSubject: BehaviorSubject<string | null>;
  private userService: UserService | null = null;

  constructor(private http: HttpClient, private injector: Injector) {
    this.currentUserSubject = new BehaviorSubject<string | null>(sessionStorage.getItem('token'))
  }

  private getUserService(): UserService {
    if (!this.userService) {
      this.userService = this.injector.get(UserService);
    }
    return this.userService;
  }

  register(user: UserModel): Observable<any> {
    return this.http.post(`${this.apiUrlAuth}/register`, user);
  }

  login(user: UserModel): Observable<any> {
    return this.http.post<{ token: string, id: string }>(`${this.apiUrlAuth}/login`, user).pipe(
      map(response => {
        sessionStorage.setItem(`id`, response.id);
        sessionStorage.setItem(`token`, response.token);
        this.currentUserSubject.next(response.id);
        this.currentUserSubject.next(response.token);
        return response;
      }),
      switchMap(response => {
        // Load user data after successful login to update header immediately
        return this.getUserService().getUser(response.id).pipe(
          map(() => response) // Return the original login response
        );
      })
    );
  }

  loginViaOmniAuth(code: String, path: String): Observable<any> {
    return this.http.post<{ token: string, id: string }>(`${this.apiUrlAuth}${path}`, code).pipe(
      map(response => {
        sessionStorage.setItem(`id`, response.id);
        sessionStorage.setItem(`token`, response.token);
        this.currentUserSubject.next(response.id);
        this.currentUserSubject.next(response.token)
        return response;
      }),
      switchMap(response => {
        // Load user data after successful OAuth login to update header immediately
        return this.getUserService().getUser(response.id).pipe(
          map(() => response) // Return the original login response
        );
      })
    )
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem(`token`);
  }

  logout(): void {
    sessionStorage.removeItem(`id`);
    sessionStorage.removeItem(`token`);
    sessionStorage.setItem(`language`, "en");
    // Clear user data from UserService
    this.getUserService().clearCurrentUser();
  }

  getCurrentUserId(): string | null {
	  return sessionStorage.getItem(`id`);
  }

  getToken(): string | null {
    return sessionStorage.getItem(`token`)
  }

  verifyEmail(token: string): Observable<string> {
    return this.http.get<string>(`${this.apiUrlAuth}/verify-email?token=${token}`).pipe();
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.get(`${this.apiUrlAuth}/forgot-password?email=${email}`);
  }

  verifyPasswordToken(token: string): Observable<any> {
    return this.http.get(`${this.apiUrlAuth}/reset-password?token=${token}`);
  }

  verifyCurrentPassword(password: string): Observable<boolean> {
    const token = this.getToken();
    const headers = { Authorization: `Bearer ${token}` };
    const body = { "oldPassword": password };
    return this.http.post<{ response: string }>(`${this.apiUrlAuth}/old-password-verify`, body, {headers}).pipe
      (map((response: any) => {
        return response.response === "true" || response.response === true;
  }));
  }

  updatePassword(token: string, password: string): Observable<any> {
    const tokenBearer = this.getToken();
    const headers = { Authorization: `Bearer ${tokenBearer}`};

    return this.http.post(`${this.apiUrlAuth}/update-password?token=${token}`, password, { headers, responseType: 'text' as 'json'  });
  }

  updateForgotPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrlAuth}/update-password?token=${token}`, password, { responseType: 'text' as 'json' });
  }

  isOmniauthSession(): Observable<boolean> {
    const tokenBearer = this.getToken();
    const headers = { Authorization: `Bearer ${tokenBearer}`};

    return this.http.get<{ response: string }>(`${this.apiUrlAuth}/omniauth`, { headers}).pipe
      (map((response: any) => {
        return response.response === "true" || response.response === true;
  }));
  }
}
