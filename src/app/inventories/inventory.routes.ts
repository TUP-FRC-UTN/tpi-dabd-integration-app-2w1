import { Routes } from "@angular/router";
import { InventoryEmployeeProviderHomeComponent } from "./inventory-employee-provider-home/inventory-employee-provider-home.component";
import { IepDetailTableComponent } from "./iep-inventory/components/iep-detail-table/iep-detail-table.component";
import { IepInventoryComponent } from "./iep-inventory/components/iep-inventory/iep-inventory.component";
import { IepProductComponent } from "./iep-inventory/components/iep-product/iep-product.component";
import { IepStockIncreaseComponent } from "./iep-inventory/components/iep-stock-increase/iep-stock-increase.component";
import { IepTableComponent } from "./iep-inventory/components/iep-table/iep-table.component";
import { IepWarehouseMovementSearchComponent } from "./iep-inventory/components/iep-warehouse-movement-search/iep-warehouse-movement-search.component";

export const INVENTORY_ROUTES: Routes = [
 { path: '', component: InventoryEmployeeProviderHomeComponent }, //agregado para desarrollar
    
 { path: 'inventory', component: IepInventoryComponent },
    { path: 'inventory-detail', component: IepDetailTableComponent },
    { path: 'register-product', component: IepProductComponent },
    { path: 'stock-increase', component: IepStockIncreaseComponent },
    { path: 'stock-movements-history', component: IepTableComponent },
    { path: 'warehouse-movements', component: IepWarehouseMovementSearchComponent },
    { path: 'categories', component: InventoryEmployeeProviderHomeComponent }, //Remplazar por el componente del listad de categorias
    { path: 'dashboard', component: InventoryEmployeeProviderHomeComponent }, // Cambiar por el componente correspondiente
];