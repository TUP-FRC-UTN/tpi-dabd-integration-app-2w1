import { Routes } from "@angular/router";
import { InventoryEmployeeProviderHomeComponent } from "./inventory-employee-provider-home/inventory-employee-provider-home.component";
import { IepDetailTableComponent } from "./iep-inventory/components/iep-detail-table/iep-detail-table.component";
import { IepInventoryComponent } from "./iep-inventory/components/iep-inventory/iep-inventory.component";
import { IepStockIncreaseComponent } from "./iep-inventory/components/iep-stock-increase/iep-stock-increase.component";
import { IepTableComponent } from "./iep-inventory/components/iep-table/iep-table.component";
import { IepWarehouseMovementSearchComponent } from "./iep-inventory/components/iep-warehouse-movement-search/iep-warehouse-movement-search.component";
import { IepCategoriesListComponent } from "./iep-inventory/components/iep-categories-list/iep-categories-list.component";
import { IepChartsInventoryComponent } from "./iep-inventory/components/iep-charts-inventory/iep-charts-inventory.component";

export const INVENTORY_ROUTES: Routes = [

 { path: '', component: InventoryEmployeeProviderHomeComponent }, //agregado para desarrollar
    
 { path: 'inventory', component: IepInventoryComponent },
    { path: 'stock-increase', component: IepStockIncreaseComponent },
    { path: 'stock-movements-history', component: IepTableComponent },
    { path: 'warehouse-movements', component: IepWarehouseMovementSearchComponent },
    { path: 'categories', component: IepCategoriesListComponent }, 
    { path: 'dashboard', component: IepChartsInventoryComponent }, 
];