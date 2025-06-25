import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators, AbstractControl, ValidationErrors, FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { BrowserModule } from '@angular/platform-browser'
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { TranslateService } from '../../services/translate.service';
import { GlobalMessageService } from '../../services/global.message.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-password',
  imports: [ 
    CommonModule,
    ReactiveFormsModule, 
    FormsModule
   ],
  standalone: true,
  templateUrl: './modify-password.component.html',
  styleUrl: './modify-password.component.css'
})
export class ModifyPasswordComponent {

  @Input() forgotPassword: boolean = false;

  passwordForm = new FormGroup({
    currentPassword: new FormControl<string>(''),
    password: new FormControl<string>('', [Validators.required, ]),
    confirmPassword: new FormControl<string>('', [Validators.required]),
  },{ validators: (control) => this.confirmPasswordValidator(control) });

  
  successMessage: boolean = false;
  private _errorMessage: string = '';

  tradMap = new Map<string, string>([
    ["Current Password", "Current Password"],
    ["New Password", "New Password"],
    ["Confirm New Password", "Confirm New Password"],
    ["Update", "Update"],
    ["Password updated successfully!", "Password updated successfully!"],
    ["Current password is incorrect.", "Current password is incorrect."],
  ]);

  constructor(private authService: AuthService, private translateService: TranslateService, private globalMessageService: GlobalMessageService, private router: Router) { }

  ngOnInit(): void {
    this.translateService.autoTranslateTexts(this.tradMap);
    this.translateService.initializeLanguageListener(this.tradMap);

    this.authService.isOmniauthSession().subscribe({
      next: (isOmniAuth) => {
        if (isOmniAuth){
          this.router.navigate(['/']).then();
        }
      },
      error: (error) => {
        console.log("Error checking omniauth session:", error);
      }
    });
  }

  confirmPasswordValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    const currentPassword = control.get('currentPassword')?.value

    if (!password || !confirmPassword) {
      return null;
    }

    if (password !== confirmPassword) {
      this.errorMessage = "Passwords do not match.";
      return { PasswordNoMatch: true };
    } else if (password.length < 6 || password.length > 40) {
      this.errorMessage = "Password must be between 6 and 40 characters.";
      return { PasswordTooShort: true };
    }
    // Check if there is at least one uppercase letter
    else if (!/[A-Z]/.test(password)) {
      this.errorMessage = "Password must contain at least one uppercase letter.";
      return { PasswordNoUppercase: true };
    }
    // Check if there is at least one lowercase letter
    else if (!/[a-z]/.test(password)) {
      this.errorMessage = "Password must contain at least one lowercase letter.";
      return { PasswordNoLowercase: true };
    }
    // Check if there is at least one number
    else if (!/\d/.test(password)) {
      this.errorMessage = "Password must contain at least one number.";
      return { PasswordNoNumber: true };
    }
    // Check if there is at least one special character
    else if (!/[!@#$%^&*]/.test(password)) {
      this.errorMessage = "Password must contain at least one special character.";
      return { PasswordNoSpecialChar: true };
    }

    if (!currentPassword && !this.forgotPassword) {
      this.errorMessage = "Current password is required.";
      return { PasswordVerificationError: true };
    }
    return null;    
  }

verifyCurrentPassword(currentPassword: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.authService.verifyCurrentPassword(currentPassword).subscribe({
        next: (response: boolean) => {
          if (response === false) {
            this.errorMessage = "Current password is incorrect.";
            this.globalMessageService.showMessage(this.tradMap.get("Current password is incorrect.") || "Current password is incorrect.", false);
            resolve(false);
          } else {
            console.log("Current password is correct.");
            resolve(true);
          }
        },
        error: (_) => {
          this.errorMessage = "An error occurred while verifying the current password.";
          resolve(false);
        }
      });
    });
  }

  async onSubmit() {
    if (!this.forgotPassword) {
      const currentPassword = this.passwordForm.get('currentPassword')?.value;
      if (!currentPassword) {
        this.errorMessage = "Current password is required.";
        return;
      }
      
      const isPasswordValid = await this.verifyCurrentPassword(currentPassword);
      if (!isPasswordValid) {
        return;
      }
    }
    

    if (this.passwordForm.valid) {
      const password = this.passwordForm.get('password')?.value || '';
      // get token from the query params or session storage
      if (this.forgotPassword) {
        const token = new URLSearchParams(window.location.search).get('token') || '';
        if (!token) {
          this.errorMessage = 'Token is missing!';
          return;
        }
        this.authService.updateForgotPassword(token, password).subscribe(
          (response: any) => {
            this.globalMessageService.showMessage(this.tradMap.get("Password updated successfully!") || "Password updated successfully!", true);
            this.successMessage = true;
          },
          (error: any) => {
            this.errorMessage = 'Error updating password.';
            this.successMessage = false;
          }
        );
      } else {
        this.authService.updatePassword('', password).subscribe(
          (response: any) => {
            this.globalMessageService.showMessage(this.tradMap.get("Password updated successfully!") || "Password updated successfully!", true);
            this.successMessage = true;
          },
          (error: any) => {
            this.errorMessage = 'Error updating password.';
            this.successMessage = false;
          }
        );
      }
    }
    else {
      this.errorMessage = 'Form is invalid!';
    }

    // redirect to login page after successful password update
    if (this.successMessage) {
      // setTimeout(() => {
        this.router.navigate(['/']).then();
      // }, 2000); // Redirect after 2 seconds
    }
  }

  get errorMessage(): string {
    return this._errorMessage;
  }
  
  set errorMessage(value: string) {
    this.translateService.autoTranslate([value]).subscribe((translations: string[]) => {
          translations.forEach((translation, index) => {
            this._errorMessage = translation;
      });
    });
  }
}
