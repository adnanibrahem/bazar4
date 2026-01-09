import { DOCUMENT } from '@angular/common';
import {
  Component,
  Inject,
  ElementRef,
  OnInit,
  Renderer2,
} from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService } from '@config';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { LanguageService, InConfiguration, AuthService } from '@core';

import { MatDialog } from '@angular/material/dialog';
import { PersonalInfoDialogComponent } from './personal-info-dialog/personal-info-dialog.component';
import { MyHTTP } from '@core/service/myHttp.service';
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component';
import { CommercialYear } from 'app/admin/admin.model';
import { BalanceMigrationDialogComponent } from '@shared/components/balance-migration/balance-migration-dialog.component';
import { FeatherIconsModule } from '@shared/components/feather-icons/feather-icons.module';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false
})
export class HeaderComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit {
  public config!: InConfiguration;

  curYear = 1;
  CommercialYearList: CommercialYear[] = [];

  homePage?: string;
  isNavbarCollapsed = true;
  flagvalue: string | string[] | undefined;
  countryName: string | string[] = [];
  langStoreValue?: string;
  defaultFlag?: string;
  isOpenSidebar?: boolean;
  docElement?: HTMLElement;
  isFullScreen = false;
  isDarkSidebar = false;
  selectedBgColor = 'white';
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public elementRef: ElementRef,
    private configService: ConfigService,
    public dialog: MatDialog,
    private authService: AuthService,
    private http: MyHTTP,
    private router: Router,
    public languageService: LanguageService
  ) {
    super();
  }

  loadCommercialYear() {
    this.http.list('users', 'commercialYear/list').subscribe((e: any) => {
      this.CommercialYearList = e;
      this.curYear = e[0].id;
      this.authService.setCommercialYear(e[0]);
    });
  }

  noteCount = '';

  userImg = 'assets/images/admin.jpg';
  userFullName = '';
  branchTitle = '';

  onThemeClick() {
    if (this.theme == 'light') this.theme = 'dark';
    else this.theme = 'light';

    localStorage.setItem('theme', this.theme);
    if (this.theme == 'light') this.lightThemeBtnClick();
    else this.darkThemeBtnClick();
  }
  theme = '';

  OnSelectCommercialYear(event: any) {
    const t = this.CommercialYearList.find((x) => x.id == event);
    if (t) this.authService.setCommercialYear(t);
  }
  privilege = '';
  ngOnInit() {
    this.loadCommercialYear();
    this.theme = localStorage.getItem('theme') || 'light';
    this.config = this.configService.configData;
    const userRole = this.authService.currentUserValue.role;
    this.userFullName = this.authService.currentUserValue.firstName;
    this.branchTitle = this.authService.currentUserValue.branchTitle;
    this.privilege = this.authService.currentUserValue.privilege;

    if (this.authService.currentUserValue.img != undefined) {
      this.userImg = this.authService.currentUserValue.img;
    }

    this.docElement = document.documentElement;

    if (userRole === 'Admin') {
      this.homePage = 'pages/';
    }

    this.langStoreValue = localStorage.getItem('lang') as string;
  }

  BalanceMigration() {
    const dialogRef = this.dialog.open(BalanceMigrationDialogComponent, {
      height: '550px',
      width: '550px',
      data: {},
      direction: 'rtl',
    });
    this.subs.sink = dialogRef.afterClosed().subscribe(() => { });
  }

  callFullscreen() {
    if (!this.isFullScreen) {
      if (this.docElement?.requestFullscreen != null) {
        this.docElement?.requestFullscreen();
      }
    } else {
      document.exitFullscreen();
    }
    this.isFullScreen = !this.isFullScreen;
  }
  setLanguage(text: string, lang: string, flag: string) {
    this.countryName = text;
    this.flagvalue = flag;
    this.langStoreValue = lang;
    this.languageService.setLanguage(lang);
  }
  mobileMenuSidebarOpen(event: Event, className: string) {
    const hasClass = (event.target as HTMLInputElement).classList.contains(
      className
    );
    if (hasClass) {
      this.renderer.removeClass(this.document.body, className);
    } else {
      this.renderer.addClass(this.document.body, className);
    }
  }
  callSidemenuCollapse() {
    const hasClass = this.document.body.classList.contains('side-closed');
    if (hasClass) {
      this.renderer.removeClass(this.document.body, 'side-closed');
      this.renderer.removeClass(this.document.body, 'submenu-closed');
      localStorage.setItem('collapsed_menu', 'false');
    } else {
      this.renderer.addClass(this.document.body, 'side-closed');
      this.renderer.addClass(this.document.body, 'submenu-closed');
      localStorage.setItem('collapsed_menu', 'true');
    }
  }
  logout() {
    this.subs.sink = this.authService.logout().subscribe((res) => {
      if (!res.success) {
        this.router.navigate(['/authentication/signin']);
      }
    });
  }

  changePassword() {
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      height: '600px',
      width: '550px',
      data: {},
      direction: 'rtl',
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.http.post('users', 'makechangePlus', result).subscribe(
          (e: any) => {
            if (e) {
              const user = this.authService.currentUserValue;
              user.validPasswprd = true;
              localStorage.setItem(
                'currentUser',
                this.authService.encrypt(JSON.stringify(user))
              );

              this.authService.currentUserSubject.next(user);

              this.http.showNotification(
                'snackbar-success',
                'تم التغيير بنجاح'
              );
            }
          },
          () => {
            this.http.showNotification('snackbar-danger', 'حدثت مشكلة ');
          }
        );
      }
    });
  }

  personalInfo() {
    const dialogRef = this.dialog.open(PersonalInfoDialogComponent, {
      height: '600px',
      width: '550px',
      data: {},
      direction: 'rtl',
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const fd = new FormData();
        fd.append('phoneNumber', result.phoneNumber);
        fd.append('id', result.id);
        fd.append('auth', result.auth);
        fd.append('username', result.username);
        fd.append('firstName', result.firstName);

        if (result.img)
          if (result.img instanceof File) fd.append('img', result.img);
        this.http.update('users', 'edit', fd).subscribe((e: any) => {
          const usr = this.authService.currentUserValue;
          usr.img = e.img;
          usr.phoneNumber = e.phoneNumber;
          this.authService.setCurrentUserValue(usr);
          this.userImg = e!.img;
        });
      }
    });
  }

  lightThemeBtnClick() {
    this.renderer.removeClass(this.document.body, 'dark');
    this.renderer.removeClass(this.document.body, 'submenu-closed');
    this.renderer.removeClass(this.document.body, 'menu_dark');
    this.renderer.removeClass(this.document.body, 'logo-black');
    if (localStorage.getItem('choose_skin')) {
      this.renderer.removeClass(
        this.document.body,
        localStorage.getItem('choose_skin') as string
      );
    } else {
      this.renderer.removeClass(
        this.document.body,
        'theme-' + this.config.layout.theme_color
      );
    }

    this.renderer.addClass(this.document.body, 'light');
    this.renderer.addClass(this.document.body, 'submenu-closed');
    this.renderer.addClass(this.document.body, 'menu_light');
    this.renderer.addClass(this.document.body, 'logo-white');
    this.renderer.addClass(this.document.body, 'theme-white');
    const theme = 'light';
    const menuOption = 'menu_light';
    this.selectedBgColor = 'white';
    this.isDarkSidebar = false;
    localStorage.setItem('choose_logoheader', 'logo-white');
    localStorage.setItem('choose_skin', 'theme-white');
    localStorage.setItem('theme', theme);
    localStorage.setItem('menuOption', menuOption);
  }
  darkThemeBtnClick() {
    this.renderer.removeClass(this.document.body, 'light');
    this.renderer.removeClass(this.document.body, 'submenu-closed');
    this.renderer.removeClass(this.document.body, 'menu_light');
    this.renderer.removeClass(this.document.body, 'logo-white');
    if (localStorage.getItem('choose_skin')) {
      this.renderer.removeClass(
        this.document.body,
        localStorage.getItem('choose_skin') as string
      );
    } else {
      this.renderer.removeClass(
        this.document.body,
        'theme-' + this.config.layout.theme_color
      );
    }
    this.renderer.addClass(this.document.body, 'dark');
    this.renderer.addClass(this.document.body, 'submenu-closed');
    this.renderer.addClass(this.document.body, 'menu_dark');
    this.renderer.addClass(this.document.body, 'logo-black');
    this.renderer.addClass(this.document.body, 'theme-black');
    const theme = 'dark';
    const menuOption = 'menu_dark';
    this.selectedBgColor = 'black';
    this.isDarkSidebar = true;
    localStorage.setItem('choose_logoheader', 'logo-black');
    localStorage.setItem('choose_skin', 'theme-black');
    localStorage.setItem('theme', theme);
    localStorage.setItem('menuOption', menuOption);
  }
}
