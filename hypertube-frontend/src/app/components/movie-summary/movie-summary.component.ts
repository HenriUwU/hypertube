import { Component, Input, OnInit  } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { Movie, PersonModel } from '../../models/movie.model';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-movie-summary',
  standalone: true,
  templateUrl: './movie-summary.component.html',
  styleUrl: './movie-summary.component.css',
  imports: [NgFor, NgIf],
})
export class MovieSummaryComponent implements OnInit {
  // HERE
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

  getMovieRuntime(): string {
    if (this.movie.runtime == 0){
      return '---'
    }
    const hours = Math.floor(this.movie.runtime / 60);
    const minutes = this.movie.runtime % 60;
    return `${hours}h ${minutes}m`;
  }

  getFirstFiveCast(): PersonModel[] {
    return this.movie.credits.cast.slice(0, 5) || [];
  }

  get castSummary(): string {
    return this.getFirstFiveCast()
      .map(p => p.name + (p.character ? ` as ${p.character}` : ''))
      .join(', ');
  }

  getFirstFiveCrew(): PersonModel[] {
    return this.movie.credits.crew.slice(0, 5) || [];
  }

  get crewSummary(): string {
    return this.getFirstFiveCrew()
      .map(p => p.name + (p.character ? ` as ${p.character}` : ''))
      .join(', ');
  }

}
