import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable, tap} from "rxjs";
import {UserModel} from "../models/user.model";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrlUser = 'http://localhost:8080/user'
  private currentUserSubject = new BehaviorSubject<UserModel | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private httpClient: HttpClient) {
  }

  getUser(id: string): Observable<UserModel> {
    return this.httpClient.get<UserModel>(`${this.apiUrlUser}/${id}`).pipe(
      tap(user => {
        // Update the current user if this is the same user
        const currentUser = this.currentUserSubject.value;
        if (!currentUser || currentUser.id === user.id) {
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  // updateUser(user: UserModel): Observable<UserModel> {
  updateUser(user: UserModel): Observable<any> {
    // return this.httpClient.put<UserModel>(`${this.apiUrlUser}`, user);
    return this.httpClient.put<any>(`${this.apiUrlUser}`, user).pipe(
      tap(updatedUser => {
        // Update the current user subject with the updated user data
        this.currentUserSubject.next(updatedUser);
      })
    );
  }

  getAllUsers(): Observable<UserModel[]> {
    return this.httpClient.get<UserModel[]>(`${this.apiUrlUser}`);
  }

  deleteUser(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.apiUrlUser}/${id}`);
  }

  // Method to get the current user
  getCurrentUser(): UserModel | null {
    return this.currentUserSubject.value;
  }

  // Method to set the current user
  setCurrentUser(user: UserModel | null): void {
    this.currentUserSubject.next(user);
  }

  // Method to clear the current user (on logout)
  clearCurrentUser(): void {
    this.currentUserSubject.next(null);
  }

}
