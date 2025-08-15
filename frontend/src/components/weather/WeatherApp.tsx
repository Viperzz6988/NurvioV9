import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Cloud, Sun, CloudRain, CloudSnow, Wind, Thermometer, 
  Droplets, Eye, Gauge, MapPin, Search, Loader2 
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  conditionCode: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  icon: string;
  description: string;
  uvIndex: number;
}

interface WeatherError {
  message: string;
  code?: string;
}

const WeatherApp: React.FC = () => {
  const { t } = useLanguage();
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<WeatherError | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const API_KEY = '8001c0364c51463184b213838250108';

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('weatherRecentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (searchCity: string) => {
    const updated = [searchCity, ...recentSearches.filter(s => s !== searchCity)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('weatherRecentSearches', JSON.stringify(updated));
  };

  const getWeatherIcon = (conditionCode: number) => {
    // WeatherAPI.com condition codes mapping
    const iconMap: Record<number, any> = {
      1000: Sun, // Clear
      1003: Cloud, // Partly cloudy
      1006: Cloud, // Cloudy
      1009: Cloud, // Overcast
      1030: Cloud, // Mist
      1063: CloudRain, // Patchy rain possible
      1066: CloudSnow, // Patchy snow possible
      1069: CloudSnow, // Patchy sleet possible
      1087: CloudRain, // Thundery outbreaks possible
      1114: CloudSnow, // Blowing snow
      1117: CloudSnow, // Blizzard
      1135: Cloud, // Fog
      1147: Cloud, // Freezing fog
      1150: CloudRain, // Patchy light drizzle
      1153: CloudRain, // Light drizzle
      1168: CloudRain, // Freezing drizzle
      1171: CloudRain, // Heavy freezing drizzle
      1180: CloudRain, // Patchy light rain
      1183: CloudRain, // Light rain
      1186: CloudRain, // Moderate rain at times
      1189: CloudRain, // Moderate rain
      1192: CloudRain, // Moderate or heavy rain shower
      1195: CloudRain, // Heavy rain
      1198: CloudRain, // Light freezing rain
      1201: CloudRain, // Moderate or heavy freezing rain
      1204: CloudSnow, // Light sleet
      1207: CloudSnow, // Moderate or heavy sleet
      1210: CloudSnow, // Patchy light snow
      1213: CloudSnow, // Light snow
      1216: CloudSnow, // Patchy moderate snow
      1219: CloudSnow, // Moderate snow
      1222: CloudSnow, // Patchy heavy snow
      1225: CloudSnow, // Heavy snow
      1237: CloudSnow, // Ice pellets
      1240: CloudRain, // Light rain shower
      1243: CloudRain, // Moderate or heavy rain shower
      1246: CloudRain, // Torrential rain shower
      1249: CloudSnow, // Light sleet showers
      1252: CloudSnow, // Moderate or heavy sleet showers
      1255: CloudSnow, // Light snow showers
      1258: CloudSnow, // Moderate or heavy snow showers
      1261: CloudSnow, // Light showers of ice pellets
      1264: CloudSnow, // Moderate or heavy showers of ice pellets
      1273: CloudRain, // Patchy light rain with thunder
      1276: CloudRain, // Moderate or heavy rain with thunder
    };
    return iconMap[conditionCode] || Cloud;
  };

  const getTemperatureColor = (temp: number) => {
    if (temp <= 0) return 'text-blue-500';
    if (temp <= 10) return 'text-cyan-500';
    if (temp <= 20) return 'text-green-500';
    if (temp <= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getWeatherTips = (weather: WeatherData) => {
    const tips = [];
    
    if (weather.temperature < 0) {
      tips.push(t('weather.tips.cold'));
    }
    if (weather.temperature > 25) {
      tips.push(t('weather.tips.hot'));
    }
    if (weather.conditionCode >= 1063 && weather.conditionCode <= 1276) {
      tips.push(t('weather.tips.rainy'));
    }
    if (weather.windSpeed > 20) {
      tips.push(t('weather.tips.windy'));
    }
    
    if (tips.length === 0) {
      tips.push(t('weather.tips.perfect'));
    }
    
    return tips;
  };

  const fetchWeather = async (searchCity?: string) => {
    const cityToSearch = searchCity || city;
    if (!cityToSearch.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(cityToSearch)}&aqi=no`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || t('weather.error'));
      }
      
      const data = await response.json();
      
      const weatherData: WeatherData = {
        location: data.location.name,
        temperature: Math.round(data.current.temp_c),
        feelsLike: Math.round(data.current.feelslike_c),
        condition: data.current.condition.text,
        conditionCode: data.current.condition.code,
        humidity: data.current.humidity,
        windSpeed: Math.round(data.current.wind_kph),
        visibility: Math.round(data.current.vis_km),
        pressure: Math.round(data.current.pressure_mb),
        icon: data.current.condition.icon,
        description: data.current.condition.text,
        uvIndex: data.current.uv
      };
      
      setWeather(weatherData);
      saveRecentSearch(cityToSearch);
      setCity(cityToSearch);
    } catch (err: any) {
      setError({
        message: err.message || t('weather.error'),
        code: 'API_ERROR'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchWeather();
  };

  const handleCityClick = (clickedCity: string) => {
    setCity(clickedCity);
    fetchWeather(clickedCity);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            {t('weather.title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('weather.description')}
          </p>
        </div>

        {/* Search */}
        <Card className="glass-card mb-8">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t('weather.search')}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading || !city.trim()}
                className="bg-gradient-primary hover:shadow-hover"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={16} />
                    {t('weather.loading')}
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2" size={16} />
                    {t('weather.searchButton')}
                  </>
                )}
              </Button>
            </div>
            {error && (
              <div className="text-red-500 text-sm mt-2 flex items-center gap-2">
                <span>⚠️</span>
                {error.message}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weather Display */}
        {weather && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Weather Card */}
            <div className="lg:col-span-2">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <img 
                      src={weather.icon} 
                      alt={weather.condition}
                      className="w-8 h-8"
                    />
                    {weather.location}
                  </CardTitle>
                  <CardDescription>{t('weather.currentWeather')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-8">
                    <div className={`text-6xl font-bold mb-2 ${getTemperatureColor(weather.temperature)}`}>
                      {weather.temperature}°C
                    </div>
                    <div className="text-xl text-muted-foreground mb-4">
                      {weather.description}
                    </div>
                    <div className="flex justify-center">
                      {React.createElement(getWeatherIcon(weather.conditionCode), {
                        size: 64,
                        className: "text-primary"
                      })}
                    </div>
                  </div>

                  {/* Weather Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <Droplets className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                      <div className="text-sm text-muted-foreground">{t('weather.humidity')}</div>
                      <div className="text-lg font-bold text-primary">{weather.humidity}%</div>
                    </div>
                    
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <Wind className="w-6 h-6 mx-auto mb-2 text-green-500" />
                      <div className="text-sm text-muted-foreground">{t('weather.windSpeed')}</div>
                      <div className="text-lg font-bold text-primary">{weather.windSpeed} km/h</div>
                    </div>
                    
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <Eye className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                      <div className="text-sm text-muted-foreground">{t('weather.visibility')}</div>
                      <div className="text-lg font-bold text-primary">{weather.visibility} km</div>
                    </div>
                    
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <Gauge className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                      <div className="text-sm text-muted-foreground">{t('weather.pressure')}</div>
                      <div className="text-lg font-bold text-primary">{weather.pressure} hPa</div>
                    </div>
                    
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <Thermometer className="w-6 h-6 mx-auto mb-2 text-red-500" />
                      <div className="text-sm text-muted-foreground">{t('weather.feelsLike')}</div>
                      <div className="text-lg font-bold text-primary">{weather.feelsLike}°C</div>
                    </div>
                    
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <Sun className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                      <div className="text-sm text-muted-foreground">{t('weather.uvIndex')}</div>
                      <div className="text-lg font-bold text-primary">{weather.uvIndex}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Info */}
            <div className="space-y-6">
              {/* Weather Tips */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>{t('weather.tips')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {getWeatherTips(weather).map((tip, index) => (
                      <div key={index} className="p-2 bg-primary/10 border border-primary/20 rounded">
                        {tip}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Recent Searches</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {recentSearches.map((searchCity, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleCityClick(searchCity)}
                        >
                          <MapPin className="mr-2" size={16} />
                          {searchCity}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Getting Started */}
        {!weather && !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌤️</div>
            <h3 className="text-2xl font-bold mb-4">{t('weather.getStarted')}</h3>
            <p className="text-muted-foreground mb-8">
              Enter a city to get current weather data.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Berlin', 'München', 'Hamburg', 'Wien', 'Zürich'].map((city) => (
                <Button
                  key={city}
                  variant="outline"
                  onClick={() => handleCityClick(city)}
                  className="glass-card"
                >
                  {city}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherApp;