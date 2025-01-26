import {Component, OnInit} from '@angular/core';
import {Router, RouterOutlet} from "@angular/router";
import {MatButtonModule} from "@angular/material/button";
import {AuthService} from "../../services/auth.service";
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatMenuModule, MatMenuTrigger} from "@angular/material/menu";
import {NgStyle} from "@angular/common";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {UserModel} from "../../models/user.model";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatExpansionModule,
    MatMenuTrigger,
    MatMenuModule,
    NgStyle,
    MatSlideToggleModule
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
  currentUser!: UserModel;

  constructor(private authService: AuthService,
              private userService: UserService,
              private router: Router) {
  }

  ngOnInit() {
    const id = sessionStorage.getItem(`id`);
    if (id != null) {
      this.userService.getUser(id).subscribe((data) => {
        this.currentUser = data;
        console.log(data);
      })
    }
  }

  search(): void {

  }

  logout(): void {
    this.authService.logout()
    this.router.navigate(["/auth/login"]).then();
  }
}
