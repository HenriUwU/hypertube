import { Component, Input } from '@angular/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import {HttpClient} from "@angular/common/http";
import { MovieService } from '../../services/movie.service';
import { Movie, MovieThumbnail } from '../../models/movie.model';

@Component({
  selector: 'app-thumbnail',
  standalone: true,
  imports: [MatProgressBarModule],
  templateUrl: './thumbnail.component.html',
  styleUrl: './thumbnail.component.css'
})

export class ThumbnailComponent {

  movieThumbnail: MovieThumbnail = {
    id: 0,
    title: '',
    release_year: 0,
    poster_path: '',
    runtime: { hours: 0, minutes: 0 },
    watchedMovies: { hours: 0, minutes: 0 },
    genres: []
  };
  watchedMovie: boolean = false;

  // @Input() movieId! : number;
  @Input() movieId : number = 950387;

  constructor(private router: Router,
    private movieService: MovieService){
      this.fillMovieThumbnail(this.movieId);
      this.watchedMovie = this.movieThumbnail.watchedMovies == null;
  }

  fillMovieThumbnail(movieId: number): void {
    this.movieService.getMovieDataFromId(movieId).subscribe(
      {
        next: (data: MovieThumbnail) => {
          console.log('Movie data:', data);
          this.movieThumbnail = data;
          console.log('Movie data:', this.movieThumbnail);
        },
        error: (e) => {
          console.error('Error fetching movie data:', e);
        },
        complete: () => {
          console.log('Movie data fetching completed');
        }
      }
    );
  }

  onClick(): void {
    console.log('Thumbnail clicked, redirecting to summay/', this.movieThumbnail.id);
    this.router.navigate(['/summary', this.movieThumbnail.id]).then();
  }

  getLength(): string {
    const hours = this.movieThumbnail.runtime.hours;
    const minutes = this.movieThumbnail.runtime.minutes;
    return `${hours}h ${minutes}m`;
  }

  getVisualizedTimeAsPercent(): number {
    const totalMinutes = this.movieThumbnail.runtime.hours * 60 + this.movieThumbnail.runtime.minutes;
    const visualizedMinutes = this.movieThumbnail.watchedMovies.hours * 60 + this.movieThumbnail.watchedMovies.minutes;
    return (visualizedMinutes / totalMinutes) * 100;
  }

  getGenreByIdx(idx: number): string {
    if (idx < this.movieThumbnail.genres.length) {
      return this.movieThumbnail.genres[idx].name;
    } else {
      return '';
    }
  }

}
