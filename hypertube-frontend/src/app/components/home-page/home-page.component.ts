import {Component, HostListener, OnInit, ViewEncapsulation} from '@angular/core';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MovieService} from '../../services/movie.service';
import {NgFor, NgForOf, NgIf} from '@angular/common';
import {ThumbnailComponent} from '../thumbnail/thumbnail.component';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDivider} from '@angular/material/divider';
import {catchError, firstValueFrom, Observable, of} from 'rxjs';
import {MatMenuModule} from "@angular/material/menu";
import {MatIconModule} from "@angular/material/icon";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonModule} from "@angular/material/button";
import {GenreModel} from "../../models/movie.model";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {TranslateService} from "../../services/translate.service";


@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    MatMenuModule, MatButtonModule, MatCheckboxModule, MatIconModule, MatProgressSpinnerModule, MatFormFieldModule,
    NgFor, NgForOf, ThumbnailComponent, MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule, MatDivider, MatTab, MatTabGroup, NgIf
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

  textMap = new Map<string, string>([
    ["popular", "popular"],
    ["top rated", "top rated"],
    ["now playing", "now playing"],
    ["upcoming", "upcoming"],
    ["Genres", "Genres"],
    ["Min. stars", "Min. stars"],
    ["Search", "Search"],
    ["All", "All"]
  ])

  constructor(private movieService: MovieService, private translateService: TranslateService) {

  }

  ngOnInit() {
    this.translateService.autoTranslateTexts(this.textMap);
    this.translateService.initializeLanguageListener(this.textMap);
    this.movieService.sortBy('popular', 1, [], 0).subscribe((data: any) => {
      this.movies = data;
    });
    this.movieService.getGenres().subscribe((genres: GenreModel[]) => {
      this.genres = genres
    });
  }

  onSearchChange(value: string) {
    this.searchTerm = value;
    this.movies = [];
    this.currentPage = 1;
    this.loadMovies()
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
        source$ = this.movieService.search(this.searchTerm, this.currentPage, Array.from(this.selectedGenreIds), this.minStars).pipe(
          catchError((error) => {
            console.error('Error loading movies:', error);
            return of([]);
          })
        );
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
        return;
      }
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
      if (this.currentPage % 20 === 0) { // load a batch each 20 y offset scroll
        await this.loadMovies();
      }
    }
  }

  applyGenreFilter() {
    this.movies = [];
    this.currentPage = 1;
    this.loadMovies();
  }

  protected readonly HTMLInputElement = HTMLInputElement;
}
