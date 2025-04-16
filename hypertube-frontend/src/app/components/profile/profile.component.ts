import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { UserModel } from '../../models/user.model';

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
    // password: new FormControl(''),
    profilePicture: new FormControl(''),
    language: new FormControl('English')
  });

  @Input () userId: string = sessionStorage.getItem('id') ? sessionStorage.getItem('id')! : '0';
  isReadOnly: boolean = true;


  private defaultProfilePicture = '../../../../assets/images/default_pp.svg' ;

  languages = [
    { value: 'en', viewValue: 'English' },
    { value: 'fr', viewValue: 'Français' },
    { value: 'es', viewValue: 'Español' },
    { value: 'ch', viewValue: 'Chibraxo' },
  ];

  constructor(private userService: UserService) {
  }

  ngOnInit() {
    this.userService.getUser(this.userId).subscribe((user) => {
      this.profileForm.patchValue({
        email: user.email,
        username: user.username,
        lastname: user.lastName,
        firstname: user.firstName,
        // password: user.password,
        profilePicture: user.profilePicture ? user.profilePicture : this.defaultProfilePicture,
        language: user.language
      });

      if (sessionStorage.getItem('id') !== this.userId) {
        this.isReadOnly = true;
      } else {
        this.isReadOnly = false;
      }
    });
  }

  onSubmit() {
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
        // password: response.password,
        profilePicture: response.profilePicture ? response.profilePicture : this.defaultProfilePicture,
        language: response.language
      });
    }
    , (error) => {
      console.error('Error updating user:', error);
    }
    );
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileForm.patchValue({
          profilePicture: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  }

  getCurrentLanguage(): string {
    const language = this.profileForm.get('language')?.value;
    if (language) {

      return this.languages.find(lang => lang.value === language)?.viewValue || 'English';
    }
    return 'English';
  }
}
