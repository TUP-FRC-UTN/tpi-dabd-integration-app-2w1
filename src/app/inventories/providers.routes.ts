import { Routes } from "@angular/router";
import { InventoryEmployeeProviderHomeComponent } from "./inventory-employee-provider-home/inventory-employee-provider-home.component";
import { IepAttentionCallComponent } from "./components/iep-attention-call/iep-attention-call.component";
import { IepChargesComponent } from "./components/iep-charges/iep-charges.component";
import { IepDetailTableComponent } from "./components/iep-detail-table/iep-detail-table.component";
import { IEPFormPostEmployeesComponent } from "./components/iep-form-post-employees/iep-form-post-employees.component";
import { IepInventoryComponent } from "./components/iep-inventory/iep-inventory.component";
import { IepListEmployeesComponent } from "./components/iep-list-employees/iep-list-employees.component";
import { IepPerformancelistComponent } from "./components/iep-performancelist/iep-performancelist.component";
import { IepProductComponent } from "./components/iep-product/iep-product.component";
import { IepPutEmployeesComponent } from "./components/iep-put-employees/iep-put-employees.component";
import { IepStockIncreaseComponent } from "./components/iep-stock-increase/iep-stock-increase.component";
import { IepSupplierListComponent } from "./components/iep-supplier-list/iep-supplier-list.component";
import { IepSupplierUpdateComponent } from "./components/iep-supplier-update/iep-supplier-update.component";
import { IepSuppliersFormComponent } from "./components/iep-suppliers-form/iep-suppliers-form.component";
import { IepTableComponent } from "./components/iep-table/iep-table.component";
import { IepWarehouseMovementSearchComponent } from "./components/iep-warehouse-movement-search/iep-warehouse-movement-search.component";

export const PROVIDERS_ROUTES: Routes = [    
    { path: "suppliers", component: IepSupplierListComponent },
    { path: "create-supplier", component: IepSuppliersFormComponent },
    { path: "supplier-update/:id", component: IepSupplierUpdateComponent },
    { path: 'dashboard', component: InventoryEmployeeProviderHomeComponent }, // Cambiar por el componente correspondiente
];