/* eslint-disable @typescript-eslint/no-explicit-any */
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { Fatora } from 'app/branchAdmin/branchAdmin.model';

@Component({
  selector: 'app-show-fatora-items-dialog',
  templateUrl: './show-fatora-items.component.html',
  styleUrls: ['./show-fatora-items.component.scss'],
})
export class ShowFatoraItemsDialogComponent {
  items = '';
  title = '';
  constructor(
    public dialogRef: MatDialogRef<ShowFatoraItemsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Fatora
  ) {
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
