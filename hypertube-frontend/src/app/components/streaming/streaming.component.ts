import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Movie } from '../../models/movie.model';
import { MovieService } from '../../services/movie.service';
import { TorrentService } from '../../services/torrent.service';
import { MatDivider } from '@angular/material/divider';
import { Torrent } from '../../models/torrent.models';

@Component({
  selector: 'app-streaming',
  imports: [MatDivider],
  standalone: true,
  templateUrl: './streaming.component.html',
  styleUrl: './streaming.component.css'
})
export class StreamingComponent {
  @ViewChild('videoPlayer', {static: false}) videoPlayer!: ElementRef;

  @Input() movideId: number = 950387;
  videoUrl: string = '';
  videoTitle: string = '';


  torrentOptions:any[] = [];
  private hash: string = '';
  private magnet: string = '';

  constructor(private movieService: MovieService, private torrentService: TorrentService) {
  }

  ngOnInit() {
    this.movieService.getMovieDataFromId(this.movideId).subscribe((movie: Movie) => {
      this.videoTitle = movie.title;

      this.torrentService.searchTorrent(this.videoTitle).subscribe((response: Torrent[]) => {
        this.torrentOptions = response;
      }
      );
    });

  }

  onSortChange(event: Event) {
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
    });
  }
}
