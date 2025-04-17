import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators, AbstractControl, ValidationErrors, FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { BrowserModule } from '@angular/platform-browser'
import { CommonModule } from '@angular/common';;

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
  }, { validators: this.confirmPasswordValidator });

  successMessage: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  confirmPasswordValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    if (password !== confirmPassword) {
      return { PasswordNoMatch: true };
    } else if (password.length < 6 || password.length > 40) {
      return { PasswordTooShort: true };
    }
    // Check if there is at least one uppercase letter
    else if (!/[A-Z]/.test(password)) {
      return { PasswordNoUppercase: true };
    }
    // Check if there is at least one lowercase letter
    else if (!/[a-z]/.test(password)) {
      return { PasswordNoLowercase: true };
    }
    // Check if there is at least one number
    else if (!/\d/.test(password)) {
      return { PasswordNoNumber: true };
    }
    // Check if there is at least one special character
    else if (!/[!@#$%^&*]/.test(password)) {
      return { PasswordNoSpecialChar: true };
    }
    return null;
  }

  onSubmit() {
    console.log(this.passwordForm.value);
    if (this.passwordForm.valid) {
      console.log('Form submitted successfully!');
      this.successMessage = true;
    }
    else {
      console.log('Form is invalid!');
    }
  }

}
