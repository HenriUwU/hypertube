import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {GlobalMessageComponent} from "./components/global-message/global-message.component";
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { ThumbnailComponent } from './components/thumbnail/thumbnail.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GlobalMessageComponent, HeaderComponent, FooterComponent, ThumbnailComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(private translate: TranslateService) {
    this.translate.addLangs(['en', 'fr', 'es']);
    this.translate.setDefaultLang('en');

    const browserLang = this.translate.getBrowserLang();
    
    this.translate.use(browserLang && browserLang.match(/en|fr|es/) ? browserLang : 'en');
  }
  title = 'hypertube-frontend';

  switchLanguage(language: string) {
    this.translate.use(language);
  }
}