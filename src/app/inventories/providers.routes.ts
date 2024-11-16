import { Routes } from "@angular/router";
import { InventoryEmployeeProviderHomeComponent } from "./inventory-employee-provider-home/inventory-employee-provider-home.component";
import { IepSupplierListComponent } from "./iep-inventory/components/iep-supplier-list/iep-supplier-list.component";
import { IepSupplierUpdateComponent } from "./iep-inventory/components/iep-supplier-update/iep-supplier-update.component";
import { IepSuppliersFormComponent } from "./iep-inventory/components/iep-suppliers-form/iep-suppliers-form.component";

export const PROVIDERS_ROUTES: Routes = [    
    { path: "suppliers", component: IepSupplierListComponent },
    { path: "create-supplier", component: IepSuppliersFormComponent },
    { path: "supplier-update/:id", component: IepSupplierUpdateComponent },
    { path: 'dashboard', component: InventoryEmployeeProviderHomeComponent }, // Cambiar por el componente correspondiente
];