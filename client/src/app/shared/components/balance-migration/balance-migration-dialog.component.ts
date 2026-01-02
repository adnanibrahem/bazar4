/* eslint-disable @typescript-eslint/no-explicit-any */
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MyHTTP } from '@core/service/myHttp.service';
import { AuthService } from '@core';
import { CommercialYear } from 'app/admin/admin.model';

@Component({
  selector: 'app-balance-migration-dialog',
  templateUrl: './balance-migration-dialog.component.html',
  styleUrls: ['./balance-migration-dialog.component.scss'],
})
export class BalanceMigrationDialogComponent {
  dsRows = [
    { title: 'ارصدة العملاء والموردين', key: 'agents', showSpinner: false },
    { title: 'ارصدة مواد الخام', key: 'rawMaterial', showSpinner: false },
    { title: 'ارصدة المنتجات', key: 'production', showSpinner: false },
    { title: 'رصيد الصندوق', key: 'box', showSpinner: false },
  ];

  cmYear: CommercialYear = {} as CommercialYear;

  constructor(
    public dialogRef: MatDialogRef<BalanceMigrationDialogComponent>,
    private datePipe: DatePipe,
    private http: MyHTTP,
    private auth: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.auth.getCommercialYear().subscribe((e) => {
      if (e.id > 0) this.cmYear = e;
    });
  }

  Onkeylog(x: string) {
    console.log(x);
  }

  submit() {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  migrate(op: any) {
    op.showSpinner = true;
    this.http.list('box', 'migrate/' + this.cmYear.id + '/' + op.key).subscribe(
      (e) => {
        op.showSpinner = false;
        if (e)
          this.http.showNotification('snackbar-success', 'تم الترحيل بنجاح');
        else this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
      },
      () => {
        op.showSpinner = false;
        this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
      }
    );
  }
}
