import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {GlobalMessageService} from "../../services/global.message.service";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [
    MatProgressSpinnerModule
  ],
  template: '<mat-spinner color="primary" class="spinner"></mat-spinner>',
  styles: [
    `
      .spinner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    `
  ]
})
export class AuthCallbackComponent implements OnInit {
  constructor(private route: ActivatedRoute,
              private router: Router,
              private authService: AuthService,
              private globalMessageService: GlobalMessageService) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
        const authCode = params['code'];
        if (authCode) {
          this.authService.loginViaOmniAuth(authCode).subscribe({
            next: () =>  {
              this.router.navigate(['']).then()
              this.globalMessageService.showMessage("Login successful! Redirecting to the homepage...", true)
            },
            error: () => {
              this.globalMessageService.showMessage("Error when trying to login", false)
            }
          });
        }
    });
  }
}
