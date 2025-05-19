"use client"

import {Button} from "@/components/ui/button"
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {useStoreContext} from "@/renderer/Store/Store";
import {ChevronDown, X} from "lucide-react"
import * as React from "react"

export function ComboboxTasks({currentTaskCode, currentTask, tasksGrouped, onChange}) {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState('')

    function onSelect(value) {
        setOpen(false)
        onChange(value);
    }

    const priorityToClassName = {
        'Show-stopper': '[&>*]:border-l-1 [&>*]:border-red-500',
        'Critical': '[&>*]:border-l-1 [&>*]:border-orange-500',
        'Major': '[&>*]:border-l-1 [&>*]:border-yellow-500',
        'Normal': '[&>*]:border-l-1 [&>*]:border-green-500',
        'Minor': '[&>*]:border-l-1 [&>*]:border-neutral-500',
    };
    const priorityToTextClassName = {
        'Show-stopper': 'text-red-500',
        'Critical': 'text-orange-500',
        'Major': 'text-yellow-500',
        'Normal': 'text-green-500',
        'Minor': 'text-neutral-500',
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild className={"!px-1"}>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between flex justify-between border-neutral-500"
                >
                    <span>{currentTask ? <>[{currentTask.idReadable}] {currentTask.summary}</> : (currentTaskCode ? 'Current: ' + currentTaskCode : '')}</span>
                    <ChevronDown className="opacity-50"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command className="rounded-lg shadow-md">
                    <CommandInput value={search} onValueChange={setSearch} placeholder="Type to search..."/>
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {currentTaskCode && !currentTask && <CommandItem>
                                <span><b>Current:</b> {currentTaskCode}</span>
                            </CommandItem>}

                            {currentTaskCode && <CommandItem onSelect={() => onSelect(null)}>
                                <span className={"flex"}><X/> Clear</span>
                            </CommandItem>}
                        </CommandGroup>

                        {Object.entries(tasksGrouped).map(([groupName, tasks]: [string, any]) => (
                            <CommandGroup heading={<strong className={priorityToTextClassName[groupName]}>{groupName}</strong>} className={priorityToClassName[groupName] || ''}>
                                {tasks.map(task => (
                                    <CommandItem value={task.idReadable} onSelect={onSelect}>
                                        <span>[{task.idReadable}] {task.summary}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
