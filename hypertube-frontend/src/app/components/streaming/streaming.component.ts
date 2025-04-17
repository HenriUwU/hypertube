import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Movie } from '../../models/movie.model';
import { MovieService } from '../../services/movie.service';
import { TorrentService } from '../../services/torrent.service';
import { MatDivider } from '@angular/material/divider';
import { Torrent } from '../../models/torrent.models';
import Hls from "hls.js";

@Component({
  selector: 'app-streaming',
  imports: [MatDivider],
  standalone: true,
  templateUrl: './streaming.component.html',
  styleUrl: './streaming.component.css'
})
export class StreamingComponent {
  @ViewChild('videoPlayer', {static: false}) videoPlayer!: ElementRef;

  videoUrl: string = '';
  tracksUrl: string = '';
  // @Input() videoTitle: string = 'A minecraft movie';
  // @Input() videoTitle: string = 'The Sorcerer s Apprentice';
  @Input() videoTitle: string = 'The lion king';


  torrentOptions:any[] = [];
  private hash: string = '';
  private magnet: string = '';

  constructor(private torrentService: TorrentService) {
  }

  ngOnInit() {
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
    this.magnet = selectedOption;
    this.torrentService.sendMagnet(this.magnet).subscribe((response: string) => {
      this.hash = response;
      // this.torrentService.getTorrentPath(this.hash).subscribe((response: string) => {
      //   this.videoUrl = response;
      //   console.log(this.videoUrl);

      var interId = setInterval(() => {
        if (this.hash) {
          this.torrentService.getTorrentPath(this.hash).subscribe((response: string) => {
            this.videoUrl = response;
            console.log(this.videoUrl);
            // stop the interval if the video is loaded
            if (this.videoUrl) {
              const video = this.videoPlayer.nativeElement;
              this.hlsConversion(this.videoUrl, video);
              clearInterval(interId);
            }
          }, (error) => {
            console.error('Error fetching torrent path:', error);
          });
        }
      }, 5000);

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
