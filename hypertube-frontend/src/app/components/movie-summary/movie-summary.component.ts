import { Component, Input, OnInit } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { Movie } from '../../models/movie.model';

@Component({
  selector: 'app-movie-summary',
  standalone: true,
  templateUrl: './movie-summary.component.html',
  styleUrl: './movie-summary.component.css'
})
export class MovieSummaryComponent implements OnInit {
  @Input() movieId : number = 950387;
  movie! : Movie;

  constructor(private movieService:MovieService) {}

  ngOnInit(): void {
    this.movieService.getMovieDataFromIdAsInterface(this.movieId).subscribe(
          {
            next: (data: Movie) => {
              this.movie = data;
              console.log(this.movie);
            },
            error: (e) => {
              console.error('Error fetching movie data:', e);
            },
            complete: () => {
            }
          }
        );
  }
}
