import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { TorrentService } from '../../services/torrent.service';
import { MatDivider } from '@angular/material/divider';
import { Torrent } from '../../models/torrent.models';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import Hls from "hls.js";
import { NgIf } from '@angular/common';
import { TranslateService } from '../../services/translate.service';
import {MovieService} from "../../services/movie.service";
import {Subtitles} from "../../models/movie.model";


@Component({
  selector: 'app-streaming',
  imports: [MatDivider, MatProgressSpinnerModule, NgIf],
  standalone: true,
  templateUrl: './streaming.component.html',
  styleUrl: './streaming.component.css'
})
export class StreamingComponent {
  @ViewChild('videoPlayer', {static: false}) videoPlayer!: ElementRef;

  videoUrl: string = '';
  loading: boolean = false;
  blankVideo: boolean = true;
  @Input() videoTitle: string = 'The lion king';


  torrentOptions:any[] = [];
  private hash: string = '';
  private magnet: string = '';

  textMap = new Map<string, string>([
    ["Select a torrent", "Select a torrent"],
    ["Your browser does not support the video tag.", "Your browser does not support the video tag."],
  ]);

  constructor(private torrentService: TorrentService, private translationService: TranslateService, private movieService: MovieService) {
  }

  ngOnInit() {
    this.translationService.autoTranslateTexts(this.textMap);
    this.translationService.initializeLanguageListener(this.textMap);

    this.torrentService.searchTorrent(this.videoTitle).subscribe((response: Torrent[]) => {
      this.torrentOptions = response;
    }
    );
  }

  onTorrentChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    if (!selectElement) {
      return;
    }
    const selectedOption = selectElement.value;
    if (!selectedOption) {
      return;
    }
    this.blankVideo = false;
    this.magnet = selectedOption;
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
        }
      },
      (error) => {
        if (error.status === 403 || error.error === null) {
          console.log('Torrent not started, starting torrent...');
          this.startTorrent();
        } else {
          console.warn('Handled error while checking if torrent is started:', error.message || error);
        }
      }
    );
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
