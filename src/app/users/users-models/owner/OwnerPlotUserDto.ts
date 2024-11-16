import { Owner } from "./Owner";

export class OwnerDtoForOwner {
    id: number;
    name: string;
    lastname: string;
    dni: string;
    cuitCuil: string;
    dateBirth: string;
    businessName: string;
    active: boolean;
    ownerType: string;

    constructor(
        id: number,
        name: string,
        lastname: string,
        dni: string,
        cuitCuil: string,
        dateBirth: string,
        businessName: string,
        active: boolean,
        ownerType: string
    ) {
        this.id = id;
        this.name = name;
        this.lastname = lastname;
        this.dni = dni;
        this.cuitCuil = cuitCuil;
        this.dateBirth = dateBirth;
        this.businessName = businessName;
        this.active = active;
        this.ownerType = ownerType;
    }
}

export class PlotDtoForOwner {
    id: number;
    plot_number: number;
    block_number: number;
    total_area_in_m2: number;
    built_area_in_m2: number;
    plot_state: string;
    plot_type: string;
    files: any;

    constructor(
        id: number,
        plot_number: number,
        block_number: number,
        total_area_in_m2: number,
        built_area_in_m2: number,
        plot_state: string,
        plot_type: string,
        files: any
    ) {
        this.id = id;
        this.plot_number = plot_number;
        this.block_number = block_number;
        this.total_area_in_m2 = total_area_in_m2;
        this.built_area_in_m2 = built_area_in_m2;
        this.plot_state = plot_state;
        this.plot_type = plot_type;
        this.files = files;
    }
}

export class UserDtoForOwner {
    id: number;
    name: string;
    lastname: string;
    username: string;
    password: string;
    email: string | null;
    phone_number: string | null;
    dni: string;
    active: boolean;
    avatar_url: string;
    datebirth: string;
    roles: string[];
    plot_id: number;
    telegram_id: number;

    constructor(
        id: number,
        name: string,
        lastname: string,
        username: string,
        password: string,
        email: string | null,
        phone_number: string | null,
        dni: string,
        active: boolean,
        avatar_url: string,
        datebirth: string,
        roles: string[],
        plot_id: number,
        telegram_id: number
    ) {
        this.id = id;
        this.name = name;
        this.lastname = lastname;
        this.username = username;
        this.password = password;
        this.email = email;
        this.phone_number = phone_number;
        this.dni = dni;
        this.active = active;
        this.avatar_url = avatar_url;
        this.datebirth = datebirth;
        this.roles = roles;
        this.plot_id = plot_id;
        this.telegram_id = telegram_id;
    }
}

export class OwnerPlotUserDto {
    owner: Owner;
    plot: PlotDtoForOwner[];
    user: UserDtoForOwner;

    constructor(owner: Owner, plot: PlotDtoForOwner[], user: UserDtoForOwner) {
        this.owner = owner;
        this.plot = plot;
        this.user = user;
    }
}
