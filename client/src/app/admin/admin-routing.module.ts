/* eslint-disable @typescript-eslint/no-unused-vars */
import { NgModule, inject } from '@angular/core';
import { Routes, RouterModule, ROUTES } from '@angular/router';

import { AuthService } from '@core/service/auth.service';
import { SideMenuRouts } from 'app/layout/sidebar/sidebar-items';
import { UsersComponent } from './Users/users.component';
import { BrancheComponent } from './Branche/branche.component';
import { BoxBranchesComponent } from './boxBranches/boxBranches.component';
import { ProfitComponent } from './Profits/profit.component';

const allRoutes: Routes = [
  { path: 'branch', component: BrancheComponent },
  { path: 'users', component: UsersComponent },
  { path: 'balances', component: BoxBranchesComponent },
  { path: 'profits', component: ProfitComponent },
];

@NgModule({
  imports: [RouterModule.forChild(allRoutes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
