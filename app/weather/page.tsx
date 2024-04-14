"use client";

import AirPollution from "../Components/AirPollution/AirPollution";
import DailyForecast from "../Components/DailyForecast/DailyForecast";
import FeelsLike from "../Components/FeelsLike/FeelsLike";
import Humidity from "../Components/Humidity/Humidity";
import Mapbox from "../Components/Mapbox/Mapbox";
import Population from "../Components/Population/Population";
import Pressure from "../Components/Pressure/Pressure";
import Sunset from "../Components/Sunset/Sunset";
import Temperature from "../Components/Temperature/Temperature";
import UvIndex from "../Components/UvIndex/UvIndex";
import Visibility from "../Components/Visibility/Visibility";
import Wind from "../Components/Wind/Wind";
import defaultStates from "../utils/defaultStates";
import FiveDayForecast from "../Components/FiveDayForecast/FiveDayForecast";
import { useGlobalContextUpdate } from "../context/globalContext";

export default function Home() {
  const { setActiveCityCoords } = useGlobalContextUpdate();

  const getClickedCityCords = (lat: number, lon: number) => {
    setActiveCityCoords([lat, lon]);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <main>
      <div className="pb-4 flex flex-col gap-4 md:flex-row">
        <div className="flex flex-col gap-4 w-full min-w-[18rem] md:w-[35rem]">
          <Temperature />
          <div className="max-h-[600px]">
            <FiveDayForecast />
          </div>
        </div>
        <div className="flex flex-col w-full">
          <div className="instruments grid h-full gap-4 col-span-full sm-2:col-span-2 lg:grid-cols-3 xl:grid-cols-4">
            <AirPollution />
            <Sunset />
            <Wind />
            <DailyForecast />
            <UvIndex />
            <FeelsLike />
            <Humidity />
            <Visibility />
            <Pressure />
          </div>
          <div className="mapbox-con mt-4 h-[450px] flex gap-4">
            <Mapbox />
          </div>
        </div>
      </div>
    </main>
  );
}
