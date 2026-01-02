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

import { AuthService } from '@core';
import {
  Agent,
  BalanceDetails,
  BoxTransaction,
  Fatora,
} from '../branchAdmin.model';
import { CommercialYear } from 'app/admin/admin.model';
import { ShowFatoraItemsDialogComponent } from '@shared/components/show-fatora-items/show-fatora-items.component';

@Component({
  selector: 'app-seller',
  templateUrl: './sellers.component.html',
  styleUrls: ['./sellers.component.scss'],
})
export class SellersComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  dataSource: MatTableDataSource<Agent> = new MatTableDataSource();
  dsBoxDet: MatTableDataSource<BalanceDetails> = new MatTableDataSource();

  @ViewChild('paginator') pagi!: MatPaginator;
  @ViewChild('pagDetails') pagDetails!: MatPaginator;

  isTablet = false;
  selectedIndex = 0;
  varAgent = {} as Agent;
  showSpinner = false;
  gFormGroup!: UntypedFormGroup;
  caption = '';
  displayedColumns = [
    'seq',
    'title',
    'vehicle',
    'address',
    'phoneNumber',
    'initDenar',
    'denar',
    'actions',
  ];
  totalDenar = 0;

  title = ' الموردين ( اصحاب الستوتات )  ';

  isloading = false;
  sendToPdf() {
    this.isloading = true;
    this.http
      .post(this.appApi, this.appApiURL + 'pdf/all', {
        data: this.dataSource.filteredData,
        title: 'قائمة اسماء البائعين',
        title1: 'اسم العميل',
        totalDenar: this.totalDenar,
      })
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

  newFormGroup(): UntypedFormGroup {
    return this.fb.group({
      id: [],
      title: [],
      address: [],
      phoneNumber: [],
      vehicle: [],
      initDenar: [],
    });
  }
  cloneFormGroup(dt: Agent): UntypedFormGroup {
    return this.fb.group({
      id: [dt.id],
      title: [dt.title],
      address: [dt.address],
      branch: [dt.branch],
      userAuth: [dt.userAuth],
      phoneNumber: [dt.phoneNumber],
      initDenar: [dt.initDenar],
      vehicle: [dt.vehicle],
      initId: [dt.initId],
    });
  }
  appApi = 'agents';
  appApiURL = 'agent/';
  constructor(
    private http: MyHTTP,
    private fb: UntypedFormBuilder,
    private auth: AuthService,
    private dialog: MatDialog,
    private datePipe: DatePipe
  ) {
    super();
  }
  cmYear: CommercialYear = {} as CommercialYear;

  ngOnInit(): void {
    this.gFormGroup = this.newFormGroup();
    this.auth.getCommercialYear().subscribe((e) => {
      this.cmYear = e;
      if (e.id > 0) this.LoadAgent();
    });
  }

  getAgentBalance(k: Agent) {
    this.http
      .list(
        this.appApi,
        this.appApiURL + 'ballnce/0/' + k.id + '/' + this.cmYear.id
      )
      .subscribe((w: any) => {
        k.initDenar = w.initDenar;

        k.initId = w.initId;
        k.denar = w.denar;

        this.totalDenar += w.denar;
      });
  }
  LoadAgent() {
    this.showSpinner = true;

    this.totalDenar = 0;

    this.http.list(this.appApi, this.appApiURL + 'list').subscribe(
      (e: any) => {
        this.dataSource = new MatTableDataSource(e);
        this.dataSource.data.forEach((k) => {
          this.getAgentBalance(k);
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
    this.caption = ' تسجيل عميل جديد ';
    this.selectedIndex = 1;
  }
  editCall(ed: Agent) {
    this.gFormGroup = this.cloneFormGroup(ed);
    this.caption = ' تعديل على بيانات عميل ';
    this.selectedIndex = 1;
  }
  onSubmit() {
    this.showSpinner = true;
    const dt = this.gFormGroup.getRawValue();
    dt.group = 'seller';

    if (dt.id) {
      this.http
        .updateId(this.appApi, this.appApiURL + 'edit', dt, dt.id)
        .subscribe(
          (e: any) => {
            const t = this.dataSource.data.findIndex((x) => x.id == e.id);
            this.dataSource.data[t] = Object.assign(e);
            this.getAgentBalance(e);
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
          this.getAgentBalance(e);
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
  deleteItem(i: number, row: Agent) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: '200px',
      width: '300px',
      data: { txt: 'هل انت متأكد من حذف  ؟', title: row.title },
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
  showInfo(row: Agent) {
    console.log(row);
  }

  dipBoxDetaise = [
    'seq',
    'denar',
    'inOut',
    'toFrom',
    'amount',
    'paidAmount',
    'date',
    'comments',
  ];

  parssBoxTransaction(t: BoxTransaction): string {
    let txt = '';
    txt = ' من ';
    if (t.fromAgent) txt += t.fromAgentTitle;
    else if (t.fromBox) txt += '  الصندوق  ';

    txt += ' الى ';
    if (t.toAgent) txt += t.toAgentTitle;
    else if (t.toBox) txt += '  الصندوق  ';
    else if (t.category) txt += t.categoryTitle;
    return txt;
  }

  blnsDetals: BalanceDetails[] = [];
  currRowDetails: Agent = {} as Agent;

  payAmountBox(row: Agent) {
    const absa = Math.abs(row.denar);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: '200px',
      width: '300px',
      data: {
        txt:
          'هل انت متأكد من تسديد المبلغ ' +
          absa.toLocaleString() +
          ' الى العميل ؟ ',
        title: row.title,
      },
      direction: 'rtl',
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        row.spinner = true;
        this.showSpinner = true;
        this.http
          .post(this.appApi, this.appApiURL + 'direct/pay', {
            id: row.id,
            amount: absa,
          })
          .subscribe(
            () => {
              row.spinner = false;
              this.showSpinner = false;
              this.getAgentBalance(row);
            },
            () => {
              this.showSpinner = false;
              row.spinner = false;
              this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
            }
          );
      }
    });
  }

  ShowFatoraInfo(row: Fatora) {
    const dialogRef = this.dialog.open(ShowFatoraItemsDialogComponent, {
      height: 'auto',
      width: '650px',
      data: row,
      direction: 'rtl',
    });
    this.subs.sink = dialogRef.afterClosed().subscribe();
  }

  detailsProject(row: Agent) {
    this.caption = 'تفاصيل رصيد العميل ' + row.title;
    this.currRowDetails = row;
    this.showSpinner = true;
    this.http
      .list(
        this.appApi,
        this.appApiURL + 'ballnce/1/' + row.id + '/' + this.cmYear.id
      )
      .subscribe(
        (w: any) => {
          row.details = w.details;
          this.blnsDetals = [];
          let bDenar = row.initDenar;

          const dinit = {} as BalanceDetails;
          dinit.denar = bDenar;

          dinit.comments = 'بداية الرصيد';
          this.blnsDetals.push(dinit);
          w.details.sort((a: any, b: any) => (a.date < b.date ? -1 : 1));
          w.details.forEach((z: any) => {
            const d = {} as BalanceDetails;
            const t = z.d;
            d.comments = t.comments;
            console.log(z);
            if (z.type == 'boxTransaction') {
              d.inOut = 'حركة مالية';
              if (t.fromAgent) {
                d.amount = t.fromAmount;
                bDenar -= d.amount;
              }
              if (t.toAgent) {
                d.amount = t.toAmount;
                bDenar += d.amount;
              }
              d.toFrom = this.parssBoxTransaction(t);
            }
            if (z.type == 'fatora') {
              d.fatora = z.d;
              d.inOut = 'شراء';
              if (z.d.fatoraType == 2) d.inOut = 'بيع';
              d.amount = t.totalPrice;
              // d.paidAmount = 0;
              d.paidAmount = t.paidAmount;

              // const idx = w.details.findIndex(
              //   (x: any) => x.type === 'boxTransaction' && x.d.fatora === t.id
              // );

              // if (idx > -1) {
              //   d.paidAmount = 0;
              // }

              bDenar -= d.amount; //- d.paidAmount;
            }
            d.denar = bDenar;
            d.date = z.date;
            this.blnsDetals.push(d);
          });
          this.blnsDetals.reverse();
          this.dsBoxDet.data = this.blnsDetals;
          this.dsBoxDet.paginator = this.pagDetails;
          this.dsBoxDet._updateChangeSubscription();
          this.selectedIndex = 2;
          this.showSpinner = false;
        },
        () => {
          this.showSpinner = false;
        }
      );
  }
}
