import {Component, Input} from '@angular/core';
import {MatDividerModule} from "@angular/material/divider"
import {CommentService} from '../../services/comments.service';
import {MovieService} from '../../services/movie.service';
import {CommentDTO} from '../../models/movie.model';
import {NgFor, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-comments',
  imports: [MatDividerModule, NgFor, NgIf, FormsModule],
  standalone: true,
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.css'
})
export class CommentsComponent {
  @Input() movieId : number = 950387;
  comments! : CommentDTO[];
  // newComment: CommentDTO = {id: 0, movieId: 0, userId: 0, content: '', like: 0};
  newComment: CommentDTO = {movieId: 0, content: ''};

  constructor(
    private commentService: CommentService,
    private movieService: MovieService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.newComment.movieId = this.movieId;
    this.loadComments();
  }

  loadComments() {
    this.movieService.getComments(this.movieId).subscribe(comments => {
      this.comments = comments;
    });
  }

   submitComment() {
    if (!this.newComment.content.trim()) return;
    // this.newComment.userId = Number(this.authService.getCurrentUserId());
    console.log("submit comment", this.newComment)

    this.commentService.postComment(this.newComment).subscribe(comment => {
      this.comments.push(comment);
      this.newComment.content = '';
    });
  }

  // likeComment(commentId: number) {
  //   this.commentService.likeComment(commentId).subscribe(updatedComment => {
  //     const index = this.comments.findIndex(c => c.id === commentId);
  //     if (index !== -1) this.comments[index] = updatedComment;
  //   });
  // }

  // unlikeComment(commentId: number) {
  //   this.commentService.unlikeComment(commentId).subscribe(updatedComment => {
  //     const index = this.comments.findIndex(c => c.id === commentId);
  //     if (index !== -1) this.comments[index] = updatedComment;
  //   });
  // }

  // deleteComment(commentId: number) {
  //   this.commentService.deleteComment(commentId).subscribe(() => {
  //     this.comments = this.comments.filter(c => c.id !== commentId);
  //   });
  // }
}
