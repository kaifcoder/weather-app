"use client";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { github } from "../utils/Icons";
import ThemeDropdown from "./ThemeDropdown/ThemeDropdown";
import SearchDialog from "./SearchDialog/SearchDialog";
import { useGlobalContext } from "../context/globalContext";

function Navbar() {
  const router = useRouter();
  const { state } = useGlobalContext();

  return (
    <div className="w-full py-4 flex items-center justify-between">
      <div className="left">
        <Button
          onClick={() => router.push("/")}
          className="flex items-center gap-2"
        >
          <span className="font-bold">Weather App</span>
        </Button>
      </div>
      <div className="search-container flex shrink-0 w-full gap-2 sm:w-fit">
        <SearchDialog />
        <div className="btn-group flex items-center gap-2">
          <ThemeDropdown />
        </div>
      </div>
    </div>
  );
}

export default Navbar;
