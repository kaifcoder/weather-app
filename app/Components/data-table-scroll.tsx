"use client";

//3 TanStack Libraries!!!
import {
  ColumnDef,
  ColumnSort,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  OnChangeFn,
  Row,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  keepPreviousData,
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import React, { use, useEffect } from "react";
import { CityWeatherTable } from "../utils/city_columns";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGlobalContextUpdate } from "../context/globalContext";
import useGeolocation from "../hooks/useGeolocation";

const fetchSize = 50;

function DataTableScrollComp() {
  //we need a reference to the scrolling element for logic down below
  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  const router = useRouter();
  useGeolocation();

  const { activeCityCoords, setActiveCityCoords } = useGlobalContextUpdate();

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = React.useMemo<ColumnDef<CityWeatherTable>[]>(
    () => [
      {
        accessorKey: "ascii_name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
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
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
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
    ],
    []
  );

  type CityApiResponse = {
    total_count: number;
    results: CityWeatherTable[];
  };

  async function getCityData(
    limit: number = 20,
    offset: number = 0,
    sorting: SortingState
  ) {
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
    // console.log("transformedData", transformedData);
    const total_count = data.total_count;
    const newResults = {
      total_count,
      results: transformedData,
    };
    console.log("newResults", newResults);
    if (sorting.length) {
      const sort = sorting[0] as ColumnSort;
      const { id, desc } = sort as {
        id: keyof CityWeatherTable;
        desc: boolean;
      };
      newResults.results.sort((a: any, b: any) => {
        if (desc) {
          return a[id] < b[id] ? 1 : -1;
        }
        return a[id] > b[id] ? 1 : -1;
      });
    }
    return newResults;
  }

  //react-query has a useInfiniteQuery hook that is perfect for this use case
  const { data, fetchNextPage, isFetching, isLoading } =
    useInfiniteQuery<CityApiResponse>({
      queryKey: [
        "ascii_name",
        "cou_name_en",
        "timezone",
        "lat",
        "lon",
        sorting,
      ],
      queryFn: async ({ pageParam = 0 }) => {
        const start = (pageParam as number) * fetchSize;
        const fetchedData = await getCityData(fetchSize, start, sorting);
        console.log("fetchedData", fetchedData);
        return fetchedData;
      },
      initialPageParam: 0,
      getNextPageParam: (_lastGroup, groups) => groups.length,
      refetchOnWindowFocus: false,
      placeholderData: keepPreviousData,
    });

  //flatten the array of arrays from the useInfiniteQuery hook
  const flatData = React.useMemo(
    () => data?.pages?.flatMap((page) => page.results) ?? [],
    [data]
  );
  const totalDBRowCount = data?.pages?.[0]?.total_count ?? 0;
  const totalFetched = flatData.length;

  //called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
  const fetchMoreOnBottomReached = React.useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        //once the user has scrolled within 500px of the bottom of the table, fetch more data if we can
        if (
          scrollHeight - scrollTop - clientHeight < 500 &&
          !isFetching &&
          totalFetched < totalDBRowCount
        ) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount]
  );

  //a check on mount and after a fetch to see if the table is already scrolled to the bottom and immediately needs to fetch more data
  React.useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);

  const table = useReactTable({
    data: flatData,
    columns,
    state: {
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
    debugTable: true,
  });

  //scroll to top of table when sorting changes
  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSorting(updater);
    if (!!table.getRowModel().rows.length) {
      rowVirtualizer.scrollToIndex?.(0);
    }
  };

  //since this table option is derived from table row model state, we're using the table.setOptions utility
  table.setOptions((prev) => ({
    ...prev,
    onSortingChange: handleSortingChange,
  }));

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 33, //estimate row height for accurate scrollbar dragging
    getScrollElement: () => tableContainerRef.current,
    //measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== "undefined" &&
      navigator.userAgent.indexOf("Firefox") === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  });

  if (isLoading) {
    return <>Loading...</>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">City Countries Table</h1>
      <div className="w-full text-end p-2">
        ({flatData.length} of {totalDBRowCount} rows fetched)
      </div>
      <div
        onScroll={(e) => fetchMoreOnBottomReached(e.target as HTMLDivElement)}
        ref={tableContainerRef}
        style={{
          overflow: "auto", //our scrollable table container
          position: "relative", //needed for sticky header
          height: "600px", //should be a fixed height
        }}
      >
        {/* Even though we're still using sematic table tags, we must use CSS grid and flexbox for dynamic row heights */}
        <table style={{ display: "grid" }}>
          <thead
            style={{
              display: "grid",
              position: "sticky",
              top: 0,
              zIndex: 1,
            }}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                style={{ display: "flex", width: "100%" }}
                className="border-b transition-colors hover:bg-muted data-[state=selected]:bg-muted bg-black"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      style={{
                        display: "flex",
                        width: header.getSize(),
                      }}
                    >
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : "",
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody
            style={{
              display: "grid",
              height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
              position: "relative", //needed for absolute positioning of rows
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index] as Row<CityWeatherTable>;
              return (
                <tr
                  data-index={virtualRow.index} //needed for dynamic row height measurement
                  ref={(node) => rowVirtualizer.measureElement(node)} //measure dynamic row height
                  key={row.id}
                  style={{
                    display: "flex",
                    position: "absolute",
                    transform: `translateY(${virtualRow.start}px)`, //this should always be a `style` as it changes on scroll
                    width: "100%",
                  }}
                  className="cursor-pointer"
                  onClick={() => {
                    router.push(`/weather`);

                    setActiveCityCoords([row.original.lat, row.original.lon]);
                  }}
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td
                        key={cell.id}
                        style={{
                          display: "flex",
                          width: cell.column.getSize(),
                        }}
                        className="p-4 align-middle [&:has([role=checkbox])]:pr-0"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {isFetching && <div>Fetching More...</div>}
    </div>
  );
}

export default function DataTableScroll() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <DataTableScrollComp />
    </QueryClientProvider>
  );
}
