import { Directive, OnDestroy, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[inputWithComma]',
  providers: [DecimalPipe],
})
export class NumberCommaDirective implements OnInit, OnDestroy {
  private subscription: Subscription | undefined;

  constructor(private ngControl: NgControl, private decimal: DecimalPipe) {}

  ngOnInit() {
    const control = this.ngControl.control;
    this.subscription = control?.valueChanges
      .pipe(
        map((value) => {
          if (!value) return '';
          const parts = value.toString().split('.');
          parts[0] = this.decimal.transform(parts[0].replace(/[^0-9]*/g, ''));
          return parts.join('.');
        })
      )
      .subscribe((v) => control.setValue(v, { emitEvent: false }));
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
