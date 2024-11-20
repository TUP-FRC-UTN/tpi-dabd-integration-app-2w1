import { Injectable } from '@angular/core';
import { User } from '../../../../models/access-report/User';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, from } from 'rxjs';
import { API_ENDPOINTS } from '../../../../entries-environment';

@Injectable({
  providedIn: 'root'
})
export class AccessUserReportService {
  private apiUrl = API_ENDPOINTS.USERS;
  private userCache: Map<number, User> = new Map();
  private cacheInitialized = false;
  private cacheInitialization: Promise<void> | null = null;
  
  private defaultOwner: User = {  
    id: 3,
    name: 'Charlie',
    lastname: 'Brown',
    username: 'charlieb',
    email: 'charlieb@example.com',
    dni: 34567890,
    contact_id: 1003,
    active: true,
    avatar_url: 'https://example.com/avatar/charlieb.png',
    datebirth: '1992-07-25T00:00:00',
    roles: ['Propietario']
  };

  constructor(private http: HttpClient) {
    this.initializeCache();
  }

  private initializeCache(): Promise<void> {
    if (this.cacheInitialization) {
      return this.cacheInitialization;
    }

    this.cacheInitialization = new Promise<void>((resolve) => {
      this.getAllUsers().subscribe(users => {
        users.forEach(user => {
          this.userCache.set(user.id, user);
        });
        this.cacheInitialized = true;
        resolve();
      });
    });

    return this.cacheInitialization;
  }

  async ensureCacheInitialized(): Promise<void> {
    if (!this.cacheInitialized) {
      await this.initializeCache();
    }
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      catchError(() => of([]))
    );
  }

  getUserById(id: number | null): Observable<string> {
    if (!id) {
      return of('------');
    }

    // Asegurarnos de que el cache esté inicializado
    return from(this.ensureCacheInitialized()).pipe(
      map(() => {
        const user = this.userCache.get(id);
        if (user) {
          return `${user.lastname}, ${user.name}`;
        }
        // Si no se encuentra el usuario, devolver el default
        return `${this.defaultOwner.lastname}, ${this.defaultOwner.name}`;
      })
    );
  }
  getUsersByRole(role: string): Observable<User[]> {
    return this.getAllUsers().pipe(
      map(users => users.filter(user => 
        user.roles.some(userRole => 
          userRole.toLowerCase() === role.toLowerCase()
        )
      ))
    );
  }
  validateDniNotPropietario(dni: string | number): Observable<boolean> {
    if (!dni) {
      return of(true);
    }
  
    return this.getUsersByRole('Propietario').pipe(
      map(propietarios => {
        const dniNumber = Number(dni);
        
        if (isNaN(dniNumber)) {
          return true;
        }
        
        const isPropietario = propietarios.some(user => 
          Number(user.dni) === dniNumber
        );
      
        return !isPropietario;
      })
    );
  }
    // Método para obtener usuarios propietarios con formato para ng-select
    getPropietariosForSelect(): Observable<any[]> {
      return this.getUsersByRole('Propietario').pipe(
        map(users => users.map(user => ({
          id: user.id,
          label: `${user.lastname}, ${user.name}`
        })))
      );
    }
  
    // Método para obtener guardias con formato para ng-select
    getGuardiasForSelect(): Observable<any[]> {
      return this.getUsersByRole('Seguridad').pipe(
        map(users => users.map(user => ({
          id: user.id,
          label: `${user.lastname}, ${user.name}`
        })))
      );
    }
  

  isNumeric(value: string): boolean {
    return !isNaN(Number(value)) && !isNaN(parseFloat(value));
  }

  transformNameOrId(value: string | null): Observable<string> {
    if (value === null || value === '') {
      return of(value || '');
    }

    if (this.isNumeric(value)) {
      return this.getUserById(Number(value));
    }
    return of(value);
  }
}