import {Component, OnInit} from '@angular/core';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import { MovieService } from '../../services/movie.service';
import { NgFor, NgForOf } from '@angular/common';
import { ThumbnailComponent } from '../thumbnail/thumbnail.component';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatDivider } from '@angular/material/divider';


@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    MatProgressSpinnerModule, NgFor, NgForOf, ThumbnailComponent, MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule, MatDivider
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent implements OnInit {
  movies: any[] = [];
  sortingOptions: string[] = ['popular', 'top_rated', 'upcoming', 'now_playing'];

  constructor(private movieService: MovieService) {

  }

  ngOnInit() {
    this.movieService.sortBy('popular', 1, []).subscribe((data: any) => {
      this.movies = data;
    }
    );
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
    this.movieService.sortBy(selectedOption, 1, []).subscribe((data: any) => {
      this.movies = data;
    }
    );
  }
}
