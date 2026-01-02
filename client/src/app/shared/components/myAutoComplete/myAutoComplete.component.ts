/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

import { UnsubscribeOnDestroyAdapter } from '@shared';
import { ChangeDetectionStrategy } from '@angular/core'; // import

import { Observable, Subject, Subscription, startWith } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,

  selector: 'app-my-auto-complete',
  templateUrl: './myAutoComplete.component.html',
  styleUrls: ['./myAutoComplete.component.scss'],
})
export class MyAutoCompleteComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  @Input() placeholder: any = '';
  @Input() itemsList: any = [];
  @Input() initValue: any = '';

  @Input() dataKey: string = '';

  @Input() required: any;
  @Input() keyId: any;

  @Output() outputValue = new EventEmitter<any>();

  @Input() disabled!: Observable<boolean>;
  private eventsSubscription!: Subscription;

  constructor() {
    super();
  }
  enabled = true;
  ngOnInit(): void {
    this.initAutoComplete();

    if (this.disabled) {
      // this.autoFormControl.disable();
      this.autoFormControl.setValue(null);
      this.eventsSubscription = this.disabled.subscribe((e) => {
        if (e) this.autoFormControl.enable();
        else {
          this.autoFormControl.disable();
          this.autoFormControl.setValue(null);
          this.sendData(this.selectedText);
        }
      });
    }

    if (this.initValue) {
      if (this.dataKey != '') {
        let id = 'id';
        if (this.keyId) id = this.keyId;

        const t = this.itemsList.find((x: any) => x[id] == this.initValue);
        if (t) {
          this.autoFormControl.enable();
          this.selectedText = t;
        }
      } else this.selectedText = this.initValue;
    }
  }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  override ngOnDestroy(): void {
    if (this.eventsSubscription) this.eventsSubscription.unsubscribe();
  }
  selectedText = '';

  autoFormControl = new FormControl();
  filterAnsweredTo: any = Observable<any[]>;
  initAutoComplete() {
    this.filterAnsweredTo = this.autoFormControl.valueChanges.pipe(
      startWith(''),
      map((value) => {
        if (this.dataKey == '') {
          const name = typeof value === 'string' ? value : value;
          return name ? this._filter(name as string) : this.itemsList.slice();
        } else {
          const name = typeof value === 'string' ? value : value;
          return name ? this._filter(name as string) : this.itemsList.slice();
        }
      })
    );
  }

  private __filter(name: any): any[] {
    const filterValue = name.toLowerCase();
    if (this.dataKey == '') {
      return this.itemsList.filter((option: any) =>
        option.toLowerCase().includes(filterValue)
      );
    } else {
      return this.itemsList.filter((option: any) =>
        option[this.dataKey].toLowerCase().includes(filterValue)
      );
    }
  }
  private _filter(name: any): any[] {
    if (typeof name === 'string') {
      return this.__filter(name);
    } else {
      return this.__filter(name[this.dataKey]);
    }
  }

  sendData(v: any) {
    this.outputValue.emit(v);
  }

  disFnAnsweredTo(p: any): string {
    if (this.dataKey == '') {
      const v = p ? p : '';
      this.sendData(v);
      return v;
    } else {
      const v = p ? p[this.dataKey] : '';
      this.sendData(p);
      return v;
    }
  }

  onBlur() {
    this.sendData(this.selectedText);
  }
}
