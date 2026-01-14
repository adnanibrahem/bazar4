import { NgModule, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RightSidebarService } from './service/rightsidebar.service';
import { AuthGuard } from './guard/auth.guard';
import { AuthService } from './service/auth.service';
import { throwIfAlreadyLoaded } from './guard/module-import.guard';
import { DirectionService } from './service/direction.service';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [RightSidebarService, AuthGuard, AuthService, DirectionService],
})
export class CoreModule {
  constructor() {
    const parentModule = inject(CoreModule, { optional: true, skipSelf: true });
    if (parentModule) throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
