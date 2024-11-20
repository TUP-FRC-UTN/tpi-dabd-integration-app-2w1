import { Routes } from "@angular/router";
import { InventoryEmployeeProviderHomeComponent } from "./inventory-employee-provider-home/inventory-employee-provider-home.component";
import { IepInventoryComponent } from "./iep-inventory/components/iep-inventory/iep-inventory.component";
import { IepTableComponent } from "./iep-inventory/components/iep-table/iep-table.component";
import { IepCategoriesListComponent } from "./iep-inventory/components/iep-categories-list/iep-categories-list.component";
import { IepChartsInventoryComponent } from "./iep-inventory/components/iep-charts-inventory/iep-charts-inventory.component";
import { IepProductComponent } from "./iep-inventory/components/iep-product/iep-product.component";
import { IepSuppliersFormComponent } from "./iep-inventory/components/iep-suppliers-form/iep-suppliers-form.component";
import { IepNuevoIngresoEgresoComponent } from "./iep-inventory/components/iep-nuevo-ingreso-egreso/iep-nuevo-ingreso-egreso.component";
import { IepSupplierUpdateComponent } from "./iep-inventory/components/iep-supplier-update/iep-supplier-update.component";

export const INVENTORY_ROUTES: Routes = [

 { path: '', component: InventoryEmployeeProviderHomeComponent }, //agregado para desarrollar
    
    { path: 'inventory', component: IepInventoryComponent },
    { path: 'new-product', component: IepProductComponent},
    { path: 'product-update/:id', component: IepProductComponent },
    { path: 'stock-movements-history', component: IepTableComponent },
    { path: 'stock-increase', component: IepNuevoIngresoEgresoComponent },
    { path: 'new-provider', component: IepSuppliersFormComponent },
    { path: "supplier-update/:id", component: IepSupplierUpdateComponent },
    { path: 'categories-list', component: IepCategoriesListComponent }, 
    { path: 'dashboard', component: IepChartsInventoryComponent }, 
];