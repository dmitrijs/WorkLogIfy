"use client"

import {Button} from "@/components/ui/button"
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {Icon} from "@iconify-icon/react";
import {ChevronDown, X} from "lucide-react"
import * as React from "react"

export function ComboboxProjects({currentProject, projects, onChange}) {
    const [open, setOpen] = React.useState(false)

    function onSelect(value) {
        setOpen(false)
        const idReadable = value ? value.split("|")[0] : null;
        onChange(idReadable);
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild className={"!px-1"}>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="inline justify-between flex justify-between border-neutral-500"
                >
                    <ChevronDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 min-w-40">
                <Command className="rounded-lg shadow-md"
                         filter={(value, search) => {
                             return (value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0);
                         }}>
                    <CommandList>
                        {!currentProject && <CommandEmpty>No results found.</CommandEmpty>}

                        {(projects || []).map((project: string) => (
                            <CommandItem value={`${project}`} key={project} onSelect={onSelect}>
                                        <span className={"flex gap-1 items-center"}>
                                            <Icon icon="material-symbols-light:stop-outline-rounded" width="16" height="16" /> {project}
                                        </span>
                            </CommandItem>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
