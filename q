[1mdiff --git a/hypertube-frontend/src/app/app.config.ts b/hypertube-frontend/src/app/app.config.ts[m
[1mindex b1348d1..993b8da 100644[m
[1m--- a/hypertube-frontend/src/app/app.config.ts[m
[1m+++ b/hypertube-frontend/src/app/app.config.ts[m
[36m@@ -30,6 +30,6 @@[m [mexport const appConfig: ApplicationConfig = {[m
         disableImageSizeWarning: true, [m
         disableImageLazyLoadWarning: true[m
       }[m
[31m-    }[m
[32m+[m[32m    },[m
   ][m
 };[m
[1mdiff --git a/hypertube-frontend/src/app/components/comments/comments.component.html b/hypertube-frontend/src/app/components/comments/comments.component.html[m
[1mindex 4a97c93..6d13aba 100644[m
[1m--- a/hypertube-frontend/src/app/components/comments/comments.component.html[m
[1m+++ b/hypertube-frontend/src/app/components/comments/comments.component.html[m
[36m@@ -1,4 +1,4 @@[m
[31m-<div class="comments-container">[m
[32m+[m[32m<div class="comments-container" *ngIf="currentUser">[m
   <h3>Comments</h3>[m
 [m
   <form (ngSubmit)="submitComment()" #commentForm="ngForm" class="comment-form">[m
[1mdiff --git a/hypertube-frontend/src/app/components/movie-summary/movie-summary.component.html b/hypertube-frontend/src/app/components/movie-summary/movie-summary.component.html[m
[1mindex e3f8608..77dcda4 100644[m
[1m--- a/hypertube-frontend/src/app/components/movie-summary/movie-summary.component.html[m
[1m+++ b/hypertube-frontend/src/app/components/movie-summary/movie-summary.component.html[m
[36m@@ -74,7 +74,7 @@[m
     <div class="left-side">[m
       <ng-container *ngIf="trailerUrl; else noTrailer">[m
         <iframe[m
[31m-          [src]="trailerUrl"[m
[32m+[m[32m          [src]="trailerUrl | safeUrl"[m
           title="YouTube video"[m
           allowfullscreen>[m
         </iframe>[m
[36m@@ -110,4 +110,4 @@[m
   </div>[m
 </div>[m
 [m
[31m-<app-comments></app-comments>[m
[32m+[m[32m<!-- <app-comments></app-comments> -->[m
[1mdiff --git a/hypertube-frontend/src/app/components/movie-summary/movie-summary.component.ts b/hypertube-frontend/src/app/components/movie-summary/movie-summary.component.ts[m
[1mindex f46c97c..ef129f7 100644[m
[1m--- a/hypertube-frontend/src/app/components/movie-summary/movie-summary.component.ts[m
[1m+++ b/hypertube-frontend/src/app/components/movie-summary/movie-summary.component.ts[m
[36m@@ -10,13 +10,14 @@[m [mimport {MatButton} from "@angular/material/button";[m
 import {CommentsComponent} from '../comments/comments.component';[m
 import {MatProgressSpinner} from "@angular/material/progress-spinner";[m
 import {TranslateService} from "../../services/translate.service";[m
[32m+[m[32mimport { SafeUrlPipe } from '../../pipes/safeUrl.pipe';[m
 [m
 @Component({[m
   selector: 'app-movie-summary',[m
   standalone: true,[m
   templateUrl: './movie-summary.component.html',[m
   styleUrl: './movie-summary.component.css',[m
[31m-	imports: [NgFor, NgIf, MatButton, MatProgressSpinner, CommentsComponent],[m
[32m+[m	[32mimports: [NgFor, NgIf, MatButton, MatProgressSpinner, CommentsComponent, SafeUrlPipe],[m
 })[m
 export class MovieSummaryComponent implements OnInit, OnDestroy, AfterViewInit {[m
   @ViewChild('castContainer') castContainerRef!: ElementRef;[m
[36m@@ -25,7 +26,8 @@[m [mexport class MovieSummaryComponent implements OnInit, OnDestroy, AfterViewInit {[m
   movie! : Movie;[m
   torrents! : Torrent[];[m
   magnet!: string;[m
[31m-  trailerUrl!: SafeResourceUrl;[m
[32m+[m[32m  // trailerUrl!: SafeResourceUrl;[m
[32m+[m[32m  trailerUrl!: string;[m
   loadingTorrents: boolean = false;[m
   castIndex = 0;[m
   crewIndex = 0;[m
[36m@@ -78,7 +80,8 @@[m [mexport class MovieSummaryComponent implements OnInit, OnDestroy, AfterViewInit {[m
             this.loadMovie();[m
             this.movieService.getMovieTrailer(this.movieId).subscribe({[m
                 next: (url: string) => {[m
[31m-                  this.trailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);[m
[32m+[m[32m                    // this.trailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);[m
[32m+[m[32m                    this.trailerUrl = url;[m
                 },[m
                 error: (e) => {[m
                 },[m
[36m@@ -95,14 +98,14 @@[m [mexport class MovieSummaryComponent implements OnInit, OnDestroy, AfterViewInit {[m
         next: (data: Movie) => {[m
           this.movie = data;[m
           this.movie.vote_average = Math.round(this.movie.vote_average * 10) / 10;[m
[31m-		  this.loadingTorrents = true;[m
[32m+[m		[32m      this.loadingTorrents = true;[m
           this.torrentService.searchTorrent(this.movie.englishTitle).subscribe([m
             {next: (data: Torrent[]) => {[m
               this.torrents = data;[m
[31m-			  this.loadingTorrents = false;[m
[32m+[m			[32m        this.loadingTorrents = false;[m
             },[m
             error: (e) => {[m
[31m-				this.loadingTorrents = false;[m
[32m+[m				[32m      this.loadingTorrents = false;[m
             }});[m
             setTimeout(() => this.updateVisibleCount(), 0);[m
         },[m
