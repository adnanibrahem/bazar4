import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';

import { ComponentsModule } from '@shared/components/components.module';

import { SharedModule } from '@shared/shared.module';

import { UsersComponent } from './Users/users.component';
import { QRCodeModule } from 'angularx-qrcode';

import { TruncatePipe } from '@core/pipes';
import { BrancheComponent } from './Branche/branche.component';
import { BoxBranchesComponent } from './boxBranches/boxBranches.component';
import { ProfitComponent } from './Profits/profit.component';

@NgModule({
  declarations: [TruncatePipe],
  imports: [
    CommonModule,
    AdminRoutingModule,
    QRCodeModule,
    ComponentsModule,
    SharedModule,
    UsersComponent,
    BoxBranchesComponent,
    BrancheComponent,
    ProfitComponent,
  ],
})
export class AdminModule {}
