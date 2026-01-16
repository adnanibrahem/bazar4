/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { UnsubscribeOnDestroyAdapter } from '@shared/UnsubscribeOnDestroyAdapter';
import { UntypedFormBuilder } from '@angular/forms';
import { MyHTTP } from '@core/service/myHttp.service';
import { User } from '@core/models/user';
// import { SideMenuRouts } from 'app/layout/sidebar/sidebar-items';
import { AuthService } from '@core';
import { Branch } from '../admin.model';

class tmpUser {
  id!: number;
  username!: string;
  firstName!: string;
  phoneNumber!: string;
  privilege!: string;
  privilegeDic!: string;
}

import { SharedModule } from '@shared/shared.module';
import { ComponentsModule } from '@shared/components/components.module';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  standalone: true,
  imports: [SharedModule, ComponentsModule],
})
export class UsersComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  private http = inject(MyHTTP);
  private fb = inject(UntypedFormBuilder);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private datePipe = inject(DatePipe);

  dataSource: MatTableDataSource<User> = new MatTableDataSource();
  @ViewChild('pagi') pagi!: MatPaginator;
  isTablet = false;
  selectedIndex = 0;

  showSpinner = false;
  gFormGroup!: tmpUser;
  caption = '';

  displayedColumns = [
    'seq',
    'username',
    'firstName',
    'phoneNumber',
    'privilege',
    'branchTitle',
    'actions',
  ];
  title = 'المستخدمين';
  newFormGroup(): tmpUser {
    return {
      id: -1,
      username: '',
      firstName: '',
      phoneNumber: '',
      privilege: '',
      privilegeDic: '',
    };
  }

  cloneFormGroup(dt: User): tmpUser {
    return {
      id: dt.id,
      username: dt.username,
      firstName: dt.firstName,
      phoneNumber: dt.phoneNumber,
      privilege: dt.privilege,
      privilegeDic: '',
    };
  }
  //
  permissionList = [
    { id: 1, title: 'كل الصلاحيات' },
    { id: 2, title: 'اضافة فقط' },
    { id: 3, title: 'قراءة فقط' },
  ];
  appApi = 'users';
  appApiURL = '';
  constructor() {
    super();
  }

  branchesList: Branch[] = [];
  LoadBranche() {
    this.http.list('agents', 'branch/list').subscribe(
      (e: any) => {
        this.branchesList = e;
      },
      () => {
        this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
      }
    );
  }

  ngOnInit(): void {
    this.gFormGroup = this.newFormGroup();
    this.LoadUser();
    this.LoadBranche();
  }

  getPrivilegeDic(privilege: string): string {
    if (privilege == 'admin') return 'ادمن';
    if (privilege == 'seller') return 'مسؤول مبيعات';
    if (privilege == 'accountant') return 'محاسب';
    if (privilege == 'store') return 'مسؤول مخزن';
    return '';
  }

  LoadUser() {
    this.showSpinner = true;
    this.http.list(this.appApi, this.appApiURL + 'list').subscribe(
      (e: any) => {
        e.forEach((t: any) => {
          t.privilegeDic = this.getPrivilegeDic(t.privilege);
        });
        this.dataSource = new MatTableDataSource(e);

        this.dataSource.filterPredicate = (data: any, filter: string) => {
          const dataStr = JSON.stringify(data).toLowerCase();
          const arr = filter.split(' ');
          for (let i = 0; i < arr.length; i++)
            if (dataStr.indexOf(arr[i]) == -1) return false;
          return true;
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
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  curUser: User = {} as User;

  addNew() {
    this.curUser = {} as User;
    this.gFormGroup = this.newFormGroup();
    this.caption = ' تسجيل متستخدم جديد ';
    this.selectedIndex = 1;
  }

  resetPassword() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: '220px',
      width: '450px',
      data: {
        txt:
          '  هل انت متأكد من تغيير كلمة المرور للمستخدم ' +
          this.curUser.firstName +
          ' وجعلها 12345 ؟ ',
        title: 'تصفير كلمة المرور',
      },
      direction: 'rtl',
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        this.http
          .post(this.appApi, 'makechange', { id: this.curUser.auth })
          .subscribe(
            (e: any) => {
              if (e)
                this.http.showNotification(
                  'snackbar-success',
                  'تم التغيير بنجاح'
                );
              this.showSpinner = false;
            },
            () => {
              this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
              this.showSpinner = false;
            }
          );
      }
    });
  }

  disableAllUser() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: '220px',
      width: '450px',
      data: {
        txt: `  هل انت متأكد من تعطيل كافة الحسابات  `,
        title: 'تعطيل الحسابات',
      },
      direction: 'rtl',
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        this.dataSource.data.forEach((t) => {
          if (t.auth != this.authService.currentUserValue.auth) {
            this.http
              .post(this.appApi, 'userStatus', {
                id: t.auth,
                status: false,
              })
              .subscribe(
                (e: any) => {
                  if (e) {
                    t.enable = false;
                  }
                  this.showSpinner = false;
                },
                () => {
                  this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
                  this.showSpinner = false;
                }
              );
          }
        });
      }
    });
  }

  disableEnableUser() {
    let txt = ' تمكين ';
    if (this.curUser.enable) txt = ' تعطيل ';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: '220px',
      width: '450px',
      data: {
        txt:
          `  هل انت متأكد من  ${txt}  الحساب للمستخدم ` +
          this.curUser.firstName,
        title: txt,
      },
      direction: 'rtl',
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        this.http
          .post(this.appApi, 'userStatus', {
            id: this.curUser.auth,
            status: !this.curUser.enable,
          })
          .subscribe(
            (e: any) => {
              if (e) {
                this.curUser.enable = !this.curUser.enable;
                this.http.showNotification(
                  'snackbar-success',
                  'تم التغيير بنجاح'
                );
              }

              this.showSpinner = false;
            },
            () => {
              this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
              this.showSpinner = false;
            }
          );
      }
    });
  }

  editCall(ed: User) {
    this.curUser = ed;
    this.gFormGroup = this.cloneFormGroup(ed);
    this.caption = ' تعديل بياتات المستخدم: ' + ed.firstName;
    this.selectedIndex = 1;
  }

  onSubmit() {
    const dt = this.curUser;

    const fd = new FormData();
    const kk = Object.entries(this.curUser);
    kk.forEach((kr) => {
      if (kr[0] != 'img') {
        if (kr[1] == 'null') fd.append(kr[0], '');
        else fd.append(kr[0], kr[1]);
      }
    });

    this.showSpinner = true;
    if (dt.id) {
      this.http.update(this.appApi, this.appApiURL + 'edit', fd).subscribe(
        (e: any) => {
          e.privilegeDic = this.getPrivilegeDic(e.privilege);
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
      this.http.create(this.appApi, this.appApiURL + 'create', fd).subscribe(
        (e: any) => {
          this.showSpinner = false;
          e.privilegeDic = this.getPrivilegeDic(e.privilege);

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

  deleteItem(i: number, row: User) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: '200px',
      width: '300px',
      data: { txt: 'هل انت متأكد من حذف  ؟', title: row.firstName },
      direction: 'rtl',
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        this.http
          .delete(this.appApi, this.appApiURL + 'rud', row)
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
  showInfo(row: User) {
    console.log(row);
  }
}
