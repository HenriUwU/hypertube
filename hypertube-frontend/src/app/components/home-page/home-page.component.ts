import {Component, HostListener, OnInit} from '@angular/core';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import { MovieService } from '../../services/movie.service';
import { NgFor, NgForOf } from '@angular/common';
import { ThumbnailComponent } from '../thumbnail/thumbnail.component';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatDivider } from '@angular/material/divider';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import {MatMenuModule} from "@angular/material/menu";
import {MatIconModule} from "@angular/material/icon";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonModule} from "@angular/material/button";
import {GenreModel} from "../../models/movie.model";


@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    MatMenuModule, MatButtonModule, MatCheckboxModule, MatIconModule,  MatProgressSpinnerModule, MatFormFieldModule,
    NgFor, NgForOf, ThumbnailComponent, MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule, MatDivider
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent implements OnInit {
  movies: any[] = [];
  sortingOptions: string[] = ['popular', 'top_rated', 'upcoming', 'now_playing'];
  currentPage: number = 1;
  isLoading: boolean = false;
  selectSortingOpt: string = 'popular';
  genres: GenreModel[] = [];
  selectedGenreIds = new Set<number>();

  constructor(private movieService: MovieService) {

  }

  ngOnInit() {
    this.movieService.sortBy('popular', 1, []).subscribe((data: any) => {
      this.movies = data;
    });
    this.movieService.getGenres().subscribe((genres: GenreModel[]) => {
      this.genres = genres
    });
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

  async loadMovies(sortBy: string) {
    if (this.isLoading) return;

    this.isLoading = true;
    try {
      const source$ = this.movieService.sortBy(sortBy, this.currentPage, Array.from(this.selectedGenreIds)).pipe(
        catchError((error) => {
          console.error('Error loading movies:', error);
          return of([]);
        })
      );
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

  onSortChange(selectedOption: string) {
    if (!selectedOption) return;
    this.movies = [];
    this.selectSortingOpt = selectedOption;
    this.currentPage = 1;
    this.loadMovies(this.selectSortingOpt);
  }

  @HostListener('window:scroll', [])
  async onScroll(): Promise<void> {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100 && !this.isLoading) {
      this.currentPage++;
      if (this.currentPage % 20 === 0) { // load a batch each 20 y offset scroll
        await this.loadMovies(this.selectSortingOpt);
      }
    }
  }

  applyGenreFilter() {
    this.movies = [];
    this.currentPage = 1;
    this.loadMovies(this.selectSortingOpt);
  }
}
