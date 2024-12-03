export interface GetUserDto {
    /**
     * Identificador único del usuario.
     */
    id?: number;
  
    /**
     * Nombre real del usuario.
     */
    name?: string;
  
    /**
     * Apellido del usuario.
     */
    lastname?: string;
  
    /**
     * Nombre de usuario utilizado en login.
     */
    username?: string;
  
    /**
     * Contraseña del usuario utilizada en login.
     */
    password?: string;
  
    /**
     * Email del usuario que se obtiene desde el microservicio de Contactos.
     */
    email?: string;
  
    /**
     * Número de teléfono del usuario que se obtiene desde el microservicio de Contactos.
     */
    phone_number?: string;
  
    /**
     * Número de DNI del usuario.
     */
    dni?: string;
  
    /**
     * Tipo de DNI del usuario.
     */
    dni_type?: string;
  
    /**
     * Representa si el usuario está activo o no.
     */
    active?: boolean;
  
    /**
     * Dirección URL del avatar asignado al usuario.
     */
    avatar_url?: string;
  
    /**
     * Fecha de nacimiento del usuario.
     */
    datebirth?: string;
  
    /**
     * Fecha de creación del usuario.
     */
    create_date?: string;
  
    /**
     * Lista de los roles que tiene el usuario.
     */
    roles?: string[];
  
    /**
     * Identificador del lote asignado al usuario.
     */
    plot_id?: number[];
  
    /**
     * Identificador de la plataforma telegram utilizada en notificaciones.
     */
    telegram_id?: number;
  }