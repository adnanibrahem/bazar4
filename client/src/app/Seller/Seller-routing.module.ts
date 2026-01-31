/* eslint-disable @typescript-eslint/no-unused-vars */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgentsComponent } from './Agents/agents.component';
import { SentComponent } from './Sent/sent.component';
import { FawaterComponent } from './Fawater/fawater.component';

const allRoutes: Routes = [
  { path: 'agents', component: AgentsComponent },
  { path: 'fwater', component: FawaterComponent },
  { path: 'sent', component: SentComponent },
];

@NgModule({
  imports: [RouterModule.forChild(allRoutes)],
  exports: [RouterModule],
})
export class SellerRoutingModule { }
