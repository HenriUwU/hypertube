import { Component } from '@angular/core';
import { TranslateService } from '../../services/translate.service';
import { GlobalMessageService } from '../../services/global.message.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-forgot-password-popup',
  imports: [FormsModule], 
  templateUrl: './forgot-password-popup.component.html',
  styleUrl: './forgot-password-popup.component.css'
})
export class ForgotPasswordPopupComponent {
  // Tis componennt is used to display a popup for asking a mail address to send a reset password link

  tradMap = new Map<string, string>([
    ["Please enter your email address to receive a reset password link.", "Please enter your email address to receive a reset password link."],
    ["Email Address", "Email Address"],
    ["Send reset link", "Send reset link"],
    ["Reset link sent successfully, check your emails", "Reset link sent successfully, check your emails."],
    ["Error sending reset link", "Error sending reset link"]
  ]);

  email: string = '';

  constructor(
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private authService: AuthService
  ) {
  }

  NgOnInit(){
    this.translateService.autoTranslateTexts(this.tradMap);
    this.translateService.initializeLanguageListener(this.tradMap);
  }

  onSubmit() {

    if (!this.email || this.email.trim() === '') {
      this.globalMessageService.showMessage(this.tradMap.get("Please enter a valid email address") || "Please enter a valid email address", false);
      return;
    }
    console.log("Sending reset link to:", this.email);
    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        // this.handleSuccess();
      },
      error: (error) => {
        console.error("Error sending reset link:", error);
        this.globalMessageService.showMessage(this.tradMap.get("Error sending reset link") || "Error sending reset link", false);
      }
    });
    this.globalMessageService.showMessage(this.tradMap.get("Reset link sent successfully, check your emails.") || "Reset link sent successfully, check your emails.", true);
  }
}
