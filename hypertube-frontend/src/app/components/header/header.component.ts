import { Component, OnInit } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {FormControl, Validators, FormsModule, ReactiveFormsModule, FormGroup, FormBuilder} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MoviesService } from '../../services/movies.service';
import { SearchMovie } from '../../models/movie.model';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

interface Language {
  name: string;
  sound: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatDividerModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule, MatInputModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent implements OnInit {
  languageControl = new FormControl<Language | null>(null, Validators.required);
  selectFormControl = new FormControl('', Validators.required);
  research!: SearchMovie;
  searchForm!: FormGroup;
  isLog!: boolean;

  languages: Language[] = [
    {name: 'English', sound: 'Can I get some Burger ?'},
    {name: 'Francais', sound: 'Oui oui baguette'},
    {name: 'Spanish', sound: 'Me gustas tus'},
  ];

  query: any;

  constructor(private movieService: MoviesService,
              private formBuilder: FormBuilder,
              private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.searchForm = this.formBuilder.group({
      query: ['', Validators.required]
    })
    this.isLog = this.authService.isLoggedIn();
  }

  search(): void {
    if (!this.isLog) {
      this.searchForm.get('query')?.disable();
    }
    else {
      this.searchForm.get('query')?.enable();
    }
    
    if (this.searchForm.valid) {
      this.research = {
        query: this.searchForm.getRawValue().query,
        page: 1,
        genresIds: []
      };

      console.log(this.research)
      this.movieService.search(this.research).subscribe(res => console.log(res));
    }
  }

}

