import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { UserModel } from '../../models/user.model';
import { TranslateService } from '../../services/translate.service';
import { GlobalMessageService } from '../../services/global.message.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, NgFor, NgIf],
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  profileForm = new FormGroup({
    email: new FormControl(''),
    username: new FormControl(''),
    lastname: new FormControl(''),
    firstname: new FormControl(''),
    profilePicture: new FormControl(''),
    language: new FormControl('English')
  });

  textMap = new Map<string, string>([
    ["Email Address", "Email Address"],
    ["Username", "Username"],
    ["Last Name", "Last Name"],
    ["First Name", "First Name"],
    ["Profile Picture", "Profile Picture"],
    ["Language", "Language"],
    ["Save", "Save"],
    ["profile", "profile"],
    ["Change Password", "Change Password"],
    ["Profile updated successfully", "Profile updated successfully"],
    ["Please select a valid image file", "Please select a valid image file"],
    ["Error", "Error"],
  ]);
  
  @Input () userId: string = sessionStorage.getItem('id') ? sessionStorage.getItem('id')! : '0';
  isReadOnly: boolean = true;
  
  private defaultProfilePicture = '../../../../assets/images/default_pp.svg' ;
  
  languages = [
    { value: 'en', viewValue: 'English' },
  ];  
  
  // profilePictureUrl: string = this.defaultProfilePicture;
  profilePictureUrl: string = this.defaultProfilePicture;

  constructor(private userService: UserService, private translateService: TranslateService,  private globalMessageService: GlobalMessageService,  private router: Router) {
  }

  ngOnInit() {
    this.translateService.autoTranslateTexts(this.textMap);
    this.translateService.initializeLanguageListener(this.textMap);

    this.translateService.availableLanguages().subscribe((response) => {
      response.forEach((lang: any) => {
        this.languages.push({ value: lang.iso_639_1, viewValue: lang.english_name });
      });
    }
    );
    this.userService.getUser(this.userId).subscribe((user) => {
      this.profileForm.patchValue({
        email: user.email,
        username: user.username,
        lastname: user.lastName,
        firstname: user.firstName,
        profilePicture: user.profilePicture ? user.profilePicture : this.defaultProfilePicture,
        language: user.language
      });
      this.profilePictureUrl = user.profilePicture ? user.profilePicture : this.defaultProfilePicture;
      if (sessionStorage.getItem('id') !== this.userId) {
        this.isReadOnly = true;
      } else {
        this.isReadOnly = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.globalMessageService.showMessage(this.textMap.get("Please select a valid image file") || "Please select a valid image file", false);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilePictureUrl = e.target.result;
        this.profileForm.patchValue({ profilePicture: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.profileForm.invalid) {
      return;
    }
    const updatedUser: UserModel = {
      id: parseInt(this.userId),
      username: this.profileForm.value.username!,
      email: this.profileForm.value.email!,
      firstName: this.profileForm.value.firstname!,
      lastName: this.profileForm.value.lastname!,
      language: this.profileForm.value.language!,
      profilePicture: this.profileForm.value.profilePicture!
    };

    this.userService.updateUser(updatedUser).pipe().subscribe((response) => {
      this.profileForm.patchValue({
        email: response.email,
        username: response.username,
        lastname: response.lastName,
        firstname: response.firstName,
        profilePicture: response.profilePicture ? response.profilePicture : this.defaultProfilePicture,
        language: response.language
      });
      if (response.token && response.token !== null) {
        sessionStorage.setItem(`token`, response.token);
      }
      this.translateService.updateLanguage(response.language? response.language : 'en');
      this.globalMessageService.showMessage(this.textMap.get("Profile updated successfully") || "Profile updated successfully", true);
    }
    , (error) => {
      this.globalMessageService.showMessage(`${this.textMap.get('Error') || 'Error'}: ${error}`, false);
    }
    );
  }

  getCurrentLanguage(): string {
    const language = this.profileForm.get('language')?.value;
    if (language) {

      return this.languages.find(lang => lang.value === language)?.viewValue || 'English';
    }
    return 'English';
  }

  modifyPassword(): void {
	  this.router.navigate(['user', 'modify-password']).then();
  }
}
