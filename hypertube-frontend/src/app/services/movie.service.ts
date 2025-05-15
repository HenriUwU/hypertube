import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {Movie, Subtitles} from '../models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrlAuth = 'http://localhost:8080/movies';

  constructor(private http:HttpClient) { }

  getMovieDataFromId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrlAuth}/${id.toString()}`).pipe();
  }

  getMovieDataFromIdAsInterface(id: number): Observable<Movie> {
    return this.http.get<Movie>(`${this.apiUrlAuth}/${id.toString()}`).pipe();
  }

  sortBy(sortBy: string, page: number, genresIds: number[]): Observable<any> {
    const body = {
      sortBy: sortBy,
      page: page,
      genresIds: genresIds
    };
    return this.http.post<Movie[]>(`${this.apiUrlAuth}/sort-by`, body).pipe(
      map((response: any) => response)
    );
  }

  subtitles(tmdbId: string): Observable<Subtitles[]> {
    return this.http.get<Subtitles[]>(`${this.apiUrlAuth}/${tmdbId}/subtitles`).pipe(
      map((response: Subtitles[]) => response)
    );
  }
}
