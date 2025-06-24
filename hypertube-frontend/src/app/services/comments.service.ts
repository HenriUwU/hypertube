import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, map} from "rxjs";
import { CommentDTO } from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrlComments = 'http://localhost:8080/comment';

  constructor(private http: HttpClient) {
  }

  postComment(movieId: number, content: string): Observable<CommentDTO> {
    const body = {
      movieId: movieId,
      content: content
    };
    return this.http.post<CommentDTO>(`${this.apiUrlComments}`, body, {
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
    });
  }

  likeComment(commentId: number): Observable<CommentDTO> {
    return this.http.post<CommentDTO>(`${this.apiUrlComments}/like/${commentId}`, {}, {
    });
  }

  unlikeComment(commentId: number): Observable<CommentDTO> {
    return this.http.delete<CommentDTO>(`${this.apiUrlComments}/unlike/${commentId}`, {
    });
  }

  isLiked(commentId: number): Observable<boolean> {
    return this.http.get<{liked: string}>(`${this.apiUrlComments}/${commentId}/liked`).pipe(
      map(response => {
        return response.liked === 'true';
      })
    );
  }
}
