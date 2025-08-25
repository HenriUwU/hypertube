import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MovieService} from '../../services/movie.service';
import {Movie, PersonModel} from '../../models/movie.model';
import {NgFor, NgIf} from '@angular/common';
import {TorrentService} from '../../services/torrent.service';
import {Torrent} from '../../models/torrent.models';
import {ActivatedRoute, Router} from '@angular/router';
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {MatButton} from "@angular/material/button";
import {CommentsComponent} from '../comments/comments.component';
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {TranslateService} from "../../services/translate.service";

@Component({
  selector: 'app-movie-summary',
  standalone: true,
  templateUrl: './movie-summary.component.html',
  styleUrl: './movie-summary.component.css',
	imports: [NgFor, NgIf, MatButton, MatProgressSpinner, CommentsComponent],
})
export class MovieSummaryComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('castContainer') castContainerRef!: ElementRef;
  @ViewChild('crewContainer') crewContainerRef!: ElementRef;
  @Input() movieId!: number;
  movie!: Movie;
  torrents!: Torrent[];
  magnet!: string;
  trailerUrl!: SafeResourceUrl;
  showTrailer: boolean = false;
  loadingTorrents: boolean = false;
  noTorrent: boolean = false;
  castIndex = 0;
  crewIndex = 0;
  visibleCount = 8;
  tradMap = new Map<string, string>([
    ["Play", "Play"],
    ["The trailer is not available for this movie.", "The trailer is not available for this movie."],
    ["No torrent available.", "No torrent available."]
  ])

  constructor(
    private movieService: MovieService,
    private torrentService: TorrentService,
    private translateService: TranslateService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
	  private router: Router,
  ) {}

  ngOnInit(): void {
    window.addEventListener('resize', this.updateVisibleCount.bind(this));
    this.getData();
    this.autoUpdateLanguage();
    this.translateService.autoTranslateTexts(this.tradMap);
    this.translateService.initializeLanguageListener(this.tradMap);
  }

  private storageEventHandler = (event: StorageEvent) => {
    if (event.storageArea === sessionStorage && event.key === 'language') {
      setTimeout(() => {
        this.getData();
      }, 100);
    }
  };

  autoUpdateLanguage(): void {
    window.addEventListener('storage', this.storageEventHandler);
  }

  ngAfterViewInit(): void {
    this.updateVisibleCount();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.updateVisibleCount.bind(this));
  }

  getData(): void {
    this.route.paramMap.subscribe(params => {
          const id = params.get('id');
          if (id) {
            this.movieId = +id;
            this.loadMovie();
            this.movieService.getMovieTrailer(this.movieId).subscribe({
                next: (url: string) => {
                  const privacyUrl = this.getPrivacyEnhancedUrl(url);
                  this.trailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(privacyUrl);
                },
                error: (e) => {
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
		      this.loadingTorrents = true;
          this.torrentService.searchTorrent(this.movie.englishTitle).subscribe(
            {next: (data: Torrent[]) => {
              this.torrents = data;
			        this.loadingTorrents = false;
              if (this.torrents.length <= 0)
                this.noTorrent = true;
            },
            error: (e) => {
				this.loadingTorrents = false;
            }});
            setTimeout(() => this.updateVisibleCount(), 0);
        },
        error: (e) => {
          console.log('Error fetching movie data:', e);
        },
        complete: () => {
        }});
  }

  loadTrailer(): void {
    this.showTrailer = true;
  }

  getMovieRuntime(): string {
	if (this.movie?.runtime && this.movie?.runtime != 0) {
		const hours = Math.floor(this.movie?.runtime / 60);
		const minutes = this.movie.runtime % 60;
		return `${hours}h ${minutes}m`;
	}
	return '---'
  }

  getVisibleCast(): PersonModel[] {
    return this.movie.credits.cast.slice(this.castIndex, this.castIndex + this.visibleCount);
  }

  getVisibleCrew(): PersonModel[] {
    return this.movie.credits.crew.slice(this.crewIndex, this.crewIndex + this.visibleCount);
  }

  scrollCast(direction: number): void {
    const newIndex = this.castIndex + direction * this.visibleCount;
    if (newIndex >= 0 && newIndex < this.movie.credits.cast.length) {
      this.castIndex = newIndex;
    }
  }

  scrollCrew(direction: number): void {
    const newIndex = this.crewIndex + direction * this.visibleCount;
    if (newIndex >= 0 && newIndex < this.movie.credits.crew.length) {
      this.crewIndex = newIndex;
    }
  }

  selectTorrent(magnet: string): void {
    this.magnet = magnet;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/person-notfound.svg';
  }

  getImageUrl(path: string | undefined): string {
    if (path)
      return path
    return 'assets/images/person-notfound.svg';
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
			  magnet: this.magnet,
        movieId: this.movie.id,
        backdropPath: this.movie.backdrop_path,
        imdbId: this.movie.imdb_id
		  }
	  }).then();
  }

  updateVisibleCount(): void {
    setTimeout(() => {
      const container = this.castContainerRef?.nativeElement as HTMLElement;
      if (!container) return;

      const containerWidth = container.offsetWidth;
      const cardWidth = 100;

      const count = Math.floor(containerWidth / cardWidth);
      this.visibleCount = Math.max(1, count);
    });
  }

  private getPrivacyEnhancedUrl(url: string): string {
    if (url.includes('youtube.com/embed/')) {
      return url.replace('youtube.com', 'youtube-nocookie.com');
    }
    return url;
  }
}
