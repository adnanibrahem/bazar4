/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';

import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MyHTTP {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  sacnFromOptical(app: string, path: string) {
    return this.http.get(`${app}/${path}/`);
  }

  list(app: string, path: string) {
    return this.http.get(`${environment.apiUrl}${app}/${path}/`);
  }

  post(app: string, path: string, data: any) {
    return this.http.post(`${environment.apiUrl}${app}/${path}/`, data);
  }

  create(app: string, path: string, data: any) {
    return this.http.post(`${environment.apiUrl}${app}/${path}/`, data);
  }

  update(app: string, path: string, data: any) {
    let id = data.id;
    if (!id) id = data.get('id');
    return this.http.put(
      `${environment.apiUrl}${app}/${path}/` + id + '/',
      data
    );
  }

  updateId(app: string, path: string, data: any, id: number) {
    return this.http.put(
      `${environment.apiUrl}${app}/${path}/` + id + '/',
      data
    );
  }

  delete(app: string, path: string, data: any) {
    return this.http.delete(
      `${environment.apiUrl}${app}/${path}/` + data.id + '/'
    );
  }

  showNotification(
    colorName: string,
    text: string,
    placementFrom: MatSnackBarVerticalPosition = 'top',
    placementAlign: MatSnackBarHorizontalPosition = 'left'
  ) {
    this.snackBar.open(text, '', {
      duration: 2000,
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: ['my-snackbar', colorName],
    });
  }
}
