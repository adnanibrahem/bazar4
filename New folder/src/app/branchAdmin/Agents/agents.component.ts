/* eslint-disable @angular-eslint/prefer-standalone */
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

import { AuthService } from '@core';
import { Agent, BalanceDetails, BoxTransaction } from '../branchAdmin.model';
import { CommercialYear } from 'app/admin/admin.model';

@Component({
  selector: 'app-agents',
  templateUrl: './agents.component.html',
  styleUrls: ['./agents.component.scss'],
  standalone: false,
})
export class AgentsComponent
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
    'address',
    'phoneNumber',
    'initDenar',
    'denar',
    'actions',
  ];
  totalDenar = 0;

  title = 'إدارة العملاء ';

  isloading = false;
  sendToPdf() {
    this.isloading = true;
    this.http
      .post(this.appApi, this.appApiURL + 'pdf/all', {
        data: this.dataSource.filteredData,
        title: 'قائمة اسماء العملاء',
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
      initId: [dt.initId],
    });
  }
  appApi = 'agents';
  appApiURL = 'agent/';
  private http = inject(MyHTTP);
  private fb = inject(UntypedFormBuilder);
  private auth = inject(AuthService);
  private dialog = inject(MatDialog);
  private datePipe = inject(DatePipe);

  constructor() {
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
        console.log(w);
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
    const dt = this.gFormGroup.getRawValue();
    dt.group = 'other';
    dt.vehicle = '';

    this.showSpinner = true;
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
    'amount',
    'date',
    'toFrom',
    'comments',
  ];

  parssBoxTransaction(t: BoxTransaction): string {
    let txt = '';
    txt = ' من ';
    if (t.fromAgent) txt += ' عميل ' + t.fromAgentTitle;
    else if (t.fromBox) txt += '  الصندوق  ';

    txt += ' الى ';
    if (t.toAgent) txt += ' عميل ' + t.toAgentTitle;
    else if (t.toBox) txt += '  الصندوق  ';
    else if (t.category) txt += ' تبويب ' + t.categoryTitle;
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
            if (z.type == 'boxTransaction') {
              if (t.fromAgent) {
                d.inOut = 'صادر';
                d.amount = t.fromAmount;
                bDenar -= d.amount;
              }
              if (t.toAgent) {
                d.inOut = 'وارد';
                d.amount = t.toAmount;
                bDenar += d.amount;
              }
              d.toFrom = this.parssBoxTransaction(t);
            }
            if (z.type == 'fatora') {
              d.amount = t.totalPrice;
              if (t.fatoraType == 1) {
                d.inOut = 'شراء مواد';
                bDenar -= d.amount;
              }
              if (t.fatoraType == 2) {
                d.inOut = 'بيع مواد';
                bDenar += d.amount;
              }
            }
            d.denar = bDenar;
            d.date = z.date;
            this.blnsDetals.push(d);
          });
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
