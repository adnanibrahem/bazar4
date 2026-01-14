/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { Component, inject } from '@angular/core';
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
  dialogRef = inject<MatDialogRef<ChangePasswordDialogComponent>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);
  private authService = inject(AuthService);
  dialog = inject(MatDialog);
  private fb = inject(UntypedFormBuilder);

  dialogTitle: string;
  groupForm: UntypedFormGroup;

  regex = /^(?=.*[A-Z])(?=.*[W])(?=.*[0-9])(?=.*[a-z]).{8,128}$/;
  user!: User;
  constructor() {
    const authService = this.authService;

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
