import { Component, Input, OnInit  } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { Movie, PersonModel } from '../../models/movie.model';
import { NgFor, NgIf } from '@angular/common';
import { TorrentService } from '../../services/torrent.service';
import { Torrent } from '../../models/torrent.models';
import { ActivatedRoute } from '@angular/router';
// import { map, Observable } from 'rxjs';
// import { HttpClientModule } from '@angular/common/http';

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
  torrents! : Torrent[];
  magnet!: string;
  trailerUrl: string | null = null;

  constructor(
    private movieService: MovieService, 
    private torrentService: TorrentService, 
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
          const id = params.get('id');
          if (id) {
            this.movieId = +id;
            this.loadMovie();
            this.movieService.getMovieTrailer(this.movieId).subscribe({
                next: (url: string) => {
                  this.trailerUrl = url;
                },
                error: (e) => {
                  console.error('Error fetching trailer:', e);
                },
                complete: () => {
                }
        });
      }
    });

  }

  loadMovie(){
    this.movieService.getMovieDataFromIdAsInterface(this.movieId).subscribe(
      {
        next: (data: Movie) => {
          this.movie = data;
          this.movie.vote_average = Math.round(this.movie.vote_average * 10) / 10;

          this.torrentService.searchTorrent(this.movie.title).subscribe(
            {next: (data: Torrent[]) => {
              this.torrents = data;
              console.log(this.torrents);
            },
            error: (e) => {

            }});
        },
        error: (e) => {
          console.error('Error fetching movie data:', e);
        },
        complete: () => {
        }});
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

  selectTorrent(magnet: string): void {
    this.magnet = magnet;
  }
}
