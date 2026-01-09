/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { AuthService, User } from '@core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
export interface DialogData {
  id: number;
}

@Component({
  selector: 'app-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.scss'],
  standalone: false,

})
export class ChangePasswordDialogComponent {
  dialogTitle: string;
  groupForm: UntypedFormGroup;

  regex = /^(?=.*[A-Z])(?=.*[W])(?=.*[0-9])(?=.*[a-z]).{8,128}$/;
  user!: User;
  constructor(
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private authService: AuthService,
    public dialog: MatDialog,
    private fb: UntypedFormBuilder
  ) {
    // Set the defaults
    this.user = authService.currentUserValue;
    this.dialogTitle = ' الاسم :' + this.user.firstName;

    this.groupForm = this.fb.group({
      username: [this.user.username],
      currentPassword: [],
      newPassword1: [],
      newPassword2: [],
    });
  }

  submit() { }
  onNoClick(): void {
    this.dialogRef.close();
  }
  public confirmAdd(): void {
    // this.estimatesService.addEstimates(this.estimatesForm.getRawValue());
  }
}
