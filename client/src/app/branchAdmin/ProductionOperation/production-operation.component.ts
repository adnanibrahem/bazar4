/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { UnsubscribeOnDestroyAdapter } from '@shared/UnsubscribeOnDestroyAdapter';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MyHTTP } from '@core/service/myHttp.service';

import { AuthService, User } from '@core';
import { Branch, CommercialYear } from 'app/admin/admin.model';
import {
  ProductionItem,
  ProductionOperation,
  ProductionOperationMaterial,
  ProductionOperationProduct,
  RawMaterialItem,
} from '../branchAdmin.model';

@Component({
  selector: 'app-production-operation',
  templateUrl: './production-operation.component.html',
  styleUrls: ['./production-operation.component.scss'],
  standalone: false
})
export class ProductionOperationComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit {
  dataSource: MatTableDataSource<ProductionOperation> =
    new MatTableDataSource();
  @ViewChild('pagi') pagi!: MatPaginator;
  isTablet = false;
  selectedIndex = 0;
  varFatora = {} as ProductionOperation;
  showSpinner = false;
  curUser: User = {} as User;

  caption = '';
  displayedColumns = [
    'seq',
    'productionItemTitle',
    'operationDate',
    'userTitle',
    'comments',
    'actions',
  ];

  title = 'إدارة الإنتاج';
  dsProdMaterial: MatTableDataSource<ProductionOperationMaterial> =
    new MatTableDataSource();

  dsProdItems: MatTableDataSource<ProductionOperationProduct> =
    new MatTableDataSource();

  productionItemsList: ProductionItem[] = [];
  LoadProductionItemList() {
    this.http.list(this.appApi, 'productItem/list').subscribe((e: any) => {
      this.productionItemsList = e;
    });
  }

  appApi = 'store';
  appApiURL = 'invoice/';
  cmYear: CommercialYear = {} as CommercialYear;

  constructor(
    private http: MyHTTP,
    private fb: UntypedFormBuilder,
    private dialog: MatDialog,
    private auth: AuthService,
    private datePipe: DatePipe
  ) {
    super();
  }
  ngOnInit(): void {
    this.LoadProductionItemList();
    this.auth.getCommercialYear().subscribe((e) => {
      this.cmYear = e;
      if (e.id > 0) {
        this.LoadFatora();
        this.LoadmaterialList();
        this.curUser = this.auth.currentUserValue;
      }
    });
  }

  disColumnsMaterials = ['seq', 'title', 'quantity', 'actions'];

  agentFN(edt: any) {
    if (edt) {
      this.varFatora.productionItem = edt.id;
      // this.varFatora.productionItemTitle = edt.title;
    }
  }

  isValid(ed: ProductionOperation): boolean {
    for (let i = 0; i < this.dsProdItems.data.length; i++) {
      const t = this.dsProdItems.data[i];
      if (t.quantity == 0 || !t.productionItem) return true;
    }
    for (let i = 0; i < this.dsProdMaterial.data.length; i++) {
      const t = this.dsProdMaterial.data[i];
      if (t.quantity == 0 || !t.rawMaterialTitle) return true;
    }

    if (
      !this.varFatora.workerName ||
      this.varFatora.workerName == null ||
      this.varFatora.workerName.toLocaleString() == ''
    )
      return true;

    return false;
  }
  showAdvanceSearch = false;
  LoadFatora(jsn: any = {}) {
    this.showSpinner = true;
    this.http.post(this.appApi, 'production/list', jsn).subscribe(
      (e: any) => {
        this.dataSource = new MatTableDataSource(e);
        this.dataSource.filterPredicate = (data: any, filter: string) => {
          return JSON.stringify(data).toLowerCase().includes(filter);
        };
        this.dataSource.paginator = this.pagi;
        this.showSpinner = false;
      },
      () => {
        this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
        this.showSpinner = false;
      }
    );
  }

  dateSearchTo = '';
  dateSearchFrom = '';
  doSearch() {
    this.LoadFatora({
      dtFrom: this.datePipe.transform(this.dateSearchFrom, 'yyyy-MM-dd'),
      dtTo: this.datePipe.transform(this.dateSearchTo, 'yyyy-MM-dd'),
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  MatrialFN(edt: any, row: any) {
    if (edt) {
      row.rawMaterial = edt.id;
      row.rawMaterialTitle = edt.title;
    }
  }

  ProductionItemFN(edt: any, row: any) {
    if (edt) {
      row.productionItem = edt.id;
      row.productionItemTitle = edt.title;
    }
  }
  addNewProduct() {
    const t = {} as ProductionOperationProduct;
    t.quantity = 0;
    t.id = -1;
    t.productionItem = -1;
    t.productionItemTitle = '';
    this.dsProdItems.data.push(t);
    this.dsProdItems._updateChangeSubscription();
  }

  addNewMaterials() {
    const t = {} as ProductionOperationMaterial;
    t.quantity = 0;
    t.id = -1;
    t.rawMaterial = -1;
    t.rawMaterialTitle = '';
    this.dsProdMaterial.data.push(t);
    this.dsProdMaterial._updateChangeSubscription();
  }

  totalInput = 0;

  materialList: RawMaterialItem[] = [];
  LoadmaterialList() {
    this.http.list('store', 'rawMaterial/list').subscribe((e: any) => {
      this.materialList = e;
    });
  }

  addNew() {
    this.varFatora = {} as ProductionOperation;
    this.caption = ' تسجيل  عملية انتاج ';
    this.varFatora.items = [];
    this.varFatora.productionItem = [];
    this.dsProdMaterial = new MatTableDataSource(this.varFatora.items);
    this.dsProdItems = new MatTableDataSource(this.varFatora.productionItem);
    this.selectedIndex = 1;
  }

  editCall(ed: ProductionOperation) {
    this.varFatora = ed;

    this.dsProdMaterial = new MatTableDataSource(this.varFatora.items);
    this.dsProdMaterial._updateChangeSubscription();

    this.dsProdItems = new MatTableDataSource(this.varFatora.productionItem);
    this.dsProdItems._updateChangeSubscription();

    this.caption = ' تعديل عملية انتاج ';
    this.selectedIndex = 1;
  }

  onSubmit() {
    const dt = this.varFatora;
    this.showSpinner = true;
    if (!dt.comments) dt.comments = '';
    if (!dt.id) dt.id = -1;

    if (!dt.cabesaNumber) dt.cabesaNumber = '';

    let surl = 'production/update';
    if (dt.id == -1) surl = 'production/do';
    this.http.create(this.appApi, surl, dt).subscribe(
      (e: any) => {
        this.showSpinner = false;
        if (dt.id != -1) {
          const t = this.dataSource.data.findIndex((x) => x.id == e.id);
          this.dataSource.data[t] = Object.assign(e);
        } else this.dataSource.data.push(e);
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

  deleteProdMaterial(i: number, row: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: '200px',
      width: '300px',
      data: { txt: 'هل انت متأكد من حذف  ؟', title: row.materialTitle },
      direction: 'rtl',
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        if (row.id != -1) {
          this.http
            .list(this.appApi, 'invoiceItem/delete/' + row.id)
            .subscribe((e: any) => {
              this.dsProdMaterial.data.splice(i, 1);
              this.dsProdMaterial._updateChangeSubscription();
            });
        } else {
          this.dsProdMaterial.data.splice(i, 1);
          this.dsProdMaterial._updateChangeSubscription();
        }
      }
    });
  }

  deleteProdItem(i: number, row: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: '200px',
      width: '300px',
      data: { txt: 'هل انت متأكد من حذف  ؟', title: row.materialTitle },
      direction: 'rtl',
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        if (row.id != -1) {
          this.http
            .list(this.appApi, 'invoiceItem/delete/' + row.id)
            .subscribe((e: any) => {
              this.dsProdItems.data.splice(i, 1);
              this.dsProdItems._updateChangeSubscription();
            });
        } else {
          this.dsProdItems.data.splice(i, 1);
          this.dsProdItems._updateChangeSubscription();
        }
      }
    });
  }

  deleteItem(i: number, row: ProductionOperation) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: '200px',
      width: '300px',
      data: { txt: 'هل انت متأكد من حذف  ؟', title: row.workerName },
      direction: 'rtl',
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        this.http.delete(this.appApi, 'production/edit', row).subscribe(
          () => {
            const idx = this.dataSource.data.findIndex((x) => x.id == row.id);
            if (idx > -1) {
              this.dataSource.data.splice(idx, 1);
              this.dataSource._updateChangeSubscription();
              this.http.showNotification('snackbar-success', 'تم الحدف بنجاح');
            }
          },
          (err) => {
            this.http.showNotification('snackbar-danger', 'لا يمكن حذف الوصل');
          }
        );
      }
    });
  }

  showInfo(row: any) {
    console.log(row);
  }
}
