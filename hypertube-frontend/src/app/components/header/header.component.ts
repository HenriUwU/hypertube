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
import { ThemeService } from '../../services/theme.service';

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
              private translateService: TranslateService,
			  public themeService: ThemeService
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

    toggleTheme() {
        this.themeService.toggleTheme();
        const newTheme = this.themeService.isLightMode() ? 'light' : 'dark';

        if (newTheme === 'dark') {
            document.documentElement.style.setProperty('--background-color-darkgreen', '#153f2f');
            document.documentElement.style.setProperty('--background-color-lightgreen', '#AFBB80');
            document.documentElement.style.setProperty('--color-black', '#1a1a1a');
            document.documentElement.style.setProperty('--background-boxes', '#20242a');
            document.documentElement.style.setProperty('--color-text-comment', '#222');
            document.documentElement.style.setProperty('--background-comment-content', '#2a2f37');
            document.documentElement.style.setProperty('--color-text-edit-area', '#333');
            document.documentElement.style.setProperty('--color-text-author', '#555');
            document.documentElement.style.setProperty('--color-text-comment-content', '#555c76');
            document.documentElement.style.setProperty('--color-text-lightgrey', '#888');
            document.documentElement.style.setProperty('--border-color-textarea', '#ccc');
            document.documentElement.style.setProperty('--background-comment', '#f5f5f5');
            document.documentElement.style.setProperty('--color-text-whitesmoke', 'whitesmoke');

            document.documentElement.style.setProperty('--background-button', '#007bff');
            document.documentElement.style.setProperty('--background-button-disabled', '#a0c5f7');
            document.documentElement.style.setProperty('--background-button-hover', '#0056b3');
            document.documentElement.style.setProperty('--color-text-link', '#007bff');
            document.documentElement.style.setProperty('--border-color-edit-area', '#4A90E2');
            document.documentElement.style.setProperty('--color-text-like', '#b22222');
            document.documentElement.style.setProperty('--color-text-hover', '#f5a5a8');
            document.documentElement.style.setProperty('--border-color-container', '#eac29f');
            document.documentElement.style.setProperty('--stars', '#d4af37');
            document.documentElement.style.setProperty('--background-search-bar', '#AFBB80');
        } 
        else {
            document.documentElement.style.setProperty('--background-color-darkgreen', '#b7d8b5');
            document.documentElement.style.setProperty('--background-color-lightgreen', '#153f2f');
            document.documentElement.style.setProperty('--color-black', '#2c2c2c');
            document.documentElement.style.setProperty('--background-boxes', '#cfd8f0');
            document.documentElement.style.setProperty('--color-text-comment', '#4a4a4a');
            document.documentElement.style.setProperty('--background-comment-content', '#f9f9fb');
            document.documentElement.style.setProperty('--color-text-edit-area', '#5a5a5a');
            document.documentElement.style.setProperty('--color-text-author', '#6b6b6b');
            document.documentElement.style.setProperty('--color-text-comment-content', '#7a7f99');
            document.documentElement.style.setProperty('--color-text-lightgrey', '#a5a5a5');               
            document.documentElement.style.setProperty('--border-color-textarea', '#dcdcdc');
            document.documentElement.style.setProperty('--background-comment', '#ffffff');
            document.documentElement.style.setProperty('--color-text-whitesmoke', '#2c2c2c');

            document.documentElement.style.setProperty('--background-button', '#007bff');
            document.documentElement.style.setProperty('--background-button-disabled', '#a0c5f7');
            document.documentElement.style.setProperty('--background-button-hover', '#0056b3');
            document.documentElement.style.setProperty('--color-text-link', '#007bff');
            document.documentElement.style.setProperty('--border-color-edit-area', '#4A90E2');
            document.documentElement.style.setProperty('--color-text-like', '#b22222');
            document.documentElement.style.setProperty('--color-text-hover', '#f5a5a8');
            document.documentElement.style.setProperty('--border-color-container', '#dfa490');
            document.documentElement.style.setProperty('--stars', '#f7dc6f');
            document.documentElement.style.setProperty('--background-search-bar', '#8b7ca8');

        }
	}
}
