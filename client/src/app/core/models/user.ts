/* eslint-disable @typescript-eslint/no-explicit-any */
import { Role } from './role';

export class User {
  id!: number;
  img!: any;
  auth!: number;
  validPasswprd!: boolean;
  username!: string; // اسم دخول المستخدم
  firstName!: string; // الاسم الثلاثي
  lastName!: string;
  phoneNumber!: string; // رقم الهاتف
  isActive!: boolean;
  privilege!: string;
  enable!: boolean;
  branch!: number;
  permission!: number;

  branchTitle!: string;
  role!: Role;
  token!: string;
}
