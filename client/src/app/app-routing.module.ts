import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Page404Component } from './authentication/page404/page404.component';
import { AuthGuard } from './core/guard/auth.guard';
import { Role } from './core/models/role';
import { AuthLayoutComponent } from './layout/app-layout/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layout/app-layout/main-layout/main-layout.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // { path: '', redirectTo: '/authentication/signin', pathMatch: 'full' },
      {
        path: 'pages',
        canActivate: [AuthGuard],
        data: {
          role: [Role.Admin],
        },
        loadChildren: () =>
          import('./admin/admin.module').then((m) => m.AdminModule),
      },
      {
        path: 'acc',
        canActivate: [AuthGuard],
        data: {
          role: [Role.Accountant],
        },
        loadChildren: () =>
          import('./Accountant/Accountant.module').then(
            (m) => m.AccountantModule
          ),
      },

      {
        path: 'seller',
        canActivate: [AuthGuard],
        data: {
          role: [Role.Seller],
        },
        loadChildren: () =>
          import('./Seller/Seller.module').then((m) => m.SellerModule),
      },
    ],
  },

  {
    path: 'authentication',
    component: AuthLayoutComponent,
    loadChildren: () =>
      import('./authentication/authentication.module').then(
        (m) => m.AuthenticationModule
      ),
  },

  { path: '**', component: Page404Component },
];
@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule],
})
export class AppRoutingModule {
  constructor() { }
}
