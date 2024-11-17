import { Access } from "./access";
import { Fine } from "./fine";
import { General } from "./general";
import { Inventory } from "./inventory";
import { Payments } from "./payments";

export interface Notifications {
    fines:Fine[];
    access:Access[];
    payments:Payments[];
    generals:General[];
    inventories: Inventory[]
}
