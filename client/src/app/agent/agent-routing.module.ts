/* eslint-disable @typescript-eslint/no-unused-vars */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyOrdersComponent } from './MyOrders/my-orders.component';

const allRoutes: Routes = [{ path: 'myorders', component: MyOrdersComponent }];

@NgModule({
  imports: [RouterModule.forChild(allRoutes)],
  exports: [RouterModule],
})
export class AgentRoutingModule {}
