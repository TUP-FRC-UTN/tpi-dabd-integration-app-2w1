export interface Owner {
  id: number;
  name: string;
  lastname: string;
  dni_type : string;
  dni: number;

  active?: boolean;
  plot?: Plot[];
  username?: string;
  email?: string;
  contactId?: number;
  avatarUrl?: string;
  dateBirth?: string;
  cuitCuil? : number;
  roles?: string[];
  businessName?: string;
  ownerType?: string;
}

interface Plot {
  id: number;
  plot_number: number;
  block_number: number;
  total_area_in_m2: number;
  built_area_in_m2: number;
  plot_state: string;
  plot_type: string;
  files : null;
}