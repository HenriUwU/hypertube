// import { Component } from '@angular/core';
// import {MatIconModule} from '@angular/material/icon';
// import {MatDividerModule} from '@angular/material/divider';
// import {MatButtonModule} from '@angular/material/button';

// @Component({
//   selector: 'app-footer',
//   standalone: true,
//   imports: [MatDividerModule, MatButtonModule, MatIconModule],
//   templateUrl: './footer.component.html',
//   styleUrl: './footer.component.css'
// })
// export class FooterComponent {

// }

import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatDividerModule } from "@angular/material/divider"
import { TranslateService } from "../../services/translate.service"

@Component({
  selector: "app-footer",
  standalone: true,
  imports: [CommonModule, MatDividerModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  textMap = new Map<string, string>([
    ["Developped by", "Developped by"],
    ["and", "and"],
    ["using", "using"]
  ]);
  constructor(private translateService: TranslateService) {
    window.addEventListener('storage', (event) => {
      if (event.storageArea === sessionStorage && event.key === 'language') {
        const texts: string[] = Array.from(this.textMap.keys());
        const sourceLang = "en";
        const targetLang = sessionStorage.getItem('language') ? sessionStorage.getItem('language')! : 'en';
  
        this.translateService.translateStrings(texts, sourceLang, targetLang).subscribe((translations: string[]) => {
          translations.forEach((translation, index) => {
            this.textMap.set(texts[index], translation);
          });
        });
      }
    });
  }

  ngOnInit() {
    const texts: string[] = Array.from(this.textMap.keys());
    const sourceLang = "en";
    const targetLang = sessionStorage.getItem('language') ? sessionStorage.getItem('language')! : 'en';

    this.translateService.translateStrings(texts, sourceLang, targetLang).subscribe((translations: string[]) => {
      translations.forEach((translation, index) => {
        this.textMap.set(texts[index], translation);
      });
    }
    );
  }


}
