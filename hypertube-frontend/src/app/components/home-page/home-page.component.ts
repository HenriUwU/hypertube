import {Component} from '@angular/core';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    MatProgressSpinnerModule
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {

}
