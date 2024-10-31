import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccessAllowedDaysDto, AuthRangeInfoDto, AccessDocumentTypeDto, AccessLastEntryUserAllowedDto, AccessLastExitUserAllowedDto, AccessNewAuthRangeDto, AccessNewMovementExitDto, AccessNewMovementsEntryDto, AccessNewUserAllowedDto, AccessNewVehicleDto, AccessUserAllowedInfoDto, AccessUserAllowedTypeDto, VehicleTypeDto, AccessVisitor } from '../../models/access-visitors/access-VisitorsModels';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { AccessVisitorHelperService } from './access-visitor-helper.service';
import Swal from 'sweetalert2';
import { error } from 'jquery';

@Injectable({
  providedIn: 'root'
})
export class VisitorsService {

  private URL_GET_ALL_Visitors = "http://localhost:8090/user_Allowed/visitors/Visitor";
  private URL_POST_ENTRY_VisitorInList = "http://localhost:8090/movements_entry/register";
  private URL_POST_EXIT_VisitorInList = "http://localhost:8090/movements_exit/register";
  private URL_GET_LastEntryByDocument = "http://localhost:8090/movements_entry/last_entry_by_document?document=";
  private URL_GET_LastExitByDocument = "http://localhost:8090/movements_exit/last_exit_by_document?document=";

  private URL_POST_VALIDATE_QR = 'http://localhost:8090/visitor-qr';

  //URL para la pantalla (registrar invitado que no esta en la lista)
  private URL_POST_ENTRY_VisitorNotInList = "http://localhost:8090/movements_entry/register_if_not_exists";

  private readonly http: HttpClient = inject(HttpClient);
  private readonly helperService = inject(AccessVisitorHelperService);
  constructor() {
    this.loadVisitorsData();
  }

  //lista de Visitors
  visitorslist : AccessUserAllowedInfoDto[] = [];

  validateQrCode(qrCode: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.URL_POST_VALIDATE_QR}/validate`, { qrCode });
  }

  loadVisitorsData(): void {

    this.getVisitorsData().subscribe({
      next: (data: AccessUserAllowedInfoDto[]) => {
        this.visitorslist = data; // Asigna los datos una vez que se reciban
        //console.log("data en el service: ", data);
        //console.log("visitorslist en el service: ", this.visitorslist);

      },
      error: (error) => {
        console.error('Error al cargar los datos de los Visitors:', error);
      }
    });
  }

  GetVisitorsList(): AccessUserAllowedInfoDto[]{
    return [...this.visitorslist]
  }

  //filtra la list de Visitors
  getVisitorByParam(parameter: string): AccessUserAllowedInfoDto[] {

    //console.log("el cambio: " + parameter);

    if (parameter != null && parameter.length > 2) {
      let param = parameter.toLowerCase();

      return this.visitorslist.filter(v =>
        v.document.toLowerCase().includes(param) ||
        v.name.toLowerCase().includes(param) ||
        v.last_name.toLowerCase().includes(param)
      );
    } else {
      return this.visitorslist;
    }
  }

  //Llamadas a Endpoints de la API:
  // METODO: getAllUserAllowedVisitors(@PathVariable String visitor)
  getVisitorsData(): Observable<AccessUserAllowedInfoDto[]> {
    return this.http.get<AccessUserAllowedInfoDto[]>(this.URL_GET_ALL_Visitors);
  }

  // METODO: registerMovement_Entry(@RequestBody NewMovements_EntryDto movementsEntryDto)
  postVisitorEntry(movement: AccessNewMovementsEntryDto): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.URL_POST_ENTRY_VisitorInList, movement, { headers });
  }

  // METODO: registerMovement_Exit(@RequestBody NewMovements_ExitDto movementsExitDto)
  postVisitorExit(movement: AccessNewMovementExitDto): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.URL_POST_EXIT_VisitorInList, movement, { headers });
  }

  // METODO: getUserAllowedLastEntryByDocument(@RequestParam String document)
  getVisitorLastEntry(document: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.URL_GET_LastEntryByDocument}${encodeURIComponent(document)}`;
    return this.http.get<any>(url, { headers });
  }

    // METODO: getUserAllowedLastExitByDocument(@RequestParam String document)
    getVisitorLastExit(document: string): Observable<any> {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      const url = `${this.URL_GET_LastExitByDocument}${encodeURIComponent(document)}`;
      return this.http.get<any>(url, { headers });
    }


  // METODO: registerMovementEntryIfNotExists(
    // @RequestParam String documento,
    // @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDate date,
    // @RequestBody(required = false) NewMovements_EntryDto movementsEntryDto) {
  postUnregisteredVisitorEntry(document: string, date: string, movement: AccessNewMovementsEntryDto): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  
    // los parametros de consulta (documento y date) los pone en la URL
    // ejemplo URL completa: http://localhost:8090/movements_entry/register_if_not_exists?documento=99887766&date=2024-10-11
    const url = `${this.URL_POST_ENTRY_VisitorNotInList}?documento=${encodeURIComponent(document)}&date=${encodeURIComponent(date)}`;
  
    // hace el POST con movement en el body
    return this.http.post<any>(url, movement, { headers });
  }  



  //METODOS (para registrar Ingresos y Egresos)

/* PROBAR */

/* RegisterExit(visitor: User_AllowedInfoDto): void {
  // Verifica si su último movimiento fue ingreso (para poder egresar correctamente)
  this.getVisitorLastEntry(visitor.document).subscribe({
      next: (response) => {
          console.log("response de getVisitorLastEntry(): ", response);
          const lastEntry: LastEntryUserAllowedDto = response;

          this.getVisitorLastExit(visitor.document).subscribe({
              next: (response) => {
                  console.log("response de getVisitorLastExit(): ", response);
                  const lastExit: LastExitUserAllowedDto = response;

                  // Procesa las fechas de entrada y salida
                  const lastExitAux: Date | null = this.helperService.processDate(lastExit.movementDatetime);
                  const lastEntryAux: Date | null = this.helperService.processDate(lastEntry.movementDatetime);

                  const lastExitDateTime: Date = lastExitAux || new Date("2001-12-15");
                  const lastEntryDateTime: Date = lastEntryAux || new Date("2000-10-12");

                  const isFirstEntry: boolean = lastEntry.firstEntry;
                  const isFirstExit: boolean = lastExit.firstExit;

                  // Nueva condición: verificar si ya ha egresado
                  if (!isFirstExit) {
                      this.helperService.exitNotAllowed(); // Mensaje que se mostrará si ya ha egresado
                      return; // Detiene el proceso si ya ha egresado
                  }

                  // 1ra condición: si isFirstEntry es false, ya tiene un ingreso previo, y si isFirstExit es true, es la 1ra vez que egresa
                  // 2da condición: si la fecha y hora del último ingreso es mayor a la del último egreso, puede salir.
                  if ((!isFirstEntry && isFirstExit) || (lastEntryDateTime > lastExitDateTime)) {
                      console.log("Egreso permitido (paso el if de los movements)");

                      // Verifica observations
                      if (visitor.observations == undefined) {
                          visitor.observations = "";
                      }

                      // Verifica si está dentro de rango (fechas permitidas)
                      let indexAuthRange = this.helperService.todayIsInDateRange(visitor.authRanges);
                      if (indexAuthRange >= 0) {
                          // Verifica si está dentro de rango (día y horario permitido)
                          let indexDayAllowed = this.helperService.todayIsAllowedDay(visitor.authRanges.at(indexAuthRange));
                          if (indexDayAllowed >= 0) {
                              // Mapeos
                              const newUserAllowedDto: NewUserAllowedDto =
                                  this.helperService.mapUser_AllowedInfoDtoToNewUserAllowedDto(visitor);
                              const newAuthRangeDto: NewAuthRangeDto =
                                  this.helperService.mapAuthRangeInfoDtoToNewAuthRangeDto(visitor.authRanges, visitor.neighbor_id);

                              // Se crea el objeto (que se va a pasar por el body en el post)
                              const newMovement_ExitDto: NewMovement_ExitDto =
                                  this.helperService.createNewMovements_EntryDto(visitor, newUserAllowedDto, newAuthRangeDto);

                              // Post en la URL
                              this.postVisitorExit(newMovement_ExitDto).subscribe({
                                  next: (response) => {
                                      this.helperService.registerExitSuccess(newMovement_ExitDto);
                                  },
                                  error: (error) => {
                                      this.helperService.registerExitError();
                                      console.log(error);
                                  }
                              });

                          } else {
                              // Se dispara si el Visitor está fuera de rango (día y horario permitido)
                              this.helperService.exitLaterThanAuthorizedHourRange(visitor, indexAuthRange, indexDayAllowed);
                              return;
                          }

                      } else {
                          // Se dispara si el Visitor está fuera de rango (fechas permitidas)
                          this.helperService.exitLaterThanAuthorizedDateRange(visitor);
                          return; // Se termina la ejecución del método (no se registra el ingreso)
                      }
                  } else {
                      this.helperService.exitNotAllowed();
                      return;
                  }

              },
              error: (error) => {
                  this.helperService.getlastExitError();
                  console.log(error);
              }
          });
      },
      error: (error) => {
          this.helperService.getLastEntryError();
          console.log(error);
      }
  });
} */


//Registrar EGRESO de un visitante
      // LA VERFICACION (sobre si su ult. movimiento fue un Ingreso o Egreso) AHORA SE HACE EN EL BACK

      // this.getVisitorLastEntry(visitor.document).subscribe({
      //   next: (lastEntryResponse) => {
      //     const lastEntry: LastEntryUserAllowedDto = lastEntryResponse;
  
      //     this.getVisitorLastExit(visitor.document).subscribe({
      //       next: (lastExitResponse) => {
      //         const lastExit: LastExitUserAllowedDto = lastExitResponse;
              
      //         const lastExitAux: Date | null = this.helperService.processDate(lastExit.movementDatetime);
      //         const lastEntryAux: Date | null = this.helperService.processDate(lastEntry.movementDatetime);
  
      //         const lastExitDateTime: Date = lastExitAux || new Date("2001-12-15");
      //         const lastEntryDateTime: Date = lastEntryAux || new Date("2000-10-12");
  
      //         const isFirstEntry: boolean = lastEntry.firstEntry;
      //         const isFirstExit: boolean = lastExit.firstExit;
  
      //         if ((!isFirstEntry && isFirstExit) || (lastEntryDateTime > lastExitDateTime)) {
  RegisterExit(visitor: AccessUserAllowedInfoDto): Observable<boolean> {
    return new Observable<boolean>((observer) => {

              // Mostrar diálogo de confirmación
              Swal.fire({
                title: 'Confirmar Ingreso',
                text: `¿Está seguro que desea registrar el egreso de ${visitor.name} ${visitor.last_name}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí',
                cancelButtonText: 'Cancelar',
              }).then((result) => {
                if (result.isConfirmed) {
                  // proceso de registro
                  if (visitor.observations == undefined) {
                    visitor.observations = "";
                  }
    
                  let indexAuthRange = this.helperService.todayIsInDateRange(visitor.authRanges);
                  if (indexAuthRange >= 0) {
  
                    let indexDayAllowed = this.helperService.todayIsAllowedDay(visitor.authRanges.at(indexAuthRange));
                    if (indexDayAllowed >= 0) {
  
                      const newUserAllowedDto = this.helperService.mapUser_AllowedInfoDtoToNewUserAllowedDto(visitor);
                      const newAuthRangeDto = this.helperService.mapAuthRangeInfoDtoToNewAuthRangeDto(visitor.authRanges, visitor.neighbor_id);
    
                      const newMovement_ExitDto = this.helperService.createNewMovements_EntryDto(visitor, newUserAllowedDto, newAuthRangeDto);
    
                      this.postVisitorExit(newMovement_ExitDto).subscribe({
                        next: (response) => {
                          console.log("RegisterExit response: ", response);
                          
                          if(response.status !== 409){
                            this.helperService.registerExitSuccess(newMovement_ExitDto);
                            //return true;
                            observer.next(true);
                            observer.complete();
                          } else {
                            this.helperService.registerExitError();
                            //return false;
                            observer.next(false);
                            observer.complete();
                          }
                          
                        },
                        error: (error) => {
                          console.log("RegisterExit error: ", error);
                          if(error.status != 409){
                            this.helperService.registerExitError();
                            //return false;
                            observer.next(false);
                            observer.complete();
                            
                          } else {
                            this.helperService.exitNotAllowed();
                            //return false;
                            observer.next(false);
                            observer.complete();
                          }
                        }
                      });
    
                    } else {
                      this.helperService.exitLaterThanAuthorizedHourRange(visitor, indexAuthRange, indexDayAllowed);
                      //return false;
                      observer.next(false);
                      observer.complete();
                    }
    
                  } else {
                    this.helperService.exitLaterThanAuthorizedDateRange(visitor);
                    //return false;
                    observer.next(false);
                    observer.complete();
                  }

                } else {
                  // Si se cancela la confirmación
                  observer.next(false);
                  observer.complete();
                }
              }).catch(error => {
                console.error('Error en el diálogo de confirmación:', error);
                observer.error(error);
                observer.complete();
              });
    });
  }
  
      //         } else {
      //           this.helperService.exitNotAllowed();
      //           observer.next(false);
      //           observer.complete();
      //         }
      //       },
      //       error: (error) => {
      //         this.helperService.getlastExitError();
      //         console.log(error);
      //         observer.next(false);
      //         observer.complete();
      //       }
      //     });
      //   },
      //   error: (error) => {
      //     this.helperService.getLastEntryError();
      //     console.log(error);
      //     observer.next(false);
      //     observer.complete();
      //   }
      // });
  
  //FIN Registrar EGRESO de un visitante








 //Registrar INGRESO de un visitante
 // LA VERFICACION (sobre si su ult. movimiento fue un Ingreso o Egreso) AHORA SE HACE EN EL BACK

    //verifica si su ultimo movimiento fue Ingreso (para poder Egresar correctamente)
    //post en la URL
    // this.getVisitorLastEntry(visitor.document).subscribe({
    //   next: (response) => {
    //       //si la API devolvio la info correctamente, sigue el proceso
    //       console.log("response de getVisitorLastEntry(): ", response);
    //       const lastEntry: LastEntryUserAllowedDto = response;

    //       this.getVisitorLastExit(visitor.document).subscribe({
    //         next: (response) => {
    //             //si la API devolvio la info correctamente, sigue el proceso
    //             console.log("response de getVisitorLastExit(): ", response);
    //             const lastExit: LastExitUserAllowedDto = response;
      
    //             //si alguna de las fechas es null (en caso de q no haya un Ingreso y/o Egreso del Visitor), 
    //             // se le asigna una nueva fecha de ingreso/egreso, asegurando q el ultimo Egreso es mayor,
    //             // fallando la 2da condicion a proposito. (todo esto pq el atributo movementDatetime puede ser Date o null)

    //             console.log("lastExitAux: ");
    //             const lastExitAux: Date | null = this.helperService.processDate(lastExit.movementDatetime);
    //             console.log("lastEntryAux: ");
    //             const lastEntryAux: Date | null = this.helperService.processDate(lastEntry.movementDatetime);

    //             const lastExitDateTime: Date = lastExitAux || new Date("2001-12-15");
    //             const lastEntryDateTime: Date = lastEntryAux || new Date("2000-10-12");

    //             const isFirstEntry: boolean = lastEntry.firstEntry;
    //             const isFirstExit: boolean = lastExit.firstExit;

    //             //1ra condicion: si isFirstEntry es true, osea es su 1er ingreso, y si isFirstExit es true, osea q todavia no tiene 
    //             // ningun egreso regsitrado, se puede registrar el ingreso.
    //             //2da condicion: si la fecha y hora del ultimo Egreso es mayor a la del ultimo Ingreso, puede entrar.
    //             if((isFirstEntry && isFirstExit) || (lastEntryDateTime < lastExitDateTime)){
RegisterAccess(visitor :AccessUserAllowedInfoDto): Observable<boolean> {
  return new Observable<boolean>((observer) => {

    // Mostrar diálogo de confirmación
    Swal.fire({
      title: 'Confirmar Ingreso',
      text: `¿Está seguro que desea registrar el ingreso de ${visitor.name} ${visitor.last_name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
          // proceso de registro
          //verifica observations
          if(visitor.observations == undefined){
            visitor.observations = "";
          }

          // verifica si esta dentro de rango (fechas permitidas)
          let indexAuthRange = this.helperService.todayIsInDateRange(visitor.authRanges);
          if(indexAuthRange >= 0){

            // verifica si esta dentro de rango (dia y horario permitido)
            let indexDayAllowed = this.helperService.todayIsAllowedDay(visitor.authRanges.at(indexAuthRange));
            if(indexDayAllowed >= 0){
              
              // mapeos
              const newUserAllowedDto: AccessNewUserAllowedDto = 
                this.helperService.mapUser_AllowedInfoDtoToNewUserAllowedDto(visitor);
              const newAuthRangeDto: AccessNewAuthRangeDto = 
                this.helperService.mapAuthRangeInfoDtoToNewAuthRangeDto(visitor.authRanges, visitor.neighbor_id);

              //se crea el objeto (q se va a pasar por el body en el post)
              const newMovements_EntryDto: AccessNewMovementsEntryDto = 
                this.helperService.createNewMovements_EntryDto(visitor, newUserAllowedDto, newAuthRangeDto);

              //post en la URL
              this.postVisitorEntry(newMovements_EntryDto).subscribe({
                next: (response) => {
                  console.log("(access-visitors-service) -> Register Access response: ", response);
                  
                  if(response.status !== 409){
                    this.helperService.registerEntrySuccess(newMovements_EntryDto);
                    //return true;
                    observer.next(true);
                    observer.complete();   

                  } else {
                    this.helperService.registerEntryError();
                    //return false;
                    observer.next(false);
                    observer.complete();
                  }
                },
                error: (error) => {
                  console.log("(access-visitors-service) -> Register Access error: ", error);

                  if(error.status != 409){
                    this.helperService.registerEntryError();
                    //return false;
                    observer.next(false);
                    observer.complete();

                  } else {
                    this.helperService.entryNotAllowed();
                    //return false;
                    observer.next(false);
                    observer.complete();
                  }
                }
              });

            } else {
              //se dispara si el Visitor esta fuera de rango (dia y horario permitido)
              this.helperService.entryOutOfAuthorizedHourRange(visitor, indexAuthRange, indexDayAllowed);
              //return false;
              observer.next(false);
              observer.complete();

            }

          } else {
            //se dispara si el Visitor esta fuera de rango (fechas permitidas)
            this.helperService.entryOutOfAuthorizedDateRange(visitor);
            //return false;
            observer.next(false);
            observer.complete();
          }
    
      } else {
        // Si se cancela la confirmación
        observer.next(false);
        observer.complete();
      }
    }).catch(error => {
      console.error('Error en el diálogo de confirmación:', error);
      observer.error(error);
      observer.complete();
    });
  });
}
 //               } else {

  //                 this.helperService.entryNotAllowed();
  //                 observer.next(false);
  //                 observer.complete();
  //               }
      
  //             },
  //           error: (error) => {
  //               this.helperService.getlastExitError();
  //               console.log(error);
  //               observer.next(false);
  //               observer.complete();
  //             }
  //         });
  //       },
  //     error: (error) => {
  //         this.helperService.getLastEntryError();
  //         console.log(error);
  //         observer.next(false);
  //         observer.complete();
  //       }
  //    });
// FIN Registrar INGRESO de un visitante
  // FIN METODOS (para registrar Ingresos y Egresos)

}
