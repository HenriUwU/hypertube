import { Component, Input } from '@angular/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { MovieThumbnail } from '../../models/movieThumbnail';
import {HttpClient} from "@angular/common/http";
import { MovieService } from '../../services/movie.service';
import { MovieDTO } from '../../models/movieDTO.model';

@Component({
  selector: 'app-thumbnail',
  standalone: true,
  imports: [MatProgressBarModule],
  templateUrl: './thumbnail.component.html',
  styleUrl: './thumbnail.component.css'
})

export class ThumbnailComponent {
  private movieDTO: MovieDTO = {
    id: 0,
    title: '',
    overview: '',
    vote_average: 0,
    release_date: '',
    poster_path: '',
    runtime: 0,
    genres: [],
    credits: {
      cast: [],
      crew: []
    },
    subtitles: new Map<string, string>()
  };
  private movieThumbnail: MovieThumbnail = {
    id: 0,
    title: '',
    watched: false,
    length: { hours: 0, minutes: 0 },
    visualizedTime: { hours: 0, minutes: 0 },
    release_year: 0,
    img: ''
  }

  // @Input() movieId! : number;
  @Input() movieId : number = 950387;

  constructor(private router: Router,
    private movieService: MovieService){
      this.fillMovieThumbnail(this.movieId);
  }

  fillMovieThumbnail(movieId: number): void {
    console.log('convert movidei', this.movieId)
    // this.movieService.getMovieDataFromId(movieId).subscribe(
    //   (data: MovieDTO) => {
    //     this.movieDTO = data;
    //     this.movieThumbnail = this.convertDTOToThumbnail(this.movieDTO);
    //   },
    //   (error) => {
    //     console.error('Error fetching movie data:', error);
    //   }
    // );
    this.movieService.getMovieDataFromId(movieId).subscribe(
      {
        next: (data: MovieDTO) => {
          console.log('Movie data:', data);
          this.movieDTO = data;
          this.movieThumbnail = this.convertDTOToThumbnail(this.movieDTO);
        },
        error: (e) => {
          console.error('Error fetching movie data:', e);
        },
        complete: () => {
          console.log('Movie data fetching completed');
        }
      }
    );
    this.movieThumbnail = this.convertDTOToThumbnail(this.movieDTO);
  }

  convertDTOToThumbnail(movieDTO: MovieDTO): MovieThumbnail {
    console.log('convert dotaaato thumbanial', this.movieDTO.id)
    return {
      id: movieDTO.id,
      title: movieDTO.title,
      watched: false,
      length: { hours: Math.floor(movieDTO.runtime / 60), minutes: movieDTO.runtime % 60 },
      visualizedTime: { hours: 0, minutes: 0 },
      img: `https://image.tmdb.org/t/p/w500/${movieDTO.poster_path}`,
      release_year: parseInt(movieDTO.release_date.split('-')[0], 10),
      // img: `${movieDTO.poster_path}`
    };
  }

  onClick(): void {
    console.log('Thumbnail clicked, redirecting to summay/', this.movieThumbnail.id);
    this.router.navigate(['/summary', this.movieThumbnail.id]).then();
  }

  getMovieWatched(): boolean {
    return this.movieThumbnail.watched;
  }

  getTitle(): string {
    return this.movieThumbnail.title;
  }

  getGenres(): string[] {
    console.log('getGenres', this.movieDTO.genres);
    return this.movieDTO.genres.map(genre => genre.name);
  }

  getImage(): string {
    return this.movieThumbnail.img;
  }

  getLength(): string {
    const hours = this.movieThumbnail.length.hours;
    const minutes = this.movieThumbnail.length.minutes;
    return `${hours}h ${minutes}m`;
  }

  getVisualizedTimeAsPercent(): number {
    const totalMinutes = this.movieThumbnail.length.hours * 60 + this.movieThumbnail.length.minutes;
    const visualizedMinutes = this.movieThumbnail.visualizedTime.hours * 60 + this.movieThumbnail.visualizedTime.minutes;
    console.log('getVisualizedTimeAsPercent',(visualizedMinutes / totalMinutes) * 100);
    return (visualizedMinutes / totalMinutes) * 100;
  }

  getReleaseYear(): number {
    return this.movieThumbnail.release_year;
  }

  getGenreByIdx(idx: number): string {
    if (idx < this.movieDTO.genres.length) {
      return this.movieDTO.genres[idx].name;
    } else {
      return '';
    }
  }

}
