import {Component, OnInit} from '@angular/core';
import {RouterLink} from "@angular/router";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent implements OnInit {

  loginForm!: FormGroup;
  passwordVisible: boolean = false;

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  login(): void {
    if (this.loginForm.valid) {
      console.log("LE FORM DE LOGIN EST VALIDE MEC");
    } else {
      console.log("LE FORM DE LOGIN EST INVALIDE IDIOT");
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

}
