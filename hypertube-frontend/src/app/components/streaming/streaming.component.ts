import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-streaming',
  imports: [],
  standalone: true,
  templateUrl: './streaming.component.html',
  styleUrl: './streaming.component.css'
})
export class StreamingComponent {
  @ViewChild('videoPlayer', {static: false}) videoPlayer!: ElementRef;
  @Input() videoUrl: string = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  @Input() videoTitle: string = 'Big Buck Bunny';

  constructor() {
  }

  // toggleVideo() {
  //   const video: HTMLVideoElement = this.videoPlayer.nativeElement;
  //   video.paused ? video.play() : video.pause();
  // }
}
