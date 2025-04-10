import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrlAuth = 'http://backend:8080/movie';

  constructor(private http:HttpClient) { }

  getMovieDataFromId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrlAuth}/${id.toString()}`).pipe(
      map((response: any) => {
        return {
          id: response.id,
          title: response.title,
          watched: response.watched,
          length: response.length,
          visualizedTime: response.visualizedTime,
          img: response.img
        };
      })
    );  
  }
}
