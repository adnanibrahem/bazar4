/* eslint-disable @angular-eslint/prefer-standalone */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, inject } from '@angular/core';
import { Fatora } from 'app/Accountant/Accountant.model';

@Component({
  selector: 'app-show-fatora-items-dialog',
  templateUrl: './show-fatora-items.component.html',
  styleUrls: ['./show-fatora-items.component.scss'],
  standalone: false,
})
export class ShowFatoraItemsDialogComponent {
  dialogRef =
    inject<MatDialogRef<ShowFatoraItemsDialogComponent>>(MatDialogRef);
  data = inject<Fatora>(MAT_DIALOG_DATA);

  items = '';
  title = '';
  constructor() {
    const data = this.data;

    // this.items = data.split('\n');
    // console.log(this.items);
    this.title = 'فاتورة شراء مواد';
    if (data.fatoraType == 2) this.title = 'فاتورة بيع مواد';
  }
  imgClick(x: any) {
    window.open(x.img);
  }
  submit() {}
  onNoClick(): void {
    this.dialogRef.close();
  }
}
