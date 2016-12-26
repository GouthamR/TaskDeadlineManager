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

interface JSONSerializer<ObjectType, JSONType>
{
    toJSON(obj: ObjectType): JSONType;
    fromJSON(json: JSONType): ObjectType;
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

export interface TaskJSON
{
    title: string;
    startEpochMillis: string;
    endEpochMillis: string;
    isAllDay: string;
}

export class TaskSerializer implements JSONSerializer<Task, TaskJSON>
{
    toJSON(obj: Task): TaskJSON
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
    fromJSON(taskJson: TaskJSON): Task
    {
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

export interface DeadlineJSON
{
    title: string;
    startEpochMillis: string;
    isAllDay: string;
}

export class DeadlineSerializer implements JSONSerializer<Deadline, DeadlineJSON>
{
    toJSON(obj: Deadline): DeadlineJSON
    {
        let json: DeadlineJSON =
        {
            title: obj.getTitle(),
            startEpochMillis: obj.getStart().getTime().toString(),
            isAllDay: obj.getIsAllDay().toString()
        };
        return json;
    }
    fromJSON(deadlineJson: DeadlineJSON): Deadline
    {
        return new Deadline(deadlineJson.title, 
                            new Date(parseInt(deadlineJson.startEpochMillis)),
                            deadlineJson.isAllDay == "true");
    }
}