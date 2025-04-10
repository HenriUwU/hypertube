import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { MovieDTO } from '../models/movieDTO.model';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrlAuth = 'http://localhost:8080/movies';

  constructor(private http:HttpClient) { }

  getMovieDataFromId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrlAuth}/${id.toString()}`).pipe();  
  }

  getMovieDataFromIdAsInterface(id: number): Observable<MovieDTO> {
    return this.http.get<MovieDTO>(`${this.apiUrlAuth}/${id.toString()}`).pipe();
  }

}
