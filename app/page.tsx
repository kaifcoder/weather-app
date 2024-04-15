import React from "react";
import DataTableScroll from "./Components/data-table-scroll";
import Temperature from "./Components/Temperature/Temperature";
import Link from "next/link";

type Props = {};

const page = async (props: Props) => {
  return (
    <div className="space-y-4">
      <Link href={`/weather`}>
        <Temperature />
      </Link>

      <DataTableScroll />
    </div>
  );
};

export default page;
