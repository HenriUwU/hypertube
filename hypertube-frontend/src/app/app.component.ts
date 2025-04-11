import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {GlobalMessageComponent} from "./components/global-message/global-message.component";
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { Ng2SearchPipeModule } from '../../node_modules/ng2-search-filter';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GlobalMessageComponent, HeaderComponent, FooterComponent, Ng2SearchPipeModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'hypertube-frontend';
}
