/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input } from '@angular/core';
import { AuthService } from '@core/service/auth.service';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent {
  @Input()
  title!: string;
  @Input()
  items!: string[];
  @Input()
  active_item!: string;

  validPasswprd = false;
  constructor(private authService: AuthService) {
    const usr = authService.currentUserValue;
    this.validPasswprd = usr.validPasswprd;
  }
}
