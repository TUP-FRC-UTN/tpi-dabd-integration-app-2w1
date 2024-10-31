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

export const INVENTORY_ROUTES: Routes = [
    { path: '', component: InventoryEmployeeProviderHomeComponent },
    {
        path: 'stock-aumento',  // SANTI
        component: IepStockIncreaseComponent,
        title: 'Aumento de stock'
    },
    {
        path: 'registro-productos', // TOMAS
        component: IepProductComponent,
        title: 'Registro de productos'
    },
    {
        path: 'inventario',     // AGUSTIN
        component: IepInventoryComponent,
        title: 'Inventario'
    },
    {
        path: 'detalle-inventario',     // MARTIN
        component: IepDetailTableComponent,
        title: 'Detalle de inventario'
    },
    {
        path: 'historial-modificaciones-stock',     // ENZO
        component: IepTableComponent,
        title: 'Historial de modificacion de stock'
    },
    {
        path: 'listado-empleados',     // ENZO
        component: IepListEmployeesComponent,
        title: 'Listado de empleados'
    },
    {
        path: 'wake-up-call',
        component: IepAttentionCallComponent,
        title: 'Llamada de atención'
    },
    {
        path: 'warehouse-movements',
        component: IepWarehouseMovementSearchComponent,
        title: 'Ver almacenes'
    },
    {
        path: 'desempeño',
        component: IepPerformancelistComponent,
        title: 'desempeño'
    },

    {
        path: "suppliers",
        component: IepSupplierListComponent,
        title: "proveedores"
    },
    {
        path: "create-supplier",
        component: IepSuppliersFormComponent,
        title: "Crear proveedor"
    },
    {
        path: "supplier-update/:id",
        component: IepSupplierUpdateComponent,
        title: "Modificar proveedor"
      }
    ,
    {
        path:"employee-post",
        component:IEPFormPostEmployeesComponent,
        title:"Crear empleado"
    },
    {
        path: 'cargos',
        component: IepChargesComponent,
        title: 'Gestión de Cargos'
    },
    {
        
      path: 'empleados/modificar/:id',  // TOMAS H
      component:IepPutEmployeesComponent,
      title: 'Modificar empleado'
        

    }
  
];