import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import { MovieDTO, SearchMovie } from '../models/movie.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MoviesService {
  private apiUrlMovie = 'http://localhost:8080/movies';

  constructor(private http: HttpClient) { }

  search(research: SearchMovie): Observable<any> {
    console.log(research);
    return this.http.post(`${this.apiUrlMovie}/search`, research).pipe();
  }
}
