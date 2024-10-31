export interface Owner {
  id: number;
  name: string;
  lastname: string;
  dni: number;
  plots?: Plot[];
  username?: string;
  email?: string;
  contactId?: number;
  active?: boolean;
  avatarUrl?: string;
  dateOfBirth?: string;
  roles?: string[];
  businessName?: string;
  ownerType?: string;
}

interface Plot {
  id: number;
  plotNumber: number;
  blockNumber: number;
  totalAreaInM2: number;
  builtAreaInM2: number;
  plotState: string;
  plotType: string;
}