import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user';
import { environment } from 'environments/environment';
import * as CryptoJS from 'crypto-js';
import { CommercialYear } from 'app/admin/admin.model';
import { Role } from '@core/models/role';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  dkeey = 'c+t6l2g*_fpwjg_mq+bhy9gox(49r6td1_j1wo6f(2$sr#++jm';
  public currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  public currentCommpercialYear: Observable<CommercialYear>;
  public currentCommpercialYearSubject: BehaviorSubject<CommercialYear>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(
        this.decrypt(localStorage.getItem('currentUser') || '') || '{}'
      )
    );
    this.currentUser = this.currentUserSubject.asObservable();

    this.currentCommpercialYearSubject = new BehaviorSubject<CommercialYear>({
      id: -1,
      title: '',
    });
    this.currentCommpercialYear =
      this.currentCommpercialYearSubject.asObservable();
  }

  public encrypt(txt: string): string {
    return CryptoJS.AES.encrypt(txt, this.dkeey).toString();
  }

  private decrypt(txtToDecrypt: string) {
    return CryptoJS.AES.decrypt(txtToDecrypt, this.dkeey).toString(
      CryptoJS.enc.Utf8
    );
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  public get role(): Role {
    return this.currentUserSubject.value.role;
  }

  public setCurrentUserValue(v: User) {
    localStorage.setItem('currentUser', this.encrypt(JSON.stringify(v)));
    this.currentUserSubject.next(v);
  }

  public setCommercialYear(v: CommercialYear) {
    this.currentCommpercialYearSubject.next(v);
  }
  public getCommercialYear() {
    return this.currentCommpercialYear;
  }

  login(username: string, password: string) {
    return this.http
      .post<User>(`${environment.apiUrl}auth/token/`, {
        username,
        password,
      })
      .pipe(
        map((user) => {
          const rTest = /^(?=.*[A-Z])(?=.*[W])(?=.*[0-9])(?=.*[a-z]).{8,128}$/;

          const tUser = {} as User;
          tUser.token = user.token;
          tUser.validPasswprd = rTest.test(password);
          localStorage.setItem(
            'currentUser',
            this.encrypt(JSON.stringify(user))
          );

          this.currentUserSubject.next(user);
          return user;
        })
      );
  }

  getInfo() {
    return this.http.get<User>(`${environment.apiUrl}users/info/`);
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(this.currentUserValue);
    return of({ success: false });
  }
}
