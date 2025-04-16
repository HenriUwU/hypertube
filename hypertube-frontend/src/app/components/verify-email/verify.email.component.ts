import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [NgIf, HttpClientModule],
  templateUrl: './verify.email.component.html'
})
export class VerifyEmailComponent implements OnInit {
  message: string = '';
  isSuccess: boolean = false;

  constructor(private route: ActivatedRoute, private authService: AuthService) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.authService.verifyEmail(token).subscribe({
        next: (response: string) => {
          this.message = response;
          this.isSuccess = true;
        },
        error: (err: string) => {
          this.message = err;
          this.isSuccess = false;
        }
      });
    } else {
      this.message = 'Aucun token fourni.';
      this.isSuccess = false;
    }
  }
}
