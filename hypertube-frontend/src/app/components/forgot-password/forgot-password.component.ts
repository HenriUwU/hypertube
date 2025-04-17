import { Component, Input } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ModifyPasswordComponent } from '../modify-password/modify-password.component';

@Component({
  selector: 'app-forgot-password',
  imports: [ModifyPasswordComponent],
  standalone: true,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {

  @Input() email: string = '';
  accessPermitted: boolean = false;
  message: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      this.isLoading = true;
      this.authService.verifyPasswordToken(token).subscribe({
        next: (response: string) => {
          this.message = response;
          this.accessPermitted = true;
          this.isLoading = false;
        },
        error: (err: HttpErrorResponse) => {
          this.message = err.error?.message || 'Une erreur est survenue.';
          this.accessPermitted = false;
          this.isLoading = false;
        }
      });
    } else {
      this.message = 'Aucun token fourni.';
      this.accessPermitted = false;
    }
  }

}
