import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, map} from "rxjs";
import { CommentDTO } from '../models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrlComments = 'http://localhost:8080/comment';

  constructor(private http: HttpClient) {
  }

  postComment(comment: CommentDTO): Observable<any> {
    return this.http.post<CommentDTO>(`${this.apiUrlComments}`, comment, {
    }).pipe(
      map((response: CommentDTO) => response)
    );
  }

  updateComment(comment: CommentDTO): Observable<CommentDTO> {
    return this.http.put<CommentDTO>(`${this.apiUrlComments}`, comment, {
    });
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlComments}/${commentId}`, {
      // headers: this.getAuthHeaders()
    });
  }

  likeComment(commentId: number): Observable<CommentDTO> {
    return this.http.post<CommentDTO>(`${this.apiUrlComments}/like/${commentId}`, {}, {
      // headers: this.getAuthHeaders()
    });
  }

  unlikeComment(commentId: number): Observable<CommentDTO> {
    return this.http.delete<CommentDTO>(`${this.apiUrlComments}/unlike/${commentId}`, {
      // headers: this.getAuthHeaders()
    });
  }
}
