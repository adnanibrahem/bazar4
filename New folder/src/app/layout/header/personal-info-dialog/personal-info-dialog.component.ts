/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { Component, inject } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  UntypedFormControl,
} from '@angular/forms';

import { AuthService, User } from '@core';
import { WebcamDialogComponent } from '@shared/components/webcam-dialog/webcam-dialog.component';
import { WebcamImage } from 'ngx-webcam';
import { generateId } from '@shared/TableElement';
import { DomSanitizer } from '@angular/platform-browser';
import { MyHTTP } from '@core/service/myHttp.service';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
export interface DialogData {
  id: number;
}

@Component({
  selector: 'app-personal-info-dialog',
  templateUrl: './personal-info-dialog.component.html',
  styleUrls: ['./personal-info-dialog.component.scss'],
  standalone: false
})
export class PersonalInfoDialogComponent {
  dialogRef = inject<MatDialogRef<PersonalInfoDialogComponent>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);
  private authService = inject(AuthService);
  dialog = inject(MatDialog);
  http = inject(MyHTTP);
  protected sanitizer = inject(DomSanitizer);
  private fb = inject(UntypedFormBuilder);

  dialogTitle: string;
  groupForm: UntypedFormGroup;

  user!: User;
  constructor() {
    const authService = this.authService;

    // Set the defaults
    this.user = authService.currentUserValue;
    this.dialogTitle = ' الاسم :' + this.user.firstName;

    this.showPictureFile.setValue(this.user.img);

    this.groupForm = this.fb.group({
      phoneNumber: [this.user.phoneNumber],
      img: [this.user.img],
      id: [this.user.id],
      auth: [this.user.auth],
      username: [this.user.username],
      firstName: [this.user.firstName],
    });
  }

  submit() { }
  onNoClick(): void {
    this.dialogRef.close();
  }
  public confirmAdd(): void {
    // this.estimatesService.addEstimates(this.estimatesForm.getRawValue());
  }

  dataURItoBlob(dataURI: any) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/png' });
    return blob;
  }

  returnFileFromWebcam(webcam: WebcamImage): File {
    const imageName = generateId(12) + '.png';
    const imageBlob = this.dataURItoBlob(webcam.imageAsBase64);
    return new File([imageBlob], imageName, { type: 'image/png' });
  }

  showPictureFile = new UntypedFormControl();
  showImagePreview(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.showPictureFile.setValue(
        this.sanitizer.bypassSecurityTrustUrl(reader.result as string)
      );
    };
  }

  uploadImg = false;
  selectFile(fileList: FileList | null) {
    if (!fileList?.length) return;
    if (fileList[0].type.split('/')[0] !== 'image') {
      this.http.showNotification(
        'snackbar-danger',
        'يرجى اختيار ملف من نوع صورة'
      );
      return;
    }

    this.uploadImg = true;

    this.groupForm!.get('img')!.setValue(fileList[0]);

    this.showImagePreview(fileList[0]);
  }

  addImageFromWebcam() {
    const dialogRef = this.dialog.open(WebcamDialogComponent, {
      autoFocus: true,
    });
    dialogRef.afterClosed().subscribe((webcamImage: WebcamImage) => {
      if (webcamImage) {
        // this.uploadImg = true;
        const newFile = this.returnFileFromWebcam(webcamImage);
        this.groupForm!.get('img')!.setValue(newFile);
        this.showImagePreview(newFile);
      }
    });
  }
}
