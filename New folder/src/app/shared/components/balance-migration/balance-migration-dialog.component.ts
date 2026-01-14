/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { Component, inject } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { MyHTTP } from '@core/service/myHttp.service';
import { AuthService } from '@core';
import { CommercialYear } from 'app/admin/admin.model';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-balance-migration-dialog',
  templateUrl: './balance-migration-dialog.component.html',
  styleUrls: ['./balance-migration-dialog.component.scss'],
  standalone: false
})
export class BalanceMigrationDialogComponent {
  dialogRef = inject<MatDialogRef<BalanceMigrationDialogComponent>>(MatDialogRef);
  private datePipe = inject(DatePipe);
  private http = inject(MyHTTP);
  private auth = inject(AuthService);
  data = inject(MAT_DIALOG_DATA);

  dsRows = [
    { title: 'ارصدة العملاء والموردين', key: 'agents', showSpinner: false },
    { title: 'ارصدة مواد الخام', key: 'rawMaterial', showSpinner: false },
    { title: 'ارصدة المنتجات', key: 'production', showSpinner: false },
    { title: 'رصيد الصندوق', key: 'box', showSpinner: false },
  ];

  cmYear: CommercialYear = {} as CommercialYear;

  constructor() {
    this.auth.getCommercialYear().subscribe((e) => {
      if (e.id > 0) this.cmYear = e;
    });
  }

  Onkeylog(x: string) {
    console.log(x);
  }

  submit() { }

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
