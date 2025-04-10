import { Component, Input } from '@angular/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { MovieThumbnail } from '../../models/movieThumbnail';
import {HttpClient} from "@angular/common/http";
import { MovieService } from '../../services/movie.service';

@Component({
  selector: 'app-thumbnail',
  standalone: true,
  imports: [MatProgressBarModule],
  templateUrl: './thumbnail.component.html',
  styleUrl: './thumbnail.component.css'
})

export class ThumbnailComponent {
  // private apiUrlAuth = 'http://localhost:8080/movie/';
  private movieThumbnail: MovieThumbnail = {
    id: 0,
    title: '',
    watched: false,
    length: { hours: 0, minutes: 0 },
    visualizedTime: { hours: 0, minutes: 0 },
    img: ''
  };
  // @Input() movieId! : number;
  @Input() movieId : number = 950387;
  constructor(private router: Router,
    private movieService: MovieService){
      this.fillMovieThumbnail(this.movieId);
  }

  fillMovieThumbnail(movieId: number): void {
    this.movieService.getMovieDataFromId(movieId).subscribe((data) => {
      this.movieThumbnail = data;
      console.log(data);
    });
  }

  onClick(): void {
    this.router.navigate(['/summary', this.movieThumbnail.id]).then();
  }

  getMovieWatched(): boolean {
    return this.movieThumbnail.watched;
  }
}
