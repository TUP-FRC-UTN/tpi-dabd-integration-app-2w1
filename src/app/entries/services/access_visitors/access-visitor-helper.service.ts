import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AccessAllowedDaysDto, AuthRangeInfoDto, AccessNewAuthRangeDto, AccessNewMovementExitDto, AccessNewMovementsEntryDto, AccessNewUserAllowedDto, AccessNewVehicleDto, AccessUserAllowedInfoDto, VehicleTypeDto } from '../../models/access-visitors/access-VisitorsModels';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AccessVisitorHelperService {

  constructor(private datePipe: DatePipe) {
  }


  //MAPEOS
  //post del registro de un visitor
    // mapeo de User_AllowedInfoDto a NewUserAllowedDto:
    mapUser_AllowedInfoDtoToNewUserAllowedDto(visitorInfoDto: AccessUserAllowedInfoDto): AccessNewUserAllowedDto {

      //NewVehicleDto vacio
      const emptyVehicleTypeDto: VehicleTypeDto = { description : "Car" };
      const emptyVehicleDto: AccessNewVehicleDto = { plate: "", vehicle_Type: emptyVehicleTypeDto, insurance: ""}

      let visitorVehicle: AccessNewVehicleDto | undefined ;

      //MOMENTANEO (en el futuro, el guardia debe poder seleccionar el vehiculo con el q entra el Visitor)
      //se verifica si el Visitor tiene un vehiculo
      if(visitorInfoDto.vehicles.length > 0){
        //si lo tiene se asigna
        visitorVehicle = visitorInfoDto.vehicles.at(0);
      } else {
        //si no se le asigna uno vacio
        visitorVehicle = emptyVehicleDto;
      }
      //MOMENTANEO 

      //mapeo de los datos
      let newUserAllowedDto: AccessNewUserAllowedDto = {
        document : visitorInfoDto.document,
        name : visitorInfoDto.name,
        last_name : visitorInfoDto.last_name,
        documentType: visitorInfoDto.documentTypeDto,
        user_allowed_Type: visitorInfoDto.userType,
        vehicle: visitorVehicle,
        email: visitorInfoDto.email
      }
      //console.log("obj q entra -> User_AllowedInfoDto: ", visitorInfoDto);
      //console.log("metodo mapUser_AllowedInfoDtoToNewUserAllowedDto: ", newUserAllowedDto);
      return newUserAllowedDto;
    }
    // FIN mapeo de User_AllowedInfoDto a NewUserAllowedDto:

    // mapeo de AuthRangeInfoDto[] a NewAuthRangeDto
    mapAuthRangeInfoDtoToNewAuthRangeDto(listAuthRangeInfoDto: AuthRangeInfoDto[], neighborId: number): AccessNewAuthRangeDto{

      //console.log("mapAuthRangeInfoDtoToNewAuthRangeDto (en visitors.service)")
      //console.log("list de AuthRangeInfoDto del Visitor", listAuthRangeInfoDto);

      //la idea es q nunca se usen (pq en el component ya se verifica si el Visitor puede entrar 
      // en base a sus AuthRanges, solo se llega a este metodo si el Visitor esta dentro del rango permitido)
      const allowedDaysEmpty: AccessAllowedDaysDto[] = [];
      const emptyAuth: AccessNewAuthRangeDto = {
        neighbor_id: 0,
        init_date: "", 
        end_date: "", 
        allowedDaysDtos: allowedDaysEmpty
      };

      //agarra un AuthRange (del Visitor) q comprenda la fecha actual (pq tiene varios, entonces hay q agarrar el actual)
      let index = this.todayIsInDateRange(listAuthRangeInfoDto);
      // si hay uno valido index es mayor a -1 (index es el indice del Range valido, en el array de AuthRangeInfoDto)
      if(index >= 0){

        //fechas de inicio y fin del AuthRangeInfoDto valido
        let initDate = listAuthRangeInfoDto.at(index)?.init_date;
        let endDate = listAuthRangeInfoDto.at(index)?.end_date;
        //se pasa del objeto Date a un string (con el formato requerido por el endpoint)
        let stringInit_date: string | undefined = this.datePipe.transform( initDate,'yyyy-MM-dd')?.toString();
        let stringEnd_date: string | undefined = this.datePipe.transform( endDate,'yyyy-MM-dd')?.toString();

        //se mapea de AuthRangeInfoDto a NewAuthRangeDto
        let newAuthRangedto: AccessNewAuthRangeDto = {
          neighbor_id: neighborId, 
          init_date: stringInit_date || "", 
          end_date: stringEnd_date  || "", 
          allowedDaysDtos: listAuthRangeInfoDto.at(index)?.allowedDays || allowedDaysEmpty
        };
        //console.log("FUNCIONAAAAAAAAA")
        //console.log("metodo mapAuthRangeInfoDtoToNewAuthRangeDto: ", newAuthRangedto);
        //devuelve un NewAuthRangeDto con los datos, de un AuthRange del Visitor, validos.
        return newAuthRangedto;
      }

      //console.log("Algo malio sal...")
      //la idea es q nunca se use
      return emptyAuth;
    }
    // FIN mapeo de AuthRangeInfoDto a NewAuthRangeDto

    // creacion de NewMovements_EntryDto 
    createNewMovements_EntryDto(visitorInfo :AccessUserAllowedInfoDto, 
      newUserAllowedDto: AccessNewUserAllowedDto, 
      newAuthRangedto: AccessNewAuthRangeDto): AccessNewMovementsEntryDto{

        let newMovements_EntryDto: AccessNewMovementsEntryDto = {
          movementDatetime: new Date, // LocalDateTime (EJ: "2024-10-11T04:58:43.536Z"
          observations: visitorInfo.observations || "",
          newUserAllowedDto: newUserAllowedDto, //interface declarada mas abajo
          authRangesDto: newAuthRangedto, //interface declarada mas abajo
          vehiclesId: 0
        }

        //console.log("createNewMovements_EntryDto (en visitors.service): ", newMovements_EntryDto);
        return newMovements_EntryDto;
    }
    // FIN creacion de NewMovements_EntryDto 

    // creacion de NewMovement_ExitDto 
    createNewMovement_ExitDto(visitorInfo :AccessUserAllowedInfoDto, 
      newUserAllowedDto: AccessNewUserAllowedDto, 
      newAuthRangedto: AccessNewAuthRangeDto): AccessNewMovementExitDto{

        let newMovement_ExitDto: AccessNewMovementExitDto = {
          movementDatetime: new Date, // LocalDateTime (EJ: "2024-10-11T04:58:43.536Z"
          observations: visitorInfo.observations || "",
          newUserAllowedDto: newUserAllowedDto, //interface declarada mas abajo
          authRangesDto: newAuthRangedto, //interface declarada mas abajo
          vehiclesId: 0
        }

        //console.log("createNewMovements_EntryDto (en visitors.service): ", newMovements_EntryDto);
        return newMovement_ExitDto;
    }
    // FIN creacion de NewMovement_ExitDto 
  //FIN post del registro de un visitor
// FIN MAPEOS










  // funciones para comparar FECHAS
  // verifica si la fecha actual esta dentro de alguno de los AuthRangeInfoDto del Visitor
  todayIsInDateRange(listAuthRangeInfoDto: AuthRangeInfoDto[]): number{
    for (var i = 0; i < listAuthRangeInfoDto.length; i++) {

      //console.log("todayIsInDateRange (en visitors.service) | ciclo del for: ", i);
      //console.log("fechas del AuthRange: ", listAuthRangeInfoDto.at(i)?.init_date, " | ", listAuthRangeInfoDto.at(i)?.end_date)

      let initDate: Date | undefined = listAuthRangeInfoDto.at(i)?.init_date;
      let endDate: Date | undefined  = listAuthRangeInfoDto.at(i)?.end_date;
  
      //console.log("fechas asignadas para comparar: ", initDate, " | ", endDate)


      if(this.isDateBeforeToday(initDate) && this.isDateAfterToday(endDate)){
        //console.log("(Visitor dentro del rango!) index del AuthRange valido: ", i);
        return i; // devuelve el indice donde esta el AuthRangeInfoDto valido
      }
    }
    return -1; // no hay rango q comprenda la fecha actual
  }
  

  isDateBeforeToday(date: Date | undefined): boolean {
    if (date == undefined) {
      // Si date es undefined, devolver false
      return false;
    }
  
    //fecha actual, para poder comparar
    let todayDate = new Date();
    //fecha a comparar
    let beforeDate = new Date(date);
    //console.log(beforeDate, " | hoy -> ", todayDate)

    return beforeDate <= todayDate;
  }

  isDateAfterToday(date: Date | undefined): boolean {
    if (date == undefined) {
      // Si date es undefined, devolver false
      return false;
    }

    //fecha actual, para poder comparar
    let todayDate = new Date();
    //fecha a comparar
    let afterDate = new Date(date);
    //console.log(afterDate, " | hoy -> ", todayDate)

    return afterDate >= todayDate;
  }

  // procesa un array de numeros (number[]) y devuelve un objeto Date
  processDate(movementDatetime: number[] | null): Date | null {
    if (!movementDatetime || movementDatetime.length < 6) {
      return null; // Retorna null si el arreglo es nulo o tiene menos de 6 elementos
    }
  
    const [year, month, day, hours, minutes, seconds] = movementDatetime;
  
    // Restamos 1 al mes para ajustarlo al formato de Date
    let response = new Date(year, month - 1, day, hours, minutes, seconds);
    console.log(response);

    return response;
  };
// FIN funciones para comparar FECHAS













// funciones para comparar HORAS
    //devuelve el index del AllowedDayDto valido, dentro de la list authRangeInfoDto.allowedDays
    todayIsAllowedDay(authRangeInfoDto: AuthRangeInfoDto | undefined): number{

      if(authRangeInfoDto != undefined){
        for (var i = 0; i < authRangeInfoDto.allowedDays.length; i++) {
    
          //console.log("todayIsInHourRange (en visitors.service) | ciclo del for: ", i);
    
          if(this.isTodayAnAllowedDay(authRangeInfoDto.allowedDays.at(i))){
            //console.log("(Visitor dentro del rango horario!) index del AllowedDayDto valido: ", i);
            return i; // devuelve el indice donde esta el allowedDayDto valido
          }
        }
      }

      return -1; // no hay rango q comprenda el DIA y HORA actual
    }

    // verifica si el Visitor esta dentro de un DIA permitido, y dentro del rango HORARIO permitido
    isTodayAnAllowedDay(allowedDayDto: AccessAllowedDaysDto | undefined): boolean {
      //console.log("Metodo isTodayAnAllowedDay...");
    
      // Verifica si los datos estan definidos
      if (!allowedDayDto?.day || !allowedDayDto?.init_hour || !allowedDayDto?.end_hour) {
        //console.log("AllowedDay es undefined");
        return false;
      }

      //verifica si uno de los dias permitidos es hoy
      if (allowedDayDto.day.toString().toLowerCase() != this.getTodayDayOfWeek().toLowerCase()){
        return false;
      }
    
      // fecha y hora actual para comparar
      let todayDate = new Date();
    
      // compara si la fecha actual esta dentro del rango horario permitido
      return this.getHourInit(allowedDayDto) <= todayDate && this.getHourEnd(allowedDayDto) >= todayDate;
    }
    
    //devuelve la hora de inicio (de un Allowed_DaysDto) en formato Date 
    getHourInit(allowedDayDto: AccessAllowedDaysDto): Date{

      let response = new Date();

      response.setHours(Number(allowedDayDto.init_hour.at(0)));
      response.setMinutes(Number(allowedDayDto.init_hour.at(1)));

      return response;
    }

    //devuelve la hora de find (de un Allowed_DaysDto) en formato Date 
    getHourEnd(allowedDayDto: AccessAllowedDaysDto): Date{

      let response = new Date();

      response.setHours(Number(allowedDayDto.end_hour.at(0)));
      response.setMinutes(Number(allowedDayDto.end_hour.at(1)));
      response.setSeconds(0);

      return response;
    }


    //metodo q devuelve la hora en formato string (para mostrarla en el front)
    stringToHour(allowedDayDto: AccessAllowedDaysDto, x: boolean): string {
      
      const hours = x ? allowedDayDto.init_hour : allowedDayDto.end_hour;      
    
      // funcion auxiliar para formatear la hora
      const formatHour = (hour: unknown): string => {
        if (typeof hour === 'string') {
          return hour.padStart(2, '0');
        } else if (typeof hour === 'number') {
          return hour.toString().padStart(2, '0');
        }
        return '00';
      };
    
      // formatea horas y minutos
      const formattedHours = formatHour(hours?.[0]);
      const formattedMinutes = formatHour(hours?.[1]);
    
      return `${formattedHours}:${formattedMinutes}:00`;
    }

    //devuelve el dia de hoy (en el mismo formato q devuelve el back, osea el tipo de dato DayOfWeek en java)
    getTodayDayOfWeek(): string {
      const daysOfWeek = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = new Date().getDay(); // devuelve un numero entre 0 (Sunday) y 6 (Saturday)

      //console.log("metodo getTodayDayOfWeek(): ", today);

      return daysOfWeek[today]; // devuelve el dia de hoy en formato string
    }

// FIN funciones para comparar HORAS











// ALERTS de SweetAlert

  //Alerts para registerEntry()
  // muestra un modal avisando q el Visitor esta fuera de rango (dia y hora permitido)
  entryOutOfAuthorizedHourRange(visitor: AccessUserAllowedInfoDto, indexAuthRange: number, indexDayAllowed: number){

    let allowedDay = visitor.authRanges.at(indexAuthRange)?.allowedDays.at(indexDayAllowed);
    let rangesHtml = '';

    if(allowedDay != undefined && allowedDay.day != undefined && allowedDay.init_hour != undefined && allowedDay.end_hour != undefined){
          
        rangesHtml = `
          <p>
            <strong>Rango horario permitido: </strong> <br>
            <strong>Desde: </strong> ${this.stringToHour(allowedDay, true)} <br>
            <strong>Hasta: </strong> ${this.stringToHour(allowedDay, false)}
          </p>
        `;
      
    }

    Swal.fire({
      title: 'Denegar ingreso!',
      html: `
        <strong>El Visitante está fuera del rango horario permitido!</strong> <br>
        ${rangesHtml}
      `,
      icon: 'error',
      confirmButtonText: 'Cerrar'
    });
  }

  // muestra un modal avisando q el Visitor esta fuera de rango (fechas permitidas)
  entryOutOfAuthorizedDateRange(visitor: AccessUserAllowedInfoDto){

    let rangesHtml = '';
    let rangeNumber = 1;

    for (const range of visitor.authRanges) {

      rangeNumber++;

      rangesHtml += `
        <p>
          <strong>Rango permitido ${rangeNumber}:</strong>
          <strong>Fecha de inicio: </strong> ${this.datePipe.transform(range.init_date,'dd/MM/yyyy')?.toString()}<br>
          <strong>Fecha de fin: </strong> ${this.datePipe.transform(range.end_date,'dd/MM/yyyy')?.toString()}
        </p>
      `;
    }

    Swal.fire({
      title: 'Denegar ingreso!',
      html: `
        <strong>El Visitante está fuera del rango permitido!</strong>
        ${rangesHtml}
      `,
      icon: 'error',
      confirmButtonText: 'Cerrar'
    });
  }
  //FIN Alerts para registerEntry()

  //Alerts para registerExit()
  // muestra un modal avisando q el Visitor esta SALIENDO TARDE (fecha de egreso mayor q la fecha permitida)
  exitLaterThanAuthorizedDateRange(visitor: AccessUserAllowedInfoDto){

    let rangesHtml = '';
    let rangeNumber = 1;
      
    for (const range of visitor.authRanges) {
  
      rangeNumber++;
  
      rangesHtml += `
        <p>
          <strong>Rango permitido ${rangeNumber}:</strong>
          <strong>Fecha de inicio: </strong> ${this.datePipe.transform(range.init_date,'dd/MM/yyyy')?.toString()}<br>
          <strong>Fecha de fin: </strong> ${this.datePipe.transform(range.end_date,'dd/MM/yyyy')?.toString()}
        </p>
      `;
    }
  
    Swal.fire({
      title: 'El Visitante está saliendo muy tarde!',
      html: `
        <strong>El Visitante está fuera del rango permitido!</strong>
        ${rangesHtml}
      `,
      icon: 'warning',
      confirmButtonText: 'Cerrar'
    });
  }

  // muestra un modal avisando q el Visitor esta SALIENDO TARDE (hora de egreso mayor q la hora permitida)
  exitLaterThanAuthorizedHourRange(visitor: AccessUserAllowedInfoDto, indexAuthRange: number, indexDayAllowed: number){

    let allowedDay = visitor.authRanges.at(indexAuthRange)?.allowedDays.at(indexDayAllowed);
    let rangesHtml = '';

    if(allowedDay != undefined && allowedDay.day != undefined && allowedDay.init_hour != undefined && allowedDay.end_hour != undefined){
          
        rangesHtml = `
          <p>
            <strong>Rango horario permitido </strong> <br>
            <strong>Desde: </strong> ${this.stringToHour(allowedDay, true)} <br>
            <strong>Hasta: </strong> ${this.stringToHour(allowedDay, false)}
          </p>
        `;
      
    }

    Swal.fire({
      title: 'El Visitante está saliendo tarde!',
      html: `
        <strong>El Visitante está fuera del rango horario permitido!</strong> <br>
        ${rangesHtml}
      `,
      icon: 'warning',
      confirmButtonText: 'Cerrar'
    });
  }
  
  registerExitSuccess(newMovement_ExitDto: AccessNewMovementExitDto){
    Swal.fire({
      icon: 'success',
      title: 'Egreso registrado!',
      text: `¡El Egreso de "${newMovement_ExitDto.newUserAllowedDto.name} ${newMovement_ExitDto.newUserAllowedDto.last_name}" fue registrado con éxito!`,
      confirmButtonColor: '#28a745',
    });
  }

  registerExitError(){
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error al registrar el Egreso. Inténtelo de nuevo.',
      confirmButtonText: 'Cerrar'        
    });
  }

  getlastExitError(){
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error obteniendo el último Egreso de la Persona. Inténtelo de nuevo.',
      confirmButtonText: 'Cerrar'        
    });
  }
  //FIN Alerts para registerExit()





  // Alerts para registerEntry()
  registerEntrySuccess(newMovements_EntryDto: AccessNewMovementsEntryDto){
    Swal.fire({
      icon: 'success',
      title: 'Ingreso registrado!',
      text: `¡El Ingreso de "${newMovements_EntryDto.newUserAllowedDto.name} ${newMovements_EntryDto.newUserAllowedDto.last_name}" fue registrado con éxito!`,
      confirmButtonColor: '#28a745',
    });
  }

  registerEntryError(){
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error al registrar el Ingreso. Inténtelo de nuevo.',
      confirmButtonText: 'Cerrar'        
    });
  }

  getLastEntryError(){
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error obteniendo el último Ingreso del visitante. Inténtelo de nuevo.',
      confirmButtonText: 'Cerrar'        
    });
  }

  entryNotAllowed(){
    Swal.fire({
      title: 'El Visitante tiene un Ingreso previo!',
      html: `
        El Visitante debe egresar antes de poder volver a entrar
      `,
      icon: 'error',
      confirmButtonText: 'Cerrar'
    });
  }
  exitNotAllowed(){
    Swal.fire({
      title: 'El Visitante tiene un Egreso previo!',
      html: `
        El Visitante debe ingresar antes de poder volver a salir
      `,
      icon: 'error',
      confirmButtonText: 'Cerrar'
    });
  }
  //FIN Alerts para registerEntry()
// FIN ALERTS de SweetAlert

}
