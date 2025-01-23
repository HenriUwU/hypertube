import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {GlobalMessageComponent} from "./components/global-message/global-message.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GlobalMessageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'hypertube-frontend';
}
