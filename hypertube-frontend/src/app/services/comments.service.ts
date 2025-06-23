import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import { CommentDTO } from '../models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrlComments = 'https://localhost:8080/summary';
  private currentUserSubject: BehaviorSubject<string | null>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<string | null>(sessionStorage.getItem('token'))
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  postComment(comment: CommentDTO): Observable<CommentDTO> {
    return this.http.post<CommentDTO>(`${this.apiUrlComments}/comment`, comment, {
      headers: this.getAuthHeaders()
    });
  }

  updateComment(comment: CommentDTO): Observable<CommentDTO> {
    return this.http.put<CommentDTO>(`${this.apiUrlComments}/comment`, comment, {
      headers: this.getAuthHeaders()
    });
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlComments}/comment/${commentId}`, {
      headers: this.getAuthHeaders()
    });
  }

  likeComment(commentId: number): Observable<CommentDTO> {
    return this.http.post<CommentDTO>(`${this.apiUrlComments}/comment/like/${commentId}`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  unlikeComment(commentId: number): Observable<CommentDTO> {
    return this.http.delete<CommentDTO>(`${this.apiUrlComments}/comment/unlike/${commentId}`, {
      headers: this.getAuthHeaders()
    });
  }
}
