"use client"

import {Button} from "@/components/ui/button"
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {ChevronDown, X} from "lucide-react"
import * as React from "react"

export function ComboboxTasks({currentTaskId, currentTask, tasks, onChange, excludeIds}: { currentTaskId: any, currentTask: TaskObj, tasks: any, onChange: any, excludeIds: string[] }) {
    const [open, setOpen] = React.useState(false)

    function onSelect(value) {
        setOpen(false)
        const id = value ? value.split("|")[0] : null;
        onChange(id);
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
                    <span>{currentTask ? <>
                        {currentTask.code && `[${currentTask.code}]`}{' '}
                        {currentTask.title}{' '}
                        {currentTask.notes && ` (${currentTask.notes})`}
                    </> : (currentTaskId ? 'Current: ' + currentTaskId : '')}</span>
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
                        {!currentTaskId && <CommandEmpty>No results found.</CommandEmpty>}

                        <CommandGroup forceMount={true}>
                            {currentTaskId && !currentTask && <CommandItem>
                                <span><b>Current:</b> {currentTaskId}</span>
                            </CommandItem>}

                            {currentTaskId && <CommandItem onSelect={() => onSelect(null)}>
                                <span className={"flex"}><X/> Clear</span>
                            </CommandItem>}
                        </CommandGroup>

                        {Object.values(tasks || {}).filter((task: TaskObj) => !excludeIds.includes(task.id)).map((parentTask: TaskObj) => (<>{
                                parentTask.id !== currentTask?.id && !parentTask.parentId &&
                                <CommandItem value={`${parentTask.id}|${parentTask.code}`} key={parentTask.id} onSelect={onSelect}>
                                    <span className={"flex gap-1 items-center"}
                                          style={{color: (parentTask.distributed || !parentTask.chargeable ? '#595959' : '')}}
                                    >
                                        {parentTask.code && `[${parentTask.code}]`}{' '}
                                        {parentTask.title}{' '}
                                        {parentTask.notes && ` (${parentTask.notes})`}
                                    </span>
                                </CommandItem>
                            }</>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
