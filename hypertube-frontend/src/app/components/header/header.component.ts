import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {AuthService} from '../../services/auth.service';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {Router} from "@angular/router";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {UserService} from "../../services/user.service";
import {TranslateService} from "../../services/translate.service";
import {TranslateModel} from "../../models/translate.model";
import {UserModel} from "../../models/user.model";
import {takeUntil, Subject} from "rxjs";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatDividerModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule, MatInputModule, CommonModule, MatMenuTrigger, MatMenu, MatMenuItem, NgOptimizedImage],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})

export class HeaderComponent implements OnInit, OnDestroy {
  languages: TranslateModel[] = [];
  userInfos!: UserModel;
  private destroy$ = new Subject<void>();

  tradMap = new Map<string, string>([
    ["Languages", "Languages"],
    ["Edit Profile", "Edit Profile"],
    ["Logout", "Logout"],
    ["Login", "Login"],
    ["Profile", "Profile"],
    ["Users", "Users"],
  ])

  constructor(private authService: AuthService,
              private router: Router,
              private userService: UserService,
              private translateService: TranslateService
  ) {}

	ngOnInit(): void {
	  this.translateService.availableLanguages().subscribe({
		  next: (data: TranslateModel[]) => {
			  this.languages = data;
		  },
		  error: (error) => {
			  this.languages = [
				  { iso_639_1: 'en', flag: 'https://flagcdn.com/w80/us.png', english_name: 'English' },
			  ];
		  }
	  });

	  this.translateService.autoTranslateTexts(this.tradMap);
	  this.translateService.initializeLanguageListener(this.tradMap);

	  // Load initial user data if logged in and not already loaded
	  const userId = this.authService.getCurrentUserId();
	  if (userId && !this.userService.getCurrentUser()) {
		  this.userService.getUser(userId).subscribe();
	  }

	  // Subscribe to user changes
	  this.userService.currentUser$
		  .pipe(takeUntil(this.destroy$))
		  .subscribe((user: UserModel | null) => {
			  if (user) {
				  this.userInfos = user;
			  }
		  });
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	toHomepage():void{
	  this.router.navigate(['/']).then();
	}

	isLog(): boolean {
	  return this.authService.isLoggedIn();
	}

	logout(): void {
	  this.authService.logout(); // This will now also clear the user service
	  this.router.navigate(['/']).then();
	}

	login(): void {
	  this.router.navigate(['auth', 'login']).then();
	}

	toProfile():void{
    this.router.navigate(['user', 'profile'], {
      queryParams: {
        userId: String(this.authService.getCurrentUserId())
      }
    }).then();
	}

	toUsers():void{
	  this.router.navigate(['user', 'users']).then();
	}

  updateCurrentLanguage(language: TranslateModel) {
    this.userInfos.language = language.iso_639_1;
    this.userService.updateUser(this.userInfos).subscribe((data) => {
    	// The user service will automatically update the BehaviorSubject
    	this.translateService.updateLanguage(data.language)
    });
  }
}

