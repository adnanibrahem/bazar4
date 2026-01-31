/* eslint-disable @angular-eslint/prefer-standalone */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm.component';
import { UnsubscribeOnDestroyAdapter } from '@shared/UnsubscribeOnDestroyAdapter';
import { MyHTTP } from '@core/service/myHttp.service';
import { Fatora, FatoraItems } from 'app/Accountant/Accountant.model';
import { FatoraStuts } from '@core/models/role';

@Component({
    selector: 'app-sent',
    templateUrl: './sent.component.html',
    styleUrls: ['./sent.component.scss'],
    standalone: false
})
export class SentComponent
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

    // Pagination properties
    resultsLength = 0;
    pageSize = 10;
    pageIndex = 0;

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
    title = 'الطلبات المرسلة';
    //
    appApi = 'agents';
    appApiURL = 'seller/fatora/';
    ngOnInit(): void {
        this.LoadFawater(this.pageIndex, this.pageSize, '');
    }

    updateTotal(k: Fatora) {
        k.totalPrice = 0;
        k.showSendButton = false;
        k.items.forEach((w) => {
            if (!w.deleted) k.totalPrice += w.quantity * w.unitPrice;
            if (w.status === 1) k.showSendButton = true;
        });
        // For Sent component, likely showSendButton will be false anyway based on status
    }
    LoadFawater(pageIndex: number, pageSize: number, search: string = '') {
        this.showSpinner = true;
        // API expects 1-based page index
        const page = pageIndex + 1;
        this.http.list(this.appApi, this.appApiURL + `sent/list/?page=${page}&page_size=${pageSize}&search=${search}`).subscribe(
            (response: any) => {
                // Handle paginated response { count: number, results: any[] }
                const data = response.results || [];
                this.resultsLength = response.count || 0;

                this.dataSource = new MatTableDataSource(data);
                this.dataSource.data.forEach((k) => {
                    this.updateTotal(k);
                    k.items.forEach((w) => {
                        w.statusTitle = FatoraStuts(w.status);
                    });
                });

                // Do NOT assign this.dataSource.paginator = this.pagi; 
                // because we are doing server-side pagination.

                this.showSpinner = false;
                this.dataSource._updateChangeSubscription();
            },
            () => {
                this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
                this.showSpinner = false;
            },
        );
    }

    onPageChanged(event: PageEvent) {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.LoadFawater(this.pageIndex, this.pageSize);
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        setTimeout(() => {
            this.pageIndex = 0;
            this.LoadFawater(this.pageIndex, this.pageSize, filterValue.trim().toLowerCase());
        });
    }

    currFatora: Fatora = {} as Fatora;

    // SendToChina removed as it is for sent items

    editCall(ed: Fatora) {
        this.currFatora = ed;
        this.currFatora.items.forEach((x) => {
            x.deleted = false;
        });

        this.caption = ' تفاصيل فاتورة رقم :  ' + ed.id; // Changed to details instead of edit
        this.selectedIndex = 1;
    }

    // onSubmit removed or disabled? User said "cannot be modified", so maybe no submit.
    // But keeping it if they want to update description locally? No, "لايمكن التعديل عليه نهائيا".
    // So I won't call onSubmit. But I'll keep the method just in case or remove it.
    onSubmit() {
        // Disabled functionality
    }

    deleteFatora(i: number, row: Fatora) {
        // Usually sent invoices cannot be deleted easily, but if logic allows...
        // Keeping logic but maybe UI hides the button.
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
        // Disabled in UI
    }
}
