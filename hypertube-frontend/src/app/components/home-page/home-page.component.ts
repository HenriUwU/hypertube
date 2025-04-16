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


@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    MatProgressSpinnerModule, NgFor, NgForOf, ThumbnailComponent, MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule, MatDivider
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

  constructor(private movieService: MovieService) {

  }

  ngOnInit() {
    this.movieService.sortBy('popular', 1, []).subscribe((data: any) => {
      this.movies = data;
    }
    );
  }

  async loadMovies(sortBy: string) {
    if (this.isLoading) return;

    this.isLoading = true;
    try {
      const source$ = this.movieService.sortBy(sortBy, this.currentPage, []).pipe(
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

  onSortChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    if (!selectElement) {
      return;
    }
    const selectedOption = selectElement.value;
    if (!selectedOption) {
      return;
    }
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
}
