import { Component, Input } from '@angular/core';
import {MatDividerModule} from "@angular/material/divider"

@Component({
  selector: 'app-comments',
  imports: [MatDividerModule],
  standalone: true,
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.css'
})
export class CommentsComponent {
}
