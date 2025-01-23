import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class GlobalMessageService {
  private messageSubject = new BehaviorSubject<{ message: string; isSuccess: boolean } | null>(null);
  message$ = this.messageSubject.asObservable();

  showMessage(message: string, isSuccess: boolean): void {
    this.messageSubject.next({ message, isSuccess });
  }
}
