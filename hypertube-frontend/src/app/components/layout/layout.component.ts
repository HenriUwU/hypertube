import {Component} from '@angular/core';
import {Router, RouterOutlet} from "@angular/router";
import {MatButtonModule} from "@angular/material/button";
import {AuthService} from "../../services/auth.service";
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  constructor(private authService: AuthService,
              private router: Router) {
  }

  search(): void {

  }

  logout(): void {
    this.authService.logout()
    this.router.navigate(["/auth/login"]).then();
  }
}
