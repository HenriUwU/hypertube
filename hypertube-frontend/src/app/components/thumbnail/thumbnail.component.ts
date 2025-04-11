import { Component, Input, OnInit } from '@angular/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { MovieThumbnail } from '../../models/movie.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-thumbnail',
  standalone: true,
  imports: [MatProgressBarModule, CommonModule],
  templateUrl: './thumbnail.component.html',
  styleUrl: './thumbnail.component.css'
})

export class ThumbnailComponent implements OnInit {

  movieThumbnail: MovieThumbnail = {
    id: 0,
    title: '',
    release_date: 0,
    poster_path: '',
    runtime: 0,
    stoppedAt: { hours: 0, minutes: 0 },
    genres: []
  };
  watchedMovie: boolean = false;

  // @Input() movieId! : number;
  @Input() movieId : number = 950387;

  constructor(private router: Router,
    private movieService: MovieService){
    }
    
  ngOnInit(): void {
      this.fillMovieThumbnail(this.movieId);
  }

  fillMovieThumbnail(movieId: number): void {
    this.movieService.getMovieDataFromId(movieId).subscribe(
      {
        next: (data: MovieThumbnail) => {
          this.movieThumbnail = data;
          this.watchedMovie = this.movieThumbnail.stoppedAt !== null;
          // this.watchedMovie = true;
        },
        error: (e) => {
          console.error('Error fetching movie data:', e);
        },
        complete: () => {
        }
      }
    );
  }

  onClick(): void {
    console.log('Thumbnail clicked, redirecting to summay/', this.movieThumbnail.id);
    this.router.navigate(['/summary', this.movieThumbnail.id]).then();
  }

  getLength(): string {
    const hours = Math.floor(this.movieThumbnail.runtime / 60);
    const minutes = this.movieThumbnail.runtime % 60;
    return `${hours}h ${minutes}m`;
  }

  getVisualizedTimeAsPercent(): number {
    if (!this.movieThumbnail.stoppedAt) {
      return 0;
    }
    const totalMinutes = this.movieThumbnail.runtime;
    const visualizedMinutes = this.movieThumbnail.stoppedAt.hours * 60 + this.movieThumbnail.stoppedAt.minutes;
    return (visualizedMinutes / totalMinutes) * 100;
  }

  getGenreByIdx(idx: number): string {
    if (idx < this.movieThumbnail.genres.length) {
      return this.movieThumbnail.genres[idx].name;
    } else {
      return '';
    }
  }

  getGenreString(): string {
    return this.movieThumbnail.genres.map(genre => genre.name).join('/');
  }

}
