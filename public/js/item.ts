export class Item
{
    private title: string;
    private start: Date;
    private isAllDay: boolean;

    public constructor(title: string, start: Date, isAllDay: boolean)
    {
        this.title = title;
        this.start = start;
        this.isAllDay = isAllDay;
    }

    public getDayTimeString() : string
    {
        // stub:
        let allDayEnding: string;
        if (this.getIsAllDay())
        {
            allDayEnding = '_ALL_DAY';
        }
        else
        {
            allDayEnding = '';
        }

        return this.getStart().toString() + allDayEnding;
    }

    public getTitle() : string { return this.title; }
    public getStart() : Date { return this.start; }
    public getIsAllDay() : boolean { return this.isAllDay; }

    public setTitle(title: string) : void
    {
        this.title = title;
    }
    public setStart(start: Date) : void
    {
        this.start = start;
    }
    public setIsAllDay(isAllDay: boolean) : void
    {
        this.isAllDay = isAllDay;
    }
}

export class Task extends Item
{
    private end: Date;

    public constructor (title: string, start: Date, end: Date, isAllDay: boolean)
    {
        super(title, start, isAllDay);
        this.end = end;
    }

    public getEnd(): Date { return this.end; }

    public setEnd(end: Date): void
    {
        this.end = end;
    }

    public getDayTimeString(): string
    {
        // stub:
        let allDayEnding: string;
        if (this.getIsAllDay())
        {
            allDayEnding = '_ALL_DAY';
        }
        else
        {
            allDayEnding = '';
        }

        return this.getStart().toString() + " - " + this.getEnd().toString() + allDayEnding;
    }
}

export class Deadline extends Item
{
    public constructor (title: string, start: Date, isAllDay: boolean)
    {
        super(title, start, isAllDay);
    }
}