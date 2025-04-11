import {Component, OnInit} from '@angular/core';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import { MovieService } from '../../services/movie.service';
import { NgFor, NgForOf } from '@angular/common';
import { ThumbnailComponent } from '../thumbnail/thumbnail.component';
// ngForOf


@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    MatProgressSpinnerModule, NgFor, NgForOf, ThumbnailComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})

export class HomePageComponent implements OnInit {
  movies: any[] = [];

  constructor(private movieService: MovieService) {

  }

  ngOnInit() {
    this.movieService.sortBy('popular', 1, []).subscribe((data: any) => {
      this.movies = data;
      console.log(this.movies);
    }
    );
  }
}
