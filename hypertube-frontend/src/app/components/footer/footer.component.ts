// import { Component } from '@angular/core';
// import {MatIconModule} from '@angular/material/icon';
// import {MatDividerModule} from '@angular/material/divider';
// import {MatButtonModule} from '@angular/material/button';

// @Component({
//   selector: 'app-footer',
//   standalone: true,
//   imports: [MatDividerModule, MatButtonModule, MatIconModule],
//   templateUrl: './footer.component.html',
//   styleUrl: './footer.component.css'
// })
// export class FooterComponent {

// }

import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatDividerModule } from "@angular/material/divider"

@Component({
  selector: "app-footer",
  standalone: true,
  imports: [CommonModule, MatDividerModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {}
