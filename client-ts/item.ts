/// <reference path="./moment_modified.d.ts" />

// Returns true if dateTime is within first millisecond of today and last
// millisecond of today, inclusive.
function dateTimeInToday(dateTime: moment.Moment): boolean
{
    let startOfDay: moment.Moment = moment().startOf("day");
    let endOfDay: moment.Moment = moment().endOf("day");
    return dateTime.isBetween(startOfDay, endOfDay, null, "[]");
}

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
        // STUB (does not hide times when all day):
        
        let allDayStr: string;
        if (this.getIsAllDay())
        {
            allDayStr = '_ALL_DAY';
        }
        else
        {
            allDayStr = '';
        }

        let startStr: string = moment(this.getStart())
                                .format("dddd, MMMM Do YYYY, h:mm:ss a");

        return startStr + allDayStr;
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

    public occursToday(): boolean
    {
        let itemStart: moment.Moment = moment(this.getStart());
        return dateTimeInToday(itemStart); // inclusive of 12:00am, to be compatible with all-day events.
    }
}

interface JSONSerializer<ObjectType, JSONType, JSONWithoutIDType>
{
    toJSON(obj: ObjectType): JSONType;
    toJSONWithoutID(obj: ObjectType): JSONWithoutIDType;
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
        // STUB (does not hide times when all day):
        
        let allDayStr: string;
        if (this.getIsAllDay())
        {
            allDayStr = '_ALL_DAY';
        }
        else
        {
            allDayStr = '';
        }

        const DATETIME_FORMAT: string = "dddd, MMMM Do YYYY, h:mm:ss a";
        let startStr: string = moment(this.getStart()).format(DATETIME_FORMAT);
        let endStr: string = moment(this.getEnd()).format(DATETIME_FORMAT);
        
        return startStr + " - " + endStr + allDayStr;
    }

    public occursToday(): boolean
    {
        let taskEnd: moment.Moment = moment(this.getEnd());
        return (dateTimeInToday(taskEnd) || super.occursToday());
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

export class TaskSerializer implements JSONSerializer<Task, TaskJSON, TaskJSONWithoutID>
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

    toJSONWithoutID(obj: Task): TaskJSONWithoutID
    {
        let objWithoutId = this.toJSON(obj);
        delete objWithoutId._id;
        let jsonWithoutId: TaskJSONWithoutID = objWithoutId as TaskJSONWithoutID;
        return jsonWithoutId;
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

function convertSubTaskToWithoutIds(json: SubTaskJSON): SubTaskJSONWithoutID
{
    let objWithoutId: any = $.extend({}, json);
    delete objWithoutId._id;
    delete objWithoutId.deadlineId;
    let subTaskJsonWithoutId: SubTaskJSONWithoutID = objWithoutId as SubTaskJSONWithoutID;
    return subTaskJsonWithoutId;
}

export class SubTaskSerializer implements JSONSerializer<SubTask, SubTaskJSON, SubTaskJSONWithoutID>
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

    toJSONWithoutID(obj: SubTask): SubTaskJSONWithoutID
    {
        let objWithId: SubTaskJSON = this.toJSON(obj);
        let objWithoutId: SubTaskJSONWithoutID = convertSubTaskToWithoutIds(objWithId);
        return objWithoutId;
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

    public getUnfinishedSubTasks(): SubTask[]
    {
        let unfinished: SubTask[] = [];
        for(let subTask of this.getSubTasks())
        {
            if(!subTask.getIsDone())
            {
                unfinished.push(subTask);
            }
        }
        return unfinished;
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

export class DeadlineSerializer implements JSONSerializer<Deadline, DeadlineJSON, DeadlineJSONWithoutID>
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

    toJSONWithoutID(obj: Deadline): DeadlineJSONWithoutID
    {
        let objWithoutId: any = $.extend({}, this.toJSON(obj));
        delete objWithoutId._id;
        for(let i = 0; i < objWithoutId.subTasks.length; i++)
        {
            let subTaskWithId = objWithoutId.subTasks[i];
            objWithoutId.subTasks[i] = convertSubTaskToWithoutIds(subTaskWithId);
        }
        let jsonWithoutId: DeadlineJSONWithoutID = objWithoutId as DeadlineJSONWithoutID;
        return jsonWithoutId;
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