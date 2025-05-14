import { Component, OnInit } from '@angular/core';
import {NgClass, NgIf} from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from "../../services/auth.service";
import { HttpErrorResponse } from '@angular/common/http'; // Import this for error typing
import { TranslateService } from '../../services/translate.service';

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

  textMap = new Map<string, string>([
    ["Verification successful!", "Verification successful!"],
    ["Verification failed.", "Verification failed."],
    ["No token provided.", "No token provided."],
    ["Please check your email link or try again later.", "Please check your email link or try again later."],

  ]);

  constructor(private route: ActivatedRoute, private authService: AuthService, private translateService: TranslateService) {}

  ngOnInit(): void {
    // this.translateService.autoTranslateTexts(this.textMap);
    // this.translateService.initializeLanguageListener(this.textMap);
    
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
          this.message = err.error?.message || this.textMap.get("Verification failed.");
          this.isSuccess = false;
          this.isLoading = false;
        }
      });
    } else {
      this.message = this.textMap.get("No token provided.") || "No token provided."; 
      this.isSuccess = false;
    }
  }
}
