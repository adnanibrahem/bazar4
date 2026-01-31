/* eslint-disable @angular-eslint/prefer-standalone */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router, NavigationEnd } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  HostListener,
  OnDestroy,
  inject,
} from '@angular/core';
import { SideMenuRouts } from './sidebar-items';
import { AuthService, Role } from '@core';
import { RouteInfo } from './sidebar.metadata';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: false,
})
export class SidebarComponent implements OnInit, OnDestroy {
  private document = inject<Document>(DOCUMENT);
  private renderer = inject(Renderer2);
  elementRef = inject(ElementRef);
  private authService = inject(AuthService);
  private router = inject(Router);

  public sidebarItems!: RouteInfo[];
  public innerHeight?: number;
  public bodyTag!: HTMLElement;
  listMaxHeight?: string;
  listMaxWidth?: string;
  userFullName?: string;
  userImg?: string;
  userType?: string = '_____';
  branchTitle = '';
  headerHeight = 60;
  currentRoute?: string;
  routerObj;
  constructor() {
    this.elementRef.nativeElement.closest('body');
    this.routerObj = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // close sidebar on mobile screen after menu select
        this.renderer.removeClass(this.document.body, 'overlay-open');
      }
    });
  }
  @HostListener('window:resize', ['$event'])
  windowResizecall(event?: Event) {
    this.setMenuHeight();
    this.checkStatuForResize(false);
  }
  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.renderer.removeClass(this.document.body, 'overlay-open');
    }
  }
  callToggleMenu(event: Event, length: number) {
    if (length > 0) {
      const parentElement = (event.target as HTMLInputElement).closest('li');
      const activeClass = parentElement?.classList.contains('active');

      if (activeClass) {
        this.renderer.removeClass(parentElement, 'active');
      } else {
        this.renderer.addClass(parentElement, 'active');
      }
    }
  }

  ngOnInit() {
    SideMenuRouts.sort((a, b) => (a.index > b.index ? 1 : -1));
    if (this.authService.currentUserValue) {
      const curUser = this.authService.currentUserValue;
      const userRole = this.authService.currentUserValue.role;

      this.userFullName = '-----';
      if (this.authService.currentUserValue.role == 'admin')
        this.userFullName = 'مدير النظام';

      if (this.authService.currentUserValue.role == 'store')
        this.userFullName = 'مسؤول مخزن';
      if (this.authService.currentUserValue.role == 'accountant')
        this.userFullName = 'محاسب ';
      if (this.authService.currentUserValue.role == 'seller')
        this.userFullName = 'مسؤول مبيعات ';
      if (this.authService.currentUserValue.role == 'agent')
        this.userFullName = 'عميل ';
      this.branchTitle = this.authService.currentUserValue.branchTitle;


      this.userImg = 'assets/images/admin.jpg';
      if (this.authService.currentUserValue.img)
        this.userImg = this.authService.currentUserValue.img;

      SideMenuRouts.forEach((t) => {
        const urlTaq = t.path.split('/')[2];
      });

      if (curUser.isActive) {
        const x = SideMenuRouts.find((x) => x.path == '/pages/users/');
        if (x) x.selected = true;
        SideMenuRouts[0].selected = true;
      } else {
        const x = SideMenuRouts.find((x) => x.path == '/pages/users/');
        if (x) x.selected = false;
      }

      this.sidebarItems = SideMenuRouts.filter(
        // (x) => x.selected;
        (x) => x.role.indexOf(userRole) !== -1 || x.role.indexOf('All') !== -1
      );
    }

    // this.sidebarItems = ROUTES.filter((sidebarItem) => sidebarItem);
    this.initLeftSidebar();
    this.bodyTag = this.document.body;
  }
  ngOnDestroy() {
    this.routerObj.unsubscribe();
  }
  initLeftSidebar() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    // Set menu height
    _this.setMenuHeight();
    _this.checkStatuForResize(true);
  }
  setMenuHeight() {
    this.innerHeight = window.innerHeight;
    const height = this.innerHeight - this.headerHeight;
    this.listMaxHeight = height + '';
    this.listMaxWidth = '500px';
  }
  isOpen() {
    return this.bodyTag.classList.contains('overlay-open');
  }
  checkStatuForResize(firstTime: boolean) {
    if (window.innerWidth < 1025) {
      this.renderer.addClass(this.document.body, 'ls-closed');
    } else {
      this.renderer.removeClass(this.document.body, 'ls-closed');
    }
  }
  mouseHover() {
    const body = this.elementRef.nativeElement.closest('body');
    if (body.classList.contains('submenu-closed')) {
      this.renderer.addClass(this.document.body, 'side-closed-hover');
      this.renderer.removeClass(this.document.body, 'submenu-closed');
    }
  }
  mouseOut() {
    const body = this.elementRef.nativeElement.closest('body');
    if (body.classList.contains('side-closed-hover')) {
      this.renderer.removeClass(this.document.body, 'side-closed-hover');
      this.renderer.addClass(this.document.body, 'submenu-closed');
    }
  }
  logout() {
    this.authService.logout().subscribe((res) => {
      if (!res.success) {
        this.router.navigate(['/authentication/signin']);
      }
    });
  }
}
