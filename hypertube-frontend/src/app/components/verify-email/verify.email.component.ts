import { Component, OnInit } from '@angular/core';
import {NgClass, NgIf} from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from "../../services/auth.service";
import { HttpErrorResponse } from '@angular/common/http'; // Import this for error typing

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [NgIf, HttpClientModule, NgClass],
  templateUrl: './verify.email.component.html',
  styleUrl: './verify.email.component.css'
})
export class VerifyEmailComponent implements OnInit {
  message: string = '';
  isSuccess: boolean = false;
  isLoading: boolean = false;

  constructor(private route: ActivatedRoute, private authService: AuthService) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      this.isLoading = true;
      this.authService.verifyEmail(token).subscribe({
        next: (response: string) => {
          this.message = response;
          this.isSuccess = true;
          this.isLoading = false;
        },
        error: (err: HttpErrorResponse) => {
          this.message = err.error?.message || 'Une erreur est survenue.';
          this.isSuccess = false;
          this.isLoading = false;
        }
      });
    } else {
      this.message = 'Aucun token fourni.';
      this.isSuccess = false;
    }
  }
}
