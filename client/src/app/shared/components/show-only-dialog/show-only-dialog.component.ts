/* eslint-disable @typescript-eslint/no-explicit-any */
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';

@Component({
  selector: 'app-show-only-dialog-pending',
  templateUrl: './show-only-dialog.component.html',
  styleUrls: ['./show-only-dialog.component.scss'],
})
export class ShowOnlyDialogComponent {
  items: any;
  constructor(
    public dialogRef: MatDialogRef<ShowOnlyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.items = data.arr;
  }
  submit() {}
  onNoClick(): void {
    this.dialogRef.close();
  }
}
