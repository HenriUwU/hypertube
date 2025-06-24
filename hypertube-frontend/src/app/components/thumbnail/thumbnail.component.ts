import { Component, Input, OnInit } from '@angular/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { MovieThumbnail } from '../../models/movie.model';
import { CommonModule, IMAGE_CONFIG } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {animate, style, transition, trigger} from "@angular/animations";
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-thumbnail',
  standalone: true,
  imports: [MatProgressBarModule, CommonModule, MatIconModule, NgOptimizedImage],
  templateUrl: './thumbnail.component.html',
  styleUrl: './thumbnail.component.css',
  animations: [
    trigger('slideInAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-50px)' }),
        animate('0.8s ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('zoomInAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
  ],
})



export class ThumbnailComponent implements OnInit {
  private defaultProfilePicture = '../../../../assets/images/thumbnail_not_found.svg' ;
  private fileNotFoundIMDB = 'https://image.tmdb.org/t/p/originalnull'


  movieThumbnail: MovieThumbnail = {
    id: 0,
    title: '',
    release_date: 0,
    poster_path: this.defaultProfilePicture,
    runtime: 0,
    // stoppedAt: { hours: 0, minutes: 0 },
    stoppedAt: '',
    genres: [],
    vote_average: 0
  };
  // movieThumbnail!: MovieThumbnail;
  watchedMovie: boolean = false;
  initialized: boolean = false;

  // @Input() movieId! : number;
  @Input() movieId : number = 950387;

  constructor(private router: Router,
    private movieService: MovieService){
    }

  ngOnInit(): void {
      this.fillMovieThumbnail(this.movieId);
      this.autoUpdateLanguage();
  }

  autoUpdateLanguage(): void {
    window.addEventListener('storage', (event) => {
      if (event.storageArea === sessionStorage && event.key === 'language') {
        setTimeout(() => {
          this.fillMovieThumbnail(this.movieId);
        }, 100); // Delay to ensure the language change is processed
      }
    });
  }

  fillMovieThumbnail(movieId: number): void {
    this.movieService.getMovieDataFromId(movieId).subscribe(
      {
        next: (data: MovieThumbnail) => {
          this.movieThumbnail = data;
          this.watchedMovie = this.movieThumbnail.stoppedAt !== null;
          if (this.movieThumbnail.poster_path == this.fileNotFoundIMDB){
            this.movieThumbnail.poster_path = this.defaultProfilePicture;
          }
          this.initialized = true;
        },
        error: (e) => {
          console.error('Error fetching movie data:', e);
          this.initialized = false;
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
    if (this.movieThumbnail.runtime == 0){
      return '---'
    }
    const hours = Math.floor(this.movieThumbnail.runtime / 60);
    const minutes = this.movieThumbnail.runtime % 60;
    return `${hours}h ${minutes}m`;
  }

  getVisualizedTimeAsPercent(): number {
    if (!this.movieThumbnail.stoppedAt) {
      return 0;
    }
    const totalMinutes = this.movieThumbnail.runtime;
    const [hours, minutes] = this.movieThumbnail.stoppedAt.split(':').map(Number);
    const watchedMinutes = hours * 60 + minutes;
    if (totalMinutes === 0) {
      return 0;
    }
    const res = Math.min((watchedMinutes / totalMinutes) * 100, 100);
    console.log(`Total Minutes: ${totalMinutes}, Watched Minutes: ${watchedMinutes}, Percentage: ${res}`);
    return res;
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
