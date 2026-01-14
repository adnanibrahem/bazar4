/* eslint-disable @typescript-eslint/no-unused-vars */
import { NgModule, inject } from '@angular/core';
import { Routes, RouterModule, ROUTES } from '@angular/router';

import { UsersComponent } from './Users/users.component';
import { BrancheComponent } from './Branche/branche.component';

const allRoutes: Routes = [
  { path: 'branch', component: BrancheComponent },
  { path: 'users', component: UsersComponent },
];

@NgModule({
  imports: [RouterModule.forChild(allRoutes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
