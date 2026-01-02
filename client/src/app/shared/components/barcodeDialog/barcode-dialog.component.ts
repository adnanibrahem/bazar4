import { Component, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-barcode-dialog',
  templateUrl: './barcode-dialog.component.html',
  styleUrls: ['./barcode-dialog.component.scss'],
})
export class BarcodeDialogComponent {
  availableDevices: MediaDeviceInfo[] = [];
  currentDevice: MediaDeviceInfo = {} as MediaDeviceInfo;
  hasDevices: boolean = true;
  hasPermission: boolean = true;
  qrResultString: string = '';
  torchEnabled = false;
  torchAvailable$ = new BehaviorSubject<boolean>(false);
  tryHarder = false;
  allowedFormats = [
    BarcodeFormat.QR_CODE,
    BarcodeFormat.EAN_13,
    BarcodeFormat.CODE_128,
    BarcodeFormat.DATA_MATRIX /*, ...*/,
  ];

  constructor(
    public dialogRef: MatDialogRef<BarcodeDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: string
  ) {}
  onNoClick(): void {
    this.dialogRef.close();
  }
  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    this.hasDevices = Boolean(devices && devices.length);
  }
  onHasPermission(has: boolean) {
    this.hasPermission = has;
  }
  onCodeResult(resultString: string) {
    this.dialogRef.close(resultString);
  }
  onDeviceSelectChange(selected: string) {
    const device = this.availableDevices.find((x) => x.deviceId === selected);

    if (device) this.currentDevice = device;
  }
  onTorchCompatible(isCompatible: boolean): void {
    this.torchAvailable$.next(isCompatible || false);
  }
}
