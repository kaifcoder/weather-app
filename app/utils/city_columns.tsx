"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export type CityWeatherTable = {
  ascii_name: string;
  cou_name_en: string;
  timezone: string;
  lon: number;
  lat: number;
};

const data = {
  city: "Charkh",
  country: "Afghanistan",
  timezone: "Asia/Kabul",
  coordinates: { lon: 68.93749, lat: 33.79712 },
};

export const citycolumns: ColumnDef<CityWeatherTable>[] = [
  {
    accessorKey: "ascii_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          City
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "cou_name_en",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Country
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "timezone",
    header: "Timezone",
  },
];
