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
import { Category } from '../Accountant.model';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
  standalone: false,
})
export class CategoryComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  private http = inject(MyHTTP);
  private fb = inject(UntypedFormBuilder);
  private dialog = inject(MatDialog);
  private datePipe = inject(DatePipe);

  dataSource: MatTableDataSource<Category> = new MatTableDataSource();
  @ViewChild('pagi') pagi!: MatPaginator;
  isTablet = false;
  selectedIndex = 0;
  varCategory = {} as Category;
  showSpinner = false;
  gFormGroup!: UntypedFormGroup;
  caption = '';
  displayedColumns = ['seq', 'title', 'inProfit', 'actions'];
  title = 'تبويب المصارف ';
  newFormGroup(): UntypedFormGroup {
    return this.fb.group({
      id: [],
      title: [],
      branch: [],
      inProfit: [],
    });
  }
  cloneFormGroup(dt: Category): UntypedFormGroup {
    return this.fb.group({
      id: [dt.id],
      title: [dt.title],
      inProfit: [dt.inProfit],
      branch: [dt.branch],
    });
  }

  appApi = 'box';
  appApiURL = 'category/';
  ngOnInit(): void {
    this.gFormGroup = this.newFormGroup();
    this.LoadCategory();
  }
  LoadCategory() {
    this.showSpinner = true;
    this.http.list(this.appApi, this.appApiURL + 'list').subscribe(
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
    this.gFormGroup = this.newFormGroup();
    this.caption = ' تسجيل تبويب جديد ';
    this.selectedIndex = 1;
  }
  editCall(ed: Category) {
    this.gFormGroup = this.cloneFormGroup(ed);
    this.caption = ' تعديل بيانات تبويب ';
    this.selectedIndex = 1;
  }
  onSubmit() {
    const dt = this.gFormGroup.getRawValue();
    this.showSpinner = true;
    dt.deleted = false;
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
  deleteItem(i: number, row: Category) {
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
  showInfo(row: Category) {
    console.log(row);
  }
}
