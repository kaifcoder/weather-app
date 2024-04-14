import React from "react";
import { DataTable } from "./Components/data-table";
import { citycolumns, CityWeatherTable } from "./utils/city_columns";

type Props = {};

async function getCityData(limit: number = 20, offset: number = 0) {
  const res = await fetch(
    `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-all-cities-with-a-population-1000/records?&limit=${limit}&offset=${offset}&lang=en`
  );
  const data = await res.json();
  const transformedData = data.results.map((record: any) => {
    return {
      ascii_name: record.ascii_name,
      cou_name_en: record.cou_name_en,
      timezone: record.timezone,
      lat: record.coordinates.lat,
      lon: record.coordinates.lon,
    };
  });
  return transformedData;
}

const page = async (props: Props) => {
  const citydata: CityWeatherTable[] = await getCityData(100, 0);

  return (
    <div>
      <DataTable columns={citycolumns} data={citydata ? citydata : []} />
      <iframe
        src="https://public.opendatasoft.com/explore/embed/dataset/geonames-all-cities-with-a-population-1000/table/?disjunctive.cou_name_en&sort=name&location=2,0.90932,0.12126&basemap=jawg.light&static=false&datasetcard=false"
        width="100%"
        height="800"
      ></iframe>
    </div>
  );
};

export default page;
