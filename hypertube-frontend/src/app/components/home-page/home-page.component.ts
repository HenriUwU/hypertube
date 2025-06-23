import {Component, HostListener, OnInit, ViewEncapsulation} from '@angular/core';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MovieService} from '../../services/movie.service';
import {AsyncPipe, NgFor, NgForOf, NgIf} from '@angular/common';
import {ThumbnailComponent} from '../thumbnail/thumbnail.component';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDivider} from '@angular/material/divider';
import {catchError, debounceTime, firstValueFrom, map, Observable, of, startWith, Subject} from 'rxjs';
import {MatMenuModule} from "@angular/material/menu";
import {MatIconModule} from "@angular/material/icon";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonModule} from "@angular/material/button";
import {GenreModel} from "../../models/movie.model";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {TranslateService} from "../../services/translate.service";
import {MatAutocomplete, MatAutocompleteTrigger} from "@angular/material/autocomplete";


@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    MatMenuModule, MatButtonModule, MatCheckboxModule, MatIconModule, MatProgressSpinnerModule, MatFormFieldModule,
    NgFor, NgForOf, ThumbnailComponent, MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule, MatDivider, MatTab, MatTabGroup, NgIf, MatAutocomplete, ReactiveFormsModule, MatAutocompleteTrigger, AsyncPipe
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class HomePageComponent implements OnInit {
  movies: any[] = [];
  sortingOptions: string[] = ['popular', 'top_rated', 'now_playing', 'upcoming'];
  currentPage: number = 1;
  isLoading: boolean = false;
  selectSortingOpt: string = 'popular';
  genres: GenreModel[] = [];
  selectedGenreIds = new Set<number>();
  minStars = 0;
  hoverIndex = -1;
  starsArray = new Array(10);
  searchTerm: string = '';
  searchTerm$ = new Subject<string>();
  filterYear: string = "";
  yearControl = new FormControl();
  years: string[] = [];
  lastYearLength = 0;
  filteredYears$: Observable<string[]> = new Observable<string[]>();
  noMoreMovies: boolean = false;
  searchSourceControl= new FormControl();
  searchSource: 'omdb' | 'tmdb' = 'tmdb';

  textMap = new Map<string, string>([
    ["popular", "popular"],
    ["top rated", "top rated"],
    ["now playing", "now playing"],
    ["upcoming", "upcoming"],
    ["Genres", "Genres"],
    ["Min. stars", "Min. stars"],
    ["Search", "Search"],
    ["Production Year", "Production Year"],
    ["All", "All"],
    ["e.g. 2022", "e.g. 2022"],
    ["No more movies to load.", "No more movies to load."],
    ["Source", "Source"]
  ])


  constructor(private movieService: MovieService, private translateService: TranslateService) {
  }

  ngOnInit() {
    this.searchSourceControl = new FormControl({ value: 'tmdb', disabled: true });
    this.searchSourceControl.valueChanges.subscribe((val: 'omdb' | 'tmdb') => {
      this.onSearchSourceChange(val);
    });

    this.yearControl = new FormControl({ value: '', disabled: true });
    this.translateService.autoTranslateTexts(this.textMap);
    this.translateService.initializeLanguageListener(this.textMap);
    this.movieService.sortBy('popular', 1, [], 0).subscribe((data: any) => {
      this.movies = data;
    });
    this.movieService.getGenres().subscribe((genres: GenreModel[]) => {
      this.genres = genres
    });

    const startYear = 1900;
    const endYear = new Date().getFullYear();
    this.years = Array.from({length: endYear - startYear + 1}, (_, i) => (startYear + i).toString());

    this.filteredYears$ = this.yearControl.valueChanges.pipe(
      startWith(''),
      map((value: string | null) => this._filterYears(value || ''))
    );

    this.yearControl.valueChanges.subscribe(rawValue => {
      const cleanValue = (rawValue || '').replace(/\D/g, '').slice(0, 4);

      if (cleanValue !== rawValue) {
        this.yearControl.setValue(cleanValue, { emitEvent: false });
      }

      this.filterYear = cleanValue;
      const currentLength = cleanValue.length;
      if ((currentLength === 4 && this.lastYearLength < 4) || (currentLength === 3 && this.lastYearLength === 4)) {
        this.onYearChange();
      }

      this.lastYearLength = currentLength;
    });

    this.searchTerm$
      .pipe(debounceTime(300))
      .subscribe((search: string) => {
        this.searchTerm = search.trim();
        this.currentPage = 1;
        this.movies = [];
        this.loadMovies();

        const shouldEnable = !!this.searchTerm;

        if (shouldEnable) {
          if (this.yearControl.disabled) {
            this.yearControl.enable({ emitEvent: false });
          }
          if (this.searchSourceControl.disabled) {
            this.searchSourceControl.enable({ emitEvent: false });
          }
        } else {
          if (!this.yearControl.disabled) {
            this.yearControl.disable({ emitEvent: false });
          }
          if (!this.searchSourceControl.disabled) {
            this.searchSourceControl.disable({ emitEvent: false });
          }
        }
      });
  }

  onYearChange() {
    this.movies = [];
    this.currentPage = 1;
    this.loadMovies();
  }

  onSearchSourceChange(newSource: 'omdb' | 'tmdb') {
    this.searchSource = newSource;
    this.movies = [];
    this.currentPage = 1;
    this.loadMovies();
  }

  onSearchInputFromEvent(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const value = target?.value || '';
    this.searchTerm$.next(value);
  }

  onSearchInput(value: string) {
    this.searchTerm = value.trim();
    this.movies = [];
    this.currentPage = 1;
    this.loadMovies();

    const shouldEnable = !!this.searchTerm;

    if (shouldEnable) {
      if (this.yearControl.disabled) {
        this.yearControl.enable({ emitEvent: false });
      }
      if (this.searchSourceControl.disabled) {
        this.searchSourceControl.enable({ emitEvent: false });
      }
    } else {
      if (!this.yearControl.disabled) {
        this.yearControl.disable({ emitEvent: false });
      }
      if (!this.searchSourceControl.disabled) {
        this.searchSourceControl.disable({ emitEvent: false });
      }
    }
  }

  setMinStars(n: number) {
    this.minStars = n;
    this.movies = [];
    this.currentPage = 1;
    this.loadMovies()
  }

  isChecked(genre: GenreModel): boolean {
    return this.selectedGenreIds.has(genre.id);
  }

  toggleSelection(genre: GenreModel): void {
    if (this.selectedGenreIds.has(genre.id)) {
      this.selectedGenreIds.delete(genre.id);
    } else {
      this.selectedGenreIds.add(genre.id);
    }
    this.applyGenreFilter();
  }

  areAllGenresSelected(): boolean {
    return this.genres.every(genre => this.isChecked(genre));
  }

  toggleAllSelections(isChecked: boolean): void {
    if (isChecked) {
      this.genres.forEach(genre => {
        if (!this.isChecked(genre)) {
          this.selectedGenreIds.add(genre.id);
        }
      });
    } else {
      this.genres.forEach(genre => {
        if (this.isChecked(genre)) {
          this.selectedGenreIds.delete(genre.id);
        }
      });
    }
    this.applyGenreFilter();
  }

  async loadMovies() {
    if (this.isLoading) return;

    this.isLoading = true;
    try {
      let source$: Observable<any>;

      if (this.searchTerm && this.searchTerm.trim() !== '') {
        if (this.searchSource == "tmdb") {
          source$ = this.movieService.tmdbSearch(this.searchTerm, this.currentPage, Array.from(this.selectedGenreIds), this.minStars, this.filterYear).pipe(
            catchError((error) => {
              console.error('Error loading movies:', error);
              return of([]);
            })
          );
        } else if (this.searchSource == "omdb") {
          console.log("omdb")
          source$ = this.movieService.omdbSearch(this.searchTerm, this.currentPage, Array.from(this.selectedGenreIds), this.minStars, this.filterYear).pipe(
            catchError((error) => {
              console.error('Error loading movies:', error);
              return of([]);
            })
          );
        } else {
          throw new Error('Invalid search source');
        }
      } else {
        source$ = this.movieService.sortBy(this.selectSortingOpt, this.currentPage, Array.from(this.selectedGenreIds), this.minStars).pipe(
          catchError((error) => {
            console.error('Error loading movies:', error);
            return of([]);
          })
        );
      }
      const data: any[] = await firstValueFrom<any[]>(source$);
      if (!data || data.length === 0) {
        console.log('No more movies to load');
        this.noMoreMovies = true;
        return;
      }
      this.noMoreMovies = false;
      this.movies = [...this.movies, ...data];
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      this.isLoading = false;
    }
  }

  onSortChangeIndex(index: number) {
    this.selectSortingOpt = this.sortingOptions[index];
    this.movies = [];
    this.currentPage = 1;
    this.loadMovies();
  }

  formatLabel(opt: string): string {
    return opt.replace(/_/g, ' ');
  }

  @HostListener('window:scroll', [])
  async onScroll(): Promise<void> {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100 && !this.isLoading) {
      this.currentPage++;
      if (this.currentPage % 5 === 0) { // load a batch each 20 y offset scroll
        await this.loadMovies();
      }
    }
  }

  applyGenreFilter() {
    this.movies = [];
    this.currentPage = 1;
    this.loadMovies();
  }

  private _filterYears(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.years.filter(year => year.toLowerCase().includes(filterValue));
  }
}
