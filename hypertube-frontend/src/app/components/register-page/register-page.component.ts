import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
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

  constructor(private formBuilder: FormBuilder,
              private authService: AuthService,
              private router: Router,
              private globalMessageService: GlobalMessageService) { }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      email: ['', Validators.required],
      lastName: ['', Validators.required],
      firstName: ['', Validators.required],
    });
  }

  register(): void {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.globalMessageService.showMessage('You\'re registered successfully! Redirecting to login...', true);
          this.router.navigate(['auth/login']).then()
        },
        error: () => {
          this.globalMessageService.showMessage('Registration failed: The username or email is already in use.', false);
        }
      });
    } else {
      this.globalMessageService.showMessage('Error: Please fill out all required fields', false);
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }
}
