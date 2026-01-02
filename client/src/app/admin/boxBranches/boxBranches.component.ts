/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { UnsubscribeOnDestroyAdapter } from '@shared/UnsubscribeOnDestroyAdapter';
import { MyHTTP } from '@core/service/myHttp.service';
import { AuthService } from '@core';
import { BranchInfo, CommercialYear } from 'app/admin/admin.model';
import {
  Agent,
  ProductionItem,
  RawMaterialItem,
} from 'app/branchAdmin/branchAdmin.model';

@Component({
  selector: 'app-box-branches',
  templateUrl: './boxBranches.component.html',
  styleUrls: ['./boxBranches.component.scss'],
})
export class BoxBranchesComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  dataSource: MatTableDataSource<BranchInfo> = new MatTableDataSource();
  @ViewChild('pagi') pagi!: MatPaginator;
  isTablet = false;
  selectedIndex = 0;

  showSpinner = false;

  caption = '';
  displayedColumns = [
    'seq',
    'title',
    'boxDenar',
    'agentDenar',
    'muwadenDenar',
    'rawMatDenar',
    'prodDenar',
    'mezan',
    // 'actions',
  ];

  title = 'ارصدة الفروع';

  appApi = 'box';
  appApiURL = 'category/';
  constructor(
    private http: MyHTTP,
    private auth: AuthService,
    private dialog: MatDialog,
    private datePipe: DatePipe
  ) {
    super();
  }
  ngOnInit(): void {
    this.auth.getCommercialYear().subscribe((e) => {
      this.cmYear = e;
      if (e.id > 0) {
        this.LoadBranche();
      }
    });
  }
  cmYear: CommercialYear = {} as CommercialYear;

  boxDenar = 0;
  boxDollar = 0;

  agentDenar = 0;
  agentDollar = 0;

  custDenar = 0;
  custDollar = 0;
  storeValue = 0;
  blnsDenar = 0;
  blnsDollar = 0;

  backTomainFN($event: any) {
    this.selectedIndex = $event;
  }

  isloading = false;
  sendToPdf() {
    this.isloading = true;

    this.http
      .post(this.appApi, 'box/admin/branch/pdf', {
        items: this.dataSource.data,
        boxDenar: this.boxDenar,
        boxDollar: this.boxDollar,
        agentDenar: this.agentDenar,
        agentDollar: this.agentDollar,
        custDenar: this.custDenar,
        custDollar: this.custDollar,
        blnsDenar: this.blnsDenar,
        blnsDollar: this.blnsDollar,
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

  gRow: any;
  curRow: any;
  gTitle = '';

  // GetBranchBalance(r: BranchInfo, details: number) {
  //   r.balanceSpinner = true;
  //   this.http
  //     .list(
  //       'box',
  //       'box/admin/branch/ballnce/' +
  //         r.id +
  //         '/' +
  //         details +
  //         '/' +
  //         this.cmYear.id
  //     )
  //     .subscribe(
  //       (e: any) => {
  //         r.balanceSpinner = false;
  //         r.initBalanceDenar = e.initDenar;
  //         r.initBalanceDollar = e.initDollar;
  //         r.initId = e.initId;
  //         r.balanceDenar = e.denar;
  //         r.balanceDollar = e.dollar;

  //         this.blnsDenar += e.denar;
  //         this.blnsDollar += e.dollar;

  //         if (details == 1) {
  //           this.curRow = r;
  //           this.gRow = e;
  //           this.gTitle = 'كشف رصيد فرع : ' + r.title;
  //           this.selectedIndex = 2;
  //         }
  //       },
  //       () => {
  //         this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
  //         r.balanceSpinner = false;
  //       }
  //     );
  // }

  // GetBranchInfo(r: BranchInfo) {
  //   // r.boxSpinner = true;
  //   // r.agentSpinner = true;
  //   // r.customerSpinner = true;
  //   this.http
  //     .list('box', 'box/admin/ballnce/' + r.id + '/0/' + this.cmYear.id)
  //     .subscribe((e: any) => {
  //       r.boxSpinner = false;
  //       r.agentSpinner = false;
  //       r.customerSpinner = false;
  //       r.boxDenar = e.box.denar;
  //       r.boxDollar = e.box.dollar;
  //       r.storeValue = e.storeValue;
  //       r.agentDenar = e.agent.denar;
  //       r.agentDollar = e.agent.dollar;
  //       r.customerDenar = e.customer.denar;
  //       r.customerDollar = e.customer.dollar;

  //       this.boxDenar += r.boxDenar;
  //       this.boxDollar += r.boxDollar;
  //       this.storeValue += r.storeValue;
  //       this.agentDenar += r.agentDenar;
  //       this.agentDollar += r.agentDollar;

  //       this.custDenar += r.customerDenar;
  //       this.custDollar += r.customerDollar;
  //     });
  // }
  // showDetailse(row: BranchInfo, type: string) {
  //   switch (type) {
  //     case 'balance':
  //       this.GetBranchBalance(row, 1);
  //       break;
  //   }
  // }

  initRow: BranchInfo = {} as BranchInfo;
  editInitBalance(row: BranchInfo) {
    this.caption = 'بداية رصيد الفرع : ' + row.title;
    this.initRow = row;
    this.selectedIndex = 3;
  }

  // onClick() {
  //   this.http.update('box', 'box/admin/branch/init', this.initRow).subscribe(
  //     () => {
  //       this.GetBranchBalance(this.initRow, 0);
  //       this.selectedIndex = 0;
  //     },
  //     () => {
  //       this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
  //     }
  //   );
  // }

  loadBranchBalance(t: BranchInfo) {
    t.mezan = 0;
    //  -----------    Box ----------------
    t.boxSpinner = true;
    this.http
      .list('box', 'box/admin/ballnce/' + this.cmYear.id + '/' + t.id)
      .subscribe(
        (e: any) => {
          t.boxSpinner = false;
          t.boxDenar = e.denar;
          t.mezan += t.boxDenar;
        },
        () => {
          this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
          t.boxSpinner = false;
        }
      );

    //  -----------    Agents  ----------------
    t.agentSpinner = true;
    this.http
      .list('agents', 'agent/admin/ballnce/' + this.cmYear.id + '/' + t.id)
      .subscribe(
        (e: any) => {
          t.agentSpinner = false;
          t.agentDenar = e.denar;
          t.mezan += t.agentDenar;
        },
        () => {
          this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
          t.agentSpinner = false;
        }
      );

    //  -----------    Muwaden  ----------------
    t.muwadenSpinner = true;
    this.http
      .list('agents', 'agent/admin/ballnce/' + this.cmYear.id + '/' + t.id)
      .subscribe(
        (e: any) => {
          t.muwadenSpinner = false;
          t.muwadenDenar = e.denar;
          t.mezan += t.muwadenDenar;
        },
        () => {
          this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
          t.muwadenSpinner = false;
        }
      );

    //  -----------    rawMaterial  ----------------
    t.rawMatSpinner = true;
    this.http
      .list('store', 'rawMaterial/admin/ballnce/' + this.cmYear.id + '/' + t.id)
      .subscribe(
        (e: any) => {
          t.rawMatSpinner = false;
          t.rawMatDenar = e.denar;
          t.mezan += t.rawMatDenar;
        },
        () => {
          this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
          t.rawMatSpinner = false;
        }
      );

    //  -----------    productItem  ----------------
    t.prodSpinner = true;
    this.http
      .list('store', 'productItem/admin/ballnce/' + this.cmYear.id + '/' + t.id)
      .subscribe(
        (e: any) => {
          t.prodSpinner = false;
          t.prodDenar = e.denar;
          t.mezan += t.prodDenar;
        },
        () => {
          this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
          t.prodSpinner = false;
        }
      );
  }

  LoadBranche() {
    this.showSpinner = false;

    this.boxDenar = 0;
    this.boxDollar = 0;

    this.agentDenar = 0;
    this.agentDollar = 0;

    this.custDenar = 0;
    this.custDollar = 0;

    this.blnsDenar = 0;
    this.blnsDollar = 0;

    this.http.list('users', 'branch/list').subscribe(
      (e: any) => {
        this.dataSource = new MatTableDataSource(e);

        this.dataSource.data.forEach((t) => {
          this.loadBranchBalance(t);
        });
        this.dataSource.paginator = this.pagi;
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

  ///  agents

  agentsDisp = ['seq', 'title', 'address', 'phoneNumber', 'initDenar', 'denar'];
  totalDenar = 0;
  dsAgentList: MatTableDataSource<Agent> = new MatTableDataSource();
  getAgentBalance(k: Agent) {
    this.http
      .list('agents', 'agent/ballnce/0/' + k.id + '/' + this.cmYear.id)
      .subscribe((w: any) => {
        k.initDenar = w.initDenar;
        k.initId = w.initId;
        k.denar = w.denar;
      });
  }
  headTxt = '';
  showAgentInfo(row: BranchInfo, group: string) {
    this.caption = 'تفاصيل ارصدة العملاء';
    this.headTxt = 'اسم العميل';
    if (group == 'seller') {
      this.caption = 'تفاصيل ارصدة الموردين';
      this.headTxt = 'اسم البائع';
      row.muwadenSpinner = true;
    } else row.agentSpinner = true;

    this.caption += '  | فرع : ' + row.title;
    this.http
      .list('agents', 'agent/admin/list/' + row.id + '/' + group)
      .subscribe(
        (e: any) => {
          if (group == 'seller') row.muwadenSpinner = false;
          else row.agentSpinner = false;
          this.dsAgentList = new MatTableDataSource(e);
          this.dsAgentList.data.forEach((k) => {
            this.getAgentBalance(k);
          });
          this.selectedIndex = 1;
        },
        () => {
          this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
          if (group == 'seller') row.muwadenSpinner = false;
          else row.agentSpinner = false;
        }
      );
  }

  // rawMaterial

  rwaDispLst = [
    'seq',
    'title',
    'unitTitle',
    'initQuantity',
    'quantity',
    'unitCostPrice',
    'total',
  ];

  dsRawLst: MatTableDataSource<RawMaterialItem> = new MatTableDataSource();
  LoadItemQuantity(item: RawMaterialItem, branchId: number) {
    this.http
      .list(
        'store',
        'rawMaterial/admin/branch/ballnce/' +
          branchId +
          '/' +
          item.id +
          '/' +
          this.cmYear.id
      )
      .subscribe((e: any) => {
        item.quantity = e.quantity;
        item.initQuantity = e.initQuantity;
        item.details = e.details;
        item.initId = e.initId;
        item.unitCostPrice = Math.round(e.unitCostPrice * 100) / 100;
        item.total = e.unitCostPrice * e.quantity;
      });
  }

  ShowRawMaterialInfo(row: BranchInfo) {
    this.caption = 'المواد الاولية';
    this.caption += '  | فرع : ' + row.title;

    row.rawMatSpinner = true;
    this.http.list('store', 'rawMaterial/admin/list/' + row.id).subscribe(
      (e: any) => {
        row.rawMatSpinner = false;
        this.dsRawLst = new MatTableDataSource(e);
        this.dsRawLst.data.forEach((k) => {
          this.LoadItemQuantity(k, row.id);
        });
        this.selectedIndex = 2;
      },
      () => {
        this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
        row.rawMatSpinner = false;
      }
    );
  }

  //  ProductionItems

  prodDispLst = [
    'seq',
    'title',
    'unitTitle',
    'cabsa',
    'quantity',
    'unitCostPrice',
    'total',
  ];
  dsProdLst: MatTableDataSource<ProductionItem> = new MatTableDataSource();
  LoadProdItemQuantity(item: ProductionItem, branchId: number) {
    this.http
      .list(
        'store',
        'productItem/admin/branch/ballnce/' +
          branchId +
          '/' +
          item.id +
          '/' +
          this.cmYear.id
      )
      .subscribe((e: any) => {
        item.quantity = e.quantity;
        item.initQuantity = e.initQuantity;
        item.cabsa = e.cabsa;
        item.initCabsa = e.initCabsa;
        item.details = e.details;
        item.initId = e.initId;
        item.unitCostPrice = Math.round(e.unitCostPrice * 100) / 100;
        item.total = e.unitCostPrice * e.quantity;
      });
  }

  ShowProductionInfo(row: BranchInfo) {
    row.prodSpinner = true;
    this.caption = 'المواد الانتجاية';
    this.caption += '  | فرع : ' + row.title;

    this.http.list('store', 'productItem/admin/list/' + row.id).subscribe(
      (e: any) => {
        row.prodSpinner = false;
        this.dsProdLst = new MatTableDataSource(e);
        this.dsProdLst.data.forEach((k) => {
          this.LoadProdItemQuantity(k, row.id);
        });
        this.selectedIndex = 3;
      },
      () => {
        this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
        row.prodSpinner = false;
      }
    );
  }
}
