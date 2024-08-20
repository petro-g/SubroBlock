"use client";
import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Filter from "@/public/filter.svg";
import Sort from "@/public/sort.svg";

export default function Header() {
  // const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex m-3">
      <div>
        <Input
          className="h-[40px] w-[270px]"
          type="text"
          id="search"
          placeholder="Search"
          required
        />
      </div>

      <div className="px-5">
        <Button variant="outline" className="bg-white border-gray-400 ">
          <Image src={Filter} alt="Filter icon" /><div className="pl-1">Filters</div>
        </Button>
      </div>

      <div className="ml-auto">
        <div className="relative">
          <Button variant="outline" className="bg-white border-gray-400 ">
                        Sort By<Image src={Sort} alt="Sort logo" />
          </Button>

          {/* {isOpen && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-textColorBlack rounded-lg shadow-lg">
                            <ul>
                                {items.map((item, index) => (
                                    <li>
                                        <Button variant="outline" className="bg-white border-gray-400 ">
                                            {item.title}
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )} */}
        </div>
      </div>
    </div>
  );
}
