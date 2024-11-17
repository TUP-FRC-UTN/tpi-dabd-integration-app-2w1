import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { data } from 'jquery';
import { WeatherData } from '../users-models/weather/WeatherData';
import { ForecastData } from '../users-models/weather/ForecastData';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private readonly http: HttpClient = inject(HttpClient);
  private readonly apiKey = 'ea11cc407874e74105bd513376cc4b71'
  private readonly city = 'Cordoba,AR'
  weather: WeatherData | null = null;
  forecast: WeatherData[] = [];

  private weatherSubject = new BehaviorSubject<WeatherData | null>(null);
  weather$ = this.weatherSubject.asObservable();

  private forecastSubject = new BehaviorSubject<WeatherData[]>([]);
  forecast$ = this.forecastSubject.asObservable();

  weatherTranslations: { [key: string]: string } = {
    'clear sky': 'Cielo despejado',
    'few clouds': 'Pocas nubes',
    'scattered clouds': 'Nubes dispersas',
    'broken clouds': 'Nublado parcial',
    'shower rain': 'Lluvia fuerte',
    'rain': 'Lluvia',
    'dust': 'Viento con polvo',
    'thunderstorm': 'Tormenta eléctrica',
    'snow': 'Nieve',
    'mist': 'Neblina',
    'overcast clouds': 'Nublado total',
    'light rain': 'Lluvia ligera',
    'hot': 'Calor',
    'warm': 'Cálido',
    'mild': 'Templado',
    'cool': 'Fresco',
    'cold': 'Frío',
    'freezing': 'Muy Frío',
    'chilly': 'Muy Frío',
    'breezy': 'Viento suave',
    'windy': 'Viento fuerte',
    'humid': 'Húmedo',
    'dry': 'Seco',
    'heatwave': 'Ola de calor',
    'cold snap': 'Ola de frío'
  };


  getWeather() {
    this.http.get<WeatherData>(
      `https://api.openweathermap.org/data/2.5/weather?q=${this.city}&units=metric&appid=${this.apiKey}`
    ).subscribe(
      data => {
        if (data.weather[0]) {
          data.weather[0].description =
            this.weatherTranslations[data.weather[0].description.toLowerCase()] ||
            data.weather[0].description;
        }
        this.weatherSubject.next(data);
      },
      error => console.error('Error fetching weather data', error)
    );
  }

  getForecast() {
    this.http.get<ForecastData>(
      `https://api.openweathermap.org/data/2.5/forecast?q=${this.city}&units=metric&appid=${this.apiKey}`
    ).subscribe(
      data => {
        // Filtrar para obtener solo los pronósticos de las 12:00 PM
        const dailyForecasts = data.list.filter(item => {
          return item.dt_txt ? new Date(item.dt_txt).getHours() === 12 : false;
        }).map(curr => {
          // Traducir la descripción
          if (curr.weather[0]) {
            curr.weather[0].description =
              this.weatherTranslations[curr.weather[0].description.toLowerCase()] ||
              curr.weather[0].description;
          }
          return curr;
        });

        // Emitir los primeros 3 días después de hoy en forecastSubject
        this.forecastSubject.next(dailyForecasts.slice(0, 2)); // Aquí cambiamos para mostrar desde el lunes en adelante
      },
      error => console.error('Error fetching forecast data', error)
    );
}
}
  

