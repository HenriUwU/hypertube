import {Component} from '@angular/core';
import {MatProgressBarModule} from "@angular/material/progress-bar";

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    MatProgressBarModule
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {

}
