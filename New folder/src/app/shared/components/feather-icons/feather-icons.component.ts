import { Component, Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';

@NgModule({
  imports: [FeatherModule.pick(allIcons)],
  exports: [FeatherModule]
})
export class FeatherRegistry { }

@Component({
  selector: 'app-feather-icons',
  templateUrl: './feather-icons.component.html',
  styleUrls: ['./feather-icons.component.scss'],
  standalone: true,
  imports: [CommonModule, FeatherRegistry]
})
export class FeatherIconsComponent {
  @Input() public icon?: string;
  @Input() public class?: string;
  constructor() {
    // constructor
  }
}
