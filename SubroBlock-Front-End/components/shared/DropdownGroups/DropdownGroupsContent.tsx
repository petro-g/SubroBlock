import React, { FC } from "react";
import {
  IDropdownGroupsProps
} from "@/components/shared/DropdownGroups/dropdown-groups.types";
import {
  IOption
} from "@/components/shared/DropdownOptionsMenu/dropdown-options.types";
import DropdownOptionsContent
  from "@/components/shared/DropdownOptionsMenu/DropdownOptionsContent";
import { InputSearch } from "@/components/shared/input-search";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface IDropdownFiltersGroupsListContentProps extends IDropdownGroupsProps {
  onClearAll: () => void;
  onApplyAll: () => void;
}

const DropdownGroupsContent: FC<IDropdownFiltersGroupsListContentProps> = ({
  title,
  groups,
  onClearAll,
  onApplyAll
}) => {
  const [search, setSearch] = React.useState<string>("");

  const [selectedGroupOptions, setSelectedGroupOptions] = React.useState<Record<string, IOption[]>>(
    groups.reduce((acc: Record<string, IOption[]>, group, index) => {
      acc[index] = group.selectedOptions || [];
      return acc;
    }, {}))

  const clearAll = () => {
    groups.forEach(group => {
      group.onApplyOptionsChange?.([]);
    });
    onClearAll();
  }

  const applyAll = () => {
    groups.forEach((group, index) => {
      group.onApplyOptionsChange?.(selectedGroupOptions[index] || group.selectedOptions || []);
    });
    onApplyAll();
  }

  // if only 1 group and only 1 option - render only it and apply on selecting it
  if (groups.length === 1 && groups[0].options.length === 1) {
    return (
      <div className="-m-5">
        <DropdownOptionsContent
          {...groups[0]}
          options={groups[0].options}
          selectedOptions={selectedGroupOptions[0] || groups[0].selectedOptions || []}
          onApplyOptionsChange={(options) => {
            setSelectedGroupOptions({
              ...selectedGroupOptions,
              0: options
            });
            groups[0].onApplyOptionsChange?.(options);
            onApplyAll();
          }}
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-row justify-between w-full items-center gap-4 mb-4">
        <h4>{title}</h4>
        <Button
          variant="link"
          className="p-0 h-auto"
          onClick={clearAll}
        >
          Clear
        </Button>
      </div>
      <InputSearch
        value={search}
        onChange={setSearch}
        placeholder={`Search ${title.toLowerCase()}`}
      />
      <div className="-mx-5">
        {groups.map((group, index) => (
          <div
            key={index}
            className="relative"
          >
            <div className="text-sm text-secondary-foreground px-4 mb-2 mt-4">{group.description}</div>
            <DropdownOptionsContent
              key={index}
              {...group}
              options={group.options
                .filter(option => option && option.label?.toLowerCase().includes(search.toLowerCase()))
                .map((option) => option && ({
                  render: (option) => (
                    <div className="select-none flex items-center gap-2 text-base cursor-pointer hover:text-accent-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-nowrap">
                      <Checkbox
                        checked={selectedGroupOptions[index]?.some((selectedOption) => selectedOption.value === option.value)}
                      />
                      {option.label}
                    </div>
                  ),
                  ...option
                }))
              }
              selectedOptions={selectedGroupOptions[index] || group.selectedOptions || []}
              onApplyOptionsChange={(options) => {
                setSelectedGroupOptions({
                  ...selectedGroupOptions,
                  [index]: options
                });
              }}
            />
          </div>
        ))}
      </div>
      <div className="pt-4">
        <Button
          className="w-full"
          onClick={applyAll}
        >
          Apply
        </Button>
      </div>
    </>
  );
}
  ;

export default DropdownGroupsContent;
