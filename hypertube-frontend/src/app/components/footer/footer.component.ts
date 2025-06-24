import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatDividerModule } from "@angular/material/divider"
import { TranslateService } from "../../services/translate.service"

@Component({
  selector: "app-footer",
  standalone: true,
  imports: [CommonModule, MatDividerModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  tradMap = new Map<string, string>([
    ["Developped by", "Developped by"],
    ["and", "and"],
    ["using", "using"]
  ]);
  constructor(private translateService: TranslateService) {
  }

  ngOnInit() {
    this.translateService.autoTranslateTexts(this.tradMap);
    this.translateService.initializeLanguageListener(this.tradMap);
  }

}
