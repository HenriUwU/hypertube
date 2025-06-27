import { Component, OnInit } from '@angular/core';
import {NgFor, NgIf} from '@angular/common';
import { UserModel } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { TranslateService } from '../../services/translate.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [NgIf, NgFor, MatIcon, MatButton],
  templateUrl: './user.list.component.html',
  styleUrl: './user.list.component.css'
})
export class UserListComponent implements OnInit {

  constructor(private userService: UserService, private translateService: TranslateService, private router: Router){

  }

  users: UserModel[] = []
  tradMap = new Map<string, string>([
    ["View Profile", "View Profile"],
  ]);

  private defaultProfilePicture = '../../../../assets/images/default_pp.svg' ;


  ngOnInit(): void {
    this.translateService.autoTranslateTexts(this.tradMap);
    this.translateService.initializeLanguageListener(this.tradMap);

    this.userService.getAllUsers().subscribe({
      next: (users: UserModel[]) => {
        this.users = users;
      },
      error: (err) => {
        console.log('Error fetching users:', err);
      }
    });
  }

  getProfilePictureUrl(user: UserModel): string {
    return user.profilePicture ? user.profilePicture : this.defaultProfilePicture;
  }

  getFullName(user: UserModel): string {
    return `${user.firstName} ${user.lastName}`;
  }

  toProfile(userId: number): void {
	  this.router.navigate(['user', 'profile'], {
		  queryParams: {
			  userId: String(userId)
		  }
    }).then();
  }
}
