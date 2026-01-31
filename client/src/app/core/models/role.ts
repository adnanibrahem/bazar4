import { Fatora } from 'app/Accountant/Accountant.model';

export enum Role {
  Admin = 'admin',
  Agent = 'agent',
  Seller = 'seller',
  Accountant = 'accountant',
  Store = 'store',
}

export function FatoraStuts(fd: number): string {
  switch (fd) {
    case 1:
      return 'ordering';
    case 2:
      return 'buying';
    case 3:
      return 'shipping';
    case 4:
      return 'delivering';
    case 5:
      return 'done';
  }

  return '';
}
