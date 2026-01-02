/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { UnsubscribeOnDestroyAdapter } from '@shared/UnsubscribeOnDestroyAdapter';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import { MyHTTP } from '@core/service/myHttp.service';

import { AuthService, Role } from '@core';
import { Branch, CommercialYear } from 'app/admin/admin.model';
import {
  Agent,
  Documents,
  Fatora,
  FatoraItems,
  FixedAssets,
  RawMaterialItem,
} from '../branchAdmin.model';
import { ShowFatoraItemsDialogComponent } from '@shared/components/show-fatora-items/show-fatora-items.component';
import { DomSanitizer } from '@angular/platform-browser';
import { WebcamImage } from 'ngx-webcam';
import { generateId } from '@shared/TableElement';
import { WebcamDialogComponent } from '@shared/components/webcam-dialog/webcam-dialog.component';
import { environment } from 'environments/environment';
import { json } from 'd3';

@Component({
  selector: 'app-purchas-raw-material',
  templateUrl: './purchas-raw-material.component.html',
  styleUrls: ['./purchas-raw-material.component.scss'],
})
export class PurchasRawMaterialComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  dataSource: MatTableDataSource<Fatora> = new MatTableDataSource();
  @ViewChild('pagi') pagi!: MatPaginator;
  @ViewChild('searchKey') searchKey!: any;
  isTablet = false;
  selectedIndex = 0;
  varFatora = {} as Fatora;
  showSpinner = false;

  caption = '';
  displayedColumns = [
    'seq',
    'agentTitle',
    'invoiceDate',
    'invoiceCode',
    'totalCost',
    'paidAmount',
    'items',
    'comments',
    'actions',
  ];
  title = 'إدارة المشتريات ';
  dSItems: MatTableDataSource<FatoraItems> = new MatTableDataSource();

  agentsList: Agent[] = [];
  LoadAgentList() {
    this.http.list('agents', 'agent/list').subscribe((e: any) => {
      this.agentsList = e;
    });
  }

  appApi = 'store';
  appApiURL = 'invoice/';
  cmYear: CommercialYear = {} as CommercialYear;

  constructor(
    private http: MyHTTP,
    private dialog: MatDialog,
    protected sanitizer: DomSanitizer,
    public auth: AuthService,
    private datePipe: DatePipe
  ) {
    super();
  }
  ngOnInit(): void {
    this.LoadAgentList();
    this.auth.getCommercialYear().subscribe((e) => {
      this.cmYear = e;
      if (e.id > 0) {
        this.LoadFatora();
        this.LoadmaterialList();
      }
    });
    if (this.auth.role == Role.StoreKeeper) {
      this.displayedColumns.splice(4, 1);
      this.displayedColumns.splice(4, 1);
      this.disColumnsItems.splice(2, 1);
      this.disColumnsItems.splice(5, 1);
    }
  }

  disColumnsItems = [
    'seq',
    'title',
    'unitPrice',
    'uploadWeight',
    'downloadWeight',
    'quantity',
    'total',
    'actions',
  ];

  agentBalance = 0;
  agentSpiner = false;
  getAgentBalance(id: number) {
    this.agentSpiner = true;
    this.http
      .list('agents', 'agent/ballnce/0/' + id + '/' + this.cmYear.id)
      .subscribe(
        (w: any) => {
          this.agentBalance = w.denar;
          this.agentSpiner = false;
        },
        () => {
          this.agentSpiner = false;
        }
      );
  }
  newAgent = false;
  agentFN(edt: any) {
    if (edt) {
      if (edt.id) {
        this.newAgent = false;
        this.varFatora.agent = edt.id;
        this.varFatora.agentTitle = edt.title;
        this.getAgentBalance(this.varFatora.agent);
      } else {
        this.varFatora.agent = -1;
        this.varFatora.agentTitle = edt;
        this.newAgent = true;
      }
    }
  }

  isValid(ed: Fatora): boolean {
    for (let i = 0; i < ed.items.length; i++) {
      const t = ed.items[i];

      if (t.quantity == 0 || !t.rawMaterial) return true;
    }
    if (this.varFatora.paidAmount == 0) return false;
    if (
      !this.varFatora.paidAmount ||
      this.varFatora.paidAmount == null ||
      this.varFatora.paidAmount.toLocaleString() == ''
    )
      return true;
    return false;
  }

  showAdvanceSearch = false;
  totalPurchese = 0;
  totalPaid = 0;
  updateTotal() {
    this.totalPurchese = 0;
    this.totalPaid = 0;
    this.dataSource.filteredData.forEach((t) => {
      this.totalPurchese += t.totalPrice;
      this.totalPaid += t.paidAmount;
    });
  }

  LoadFatora(jsn: any = { fatoraType: 1 }) {
    this.showSpinner = true;
    this.http.post('agents', 'agent/purchas/list', jsn).subscribe(
      (e: any) => {
        this.dataSource = new MatTableDataSource(e);
        this.dataSource.filterPredicate = (data: Fatora, filter: string) => {
          return JSON.stringify(data).toLowerCase().includes(filter);
        };
        this.updateCountsList();
        this.dataSource.paginator = this.pagi;
        this.showSpinner = false;
        this.updateTotal();
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
      fatoraType: 1,
      dtFrom: this.datePipe.transform(this.dateSearchFrom, 'yyyy-MM-dd'),
      dtTo: this.datePipe.transform(this.dateSearchTo, 'yyyy-MM-dd'),
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.updateCountsList();
    this.updateTotal();
  }

  MatrialFN(edt: any, row: any) {
    if (edt) {
      row.rawMaterial = edt.id;
      row.rawMaterialTitle = edt.title;
    }
  }

  addNewItems() {
    const t = {} as FatoraItems;
    t.quantity = 0;
    t.id = -1;
    t.rawMaterial = -1;
    t.rawMaterialTitle = '';
    t.productItem = -1;
    t.productItemTitle = '';
    t.unitCostPrice = 0;
    t.salePrice = 0;
    t.cabsa = 0;
    this.dSItems.data.push(t);
    this.dSItems._updateChangeSubscription();
  }

  totalInput = 0;
  onChangeRow(ed: any) {
    this.totalInput = 0;
    this.dSItems.data.forEach((t) => {
      let upld = 0,
        dold = 0;
      if (t.downloadWeight) dold = t.downloadWeight;
      if (t.uploadWeight) upld = t.uploadWeight;

      t.quantity = upld - dold;
      this.totalInput += t.quantity * t.unitCostPrice;
    });
    this.varFatora.totalPrice = this.totalInput;
  }

  materialList: RawMaterialItem[] = [];
  LoadmaterialList() {
    this.http.list('store', 'rawMaterial/list').subscribe((e: any) => {
      this.materialList = e;
    });
  }

  addNew() {
    this.totalInput = 0;
    this.varFatora = {} as Fatora;
    this.varFatora.fatoraDate = new Date();
    this.caption = ' تسجيل شراء مواد ';
    this.newAgent = false;
    this.varFatora.paidAmount = 0;
    this.varFatora.documents = [];

    this.varFatora.items = [];
    this.dSItems = new MatTableDataSource(this.varFatora.items);
    this.addNewItems();
    this.selectedIndex = 1;
  }

  editCall(ed: Fatora) {
    this.varFatora = ed;

    this.varFatora.documents.forEach((t) => {
      if (t?.img) {
        t.obj = new UntypedFormControl();
        t.obj.setValue(environment.imgUr + t.img);
      }
    });

    this.dSItems = new MatTableDataSource(this.varFatora.items);
    this.dSItems._updateChangeSubscription();
    this.caption = ' تعديل وصل شراء المواد ';
    this.onChangeRow(ed);
    this.selectedIndex = 1;
  }

  onSubmit() {
    const dt = this.varFatora;
    this.showSpinner = true;
    if (!dt.comments) dt.comments = '';
    if (!dt.id) dt.id = -1;
    dt.fatoraType = 1;
    if (!dt.totalPrice) dt.totalPrice = 0;
    dt.fatoraDate = this.datePipe.transform(dt.fatoraDate, 'yyyy-MM-dd');
    let surl = 'agent/purchas/update';
    if (dt.id == -1) surl = 'agent/purchas/do';

    this.http.create('agents', surl, dt).subscribe(
      (e: any) => {
        if (dt.agent == -1) this.LoadAgentList();
        this.showSpinner = false;
        if (dt.id != -1) {
          const t = this.dataSource.data.findIndex((x) => x.id == e.id);
          this.dataSource.data[t] = Object.assign(e);
        } else this.dataSource.data.push(e);
        this.varFatora.documents.forEach((t) => {
          t.fatora = e.id;
        });
        this.uploadNewPictures(this.varFatora);
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

  resetFromLocalFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    if (fileList[0].type.split('/')[0] !== 'image') {
      this.http.showNotification(
        'snackbar-danger',
        'يرجى اختيار ملف من نوع صورة'
      );
      return;
    }

    this.showImagePreview(fileList[0]);
  }

  showImagePreview(file: File) {
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = () => {
      const showPictureFile = new UntypedFormControl();
      showPictureFile.setValue(
        this.sanitizer.bypassSecurityTrustUrl(reader.result as string)
      );
      const doc = {} as Documents;
      doc.obj = showPictureFile;
      doc.objFile = file;
      if (!this.varFatora.documents) this.varFatora.documents = [];
      this.varFatora.documents.push(doc);
    };
  }

  DataURIToBlob(dataURI: string) {
    const splitDataURI = dataURI.split(',');
    const byteString =
      splitDataURI[0].indexOf('base64') >= 0
        ? atob(splitDataURI[1])
        : decodeURI(splitDataURI[1]);
    const mimeString = splitDataURI[0].split(':')[1].split(';')[0];

    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++)
      ia[i] = byteString.charCodeAt(i);

    return new Blob([ia], { type: mimeString });
  }

  uploadNewPictures(pb: Fatora) {
    pb.documents.forEach((k) => {
      if (!k.id) {
        const fd = new FormData();
        fd.append('fatora', pb.id.toString());
        if (k.objFile) fd.append('img', k.objFile);
        else {
          const file = this.DataURIToBlob(
            k.obj.value.changingThisBreaksApplicationSecurity
          );
          fd.append('img', file, 'image.jpg');
        }
        this.showSpinner = true;
        this.http
          .create('agents', 'fatora/documant/create', fd)
          .subscribe((e: any) => {
            this.showSpinner = false;
            const pbk = this.dataSource.data.find((x) => x.id == pb.id);
            if (pbk) {
              e.obj = k.obj;
              pbk.documents.push(e);
            }
          });
      }
    });
  }

  //////////////////////////  image from camers
  addImageFromWebcam() {
    const dialogRef = this.dialog.open(WebcamDialogComponent, {
      autoFocus: true,
    });
    dialogRef.afterClosed().subscribe((webcamImage: WebcamImage) => {
      if (webcamImage) {
        // this.uploadImg = true;
        const newFile = this.returnFileFromWebcam(webcamImage);
        // this.groupForm!.get('img')!.setValue(newFile);
        this.showImagePreview(newFile);
      }
    });
  }
  returnFileFromWebcam(webcam: WebcamImage): File {
    const imageName = generateId(12) + '.png';
    const imageBlob = this.dataURItoBlob(webcam.imageAsBase64);
    return new File([imageBlob], imageName, { type: 'image/png' });
  }
  dataURItoBlob(dataURI: any) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/png' });
    return blob;
  }
  removeResetPicture(i: number) {
    if (this.varFatora.documents[i].id) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        height: '200px',
        width: '300px',
        data: {
          txt: 'هل انت متأكد من حذف الصورة   ؟',
          title: 'سيتم حذف هذه الصورة بشكل كامل ',
        },
        direction: 'rtl',
      });
      this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
        if (result === 1) {
          this.http
            .delete(
              'agents',
              'fatora/documant/edit',
              this.varFatora.documents[i]
            )
            .subscribe(() => {
              this.varFatora.documents.splice(i, 1);
            });
        }
      });
    } else this.varFatora.documents.splice(i, 1);
  }

  ///////////////////////////
  imgClick(x: any) {
    window.open(x.img);
  }
  deleteFatoraItem(i: number, row: any) {
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
            .delete('agents', 'agent/purchas/item/edit', row)
            .subscribe((e: any) => {
              this.dSItems.data.splice(i, 1);
              this.dSItems._updateChangeSubscription();
              this.onChangeRow(e);
            });
        } else {
          this.dSItems.data.splice(i, 1);
          this.dSItems._updateChangeSubscription();
        }
      }
    });
  }

  deleteItem(i: number, row: Fatora) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      height: '200px',
      width: '300px',
      data: { txt: 'هل انت متأكد من حذف  ؟', title: row.agentTitle },
      direction: 'rtl',
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        this.http.delete('agents', 'agent/purchas/edit', row).subscribe(
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

  showInfo(row: Fatora) {
    const dialogRef = this.dialog.open(ShowFatoraItemsDialogComponent, {
      height: 'auto',
      width: '650px',
      data: row,
      direction: 'rtl',
    });
    this.subs.sink = dialogRef.afterClosed().subscribe();
  }
  countsList: FixedAssets[] = [];
  updateCountsList() {
    this.countsList = [];
    this.dataSource.filteredData.forEach((f) => {
      f.items.forEach((i) => {
        {
          const idx = this.countsList.findIndex((x) => x.id == i.rawMaterial);
          if (idx > -1) {
            this.countsList[idx].quantity += i.quantity;
            this.countsList[idx].price += i.unitCostPrice * i.quantity;
          } else {
            const itm = {} as FixedAssets;
            itm.id = i.rawMaterial;
            itm.title = i.rawMaterialTitle;
            itm.quantity = i.quantity;
            itm.price = i.unitCostPrice * i.quantity;
            this.countsList.push(itm);
          }
        }
      });
    });
  }
}
