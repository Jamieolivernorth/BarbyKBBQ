import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { WiDaySunny, WiCloudy, WiRain, WiStrongWind } from "react-icons/wi";
import { Location } from "@shared/schema";

interface WeatherWidgetProps {
  location: Location;
}

interface WeatherData {
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  wind: {
    speed: number;
  };
}

export function WeatherWidget({ location }: WeatherWidgetProps) {
  const { data: weather, isLoading } = useQuery<WeatherData>({
    queryKey: ["/api/weather", location.name],
    enabled: !!location,
  });

  const getWeatherIcon = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case "clear":
        return <WiDaySunny className="w-12 h-12 text-yellow-500" />;
      case "clouds":
        return <WiCloudy className="w-12 h-12 text-gray-500" />;
      case "rain":
        return <WiRain className="w-12 h-12 text-blue-500" />;
      default:
        return <WiDaySunny className="w-12 h-12 text-yellow-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-slate-200 h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getWeatherIcon(weather.weather[0]?.main)}
            <div>
              <h3 className="font-semibold text-lg">{location.name}</h3>
              <p className="text-sm text-gray-600">{weather.weather[0]?.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{Math.round(weather.main.temp)}°C</p>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <WiStrongWind className="w-4 h-4" />
              <span>{Math.round(weather.wind.speed)} km/h</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
