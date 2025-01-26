import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {UserModel} from "../models/user.model";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrlUser = 'http://localhost:8080/user'

  constructor(private httpClient: HttpClient) {
  }

  getUser(id: string): Observable<UserModel> {
    return this.httpClient.get<UserModel>(`${this.apiUrlUser}/${id}`);
  }

}
