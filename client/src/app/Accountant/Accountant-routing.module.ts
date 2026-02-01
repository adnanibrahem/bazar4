/* eslint-disable @typescript-eslint/no-unused-vars */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CategoryComponent } from './Category/category.component';
import { BoxTransactionComponent } from './BoxTransaction/boxtransaction.component';
import { AgentsComponent } from 'app/seller/Agents/agents.component';


const allRoutes: Routes = [
  { path: 'box', component: BoxTransactionComponent },
  { path: 'category', component: CategoryComponent },
  { path: 'agents', component: AgentsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(allRoutes)],
  exports: [RouterModule],
})
export class AccountantRoutingModule { }
