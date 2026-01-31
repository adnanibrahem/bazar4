/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { AuthService, Role, User } from '@core';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
})
export class SigninComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  authForm!: UntypedFormGroup;
  submitted = false;
  loading = false;
  error = '';
  hide = true;

  ngOnInit() {
    this.authService.setCurrentUserValue({} as User);
    this.authForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  get f() {
    return this.authForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.loading = true;
    this.error = '';
    if (this.authForm.invalid) {
      this.error = 'Username and Password not valid !';
      return;
    } else {
      this.subs.sink = this.authService
        .login(this.f['username'].value, this.f['password'].value)
        .subscribe(
          (res: any) => {
            this.authService.getInfo().subscribe((e: any) => {
              const lUser = e[0] as User;
              const s = e[0].optionTime as string;
              lUser.isActive = false;
              let tUrl = '/pages/branch';
              if (s.includes('3')) {
                lUser.isActive = true;
                lUser.role = Role.Admin;
              } else if (s.includes('4')) {
                lUser.role = Role.Agent;
                tUrl = '/agent/myorders';
              } else if (s.includes('9')) {
                lUser.role = Role.Seller;
                tUrl = '/seller/fwater';
              } else if (s.includes('2')) {
                lUser.role = Role.Accountant;
                tUrl = '/acc/purchas';
              } else this.router.navigate(['/authentication/signin']);

              lUser.token = res.token;

              this.authService.setCurrentUserValue(lUser);
              this.router.navigate([tUrl]);
            });
          },
          (error) => {
            this.error = error;
            this.submitted = false;
            this.loading = false;
          },
        );
    }
  }
}
