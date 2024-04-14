import React from "react";
import { DataTable } from "./Components/data-table";
import { citycolumns, CityWeatherTable } from "./utils/city_columns";

type Props = {};

async function getCityData(limit: number = 20, offset: number = 0) {
  const res = await fetch(
    `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-all-cities-with-a-population-1000/records?select=ascii_name%2Ccou_name_en%2Ctimezone%2Ccoordinates&limit=${limit}&offset=${offset}&lang=en`
  );
  const data = await res.json();
  const transformedData = data.results.map((record: any) => {
    return {
      ascii_name: record.ascii_name,
      cou_name_en: record.cou_name_en,
      timezone: record.timezone,
      lat: record.coordinates[0],
      lon: record.coordinates[1],
    };
  });
  return transformedData;
}

const page = async (props: Props) => {
  const citydata: CityWeatherTable[] = await getCityData(50, 0);

  return (
    <div>
      <DataTable columns={citycolumns} data={citydata ? citydata : []} />
    </div>
  );
};

export default page;
