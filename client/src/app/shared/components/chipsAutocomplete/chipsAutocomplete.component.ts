/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { UnsubscribeOnDestroyAdapter } from '@shared';

import { Observable, startWith } from 'rxjs';
import { map } from 'rxjs/operators';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-chips-autocomplete-complete',
  templateUrl: './chipsAutocomplete.component.html',
  styleUrls: ['./chipsAutocomplete.component.scss'],
})
export class ChipsAutocompleteComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  @Input() placeholder: any = '';
  @Input() itemsList: any = [];
  @Input() initValue: any = '';
  @Input() dataKey: string = '';
  @Input() required: any;
  @Output() outputValue = new EventEmitter<any>();

  separatorKeysCodes: number[] = [ENTER, COMMA];
  itemCtrl = new FormControl('');
  filtereditems: Observable<any[]>;
  items: any[] = [];

  @ViewChild('itemInput') itemInput!: ElementRef<HTMLInputElement>;

  announcer = inject(LiveAnnouncer);

  constructor() {
    super();

    this.filtereditems = this.itemCtrl.valueChanges.pipe(
      startWith(null),
      map((item: any | null) =>
        item ? this._filter(item) : this.itemsList.slice()
      )
    );
  }
  ngOnInit(): void {
    if (this.initValue && this.initValue.includes('['))
      this.items = JSON.parse(this.initValue);
  }
  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.items.push(value);
      this.outputValue.emit(this.items);
    }

    event.chipInput!.clear();

    this.itemCtrl.setValue(null);
  }

  remove(item: string): void {
    const index = this.items.indexOf(item);

    if (index >= 0) {
      this.items.splice(index, 1);
      this.outputValue.emit(this.items);

      this.announcer.announce(`Removed ${item}`);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.items.push(event.option.value);
    this.outputValue.emit(this.items);
    this.itemInput.nativeElement.value = '';
    this.itemCtrl.setValue(null);
  }

  private _filter(value: any): any[] {
    let filterValue = '';
    if (typeof value === 'string') filterValue = value.toLowerCase();
    else filterValue = value[this.dataKey].toLowerCase();
    if (this.dataKey == '')
      return this.itemsList.filter((item: any) =>
        item.toLowerCase().includes(filterValue)
      );
    else
      return this.itemsList.filter((item: any) =>
        item[this.dataKey].toLowerCase().includes(filterValue)
      );
  }
}
