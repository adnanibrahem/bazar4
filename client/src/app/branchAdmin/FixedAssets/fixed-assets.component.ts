/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { UnsubscribeOnDestroyAdapter } from '@shared/UnsubscribeOnDestroyAdapter';
import { UntypedFormBuilder } from '@angular/forms';
import { MyHTTP } from '@core/service/myHttp.service';

import { AuthService, User } from '@core';

import { DomSanitizer } from '@angular/platform-browser';
import { FixedAssets } from '../branchAdmin.model';

@Component({
  selector: 'app-fixed-assets',
  templateUrl: './fixed-assets.component.html',
  styleUrls: ['./fixed-assets.component.scss'],
})
export class FixedAssetsComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  dataSource: MatTableDataSource<FixedAssets> = new MatTableDataSource();

  @ViewChild('paginator') pagi!: MatPaginator;

  isTablet = false;
  selectedIndex = 0;
  varFixedAssets = {} as FixedAssets;
  showSpinner = false;
  curUser: User = {} as User;

  caption = '';
  displayedColumns = [
    'seq',
    'title',
    'location',
    'owner',
    'quantity',
    'price',
    'actions',
  ];

  totalDenar = 0;

  title = 'الموجودات الثابتة';

  appApi = 'store';
  appApiURL = 'fixedAssets/';
  constructor(
    private http: MyHTTP,
    private fb: UntypedFormBuilder,
    protected sanitizer: DomSanitizer,
    private auth: AuthService,
    private dialog: MatDialog,
    private datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.varFixedAssets = {} as FixedAssets;
    this.showSpinner = true;
    this.LoadFixedAssets();
    this.curUser = this.auth.currentUserValue;
  }

  LoadFixedAssets() {
    this.showSpinner = true;
    this.totalDenar = 0;
    this.http.list(this.appApi, 'fixedAssets/list').subscribe(
      (e: any) => {
        this.dataSource = new MatTableDataSource(e);

        this.dataSource.paginator = this.pagi;
        this.showSpinner = false;
      },
      () => {
        this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
        this.showSpinner = false;
      }
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addNew() {
    this.showOthers = false;
    this.varFixedAssets = {} as FixedAssets;

    this.caption = ' اضافة مادة ثابتة ';
    this.selectedIndex = 1;
  }

  showOthers = false;

  editCall(ed: FixedAssets) {
    this.varFixedAssets = ed;

    this.caption = ' تعديل بيانات مادة ثابتة ';
    this.showOthers = true;
    this.selectedIndex = 1;
  }

  onSubmit() {
    const dt = this.varFixedAssets;

    this.showSpinner = true;
    if (dt.id) {
      this.http
        .updateId(this.appApi, this.appApiURL + 'edit', dt, dt.id)
        .subscribe(
          (e: any) => {
            const t = this.dataSource.data.findIndex((x) => x.id == e.id);
            this.dataSource.data[t] = Object.assign(e);

            this.dataSource._updateChangeSubscription();
            this.showSpinner = false;
            this.http.showNotification('snackbar-success', 'تم الخزن بنجاح');
          },
          () => {
            this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
            this.showSpinner = false;
          }
        );
    } else {
      this.http.create(this.appApi, this.appApiURL + 'create', dt).subscribe(
        (e: any) => {
          this.showSpinner = false;
          this.dataSource.data.push(e);

          this.dataSource._updateChangeSubscription();
          this.http.showNotification('snackbar-success', 'تم الخزن بنجاح');
          this.selectedIndex = 0;
        },
        () => {
          this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
          this.showSpinner = false;
        }
      );
    }
  }

  deleteItem(i: number, row: FixedAssets) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: '200px',
      width: '300px',
      data: {
        txt: 'حذف مادة ثابتة',
        title: 'هل انت متأكد من حذف المادة ? ',
      },
      direction: 'rtl',
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        this.http
          .delete(this.appApi, this.appApiURL + 'edit', row)
          .subscribe(() => {
            const idx = this.dataSource.data.findIndex((x) => x.id == row.id);
            if (idx > -1) {
              this.dataSource.data.splice(idx, 1);
              this.dataSource._updateChangeSubscription();
              this.http.showNotification('snackbar-success', 'تم الحدف بنجاح');
            }
          });
      }
    });
  }

  deleteReportItem(i: number, row: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: '200px',
      width: '300px',
      data: { txt: 'هل انت متأكد الحذف  ؟', title: '' },
      direction: 'rtl',
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        if (row.row.type === 'fatora') {
          this.http
            .delete('accounts', 'sales/edit', row.row.d)
            .subscribe(() => {
              this.http.showNotification('snackbar-success', 'تم الحدف بنجاح');
            });
        }
        if (row.row.type === 'boxTransaction') {
          this.http.delete('accounts', 'box/edit', row.row.d).subscribe(() => {
            this.http.showNotification('snackbar-success', 'تم الحدف بنجاح');
          });
        }
      }
    });
  }
}
