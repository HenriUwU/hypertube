import {Component, ElementRef, ViewChild} from '@angular/core';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import Hls from "hls.js";
import {HttpClient} from "@angular/common/http";
import {StreamingService} from "../../services/streaming.service";

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    MatProgressSpinnerModule
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {

  @ViewChild('videoPlayer') videoRef!: ElementRef<HTMLVideoElement>;

  constructor(private http: HttpClient,
              private streamingService: StreamingService) {}

  ngAfterViewInit() {
    const hash = '87A2D22EB879593B48B3D3EE6828F56E2BFB4415';
    const hlsUrl = `http://localhost:8080/torrents/${hash}/hls/playlist.m3u8`;

    const video = this.videoRef.nativeElement;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().then();
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().then();
      });
    }
  }


}