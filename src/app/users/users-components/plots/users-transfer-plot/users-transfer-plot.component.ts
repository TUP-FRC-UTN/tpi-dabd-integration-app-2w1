import { Component, inject, Input } from '@angular/core';
import { SuscriptionManagerService } from '../../../../common/services/suscription-manager.service';
import { OwnerService } from '../../../users-servicies/owner.service';
import { Owner } from '../../../users-models/owner/Owner';
import { PlotService } from '../../../users-servicies/plot.service';
import { GetPlotModel } from '../../../users-models/plot/GetPlot';
import { AuthService } from '../../../users-servicies/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-users-transfer-plot',
  standalone: true,
  imports: [],
  templateUrl: './users-transfer-plot.component.html'
})
export class UsersTransferPlotComponent {

  owners : Owner[] = []
  plot : GetPlotModel = new GetPlotModel();

  constructor(private route : ActivatedRoute){}

  private readonly ownersService = inject(OwnerService);
  private readonly plotService = inject(PlotService);
  private readonly suscriptionService = inject(SuscriptionManagerService);
  private readonly authService = inject(AuthService);

  //Cargar todos los propietarios
  loadAllOwners(){
    this.ownersService.getAll().subscribe({
      next: (data: Owner[]) =>{
        this.owners = data;
      },
      error: (error) =>{
        console.log('No se pudo cargar los usuarios')
      }
    })
  }

  loadPlotInfo(){
    this.plotService.getPlotById(this.getPlotId()).subscribe({
      next: (data: GetPlotModel) =>{
        this.plot = data;
      },
      error: (error) =>{
        console.log('No se pudo cargar la información de la parcela')
      }
    })
  }

  getPlotId() : number{
    var id = Number(this.route.snapshot.paramMap.get('id')) || 0;
    return id;
  }
}
