import {Component, Input, OnInit} from '@angular/core';
import {MovieService} from '../../services/movie.service';
import {Movie, PersonModel} from '../../models/movie.model';
import {NgFor, NgIf} from '@angular/common';
import {TorrentService} from '../../services/torrent.service';
import {Torrent} from '../../models/torrent.models';
import {ActivatedRoute, Router} from '@angular/router';
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-movie-summary',
  standalone: true,
  templateUrl: './movie-summary.component.html',
  styleUrl: './movie-summary.component.css',
	imports: [NgFor, NgIf, MatButton],
})
export class MovieSummaryComponent implements OnInit {
  @Input() movieId : number = 950387;
  movie! : Movie;
  torrents! : Torrent[];
  magnet!: string;
  trailerUrl!: SafeResourceUrl;

  constructor(
    private movieService: MovieService,
    private torrentService: TorrentService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
	private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
          const id = params.get('id');
          if (id) {
            this.movieId = +id;
            this.loadMovie();
            this.movieService.getMovieTrailer(this.movieId).subscribe({
                next: (url: string) => {
                  this.trailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
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
	if (this.movie?.runtime && this.movie?.runtime != 0) {
		const hours = Math.floor(this.movie?.runtime / 60);
		const minutes = this.movie.runtime % 60;
		return `${hours}h ${minutes}m`;
	}
	return '---'
  }

  getFirstFiveCast(): PersonModel[] | null {
	  if (this.movie?.credits) {
		  return this.movie.credits.cast.slice(0, 5) || [];
	  }
	  return null;
  }

  get castSummary(): string | null {
	  const firstFiveCast = this.getFirstFiveCast();
	  if (firstFiveCast) {
		  return firstFiveCast
			  .map(p => p.name + (p.character ? ` as ${p.character}` : ''))
			  .join(', ');
	  }
	  return null;
  }

  getFirstFiveCrew(): PersonModel[] | null {
	  if (this.movie?.credits) {
		  return this.movie.credits.crew.slice(0, 5) || [];
	  }
	  return null;
  }

  get crewSummary(): string {
	  const firstFiveCrew = this.getFirstFiveCrew()
	  if (firstFiveCrew) {
		  return firstFiveCrew
			  .map(p => p.name + (p.character ? ` as ${p.character}` : ''))
			  .join(', ');
	  }
	  return '';
  }

  selectTorrent(magnet: string): void {
    this.magnet = magnet;
  }

  getGenreString(): string | null {
	  if (this.movie?.genres) {
		  return this.movie.genres.map(genre => genre.name).join(' - ');
	  }
	  return null
  }

  stream(): void {
	  this.router.navigate(['/stream'], {
		  queryParams: {
			  title: this.movie.title,
			  backdrop: this.movie.backdrop_path,
			  magnet: this.magnet
		  }
	  }).then();
  }

}
