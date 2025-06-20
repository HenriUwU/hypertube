import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {GlobalMessageComponent} from "./components/global-message/global-message.component";
import {FooterComponent} from './components/footer/footer.component';
import {HeaderComponent} from './components/header/header.component';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet, GlobalMessageComponent, HeaderComponent, FooterComponent, ],
	templateUrl: './app.component.html',
	styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'hypertube-frontend';
}
