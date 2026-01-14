/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input, inject } from '@angular/core';
import { AuthService } from '@core/service/auth.service';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
  standalone: false
})
export class BreadcrumbComponent {
  private authService = inject(AuthService);

  @Input()
  title!: string;
  @Input()
  items!: string[];
  @Input()
  active_item!: string;

  validPasswprd = false;
  constructor() {
    const authService = this.authService;

    const usr = authService.currentUserValue;
    this.validPasswprd = usr.validPasswprd;
  }
}
