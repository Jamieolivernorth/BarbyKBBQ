import { getEnvironmentBanner, CURRENT_ENV } from "@shared/config";

export function EnvironmentBanner() {
  const bannerText = getEnvironmentBanner();
  
  if (!bannerText) return null;
  
  // Apply different colors based on environment
  const getBannerColor = () => {
    switch (CURRENT_ENV) {
      case 'local':
        return 'bg-blue-600';
      case 'staging':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-600';
    }
  };
  
  return (
    <div className={`${getBannerColor()} text-white text-center text-xs py-1 px-2 font-medium`}>
      {bannerText} ENVIRONMENT
    </div>
  );
}