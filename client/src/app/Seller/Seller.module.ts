import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComponentsModule } from '@shared/components/components.module';
import { SharedModule } from '@shared/shared.module';
import { AgentsComponent } from './Agents/agents.component';
import { SellerRoutingModule } from './Seller-routing.module';
@NgModule({
  declarations: [AgentsComponent],
  imports: [CommonModule, SellerRoutingModule, ComponentsModule, SharedModule],
})
export class SellerModule {}
