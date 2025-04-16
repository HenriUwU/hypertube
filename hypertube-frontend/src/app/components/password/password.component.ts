import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn, FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { BrowserModule } from '@angular/platform-browser'
import { CommonModule } from '@angular/common';;
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

// export const confirmPasswordValidator: ValidatorFn = (
//   control: AbstractControl
// ): ValidationErrors | null => {
//   return control.value.password1 === control.value.password2
//     ? null
//     : { PasswordNoMatch: true };
// };

@Component({
  selector: 'app-password',
  imports: [ 
    CommonModule,
    ReactiveFormsModule, 
    FormsModule
   ],
  standalone: true,
  templateUrl: './password.component.html',
  styleUrl: './password.component.css'
})
export class PasswordComponent {

  @Input() resetPassword: boolean = false;

  passwordForm = new FormGroup({
    // initalPassword: new FormControl<string>('', [Validators.required, Validators.minLength(6), Validators.maxLength(40)]),
    // password: new FormControl<string>('', [Validators.required, Validators.minLength(6), Validators.maxLength(40), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/)]),
    // initalPassword: new FormControl<string>('', [Validators.required]),
    password: new FormControl<string>('', [Validators.required]),
    confirmPassword: new FormControl<string>('', [Validators.required]),
  }, { validators: this.confirmPasswordValidator });

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
    console.log('Password is valid');
    return null;
  }

  onSubmit() {
    console.log(this.passwordForm.value);
    if (this.passwordForm.valid) {
      console.log('Form submitted successfully!');
    }
    else {
      console.log('Form is invalid!');
    }
  }

}
