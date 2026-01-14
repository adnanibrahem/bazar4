import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, inject } from '@angular/core';

export interface DialogData {
  txt: string;
  title: string;
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss'],
  standalone: false
})
export class ConfirmDialogComponent {
  dialogRef = inject<MatDialogRef<ConfirmDialogComponent>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);

  onNoClick(): void {
    this.dialogRef.close();
  }
  confirmDelete(): void { }
}
