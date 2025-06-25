import {Component, Input, OnInit} from '@angular/core';
import {MatDividerModule} from "@angular/material/divider"
import {CommentService} from '../../services/comments.service';
import {MovieService} from '../../services/movie.service';
import {NgFor, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {CommentDTO} from '../../models/comment.model';
import {RouterModule} from '@angular/router';
import {UserService} from '../../services/user.service';
import { UserModel } from '../../models/user.model';
import {Observable} from "rxjs";

@Component({
  selector: 'app-comments',
  imports: [MatDividerModule, NgFor, NgIf, FormsModule, RouterModule],
  standalone: true,
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.css'
})

export class CommentsComponent implements OnInit {
  @Input() movieId : number = 950387;
  comments! : CommentDTO[];
  commentContent: string = '';
  currentUser!: UserModel;
  likedStatus: { [commentId: string]: boolean } = {};

  constructor(
    private commentService: CommentService,
    private movieService: MovieService,
    private authService: AuthService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    const id: string = this.authService.getCurrentUserId()!;
    this.userService.getUser(id).subscribe({
      next: (user) => {
        console.log('Current user:', user);
        this.currentUser = user;
        this.loadComments();
      },
      error: (err) => {
        console.error('Error fetching user:', err);
      }
    });
  }

  submitComment() {
    if (!this.commentContent.trim()) return;

    this.commentService.postComment(this.movieId, this.commentContent).subscribe(comment => {
      this.comments.push(comment);
      this.commentContent = '';
    });
  }

  loadComments() {
    this.movieService.getComments(this.movieId).subscribe(comments => {
      this.comments = comments;
      this.updateLikedStatus();
    });
  }

  updateLikedStatus() {
    if (!this.currentUser) return;

    this.comments.forEach(comment => {
      this.commentService.isLiked(comment.id).subscribe(isLiked => {
        console.log(`Comment ID: ${comment.id}, Liked: ${isLiked}`);
        this.likedStatus[comment.id] = isLiked;
      });
    });
  }

  toggleLike(comment: CommentDTO) {
    this.commentService.isLiked(comment.id).subscribe(isLiked => {
      if (isLiked) {
        this.unlikeComment(comment.id);
      } else {
        this.likeComment(comment.id);
      }
    });
  }

  likeComment(commentId: number) {
    this.commentService.likeComment(commentId).subscribe(updatedComment => {
      const index = this.comments.findIndex(c => c.id === commentId);
      if (index !== -1) this.comments[index] = updatedComment;

      this.likedStatus[commentId] = true;
    });
  }

  unlikeComment(commentId: number) {
    this.commentService.unlikeComment(commentId).subscribe(updatedComment => {
      const index = this.comments.findIndex(c => c.id === commentId);
      if (index !== -1) this.comments[index] = updatedComment;

      this.likedStatus[commentId] = false;
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


