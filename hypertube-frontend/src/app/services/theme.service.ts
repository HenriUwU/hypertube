import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private lightMode = false;

  toggleTheme() {
    this.lightMode = !this.lightMode;
    document.body.classList.toggle('light-mode', this.lightMode);
  }

  isLightMode() {
    return this.lightMode;
  }
}
