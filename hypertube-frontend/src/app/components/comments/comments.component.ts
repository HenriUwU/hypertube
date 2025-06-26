import { Component, Input, OnInit } from '@angular/core';
import { MatDividerModule } from "@angular/material/divider"
import { CommentService } from '../../services/comments.service';
import { MovieService } from '../../services/movie.service';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommentDTO } from '../../models/comment.model';
import { UserService } from '../../services/user.service';
import { UserModel } from '../../models/user.model';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import {TranslateService} from "../../services/translate.service";

@Component({
  selector: 'app-comments',
  imports: [MatDividerModule, NgFor, NgIf, FormsModule, RouterModule],
  standalone: true,
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.css'
})

export class CommentsComponent implements OnInit {
  @Input() movieId!: number;
  comments! : CommentDTO[];
  commentContent: string = '';
  currentUser!: UserModel;
  likedStatus: { [commentId: string]: boolean } = {};
  isEditing: number = 0;
  commentBeforeEdit!: string;
  commentEdited!: string
  tradMap = new Map<string, string>([
    ["Comments", "Comments"],
    ["Write your comment here...", "Write your comment here..."],
    ["Send", "Send"],
    ["Save", "Save"],
    ["Cancel", "Cancel"]
  ])

  constructor(
    private commentService: CommentService,
    private movieService: MovieService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.translateService.autoTranslateTexts(this.tradMap);
    this.translateService.initializeLanguageListener(this.tradMap);
    const id: string = this.authService.getCurrentUserId()!;
    this.userService.getUser(id).subscribe({
      next: (user) => {
        this.currentUser = user;
        this.loadComments();
      },
      error: (err) => {
        console.log('Error fetching user:', err);
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

  isMyComment(comment: CommentDTO): boolean {
    return comment.user.id === Number(this.authService.getCurrentUserId());
  }

  editComment(comment: CommentDTO) {
    this.isEditing = comment.id;
    this.commentBeforeEdit = comment.content;
    this.commentEdited = comment.content;
  }

  saveComment(comment: CommentDTO) {
    let editedContent = comment;
    editedContent.content = this.commentEdited;
    this.commentService.updateComment(editedContent).subscribe(updatedComment => {
      const index = this.comments.findIndex(c => c.id === comment.id);
      if (index !== -1) this.comments[index] = updatedComment;
      this.isEditing = 0;
    });
  }

  cancelEdit(comment: CommentDTO) {
    this.isEditing = 0;
    this.commentEdited = this.commentBeforeEdit;
  }

  deleteComment(commentId: number) {
    this.commentService.deleteComment(commentId).subscribe(() => {
      this.comments = this.comments.filter(c => c.id !== commentId);
    });
  }

  toProfile(userId: number): void {
    this.router.navigate(['user', 'profile'], {
      queryParams: { userId: String(userId) }
    }).then();
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

  getCharCount(): number {
    return this.commentContent ? this.commentContent.length : 0;
  }
}
