import {Component, OnInit} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {GlobalMessageService} from "../../services/global.message.service";
import {animate, style, transition, trigger} from "@angular/animations";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {ForgotPasswordPopupComponent} from '../forgot-password-popup/forgot-password-popup.component';


@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
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
export class LoginPageComponent implements OnInit {
  loginForm!: FormGroup;
  hide: boolean = true;

  constructor(private formBuilder: FormBuilder,
              private authService: AuthService,
              private router: Router,
              private globalMessageService: GlobalMessageService,
              private dialog: MatDialog
) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, this.passwordValidator]]
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

  login(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res: any) => {
          if (res.success == 'true') {
            sessionStorage.setItem('language', 'en');
            this.router.navigate(['']).then()
          } else if (res.success == 'false') {
            this.globalMessageService.showMessage("Invalid username or password. Please try again.", false);
          }
        },
        error: () => {
          this.globalMessageService.showMessage("Invalid username or password. Please try again.", false);
        }
      });
    } else {
      // Check for specific password validation errors
      const passwordControl = this.loginForm.get('password');
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
        this.globalMessageService.showMessage('Please fill out all required fields.', false);
      }
    }
  }

  openForgotPasswordPopup(): void {
    this.dialog.open(ForgotPasswordPopupComponent, {
      width: '400px'
    });
  }
}
