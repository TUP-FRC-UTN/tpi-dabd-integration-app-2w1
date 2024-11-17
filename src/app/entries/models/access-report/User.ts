export interface User {
    id: number;
    name: string;
    lastname: string;
    username: string;
    email: string;
    dni: number;
    contact_id: number;
    active: boolean;
    avatar_url: string;
    datebirth: string;
    roles: string[];
  }