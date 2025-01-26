import {Component, OnInit} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {GlobalMessageService} from "../../services/global.message.service";
import {animate, style, transition, trigger} from "@angular/animations";
import {NgOptimizedImage} from "@angular/common";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgOptimizedImage,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
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
  hide: boolean = false;

  constructor(private formBuilder: FormBuilder,
              private authService: AuthService,
              private router: Router,
              private globalMessageService: GlobalMessageService) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  login(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['']).then()
        },
        error: () => {
          this.globalMessageService.showMessage("Invalid username or password. Please try again.", false);
        }
      });
    } else {
      this.globalMessageService.showMessage('Please fill out all required fields.', false);
    }
  }
}
