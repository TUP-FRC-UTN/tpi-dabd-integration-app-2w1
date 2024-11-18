export interface WeatherData {
    currentDate: Date;
    dayOfWeek: string; // Día de la semana
    main: {
      temp: number;        // Temperatura actual
      feels_like: number;  // Sensación térmica
      temp_min: number;    // Temperatura mínima
      temp_max: number;    // Temperatura máxima
      humidity: number;    // Humedad
      pressure: number;    // Presión
    };
    weather: [{
      description: string; // Descripción del clima (e.g., "dust")
      icon: string;        // Icono del clima
    }];
    wind: {
      speed: number;       // Velocidad del viento
      deg: number;         // Dirección del viento
      gust: number;        // Ráfaga de viento
    };
    rain?: {
      "1h"?: number;       // Volumen de lluvia en la última hora
      "3h"?: number;       // Volumen de lluvia en las últimas 3 horas
    };
    clouds: {
      all: number;         // Porcentaje de nubosidad
    };
    visibility: number;    // Visibilidad en metros
    dt_txt?: string;       // Fecha y hora del pronóstico, opcional
  }