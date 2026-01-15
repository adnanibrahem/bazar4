/* eslint-disable @typescript-eslint/no-unused-vars */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgentsComponent } from './Agents/agents.component';

const allRoutes: Routes = [{ path: 'agents', component: AgentsComponent }];

@NgModule({
  imports: [RouterModule.forChild(allRoutes)],
  exports: [RouterModule],
})
export class SellerRoutingModule {}
