import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslateService {
  private apiUrlAuth = 'http://localhost:8080/translate';

  constructor(private http:HttpClient) { }

  availableLanguages(): Observable<any> {
    return this.http.get(`${this.apiUrlAuth}/lang`).pipe(
      map((response: any) => response)
    );
  }

  translateStrings(text: string[], source: string, target: string): Observable<any> {
    const body = {
      text: text,
      source: source,
      target: target
    };
    return this.http.post<any>(`${this.apiUrlAuth}`, body).pipe(
      map((response: any) => response.translations)
    );
  }

  autoTranslate(text: string[]): Observable<any> {
    return this.translateStrings(text, 'en', sessionStorage.getItem('language') ? sessionStorage.getItem('language')! : 'en')
  }

  autoTranslateTexts(textMap: Map<string, string>): void{
    const texts: string[] = Array.from(textMap.keys());
    const sourceLang = "en";
    const targetLang = sessionStorage.getItem('language') ? sessionStorage.getItem('language')! : 'en';

    this.translateStrings(texts, sourceLang, targetLang).subscribe((translations: string[]) => {
      translations.forEach((translation, index) => {
        textMap.set(texts[index], translation);
      });
    });
  }

  updateLanguage(language: string): void{
    sessionStorage.setItem('language', language);

    const event = new StorageEvent('storage', {
      key: 'language',
      newValue: language,
      storageArea: sessionStorage
    });
    window.dispatchEvent(event);
  }

  initializeLanguageListener(textMap: Map<string, string>): void {
    window.addEventListener('storage', (event) => {
      if (event.storageArea === sessionStorage && event.key === 'language') {
        const texts: string[] = Array.from(textMap.keys());
        this.autoTranslate(texts).subscribe((translations: string[]) => {
          translations.forEach((translation, index) => {
            textMap.set(texts[index], translation);
          });
        });
      }
    });
  }
}
