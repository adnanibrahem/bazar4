/* eslint-disable @typescript-eslint/no-explicit-any */
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-show-only-dialog-pending',
  templateUrl: './show-only-dialog.component.html',
  styleUrls: ['./show-only-dialog.component.scss'],
  standalone: false
})
export class ShowOnlyDialogComponent {
  dialogRef = inject<MatDialogRef<ShowOnlyDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);

  items: any;
  constructor() {
    const data = this.data;

    this.items = data.arr;
  }
  submit() { }
  onNoClick(): void {
    this.dialogRef.close();
  }
}
