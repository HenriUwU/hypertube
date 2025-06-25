import {AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TorrentService} from '../../services/torrent.service';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import Hls from "hls.js";
import {NgIf, NgOptimizedImage} from '@angular/common';
import {TranslateService} from '../../services/translate.service';
import {MovieService} from "../../services/movie.service";
import {Movie, Subtitles} from "../../models/movie.model";
import {ActivatedRoute} from "@angular/router";


@Component({
  selector: 'app-streaming',
	imports: [MatProgressSpinnerModule, NgIf, NgOptimizedImage],
  standalone: true,
  templateUrl: './streaming.component.html',
  styleUrl: './streaming.component.css'
})
export class StreamingComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('videoPlayer', {static: false}) videoPlayer!: ElementRef;

  videoUrl: string = '';
  loading: boolean = false;
  blankVideo: boolean = true;
  @Input() magnet!: string;
  @Input() movieId!: number;
  @Input() backdropPath!: string;
  @Input() imdbId!: string;
  @Input() filmStoppedAt!: string;

  private hash: string = '';

  tradMap = new Map<string, string>([
    ["Select a torrent", "Select a torrent"],
    ["Your browser does not support the video tag.", "Your browser does not support the video tag."],
  ]);

  constructor(private torrentService: TorrentService,
			  private translationService: TranslateService,
			  private movieService: MovieService,
			  private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.translationService.autoTranslateTexts(this.tradMap);
    this.translationService.initializeLanguageListener(this.tradMap);
    this.loading = true;

    this.route.queryParams.subscribe(params => {
      this.magnet = params['magnet'];
      this.movieId = params['movieId'];
      this.backdropPath = params['backdropPath'];
      this.imdbId = params['imdbId'];
      this.filmStoppedAt = params['filmStoppedAt']
    });
  }

  ngAfterViewInit() {
    this.startStreaming();
  }

  ngOnDestroy() {
    const videoElem: HTMLVideoElement = this.videoPlayer.nativeElement;
    if (videoElem) {
      const currentTime = videoElem.currentTime;
      const stoppedAt = new Date(currentTime * 1000).toISOString().substr(11, 8);
      this.movieService.saveWatched(this.movieId, stoppedAt).subscribe({
        next: () => console.log('Watched time updated successfully'),
        error: (error) => console.error('Error updating watched time:', error)
      });
    }
  }

  startStreaming() {
    this.blankVideo = false;
    this.loading = true;
    const videoEl: HTMLVideoElement = this.videoPlayer.nativeElement;
    Array.from(videoEl.querySelectorAll('track')).forEach(track => track.remove());

    this.movieService.getSubtitles(this.imdbId).subscribe(
      (response: Subtitles[]) => {
        if (response.length > 0) {
          response.forEach((sub, index) => {
            if (sub.url) {
              const trackEl = document.createElement('track');
              trackEl.kind = 'subtitles';
              trackEl.label = sub.title;
              trackEl.srclang = sub.language || 'en';
              trackEl.src = sub.url;
              trackEl.default = false;

              videoEl.appendChild(trackEl);
            }
          });
          setTimeout(() => {
            const tracks = videoEl.textTracks;
            if (tracks.length > 0) {
              tracks[0].mode = 'showing';
            }
          }, 500);
        }
      },
      (error) => {
        console.log('Subtitle fetch error:', error);
      }
    );

    this.torrentService.isTorrentStarted(this.magnet).subscribe(
      (response: string) => {
        this.hash = response;
        if (this.hash) {
          this.launchStreaming();
        } else {
          this.startTorrent();
		}},
      (error) => {
        if (error.status === 403 || error.error === null) {
          console.log('Torrent not started, starting torrent...');
          this.startTorrent();
        } else {
          console.warn('Handled error while checking if torrent is started:', error.message || error);
        }});
  }

  startTorrent() {
    this.torrentService.sendMagnet(this.magnet).subscribe((response: string) => {
      this.hash = response;
      this.launchStreaming();
    });
  }

  launchStreaming() {
    if (!this.hash) {
      console.error('Error: hash is not defined');
      return;
    }
    this.torrentService.getTorrentPath(this.hash).subscribe((response: string) => {
      this.videoUrl = response;
      console.log(this.videoUrl);
      if (this.videoUrl) {
        this.loading = false;
        const video = this.videoPlayer.nativeElement;
        this.hlsConversion(this.videoUrl, video);
      } else {
        console.error('Error: videoUrl is empty');
      }
    }, (error) => {
      console.error('Error fetching torrent path:', error);
    });
  }

  hlsConversion(videoUrl: string, video: HTMLVideoElement) {
    if (Hls.isSupported()) {
      const hls = new Hls({
        startPosition: 0,
        maxBufferLength: 60,
        maxMaxBufferLength: 120,
        liveSyncDurationCount: 999998, // désactive auto-synchro
        liveMaxLatencyDurationCount: 999999, // idem
        backBufferLength: 90 // garde un peu de buffer derrière
      });

      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.currentTime = 0; // force début
        video.play().catch(err => console.warn('Autoplay failed:', err));
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().then();
      });
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const video = this.videoPlayer?.nativeElement;
    if (!video) return;

    switch (event.key.toLowerCase()) {
      case 'f':
        if (document.fullscreenElement) {
          document.exitFullscreen().catch((err:string) => console.warn('Exit fullscreen error:', err));
        } else {
          video.requestFullscreen().catch((err: string) => console.warn('Fullscreen error:', err));
        }
        break;

      case 'arrowright':
        video.currentTime += 10;
        break;

      case 'arrowleft':
        video.currentTime -= 10;
        break;

      case ' ':
        if (video.paused) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
        break;
    }
  }

}
