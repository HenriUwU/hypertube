import { Component, Input } from '@angular/core';
import {MatDividerModule} from "@angular/material/divider"
import { CommentService } from '../../services/comments.service';
import { MovieService } from '../../services/movie.service';
import { CommentDTO } from '../../models/movie.model';

@Component({
  selector: 'app-comments',
  imports: [MatDividerModule],
  standalone: true,
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.css'
})
export class CommentsComponent {
  @Input() movieId : number = 950387;
  lastComment! : CommentDTO[];

  constructor(
    private commentService: CommentService,
    private movieService: MovieService,
  ) {}

  ngOnInit(): void {
    console.log("test", this.movieService.getComments(this.movieId))
    this.movieService.getComments(this.movieId).subscribe(
      {
        next: (data: CommentDTO[]) => {
          this.lastComment = data;
        },
        error: (e) => {
          console.error('Error fetching comment data:', e);
        },
        complete: () => {

        }})
      }
}
