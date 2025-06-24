import {Component, Input} from '@angular/core';
import {MatDividerModule} from "@angular/material/divider"
import {CommentService} from '../../services/comments.service';
import {MovieService} from '../../services/movie.service';
import {NgFor, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
// import { UserService } from '../../services/user.service';
import {AuthService} from '../../services/auth.service';
import {CommentDTO} from '../../models/comment.model';
import {RouterModule} from '@angular/router';
import {UserService} from '../../services/user.service';
import { UserModel } from '../../models/user.model';

@Component({
  selector: 'app-comments',
  imports: [MatDividerModule, NgFor, NgIf, FormsModule, RouterModule],
  standalone: true,
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.css'
})

export class CommentsComponent {
  @Input() movieId : number = 950387;
  comments! : CommentDTO[];
  commentContent: string = '';
  currentUser!: UserModel;

  constructor(
    private commentService: CommentService,
    private movieService: MovieService,
    private authService: AuthService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    // this.newComment.movieId = this.movieId;
    this.loadComments();
    const id: string = this.authService.getCurrentUserId()!;
    this.userService.getUser(id).subscribe({
      next: (user) => {
        console.log('Current user:', user);
        this.currentUser = user;
      },
      error: (err) => {
        console.error('Error fetching user:', err);
      }
    });
  }

  loadComments() {
    this.movieService.getComments(this.movieId).subscribe(comments => {
      this.comments = comments.map(comment => {
        return {
          ...comment,
          likedByCurrentUser: this.checkIfLikedByCurrentUser(comment)
        };
      });
    });
  }

  checkIfLikedByCurrentUser(comment: CommentDTO): boolean {
    // const currentUserId = this.authService.getCurrentUserId();
    // return comment.likes.some(like => like.userId === Number(currentUserId));
    return false;
  }

   submitComment() {
    if (!this.commentContent.trim()) return;

    this.commentService.postComment(this.movieId, this.commentContent).subscribe(comment => {
      this.comments.push(comment);
      this.commentContent = '';
    });
  }

  // toggleLike(comment: CommentDTO) {
  //   if (comment.likedByCurrentUser) {
  //     this.unlikeComment(comment.id);
  //   } else {
  //     this.likeComment(comment.id);
  //   }
  //   comment.likedByCurrentUser = !comment.likedByCurrentUser;
  //   comment.likes += comment.likedByCurrentUser ? 1 : -1;
  // }

  likeComment(commentId: number) {
    this.commentService.likeComment(commentId).subscribe(updatedComment => {
      const index = this.comments.findIndex(c => c.id === commentId);
      if (index !== -1) this.comments[index] = updatedComment;
    });
  }

  unlikeComment(commentId: number) {
    this.commentService.unlikeComment(commentId).subscribe(updatedComment => {
      const index = this.comments.findIndex(c => c.id === commentId);
      if (index !== -1) this.comments[index] = updatedComment;
    });
  }

  deleteComment(commentId: number) {
    this.commentService.deleteComment(commentId).subscribe(() => {
      this.comments = this.comments.filter(c => c.id !== commentId);
    });
  }

  isMyComment(comment: CommentDTO): boolean {
  return comment.user.id === Number(this.authService.getCurrentUserId());
  }
  
  // /comment/id/like 
  // {commentId/liked bool}

  formatDateTime(datetime: string): string {
    const date = new Date(datetime);
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}


