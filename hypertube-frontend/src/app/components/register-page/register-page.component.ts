import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent implements OnInit {
  registerForm!: FormGroup;
  passwordVisible: boolean = false;

  constructor(private formBuilder: FormBuilder) {
  }

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
      console.log("LE FORM DE LOGIN EST VALIDE MEC");
    } else {
      console.log("LE FORM DE LOGIN EST INVALIDE IDIOT");
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }
}
