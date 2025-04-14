import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Torrent } from '../models/torrent.models';

@Injectable({
  providedIn: 'root'
})
export class TorrentService {
  private apiUrlAuth = 'http://localhost:8080/torrent';

  constructor(private http:HttpClient) { }

  searchTorrent(query: string): Observable<Torrent[]> {
    const params = {'query': query}
    return this.http.get<Torrent[]>(`${this.apiUrlAuth}/search`, { params: params }).pipe();
  }

  sendMagnet(magnet: string): Observable<string> {
    const params = {'magnet': magnet}
    return this.http.post<string>(`${this.apiUrlAuth}/start`, params).pipe();
  }
}
