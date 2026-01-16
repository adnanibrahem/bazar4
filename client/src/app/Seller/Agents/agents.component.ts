/* eslint-disable @angular-eslint/prefer-inject */
/* eslint-disable @angular-eslint/prefer-standalone */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { UnsubscribeOnDestroyAdapter } from '@shared/UnsubscribeOnDestroyAdapter';
import { MyHTTP } from '@core/service/myHttp.service';

import { AuthService, User } from '@core';

import { DomSanitizer } from '@angular/platform-browser';
import { Agent, BalanceDetails } from 'app/Accountant/Accountant.model';
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
  curUser: User = {} as User;

  caption = '';
  displayedColumns = [
    'seq',
    'title',
    'address',
    'phoneNumber',
    'initBalance',
    'denar',
    'actions',
  ];
  totalDenar = 0;

  title = 'الزبائن';

  appApi = 'agents';
  appApiURL = 'agent/';
  constructor(
    private http: MyHTTP,
    protected sanitizer: DomSanitizer,
    private auth: AuthService,
    private dialog: MatDialog,
    private datePipe: DatePipe
  ) {
    super();
  }
  cmYear: CommercialYear = {} as CommercialYear;

  ngOnInit(): void {
    this.varAgent = {} as Agent;
    this.showSpinner = true;

    this.auth.getCommercialYear().subscribe((e) => {
      this.showSpinner = false;
      this.cmYear = e;
      if (e.id > 0) this.LoadAgent();
      this.curUser = this.auth.currentUserValue;
    });
  }

  getAgentBalance(k: Agent) {
    k.hasLoginName = k.loginName != '';
    this.http
      .list(
        this.appApi,
        this.appApiURL + 'ballnce/0/' + k.id + '/' + this.cmYear.id
      )
      .subscribe((w: any) => {
        k.initId = w.initId;

        k.initDollar = w.initDollar;

        k.curDenar = w.denar;
        k.initDenar = w.initDenar;

        k.yearId = this.cmYear.id;
        this.totalDenar += w.denar;
      });
  }

  LoadAgent() {
    this.showSpinner = true;
    this.totalDenar = 0;
    this.http.list(this.appApi, this.appApiURL + 'list').subscribe(
      (e: any) => {
        this.dataSource = new MatTableDataSource(e);

        this.dataSource.filterPredicate = (data: any, filter: string) => {
          const searchTerms = filter.split(' ');
          const dataStr = JSON.stringify(data).toLowerCase();
          return searchTerms.every((term) => dataStr.includes(term));
        };

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

  applyFilterDetails(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsBoxDet.filter = filterValue.trim().toLowerCase();
  }

  addNew() {
    this.showOthers = false;
    this.varAgent = {} as Agent;
    this.caption = ' تسجيل  زبون  جديد ';
    this.selectedIndex = 1;
  }

  showOthers = false;

  editCall(ed: Agent) {
    this.varAgent = ed;

    this.caption = ' تعديل على بيانات  زبون  ';
    this.showOthers = true;
    this.selectedIndex = 1;
  }

  isReload = false;
  reloadBalance() {
    this.isReload = true;
    this.detailsProject(this.currRowDetails);
  }
  onSaveLoginName() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: '200px',
      width: '300px',
      data: {
        txt: 'هل انت متأكد من خزن اسم الدخول لل زبون   ؟',
        title: this.varAgent.title,
      },
      direction: 'rtl',
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        this.http
          .post(this.appApi, this.appApiURL + 'active/loginpage', this.varAgent)
          .subscribe(
            (e: any) => {
              if (e.error) {
                this.http.showNotification('snackbar-danger', e.msg);
              } else {
                this.varAgent.hasLoginName = true;
                this.http.showNotification(
                  'snackbar-success',
                  'تم الخزن بنجاح'
                );
              }
            },
            () => {
              this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
            }
          );
      }
    });
  }

  onSubmit() {
    this.varAgent.yearId = this.cmYear.id;
    if (!this.varAgent.initDenar) this.varAgent.initDenar = 0;

    this.showSpinner = true;
    if (this.varAgent.id) {
      this.http
        .updateId(
          this.appApi,
          this.appApiURL + 'edit',
          this.varAgent,
          this.varAgent.id
        )
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
      this.http
        .create(this.appApi, this.appApiURL + 'create', this.varAgent)
        .subscribe(
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
              this.detailsProject(this.currRowDetails);
              this.http.showNotification('snackbar-success', 'تم الحدف بنجاح');
            });
        }
        if (row.row.type === 'boxTransaction') {
          this.http.delete('accounts', 'box/edit', row.row.d).subscribe(() => {
            this.detailsProject(this.currRowDetails);
            this.http.showNotification('snackbar-success', 'تم الحدف بنجاح');
          });
        }
      }
    });
  }

  dipBoxDetaise = [
    'seq',
    'denar',
    'amount',

    // 'itemTitle',
    'salePrice',

    'count',
    'inOut',
    'date',

    // 'itemCode',
    'comments',
    'action',
  ];

  isloading = false;
  isloadingTasded = false;
  saveToAgentBalancePDF() {
    this.isloading = true;
    this.http
      .post('agents', 'agent/pdf', {
        balance: this.currRowDetails.curDollar.toLocaleString(),
        agentTitle: this.caption,
        items: this.blnsDetals,
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

  parssBoxTransaction(t: any): string {
    let txt = '';

    txt = ' من ';
    if (t.fromAgent) txt += '  زبون  ' + t.fromAgentTitle;
    else if (t.fromCustomer) txt += ' زبون ' + t.fromCustomerTitle;
    else if (t.fromBox) txt += '  الصندوق  ';
    else if (t.fromBranchOtherAccounts)
      txt += ' حسابات اخرى ' + t.fromBranchOtherAccountsTitle;
    else if (t.fromMainAccountant) txt += ' حسابات صندوق الشركة ';

    txt += ' الى ';
    if (t.toAgent) txt += '  زبون  ' + t.toAgentTitle;
    else if (t.toCustomer) txt += ' زبون ' + t.toCustomerTitle;
    else if (t.toBranchOtherAccounts)
      txt += ' حسابات اخرى  ' + t.toBranchOtherAccountsTitle;
    else if (t.toMainAccountant) txt += ' حسابات اخرى  ';
    else if (t.toBox) txt += '  الصندوق  ';
    else if (t.category) txt += ' تبويب ' + t.categoryTitle;

    return txt;
  }

  blnsDetals: BalanceDetails[] = [];
  currRowDetails: Agent = {} as Agent;

  reserve: any = [];
  detailsProject(row: Agent) {
    this.caption = row.title;
    this.blnsDetals = [];
    this.currRowDetails = row;
    row.showSpinner = true;

    this.http
      .list(
        this.appApi,
        this.appApiURL + 'ballnce/1/' + row.id + '/' + this.cmYear.id
      )
      .subscribe(
        (w: any) => {
          row.details = w.details;
          this.reserve = w.reserve;

          this.blnsDetals = [];

          const dinit = {} as BalanceDetails;
          dinit.denar = w.initBalance;
          let bDenar = w.initBalance;
          dinit.comments = 'بداية الرصيد';
          this.blnsDetals.push(dinit);

          w.details.sort((a: any, b: any) => (a.date < b.date ? -1 : 1));

          w.details.forEach((z: any) => {
            const d = {} as BalanceDetails;

            const t = z.d;

            d.comments = t.comments;

            if (z.type == 'boxTransaction') {
              if (t.fromAgent == row.id) {
                d.amount = t.fromAmount;
                bDenar -= d.amount;
              }
              if (t.toAgent == row.id) {
                d.inOut = 'سحب';

                d.amount = t.toAmount;
                bDenar += d.amount;
              }
              // d.comments = t.comments; //this.parssBoxTransaction(t);
            }
            if (z.type == 'fatora') {
              // d.inOut = 'شراء مواد';

              d.inOut = t.itemTitle;
              d.comments = t.comments;
            }
            if (z.type == 'returnSale') {
              // d.inOut = 'شراء مواد';
              d.amount = t.salePrice * t.returnInfo.returnQuantity;
              bDenar -= d.amount;

              d.inOut = 'ترجيع';
              d.comments = t.itemTitle;
            }

            d.date = z.date;
            d.denar = bDenar;
            this.blnsDetals.push(d);
          });

          this.blnsDetals.reverse();

          this.dsBoxDet.data = this.blnsDetals;
          this.dsBoxDet.paginator = this.pagDetails;
          this.dsBoxDet._updateChangeSubscription();
          this.currRowDetails.curDenar = bDenar;
          this.selectedIndex = 2;
          row.showSpinner = false;
          this.isReload = false;
        },
        () => {
          row.showSpinner = false;
        }
      );
  }

  onResetPassword() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: '200px',
      width: '300px',
      data: {
        txt: 'هل انت متأكد من  تغيير كلمة المرور الى 12345  لل زبون   ؟',
        title: this.varAgent.title,
      },
      direction: 'rtl',
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        this.http
          .post(this.appApi, this.appApiURL + 'reset/password', this.varAgent)
          .subscribe(
            (e: any) => {
              if (e.error) {
                this.http.showNotification('snackbar-danger', e.msg);
              } else {
                this.varAgent.hasLoginName = true;
                this.http.showNotification(
                  'snackbar-success',
                  'تم الخزن بنجاح'
                );
              }
            },
            () => {
              this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
            }
          );
      }
    });
  }
}
