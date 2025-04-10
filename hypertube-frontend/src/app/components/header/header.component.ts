import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {FormControl, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';

interface Language {
  name: string;
  sound: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatDividerModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule, MatInputModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent {
  languageControl = new FormControl<Language | null>(null, Validators.required);
  selectFormControl = new FormControl('', Validators.required);
  languages: Language[] = [
    {name: 'English', sound: 'Can I get some Burger ?'},
    {name: 'Francais', sound: 'Oui oui baguette'},
    {name: 'Spanish', sound: 'Me gustas tus'},
  ];
  term: any;
}



