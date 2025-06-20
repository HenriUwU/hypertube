import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface CommentDTO {
  id?: number;
  movieId: number;
  userId: number;
  content: string;
  likes?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private API_URL = 'https://ton-api.com';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  postComment(comment: CommentDTO): Observable<CommentDTO> {
    return this.http.post<CommentDTO>(`${this.API_URL}/comment`, comment, {
      headers: this.getAuthHeaders()
    });
  }

  updateComment(comment: CommentDTO): Observable<CommentDTO> {
    return this.http.put<CommentDTO>(`${this.API_URL}/comment`, comment, {
      headers: this.getAuthHeaders()
    });
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/comment/${commentId}`, {
      headers: this.getAuthHeaders()
    });
  }

  likeComment(commentId: number): Observable<CommentDTO> {
    return this.http.post<CommentDTO>(`${this.API_URL}/comment/like/${commentId}`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  unlikeComment(commentId: number): Observable<CommentDTO> {
    return this.http.delete<CommentDTO>(`${this.API_URL}/comment/unlike/${commentId}`, {
      headers: this.getAuthHeaders()
    });
  }
}
