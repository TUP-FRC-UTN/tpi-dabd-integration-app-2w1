import { inject, Injectable } from '@angular/core';
import { LoginService } from './login.service';
import { UserGet } from '../users-models/users/UserGet';
import { KJUR } from 'jsrsasign';
import { UserLoged } from '../users-models/users/UserLoged';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  
  async login(data: any): Promise<void> {
    this.saveToken(data.token);
    this.saveActualRole(this.getUser().roles[0]);
  }

  //Obtiene el token y genera un UserLoged
  getUser(): UserLoged{
    var user = new UserLoged();
      const decodedToken: any = KJUR.jws.JWS.parse(this.getToken() || '');
      user.id = decodedToken.payloadObj.id;
      user.roles = decodedToken.payloadObj.roles;
      user.name = decodedToken.payloadObj.name;
      user.lastname = decodedToken.payloadObj.lastname;
      user.plotId = decodedToken.payloadObj.plot_id;

      return user;
  }

  //Guarda el token en LocalStorage
  saveToken(token: string) {
    localStorage.setItem('jwtToken', token);
  }

  //Obtiene el token del almacenamiento
  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  //Elimina el token
  logOut() {
    localStorage.removeItem('jwtToken');
  }

  //Verifica si el id existe ene l localstorage
  isLoggedIn(): boolean {
    return localStorage.getItem('jwtToken') !== null;
  }

  //Verifica si tiene cierto rol
  hasRole(role: string): boolean {
    return this.getUser().roles.includes(role); 
  }

  // Método para crear el JWT y guardarlo en el localStorage
  saveActualRole(rolSelected: string): void {
    const header = { alg: 'HS256', typ: 'JWT' }; // Cabecera
    const payload = {
      selectedRol: rolSelected,
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // Expira en 1 hora
    };
    
    const secret = 'your-256-bit-secret'; // Clave secreta (debe ser segura y no expuesta en código)
    
    // Crear el JWT
    const token = KJUR.jws.JWS.sign('HS256', JSON.stringify(header), JSON.stringify(payload), secret);
    
    // Guardar el token en localStorage
    localStorage.setItem('jwtRole', token);
  }

  hasActualRole(): boolean {
    return localStorage.getItem('jwtRole') == null;
  }

  // Método para obtener el rolSelected desde el JWT en el localStorage
  getActualRole(): string | null {
    const token = localStorage.getItem('jwtRole');
    if (!token) {
      return null; // Retorna null si no hay token
    }

    const secret = 'your-256-bit-secret'; // Debe ser la misma clave secreta utilizada para firmar el token

    // Decodificar el JWT
    const decodedToken: any = KJUR.jws.JWS.parse(token);
    // Verifica la firma
    const isValid = KJUR.jws.JWS.verify(token, secret, ['HS256']);
    
    if (isValid) {
      return decodedToken.payloadObj.selectedRol || null; // Retorna el rolSelected
    } else {
      console.error('Token no es válido.');
      return null;
    }
  }

}
