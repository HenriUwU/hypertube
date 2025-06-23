import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {map, min, Observable} from 'rxjs';
import {CommentDTO, GenreModel, Movie, Subtitles} from '../models/movie.model';

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

  sortBy(sortBy: string, page: number, genresIds: number[], minStars: number): Observable<any> {
    const body = {
      sortBy: sortBy,
      page: page,
      genresIds: genresIds,
      minStars: minStars,
    };
    return this.http.post<Movie[]>(`${this.apiUrlAuth}/sort-by`, body).pipe(
      map((response: any) => response)
    );
  }

  tmdbSearch(query: string, page: number, genresIds: number[], minStars: number, productionYear: string): Observable<any> {
    const body = {
      query: query,
      page: page,
      genresIds: genresIds,
      minStars: minStars,
      productionYear: productionYear
    };
    return this.http.post<Movie[]>(`${this.apiUrlAuth}/tmdb-search`, body).pipe(
      map((response: any) => response)
    );
  }

  omdbSearch(query: string, page: number, genresIds: number[], minStars: number, productionYear: string): Observable<any> {
    const body = {
      query: query,
      page: page,
      genresIds: genresIds,
      minStars: minStars,
      productionYear: productionYear
    };
    return this.http.post<Movie[]>(`${this.apiUrlAuth}/omdb-search`, body).pipe(
      map((response: any) => response)
    );
  }

  getSubtitles(imdbId: string): Observable<Subtitles[]> {
    return this.http.get<Subtitles[]>(`${this.apiUrlAuth}/${imdbId}/subtitles`).pipe(
      map((response: Subtitles[]) => response)
    );
  }

  getGenres(): Observable<GenreModel[]> {
    return this.http.get<GenreModel[]>(`${this.apiUrlAuth}/genres`).pipe(
      map((response: GenreModel[]) => response)
    )
  }

  getComments(movieId: number): Observable<CommentDTO[]> {
    return this.http.get<CommentDTO[]>(`${this.apiUrlAuth}/${movieId}/comments`).pipe(
      map((response: CommentDTO[]) => response)
    )
  }

  getMovieTrailer(movieId: number): Observable<string> {
    return this.http.get<{ link: string }>(`${this.apiUrlAuth}/${movieId}/trailer`).pipe(
      map(response => response.link)
    );
  }
}
