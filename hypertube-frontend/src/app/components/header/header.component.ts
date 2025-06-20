import {Component, OnInit} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MoviesService} from '../../services/movies.service';
import {AuthService} from '../../services/auth.service';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {Router} from "@angular/router";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {UserService} from "../../services/user.service";
import {TranslateService} from "../../services/translate.service";
import {TranslateModel} from "../../models/translate.model";
import {UserModel} from "../../models/user.model";
import {filter, interval, map, switchMap, take} from "rxjs";

interface Language {
  name: string;
  sound: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatDividerModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule, MatInputModule, CommonModule, MatMenuTrigger, MatMenu, MatMenuItem, NgOptimizedImage],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent implements OnInit {
  languages: TranslateModel[] = [];
  selectedLanguage!: TranslateModel;
  userInfos!: UserModel;

  textMap = new Map<string, string>([
    ["Language", "Language"],
    ["Edit Profile", "Edit Profile"]
  ])


  constructor(private movieService: MoviesService,
              private formBuilder: FormBuilder,
              private authService: AuthService,
              private router: Router,
              private userService: UserService,
              private translateService: TranslateService
  ) {}

	ngOnInit(): void {
	  this.translateService.availableLanguages().subscribe((data: TranslateModel[]) =>
		  this.languages = data
	  );

	  this.translateService.autoTranslateTexts(this.textMap);
	  this.translateService.initializeLanguageListener(this.textMap);

	  interval(100)
		  .pipe(map(() => this.authService.getCurrentUserId()),
			  filter((id): id is string => id != null),
			  take(1),
			  switchMap(id => this.userService.getUser(id)))
		  .subscribe((data: UserModel) => {
			  this.userInfos = data;
		  });
	}

	toHomepage():void{
	  this.router.navigate(['/']).then();
	}

	isLog(): boolean {
	  return this.authService.isLoggedIn();
	}

	logout(): void {
	  this.authService.logout();
	  this.router.navigate(['/']).then();
	}

	login(): void {
	  this.router.navigate(['auth', 'login']).then();
	}

	toProfile():void{
	  this.router.navigate(['user', 'profile']).then();
	}

  updateCurrentLanguage(language: TranslateModel) {
    this.userInfos.language = language.iso_639_1;
    this.userService.updateUser(this.userInfos).subscribe((data) => {
      this.userInfos.language = data.language
      this.translateService.updateLanguage(this.userInfos.language)
    });
  }
}

