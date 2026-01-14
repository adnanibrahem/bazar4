import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-page500',
  templateUrl: './page500.component.html',
  styleUrls: ['./page500.component.scss'],
  standalone: true,
  imports: [MatButtonModule, RouterModule]
})
export class Page500Component {
  constructor() {
    // constructor code
  }
}
