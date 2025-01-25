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
    return this.http.post<{ token: string}>(`${this.apiUrlAuth}/login`, user).pipe(
      map(response => {
        sessionStorage.setItem(`token`, response.token);
        this.currentUserSubject.next(response.token);
        return response;
      }));
  }

  loginViaOmniAuth(code: String): Observable<any> {
    return this.http.post<{ token: string }>(`${this.apiUrlAuth}/omniauth/42`, code).pipe(
      map(response => {
        sessionStorage.setItem(`token`, response.token);
        this.currentUserSubject.next(response.token)
        return response;
      })
    )
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem(`token`);
  }

  logout(): void {
    sessionStorage.removeItem(`token`);
  }

  getToken(): string | null {
    return sessionStorage.getItem(`token`)
  }
}
