export class Item
{
    private title: string;
    private start: Date;
    private isAllDay: boolean; // when true, time component of start is disregarded.
    private id: string;

    public constructor(title: string, start: Date, isAllDay: boolean, id: string)
    {
        this.title = title;
        this.start = start;
        this.isAllDay = isAllDay;
        this.id = id;
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
    public getID() : string { return this.id; }

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
    // When isAllDay = true, end is used for the end day, EXCLUSIVE.
    // Example 1: start = 2/2/2016 and end = 2/3/2016 refers to all day through 2/2/2016.
    // Example 2: start = 2/2/2016 and end = 2/4/2016 refers to all day through 2/2/2016 AND 2/3/2016.
    // When isAllDay = true, time component of end is disregarded.
    private end: Date;

    public constructor(title: string, start: Date, end: Date, isAllDay: boolean, id: string)
    {
        super(title, start, isAllDay, id);
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

export interface TaskJSONWithoutID
{
    title: string;
    startEpochMillis: string;
    endEpochMillis: string;
    isAllDay: string;
}

export interface TaskJSON extends TaskJSONWithoutID
{
    _id: string;
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
            isAllDay: obj.getIsAllDay().toString(),
            _id: obj.getID()
        };
        return json;
    }

    fromJSON(taskJson: TaskJSON): Task
    {
        return new Task(taskJson.title, 
                        new Date(parseInt(taskJson.startEpochMillis)),
                        new Date(parseInt(taskJson.endEpochMillis)), 
                        taskJson.isAllDay == "true",
                        taskJson._id);
    }
}

export class SubTask extends Task
{
    private deadlineId: string;
    private isDone: boolean;

    public constructor(title: string, start: Date, end: Date,
                        isAllDay: boolean, id: string, deadlineId: string,
                        isDone: boolean = false)
    {
        super(title, start, end, isAllDay, id);
        this.deadlineId = deadlineId;
        this.isDone = isDone;
    }

    public getDeadlineID(): string { return this.deadlineId; }
    public getIsDone(): boolean { return this.isDone; }
    
    public markAsDone(): void
    {
        this.isDone = true;
    }

    public getDayTimeString(): string
    {
        let begin: string = super.getDayTimeString();
        let end: string = "[" + this.deadlineId + "]";
        return (begin + end);
    }
}

export interface SubTaskJSONWithoutID extends TaskJSONWithoutID
{
    isDone: string;
}

export interface SubTaskJSON extends SubTaskJSONWithoutID
{
    deadlineId: string;
    _id: string;
}

export class SubTaskSerializer implements JSONSerializer<SubTask, SubTaskJSON>
{
    toJSON(obj: SubTask): SubTaskJSON
    {
        let json: SubTaskJSON =
        {
            title: obj.getTitle(),
            startEpochMillis: obj.getStart().getTime().toString(),
            endEpochMillis: obj.getEnd().getTime().toString(),
            isAllDay: obj.getIsAllDay().toString(),
            deadlineId: obj.getDeadlineID(),
            isDone: obj.getIsDone().toString(),
            _id: obj.getID()
        };
        return json;
    }

    fromJSON(json: SubTaskJSON): SubTask
    {
        return new SubTask(json.title, 
                            new Date(parseInt(json.startEpochMillis)),
                            new Date(parseInt(json.endEpochMillis)), 
                            json.isAllDay == "true",
                            json._id,
                            json.deadlineId,
                            json.isDone == "true");
    }
}

export class Deadline extends Item
{
    private subTasks: SubTask[];

    public constructor(title: string, start: Date, isAllDay: boolean, 
                        id: string, subTasks: SubTask[])
    {
        super(title, start, isAllDay, id);
        this.subTasks = subTasks;
    }

    public getSubTasks(): SubTask[] { return this.subTasks; }

    public isDone(): boolean
    {
        for(let currSubTask of this.getSubTasks())
        {
            if(!currSubTask.getIsDone())
            {
                return false;
            }
        }
        return true;
    }
}

interface DeadlineJSONWithoutIDOrSubTask
{
    title: string;
    startEpochMillis: string;
    isAllDay: string;
}

export interface DeadlineJSONWithoutID extends DeadlineJSONWithoutIDOrSubTask
{
    subTasks: SubTaskJSONWithoutID[];
}

export interface DeadlineJSON extends DeadlineJSONWithoutIDOrSubTask
{
    subTasks: SubTaskJSON[];
    _id: string;
}

export class DeadlineSerializer implements JSONSerializer<Deadline, DeadlineJSON>
{
    toJSON(obj: Deadline): DeadlineJSON
    {
        let subTasksJsons: SubTaskJSON[] = [];
        let subTaskSerializer: SubTaskSerializer = new SubTaskSerializer();
        for(let currSubTask of obj.getSubTasks())
        {
            let currSubTaskJson: SubTaskJSON = subTaskSerializer.toJSON(currSubTask);
            subTasksJsons.push(currSubTaskJson);
        }

        let json: DeadlineJSON =
        {
            title: obj.getTitle(),
            startEpochMillis: obj.getStart().getTime().toString(),
            isAllDay: obj.getIsAllDay().toString(),
            _id: obj.getID(),
            subTasks: subTasksJsons
        };
        return json;
    }
    fromJSON(json: DeadlineJSON): Deadline
    {
        let subTasks: SubTask[] = [];
        let subTaskSerializer: SubTaskSerializer = new SubTaskSerializer();
        for(let currSubTaskJson of json.subTasks)
        {
            let currSubTask: SubTask = subTaskSerializer.fromJSON(currSubTaskJson);
            subTasks.push(currSubTask);
        }

        return new Deadline(json.title, 
                            new Date(parseInt(json.startEpochMillis)),
                            json.isAllDay == "true",
                            json._id,
                            subTasks);
    }
}