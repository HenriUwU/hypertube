import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {UserModel} from "../models/user.model";

@Injectable({
  providedIn: 'root'
})
export class StreamingService {

  constructor(private httpClient: HttpClient) {
  }

  getPlaylist(hash: string): Observable<string> {
    return this.httpClient.get(`http://localhost:8080/torrent/stream/${hash}`, {
      responseType: 'text'
    });
  }

}
