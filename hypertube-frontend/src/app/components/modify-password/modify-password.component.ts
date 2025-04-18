import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators, AbstractControl, ValidationErrors, FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { BrowserModule } from '@angular/platform-browser'
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
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
  // }, { validators: this.confirmPasswordValidator });
  },{ validators: (control) => this.confirmPasswordValidator(control) });

  successMessage: boolean = false;
  errorMessage: string = '';

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  }

  confirmPasswordValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    const currentPassword = control.get('currentPassword')?.value;

    console.log("Curnet password: ", currentPassword);
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

    // console.log("Current password: ", currentPassword);
    // const verifCurrent = this.authService.verifyCurrentPassword(currentPassword).subscribe({
    //   next: (response: any) => {
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

  onSubmit() {
    console.log(this.passwordForm.value);

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
      console.log('Form is invalid!');
    }
  }

}
