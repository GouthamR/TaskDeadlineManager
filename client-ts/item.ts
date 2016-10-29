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

interface JSONSerializer<T>
{
    toJSON(obj: T): Object;
    fromJSON(json: Object): T;
}

export class Task extends Item
{
    private end: Date;

    public constructor(title: string, start: Date, end: Date, isAllDay: boolean)
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

interface TaskJSON
{
    // string representations of all:
    title: string;
    startEpochMillis: string;
    endEpochMillis: string;
    isAllDay: string;
}

export class TaskSerializer implements JSONSerializer<Task>
{
    toJSON(obj: Task): Object
    {
        let json: TaskJSON =
        {
            title: obj.getTitle(),
            startEpochMillis: obj.getStart().getTime().toString(),
            endEpochMillis: obj.getEnd().getTime().toString(),
            isAllDay: obj.getIsAllDay().toString()
        };
        return json;
    }
    fromJSON(json: Object): Task
    {
        let taskJson: TaskJSON = <TaskJSON> json;
        return new Task(taskJson.title, 
                        new Date(parseInt(taskJson.startEpochMillis)),
                        new Date(parseInt(taskJson.endEpochMillis)), 
                        taskJson.isAllDay == "true");
    }
}

export class Deadline extends Item
{
    public constructor(title: string, start: Date, isAllDay: boolean)
    {
        super(title, start, isAllDay);
    }
}

interface DeadlineJSON
{
    // string representations of all:
    title: string;
    startEpochMillis: string;
    isAllDay: string;
}

export class DeadlineSerializer implements JSONSerializer<Deadline>
{
    toJSON(obj: Deadline): Object
    {
        let json: DeadlineJSON =
        {
            title: obj.getTitle(),
            startEpochMillis: obj.getStart().getTime().toString(),
            isAllDay: obj.getIsAllDay().toString()
        };
        return json;
    }
    fromJSON(json: Object): Deadline
    {
        let deadlineJson: DeadlineJSON = <DeadlineJSON> json;
        return new Deadline(deadlineJson.title, 
                            new Date(parseInt(deadlineJson.startEpochMillis)),
                            deadlineJson.isAllDay == "true");
    }
}