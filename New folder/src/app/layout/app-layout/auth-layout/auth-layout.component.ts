import { Direction } from '@angular/cdk/bidi';
import { Component, Renderer2, inject } from '@angular/core';
import { DirectionService, InConfiguration } from '@core';
import { ConfigService } from '@config';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.component.html',
  styleUrls: [],
  standalone: false
})
export class AuthLayoutComponent {
  private document = inject<Document>(DOCUMENT);
  private directoryService = inject(DirectionService);
  private configService = inject(ConfigService);
  private renderer = inject(Renderer2);

  direction!: Direction;
  public config!: InConfiguration;
  constructor() {
    this.config = this.configService.configData;
    this.directoryService.currentData.subscribe((currentData) => {
      if (currentData) {
        this.direction = currentData === 'ltr' ? 'ltr' : 'rtl';
      } else {
        if (localStorage.getItem('isRtl')) {
          if (localStorage.getItem('isRtl') === 'true') {
            this.direction = 'rtl';
          } else if (localStorage.getItem('isRtl') === 'false') {
            this.direction = 'ltr';
          }
        } else {
          if (this.config) {
            if (this.config.layout.rtl === true) {
              this.direction = 'rtl';
              localStorage.setItem('isRtl', 'true');
            } else {
              this.direction = 'ltr';
              localStorage.setItem('isRtl', 'false');
            }
          }
        }
      }
    });

    // set theme on startup
    if (localStorage.getItem('theme')) {
      this.renderer.removeClass(this.document.body, this.config.layout.variant);
      this.renderer.addClass(
        this.document.body,
        localStorage.getItem('theme') as string
      );
    } else {
      this.renderer.addClass(this.document.body, this.config.layout.variant);
    }
  }
}
