import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { TranslateModel } from '../models/translate.model';

@Injectable({
  providedIn: 'root'
})
export class TranslateService {
  private apiUrlAuth = 'http://localhost:8080/translate';

  constructor(private http:HttpClient) { }

  availableLanguages(): Observable<TranslateModel[]> {
    return this.http.get(`${this.apiUrlAuth}/lang`).pipe(
      map((response: any) => response),
      catchError((error) => {
        // console.log('Error fetching available languages:', error);
        return of([
          { iso_639_1: 'en', flag: 'https://flagcdn.com/w80/us.png', english_name: 'English' },
        ]);
      })
    );
  }

  translateStrings(text: string[], source: string, target: string): Observable<any> {
    const body = {
      text: text,
      source: source,
      target: target
    };
    return this.http.post<any>(`${this.apiUrlAuth}`, body).pipe(
      map((response: any) => response.translations),
      catchError((error) => {
        // console.log('Error translating strings:', error);
        return of(text);
      })
    );
  }

  autoTranslate(text: string[]): Observable<any> {
    return this.translateStrings(text, 'en', sessionStorage.getItem('language') ? sessionStorage.getItem('language')! : 'en')
  }

  autoTranslateTexts(tradMap: Map<string, string>): void{
    const texts: string[] = Array.from(tradMap.keys());
    const sourceLang = "en";
    const targetLang = sessionStorage.getItem('language') ? sessionStorage.getItem('language')! : 'en';

    this.translateStrings(texts, sourceLang, targetLang).subscribe({
      next: (translations: string[]) => {
        translations.forEach((translation, index) => {
          tradMap.set(texts[index], translation);
        });
      },
      error: (error) => {
        // console.log('Error in autoTranslateTexts:', error);
      }
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

  getLanguage(): string {
    return sessionStorage.getItem('language') || 'en';
  }

  initializeLanguageListener(tradMap: Map<string, string>): void {
    window.addEventListener('storage', (event) => {
      if (event.storageArea === sessionStorage && event.key === 'language') {
        const texts: string[] = Array.from(tradMap.keys());
        this.autoTranslate(texts).subscribe({
          next: (translations: string[]) => {
            translations.forEach((translation, index) => {
              tradMap.set(texts[index], translation);
            });
          },
          error: (error) => {
            // console.log('Error in language listener translation:', error);
          }
        });
      }
    });
  }
}
