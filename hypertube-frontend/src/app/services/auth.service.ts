import {Injectable, Injector} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, map, Observable, of, switchMap} from "rxjs";
import {UserModel} from "../models/user.model";
import {UserService} from "./user.service";
import { TranslateService } from "./translate.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrlAuth = 'http://localhost:8080/auth';
  private currentUserSubject: BehaviorSubject<string | null>;
  private userService: UserService | null = null;
  private translateService: TranslateService | null = null;

  constructor(private http: HttpClient, private injector: Injector) {
    this.currentUserSubject = new BehaviorSubject<string | null>(sessionStorage.getItem('token'))
  }

  private getUserService(): UserService {
    if (!this.userService) {
      this.userService = this.injector.get(UserService);
    }
    return this.userService;
  }

  private getTranslateService(): any {
    if (!this.translateService) {
      this.translateService = this.injector.get(TranslateService);
    }
    return this.translateService;
  }

  register(user: UserModel): Observable<any> {
    return this.http.post(`${this.apiUrlAuth}/register`, user);
  }

  login(user: UserModel): Observable<any> {
    return this.http.post<{ token?: string, id?: string, success: string, message?: string }>(`${this.apiUrlAuth}/login`, user).pipe(
      map(response => {
        if (response.success === "true" && response.token && response.id) {
          sessionStorage.setItem(`id`, response.id);
          sessionStorage.setItem(`token`, response.token);
          this.currentUserSubject.next(response.id);
          this.currentUserSubject.next(response.token);
          // get the language
          this.getUserService().getUser(response.id).subscribe((user: UserModel) => {
            this.getTranslateService().updateLanguage(user.language);
          });
        }
        return response;
      }),
      switchMap(response => {
        if (response.success === "true" && response.id) {
          // same but with language update
          return this.getUserService().getUser(response.id).pipe(
            map((user: UserModel) => {
              this.getTranslateService().updateLanguage(user.language);
              return response;
            })
          );
        } else {
          return of(response);
        }
      })
    );
  }

  loginViaOmniAuth(code: String, path: String): Observable<any> {
    return this.http.post<{ token: string, id: string }>(`${this.apiUrlAuth}${path}`, code).pipe(
      map(response => {
        sessionStorage.setItem(`id`, response.id);
        sessionStorage.setItem(`token`, response.token);
        this.currentUserSubject.next(response.id);
        this.currentUserSubject.next(response.token);
        // get the language
        this.getUserService().getUser(response.id).pipe(
          map((user: UserModel) => {
            this.getTranslateService().updateLanguage(user.language);
            return user.language;
          })
        ).subscribe();
        return response;
      }),
      switchMap(response => {
        // Load user data after successful OAuth login to update header immediately
        return this.getUserService().getUser(response.id).pipe(
          map((user: UserModel) => {
            this.getTranslateService().updateLanguage(user.language);
            return response;
          })
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
    return this.http.get<{ response: string }>(`${this.apiUrlAuth}/verify-email?token=${token}`).pipe
      (map((response: any) => {
        return response.response;
      }));
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
