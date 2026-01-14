/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-types */
import { Component, ElementRef, HostListener, Input, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FileUploadComponent,
      multi: true,
    },
  ],
  styleUrls: ['./file-upload.component.scss'],
  standalone: false
})
export class FileUploadComponent implements ControlValueAccessor {
  private host = inject<ElementRef<HTMLInputElement>>(ElementRef);

  onChange!: Function;
  public file: File | null = null;

  @HostListener('change', ['$event']) emitFiles(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files && target.files.item(0);
    if (file) {
      this.onChange(file);
      this.file = file;
    }
  }

  writeValue(value: null) {
    // clear file input
    this.host.nativeElement.value = '';
    this.file = null;
  }

  registerOnChange(fn: Function) {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function) {
    // add code here
  }
}
