export interface GetOwnerAndPlot {
    owner: {
      id: number;
      name: string;
      lastname: string;
      dni: string;
      dni_type: string;
      dateBirth: string;
      ownerType: string;
      businessName: string;
      active: boolean;
      taxStatus: string;
    };
    plot: {
      id: number;
      plot_number: number;
      block_number: number;
      total_area_in_m2: number;
      built_area_in_m2: number;
      plot_state: string;
      plot_type: string;
      files: null;
    }[];
    user: {
      id: number;
      name: string;
      lastname: string;
      username: string;
      email: string;
      phone_number: string;
      dni_type: string;
      dni: string;
      active: boolean;
      avatar_url: string;
      datebirth: string;
      create_date: string;
      roles: string[];
      plot_id: number[];
      telegram_id: number;
    };
  }