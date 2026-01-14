/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { UnsubscribeOnDestroyAdapter } from '@shared/UnsubscribeOnDestroyAdapter';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MyHTTP } from '@core/service/myHttp.service';

import { AuthService, User } from '@core';
import { RawMaterialItem, StoreItemDetails } from '../branchAdmin.model';
import { CommercialYear } from 'app/admin/admin.model';

@Component({
  selector: 'app-raw-materials',
  templateUrl: './raw-materials.component.html',
  styleUrls: ['./raw-materials.component.scss'],
  standalone: false
})
export class RawMaterialsComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit {
  private http = inject(MyHTTP);
  private fb = inject(UntypedFormBuilder);
  private dialog = inject(MatDialog);
  auth = inject(AuthService);
  private datePipe = inject(DatePipe);

  dataSource: MatTableDataSource<RawMaterialItem> = new MatTableDataSource();

  @ViewChild('pagi') pagi!: MatPaginator;
  @ViewChild('pagBoxDetails') pagBoxDetails!: MatPaginator;
  isTablet = false;
  selectedIndex = 0;
  varItem = {} as RawMaterialItem;
  showSpinner = false;
  gFormGroup!: UntypedFormGroup;
  caption = '';
  curUser: User = {} as User;
  displayedColumns = [
    'seq',
    'title',
    'unitTitle',
    'initQuantity',
    'quantity',
    'unitCostPrice',
    'total',
    'actions',
  ];
  title = 'مخزون المواد الخام ';
  newFormGroup(): UntypedFormGroup {
    return this.fb.group({
      id: [],
      title: [],
      unitTitle: [],
      unitCostPrice: [],
      initQuantity: [],
    });
  }

  cloneFormGroup(dt: RawMaterialItem): UntypedFormGroup {
    return this.fb.group({
      id: [dt.id],
      title: [dt.title],
      unitTitle: [dt.unitTitle],
      unitCostPrice: [dt.unitCostPrice],
      initQuantity: [dt.initQuantity],
      branch: [dt.branch],
      yearId: [dt.yearId],
      userAuth: [dt.userAuth],
      initId: [dt.initId],
    });
  }

  LoadItemQuantity(item: RawMaterialItem) {
    this.http
      .list('store', 'rawMaterial/ballnce/0/' + item.id + '/' + this.cmYear.id)
      .subscribe((e: any) => {
        item.quantity = e.quantity;
        item.initQuantity = e.initQuantity;
        item.details = e.details;
        item.initId = e.initId;
        item.unitCostPrice = Math.round(e.unitCostPrice * 100) / 100;
        item.total = e.unitCostPrice * e.quantity;
        this.totalItemsCost += e.unitCostPrice * e.quantity;
      });
  }

  appApi = 'store';
  appApiURL = 'rawMaterial/';

  isloading = false;
  cmYear: CommercialYear = {} as CommercialYear;
  ngOnInit(): void {
    this.curUser = this.auth.currentUserValue;

    this.gFormGroup = this.newFormGroup();

    this.auth.getCommercialYear().subscribe((e) => {
      this.cmYear = e;
      if (e.id > 0) {
        this.LoadItem();
      }
    });
    if (this.auth.role == 'StoreKeeper') {
      this.displayedColumns = [
        'seq',
        'title',
        'unitTitle',
        'initQuantity',
        'quantity',
        'actions',
      ];
    }
  }
  totalItemsCost = 0;
  LoadItem() {
    this.totalItemsCost = 0;
    this.showSpinner = true;
    this.http.list(this.appApi, this.appApiURL + 'list').subscribe(
      (e: any) => {
        this.dataSource = new MatTableDataSource(e);
        this.dataSource.data.forEach((k) => {
          this.LoadItemQuantity(k);
        });
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
    this.gFormGroup = this.newFormGroup();
    this.caption = ' تسجيل مادة مخزنية ';
    this.selectedIndex = 1;
  }

  editCall(ed: RawMaterialItem) {
    this.gFormGroup = this.cloneFormGroup(ed);
    this.caption = ' تعديل بيانات مادة مخزنية ';
    this.selectedIndex = 1;
  }

  sendToPdf() {
    this.isloading = true;
    this.http
      .post(this.appApi, this.appApiURL + 'pdf', this.dataSource.filteredData)
      .subscribe(
        (e: any) => {
          window.open(e.url, '_blank');
          this.isloading = false;
        },
        () => {
          this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
          this.isloading = false;
        }
      );
  }
  isloadingDetails = false;
  sendDetailsToPdf() {
    this.isloadingDetails = true;
    this.http
      .post(this.appApi, this.appApiURL + 'details/pdf', {
        items: this.itemsDetals.data,
        title: this.caption,
        curQuantity: this.curQuantity,
      })
      .subscribe(
        (e: any) => {
          window.open(e.url, '_blank');
          this.isloadingDetails = false;
        },
        () => {
          this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
          this.isloadingDetails = false;
        }
      );
  }
  fromAgentFN(dt: any) {
    if (dt) {
      this.gFormGroup.get('material')?.setValue(dt.id);
    }
  }

  onSubmit() {
    this.showSpinner = true;
    const dt = this.gFormGroup.getRawValue();
    if (!dt.unitCostPrice) dt.unitCostPrice = 0;
    if (dt.id) {
      this.http
        .updateId(this.appApi, this.appApiURL + 'edit', dt, dt.id)
        .subscribe(
          (e: any) => {
            const t = this.dataSource.data.findIndex((x) => x.id == e.id);
            this.dataSource.data[t] = Object.assign(e);
            this.LoadItemQuantity(this.dataSource.data[t]);
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
          this.LoadItemQuantity(e);
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

  deleteItem(i: number, row: RawMaterialItem) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: '200px',
      width: '300px',
      data: { txt: 'هل انت متأكد من حذف  ؟', title: row.title },
      direction: 'rtl',
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        if (row.quantity != 0) {
          this.http.showNotification(
            'snackbar-danger',
            'لا يمكن الحذف الا بعد تصفير الرصيد'
          );
          return;
        }
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

  dipBoxDetaise = ['sq', 'balance', 'type', 'quantity', 'price', 'date', 'comments'];

  itemsListDet: StoreItemDetails[] = [];
  itemsDetals: MatTableDataSource<StoreItemDetails> = new MatTableDataSource();
  curQuantity = 0;
  detailsProject(item: RawMaterialItem) {
    this.caption = item.title;
    item.spinner = true;
    console.log(item);
    this.http
      .list('store', 'rawMaterial/ballnce/1/' + item.id + '/' + this.cmYear.id)
      .subscribe(
        (e: any) => {
          item.quantity = e.quantity;
          this.curQuantity = e.quantity;
          item.details = e.details;
          item.details.sort((a: any, b: any) => (a.date < b.date ? -1 : 1));

          let balance = item.initQuantity;
          const t = {} as StoreItemDetails;
          t.balance = item.initQuantity;
          t.comments = 'بداية الرصيد';
          this.itemsListDet = [];
          this.itemsListDet.push(t);
          item.details.forEach((k: any) => {
            const w = {} as StoreItemDetails;

            w.quantity = k.data.quantity;
            w.date = k.date;
            if (k.type.trim() == 'purchasItems') {
              w.type = 'شراء';
              balance += k.data.quantity;
              w.price = k.data.unitCostPrice;
              w.comments =
                'البائع: ' +
                k.data.info.agentTitle +
                ', رقم الفانورة : ' +
                k.data.info.id;
            }
            if (k.type.trim() == 'salesItems') {
              w.type = 'بيع';
              balance -= k.data.quantity;
              w.price = k.data.salePrice;
              w.comments =
                'المشتري: ' +
                k.data.info.agentTitle +
                ', رقم الفانورة : ' +
                k.data.info.id;
            }
            if (k.type.trim() == 'ProductionOperationItems') {
              w.type = 'انتاج';
              balance -= k.data.quantity;
              w.comments =
                'اسم المنتج: ' +
                k.data.info.productionItemTitle +
                'اسم العامل: ' +
                k.data.info.workerName;
            }
            w.balance = balance;
            this.itemsListDet.push(w);
          });
          this.itemsListDet.reverse();
          this.itemsDetals.data = this.itemsListDet;
          this.itemsDetals._updateChangeSubscription();
          this.itemsDetals.paginator = this.pagBoxDetails;
          item.spinner = false;
          this.selectedIndex = 2;
        },
        () => {
          this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
          item.spinner = false;
        }
      );
  }
}
