import { Access } from "./access";
import { Fine } from "./fine";
import { General } from "./general";
import { Inventory } from "./inventory";
import { Payments } from "./payments";

export interface AllNotifications {
    fines:Fine[];
    access:Access[];
    payments:Payments[];
    generals:General[];
    inventories:Inventory[];
}
