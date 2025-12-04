"use client"

import {Button} from "@/components/ui/button"
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {Icon} from "@iconify-icon/react";
import {ChevronDown, X} from "lucide-react"
import * as React from "react"

export function ComboboxExternalTasks({currentTaskCode, currentTask, tasksGrouped, onChange}) {
    const [open, setOpen] = React.useState(false)

    function onSelect(value) {
        setOpen(false)
        const idReadable = value ? value.split("|")[0] : null;
        onChange(idReadable);
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

    function stateIcon(state) {
        switch (state) {
            case 'In Progress':
                return <Icon icon="material-symbols-light:play-circle-outline-rounded" width="16" height="16" className={"text-green-700"}/>
            case 'To be discussed':
                return <Icon icon="material-symbols-light:pause-circle-outline-rounded" width="16" height="16" className={"text-yellow-700"}/>
            case   'Open':
            case   'Submitted':
                return <Icon icon="material-symbols-light:stop-outline-rounded" width="16" height="16"/>
            case 'Fixed':
                return <Icon icon="material-symbols-light:done-rounded" width="16" height="16" className={"text-green-700"}/>
        }
        console.log('UNKNOWN STATE: ' + state);
        return <Icon icon="material-symbols-light:stop-outline-rounded" width="16" height="16"/>
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild className={"!px-1"}>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between flex justify-between border-neutral-500 max-w-100 overflow-hidden"
                >
                    <span>{currentTask ? <>[{currentTask.idReadable}] {currentTask.summary}</> : (currentTaskCode ? 'Current: ' + currentTaskCode : '')}</span>
                    <ChevronDown className="opacity-50"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command className="rounded-lg shadow-md"
                         filter={(value, search) => {
                             return (value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0);
                         }}>
                    <CommandInput placeholder="Type to search..."/>
                    <CommandList>
                        {!currentTaskCode && <CommandEmpty>No results found.</CommandEmpty>}

                        <CommandGroup forceMount={true}>
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
                                    <CommandItem value={`${task.idReadable}|${task.summary}`} key={task.idReadable} onSelect={onSelect}>
                                        <span className={"flex gap-1 items-center"}>{stateIcon(task.State)} [{task.idReadable}] {task.summary}</span>
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
