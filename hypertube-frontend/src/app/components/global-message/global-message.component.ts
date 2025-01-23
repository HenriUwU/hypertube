import {Component, OnInit} from '@angular/core';
import {GlobalMessageService} from "../../services/global.message.service";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-global-message',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './global-message.component.html',
  styleUrl: './global-message.component.css'
})
export class GlobalMessageComponent implements OnInit {
  message: string | null = null;
  isSuccess: boolean = true;

  constructor(private globalMessageService: GlobalMessageService) {  }

  ngOnInit(): void {
    this.globalMessageService.message$.subscribe((data) => {
      if (data) {
        this.message = data.message;
        this.isSuccess = data.isSuccess;

        setTimeout(() => {
          const messageElement = document.querySelector('.global-message');
          if (messageElement) {
            messageElement.classList.add('show');
          }
        });

        setTimeout(() => {
          const messageElement = document.querySelector('.global-message');
          if (messageElement) {
            messageElement.classList.remove('show');
          }
          setTimeout(() => (this.message = null), 300);
        }, 2000);
      }
    });
  }
}
