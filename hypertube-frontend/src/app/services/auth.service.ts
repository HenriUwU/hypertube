import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, map, Observable} from "rxjs";
import {UserModel} from "../models/user.model";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrlAuth = 'http://localhost:8080/auth';
  private currentUserSubject: BehaviorSubject<string | null>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<string | null>(sessionStorage.getItem('token'))
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
      }));
  }

  loginViaOmniAuth(code: String, path: String): Observable<any> {
    return this.http.post<{ token: string, id: string }>(`${this.apiUrlAuth}${path}`, code).pipe(
      map(response => {
        sessionStorage.setItem(`id`, response.id);
        sessionStorage.setItem(`token`, response.token);
        this.currentUserSubject.next(response.id);
        this.currentUserSubject.next(response.token)
        return response;
      })
    )
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem(`token`);
  }

  logout(): void {
    sessionStorage.removeItem(`id`);
    sessionStorage.removeItem(`token`);
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

  verifyCurrentPassword(password: string): Observable<any> {
    const token = this.getToken();
    const headers = { Authorization: `Bearer ${token}` };

    return this.http.post(`${this.apiUrlAuth}/old-password-verify`, password, { headers, responseType: 'text' as 'json'  });
  }

  updatePassword(token: string, password: string): Observable<any> {
    const tokenBearer = this.getToken();
    const headers = { Authorization: `Bearer ${tokenBearer}`};
    return this.http.post(`${this.apiUrlAuth}/update-password?token=${token}`, password, { headers, responseType: 'text' as 'json'  });
  }
}
