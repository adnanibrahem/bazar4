export enum Role {
  Admin = 'admin', // مدير
  Agent = 'agent', // وكيل
  Seller = 'seller', // بائع
  Accountant = 'accountant', // محاسب
  Store = 'store', // مخزن
}

export function FatoraStuts(fd: number): any {
  switch (fd) {
    case 1:
      return { ar: 'طلب', en: 'ordering' };
    case 2:
      return { ar: 'شراء', en: 'buying' };
    case 3:
      return { ar: 'الاستلام', en: 'delivering' };
    case 4:
      return { ar: 'الشحن', en: 'shipping' };
    case 5:
      return { ar: 'وصول', en: 'arriving' };
  }

  return '';
}
