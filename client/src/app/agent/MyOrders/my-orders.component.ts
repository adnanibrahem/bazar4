/* eslint-disable @angular-eslint/prefer-standalone */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { UnsubscribeOnDestroyAdapter } from '@shared/UnsubscribeOnDestroyAdapter';
import { MyHTTP } from '@core/service/myHttp.service';
import { Fatora, FatoraItems } from 'app/Accountant/Accountant.model';
import { ChangeDetectorRef } from '@angular/core';
import { FatoraStuts } from '@core/models/role';
@Component({
  selector: 'app-my-orders',
  templateUrl: 'my-orders.component.html',
  styleUrls: ['my-orders.component.scss'],
  standalone: false,
})
export class MyOrdersComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit {
  private http = inject(MyHTTP);
  private dialog = inject(MatDialog);
  private datePipe = inject(DatePipe);
  private cdr = inject(ChangeDetectorRef);
  dataSource: MatTableDataSource<Fatora> = new MatTableDataSource();
  @ViewChild('pagi') pagi!: MatPaginator;
  isTablet = false;
  selectedIndex = 0;

  showSpinner = false;

  caption = '';
  displayedColumns = [
    'seq',
    'title',
    'fatiraNo',

    'dateAt',
    'itemcont',
    'totalprice',
    'actions',
  ];
  title = 'فواتير المبيعات';
  //
  appApi = 'agents';
  appApiURL = 'agent/fatora/';
  ngOnInit(): void {
    this.LoadFawater();
  }

  updateTotal(k: Fatora) {
    k.totalPrice = 0;
    k.showSendButton = false;
    k.items.forEach((w) => {
      if (!w.deleted) k.totalPrice += w.quantity * w.unitPrice;
      if (w.status === 1) k.showSendButton = true;
    });
  }
  LoadFawater() {
    this.showSpinner = true;
    this.http.list(this.appApi, this.appApiURL + 'list').subscribe(
      (e: any) => {
        this.dataSource = new MatTableDataSource(e);
        this.dataSource.data.forEach((k) => {
          this.updateTotal(k);
          k.items.forEach((w) => {
            w.statusTitle = FatoraStuts(w.status);
          });
        });
        this.dataSource.paginator = this.pagi;
        this.showSpinner = false;
        this.dataSource._updateChangeSubscription();
      },
      () => {
        this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
        this.showSpinner = false;
      },
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  currFatora: Fatora = {} as Fatora;
  SendToChina(ed: Fatora) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: '200px',
      width: '600px',
      data: {
        txt: 'هل انت متأكد من ارسال الفاتورة الى المشتري في الصين  ؟',
        title: ed.agentInfo.title + '  , ' + ed.id,
      },
      direction: 'rtl',
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        ed.showSpinner = true;
        this.cdr.detectChanges();

        this.http.list(this.appApi, this.appApiURL + 'send/' + ed.id).subscribe(
          () => {
            ed.items.forEach((w) => {
              w.status = 2;
            });
            ed.showSendButton = false;

            this.http.showNotification('snackbar-success', 'تم الحدف بنجاح');
            ed.showSpinner = false;
            this.cdr.detectChanges();
          },
          () => {
            ed.showSpinner = false;
            this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
          },
        );
      }
    });
  }
  editCall(ed: Fatora) {
    this.currFatora = ed;
    this.currFatora.items.forEach((x) => {
      x.deleted = false;
    });

    this.caption = ' تعديل بيانات فاتورة رقم :  ' + ed.id;
    this.selectedIndex = 1;
  }
  onSubmit() {
    this.showSpinner = true;
    this.http
      .updateId(
        this.appApi,
        this.appApiURL + 'edit',
        this.currFatora,
        this.currFatora.id,
      )
      .subscribe(
        (e: any) => {
          const t = this.dataSource.data.findIndex((x) => x.id == e.id);
          this.dataSource.data[t] = Object.assign(e);
          this.updateTotal(this.dataSource.data[t]);
          this.dataSource._updateChangeSubscription();
          this.showSpinner = false;
          this.http.showNotification('snackbar-success', 'تم الخزن بنجاح');
        },
        () => {
          this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
          this.showSpinner = false;
        },
      );
  }
  deleteFatora(i: number, row: Fatora) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: '200px',
      width: '300px',
      data: { txt: 'هل انت متأكد من حذف  ؟', title: row.agentInfo.title },
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
  showInfo(row: Fatora) {
    console.log(row);
  }

  deleteItem(row: FatoraItems) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: '200px',
      width: '300px',
      data: { txt: 'هل انت متأكد من حذف  ؟', title: row.itemTitle },
      direction: 'rtl',
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        row.deleted = true;
        this.cdr.detectChanges();
        this.updateTotal(this.currFatora);
      }
    });
  }
}
