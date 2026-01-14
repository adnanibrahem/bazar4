// Sidebar route metadata
export interface RouteInfo {
  path: string;
  title: string;
  iconType: string;
  icon: string;
  class: string;
  groupTitle: boolean;
  badge: string;
  index: number;
  badgeClass: string;
  role: string[];
  selected: boolean;
  submenu: RouteInfo[];
}
