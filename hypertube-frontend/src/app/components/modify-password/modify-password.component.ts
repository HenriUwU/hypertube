import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators, AbstractControl, ValidationErrors, FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { BrowserModule } from '@angular/platform-browser'
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { TranslateService } from '../../services/translate.service';
;

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

  @Input() resetPassword: boolean = false;

  passwordForm = new FormGroup({
    currentPassword: new FormControl<string>(''),
    password: new FormControl<string>('', [Validators.required, ]),
    confirmPassword: new FormControl<string>('', [Validators.required]),
  },{ validators: (control) => this.confirmPasswordValidator(control) });
  // }, { validators: this.confirmPasswordValidator });

  
  successMessage: boolean = false;
  private _errorMessage: string = '';

  textMap = new Map<string, string>([
    ["Current Password", "Current Password"],
    ["New Password", "New Password"],
    ["Confirm New Password", "Confirm New Password"],
    ["Update", "Update"],
    ["Password updated successfully!", "Password updated successfully!"],
  ]);

  constructor(private authService: AuthService, private translateService: TranslateService) { }

  ngOnInit(): void {
    this.translateService.autoTranslateTexts(this.textMap);
    this.translateService.initializeLanguageListener(this.textMap);
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

    if (!currentPassword) {
      this.errorMessage = "Current password is required.";
      return { PasswordVerificationError: true };
    }
    // const verifCurrent = this.authService.verifyCurrentPassword(currentPassword).subscribe({
    //   next: (response: any) => {
    //     console.log("Response: ", response);
    //     console.log("Response: ", response.response);
    //     if (response.status === 200 && response.data === true) {
    //       this.errorMessage = "Current password is incorrect.";
    //       return { PasswordVerificationError: true };
    //     }
    //     return null;
    //   },
    //   error: (error: any) => {
    //     this.errorMessage = "An error occurred while verifying the current password.";
    //     return { PasswordVerificationError: true };
    //   }
    // });

    // return verifCurrent;    
    return null;    
  }

  verifyCurrentPassword(currentPassword: string): boolean {
      const verifCurrent = this.authService.verifyCurrentPassword(currentPassword).subscribe({
      next: (response: any) => {
        console.log("Response: ", response); // output this: {"reponse": false}
        console.log("Response: ", response.response); 
        if (response.reposnse === false) {
          this.errorMessage = "Current password is incorrect.";
          // return { PasswordVerificationError: true };
          return false;
        }
        // return null;
        return true;
      },
      error: (_) => {
        this.errorMessage = "An error occurred while verifying the current password.";
        // return { PasswordVerificationError: true };
        return false;
      }
    });

    // return false
    return true
  }

  onSubmit() {
    const currentPassword = this.passwordForm.get('currentPassword')?.value;

    if (!currentPassword ||  this.verifyCurrentPassword(currentPassword) === false){
      this.errorMessage = "Current password is incorrect.";
      return;
    }

    if (this.passwordForm.valid) {
      const password = this.passwordForm.get('password')?.value || '';
      this.authService.updatePassword('', password).subscribe(
        (response: any) => {
          console.log('Password updated successfully!', response);
          this.successMessage = true;
        },
        (error: any) => {
          console.error('Error updating password:', error);
          this.errorMessage = 'Error updating password.';
          this.successMessage = false;
        }
      );
    }
    else {
      this.errorMessage = 'Form is invalid!';
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
