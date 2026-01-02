/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { UnsubscribeOnDestroyAdapter } from '@shared/UnsubscribeOnDestroyAdapter';
import { UntypedFormBuilder } from '@angular/forms';
import { MyHTTP } from '@core/service/myHttp.service';
import { Branch } from '../admin.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-profit',
  templateUrl: './profit.component.html',
  styleUrls: ['./profit.component.scss'],
})
export class ProfitComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  dsSales: MatTableDataSource<any> = new MatTableDataSource();
  @ViewChild('pagiSales') pagiSales!: MatPaginator;
  dsExpencess: MatTableDataSource<any> = new MatTableDataSource();
  @ViewChild('pagiExpenses') pagiExpenses!: MatPaginator;
  dispSales = [
    'seq',
    'title',
    'date',
    'agentTitle',
    'quantity',
    'cost',
    'salePrice',
    'profit',
  ];
  dispExpenses = [
    'seq',
    'title',
    'date',
    'price',
    'inprofit',
    'usetTitle',
    'comments',
  ];
  selectedIndex = 0;
  branchList: Branch[] = [];
  showSpinner = false;

  curBranch: Branch = {} as Branch;
  caption = '';

  title = 'حساب الارباح';

  dateSearchTo = '';
  dateSearchFrom = '';

  appApi = 'users';
  appApiURL = 'branch/';
  constructor(
    private http: MyHTTP,
    private fb: UntypedFormBuilder,
    private dialog: MatDialog,
    private datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.LoadBranche();
  }

  applyFilterSales(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsSales.filter = filterValue.trim().toLowerCase();
    this.updateTotals();
  }
  applyFilterExpenses(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsExpencess.filter = filterValue.trim().toLowerCase();
    this.updateTotals();
  }

  LoadBranche() {
    this.showSpinner = true;
    this.http.list(this.appApi, this.appApiURL + 'list').subscribe(
      (e: any) => {
        this.branchList = e;

        this.showSpinner = false;
      },
      () => {
        this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
        this.showSpinner = false;
      }
    );
  }

  totalSales = 0;
  totalExpences = 0;
  totalProfitExpencs = 0;

  updateTotals() {
    this.totalSales = 0;
    this.totalExpences = 0;
    this.totalProfitExpencs = 0;
    this.dsSales.filteredData.forEach((row) => {
      this.totalSales += (row.salePrice - row.unitCostPrice) * row.quantity;
    });
    this.dsExpencess.filteredData.forEach((row) => {
      this.totalExpences += row.fromAmount;
      if (row.categoryInfo.inProfit) this.totalProfitExpencs += row.fromAmount;
    });
  }

  expensesGroupBy: { title: string; total: number }[] = [];

  getProfits() {
    this.totalSales = 0;
    this.totalExpences = 0;
    this.totalProfitExpencs = 0;
    this.showSpinner = true;
    this.http
      .post('box', 'profits', {
        brId: this.curBranch.id,
        dtFrom: this.datePipe.transform(this.dateSearchFrom, 'yyyy-MM-dd'),
        dtTo: this.datePipe.transform(this.dateSearchTo, 'yyyy-MM-dd'),
      })
      .subscribe(
        (e: any) => {
          this.dsSales = new MatTableDataSource(e.sales);
          this.dsSales.paginator = this.pagiSales;
          this.dsExpencess = new MatTableDataSource(e.expenses);
          this.dsExpencess.filterPredicate = (data: any, filter: string) => {
            return JSON.stringify(data).toLowerCase().includes(filter);
          };
          this.expensesGroupBy = [];
          this.dsExpencess.data.forEach((el) => {
            const title = el.categoryInfo.title;
            const total = el.fromAmount;
            const existing = this.expensesGroupBy.find(
              (item) => item.title === title
            );
            if (existing) {
              existing.total += total;
            } else {
              this.expensesGroupBy.push({ title, total });
            }
          });
          this.dsExpencess.paginator = this.pagiExpenses;
          this.showSpinner = false;
          this.updateTotals();
        },
        () => {
          this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
          this.showSpinner = false;
        }
      );
  }
  showInfo(row: Branch) {
    console.log(row);
  }
}
