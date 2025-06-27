import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors} from "@angular/forms";
import {Router, RouterLink} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {GlobalMessageService} from "../../services/global.message.service";
import {animate, style, transition, trigger} from "@angular/animations";
import {NgOptimizedImage} from "@angular/common";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NgOptimizedImage,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css',
  animations: [
    trigger('slideInAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-50px)' }),
        animate('0.8s ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('zoomInAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
  ],
})
export class RegisterPageComponent implements OnInit {
  registerForm!: FormGroup;
  passwordVisible: boolean = false;
  hide: boolean = true;

  constructor(private formBuilder: FormBuilder,
              private authService: AuthService,
              private router: Router,
              private globalMessageService: GlobalMessageService) { }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, this.passwordValidator]],
      email: ['', Validators.required],
      lastName: ['', Validators.required],
      firstName: ['', Validators.required],
    });
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;

    if (!password) {
      return null;
    }

    // Check password length
    if (password.length < 6 || password.length > 40) {
      return { passwordLength: true };
    }

    // Check if there is at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return { passwordNoUppercase: true };
    }

    // Check if there is at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return { passwordNoLowercase: true };
    }

    // Check if there is at least one number
    if (!/\d/.test(password)) {
      return { passwordNoNumber: true };
    }

    // Check if there is at least one special character
    if (!/[!@#$%^&*]/.test(password)) {
      return { passwordNoSpecialChar: true };
    }

    return null;
  }

  register(): void {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          sessionStorage.setItem('language', 'en');
          this.globalMessageService.showMessage('Registration successful. A verification email has been sent to your inbox.', true);
          this.router.navigate(['auth/login']).then()
        },
        error: () => {
          this.globalMessageService.showMessage('Registration failed: The username or email is already in use.', false);
        }
      });
    } else {
      // Check for specific password validation errors
      const passwordControl = this.registerForm.get('password');
      if (passwordControl?.errors) {
        if (passwordControl.errors['passwordLength']) {
          this.globalMessageService.showMessage('Password must be between 6 and 40 characters.', false);
        } else if (passwordControl.errors['passwordNoUppercase']) {
          this.globalMessageService.showMessage('Password must contain at least one uppercase letter.', false);
        } else if (passwordControl.errors['passwordNoLowercase']) {
          this.globalMessageService.showMessage('Password must contain at least one lowercase letter.', false);
        } else if (passwordControl.errors['passwordNoNumber']) {
          this.globalMessageService.showMessage('Password must contain at least one number.', false);
        } else if (passwordControl.errors['passwordNoSpecialChar']) {
          this.globalMessageService.showMessage('Password must contain at least one special character (!@#$%^&*).', false);
        } else if (passwordControl.errors['required']) {
          this.globalMessageService.showMessage('Password is required.', false);
        }
      } else {
        this.globalMessageService.showMessage('Error: Please fill out all required fields', false);
      }
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }
}
