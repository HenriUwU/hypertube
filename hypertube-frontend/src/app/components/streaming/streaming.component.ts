import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {TorrentService} from '../../services/torrent.service';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import Hls from "hls.js";
import {NgIf, NgOptimizedImage} from '@angular/common';
import {TranslateService} from '../../services/translate.service';
import {MovieService} from "../../services/movie.service";
import {Subtitles} from "../../models/movie.model";


@Component({
  selector: 'app-streaming',
	imports: [MatProgressSpinnerModule, NgIf, NgOptimizedImage],
  standalone: true,
  templateUrl: './streaming.component.html',
  styleUrl: './streaming.component.css'
})
export class StreamingComponent implements OnInit, AfterViewInit {
  @ViewChild('videoPlayer', {static: false}) videoPlayer!: ElementRef;

  videoUrl: string = '';
  loading: boolean = false;
  blankVideo: boolean = true;
  @Input() videoTitle: string = 'minecraft';
  @Input() backdrop_path: string = 'https://image.tmdb.org/t/p/original/rU9kRB3rBU5O7AMReZCiuIy7zmE.jpg';
  @Input() magnet: string = 'magnet:?xt=urn:btih:837F5D78B6CA706A612892F9960A826B715461E7&dn=A+Minecraft+Movie+%282025%29+%5B1080p%5D+%5BWEBRip%5D+%5B5.1%5D+%5BYTS.MX%5D&tr=http%3A%2F%2Fp4p.arenabg.com%3A1337%2Fannounce&tr=udp%3A%2F%2F47.ip-51-68-199.eu%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.me%3A2780%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2710%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2730%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2920%2Fannounce&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2Fopentracker.i2p.rocks%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.cyberia.is%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.dler.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Ftracker.pirateparty.gr%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.tiny-vps.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce';

  torrentOptions:any[] = [];
  private hash: string = '';

  textMap = new Map<string, string>([
    ["Select a torrent", "Select a torrent"],
    ["Your browser does not support the video tag.", "Your browser does not support the video tag."],
  ]);

  constructor(private torrentService: TorrentService, private translationService: TranslateService, private movieService: MovieService) {
  }

  ngOnInit() {
	  this.translationService.autoTranslateTexts(this.textMap);
	  this.translationService.initializeLanguageListener(this.textMap);
	  this.loading = true;

	  // this.torrentService.searchTorrent(this.videoTitle).subscribe((response: Torrent[]) => {
	  //   this.torrentOptions = response;
	  // 	console.log(this.torrentOptions);
	  // });
  }

  ngAfterViewInit() {
	  this.startStreaming()
  }

  startStreaming() {
    this.blankVideo = false;
    this.loading = true;
    const videoEl: HTMLVideoElement = this.videoPlayer.nativeElement;
    Array.from(videoEl.querySelectorAll('track')).forEach(track => track.remove());

    this.movieService.getSubtitles("tt13186482").subscribe(
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
        console.log('Torrent hash:', this.hash);
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
      const hls = new Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().then();
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().then();
      });
    }
  }

}
