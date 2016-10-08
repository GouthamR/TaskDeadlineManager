/// <reference path="jquery.d.ts" />

import { flatpickr } from "./flatpickr.min.js";

class Item
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

class Task extends Item
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

class Deadline extends Item
{
    public constructor (title: string, start: Date, isAllDay: boolean)
    {
        super(title, start, isAllDay);
    }
}

function loadTasksFromDB(day: Date): Task[]
{
    // stub:
    function getTodayAtTime(hours: number, minutes: number): Date
    {
        let date: Date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        return date;
    }
    function getTodayAllDay(): Date
    {
        let date: Date = new Date();
        return date;
    }
    return [new Task("Clean Room", getTodayAtTime(8, 0), getTodayAtTime(8, 45), false),
            new Task("Math HW", getTodayAtTime(10, 0), getTodayAtTime(10, 30), false),
            new Task("Lunch", getTodayAtTime(12, 30), getTodayAtTime(13, 30), false),
            new Task("End Poverty", getTodayAllDay(), getTodayAllDay(), true),
            new Task("Game of Thrones Marathon", getTodayAtTime(18, 0), getTodayAtTime(23, 30), false),
            new Task("Solve the Water Stagnation Problem", getTodayAllDay(), getTodayAllDay(), true),
            new Task("Dinner", getTodayAtTime(19, 30), getTodayAtTime(20, 30), false)];
}

function loadDeadlinesFromDB(): Deadline[]
{
    // stub
    return [new Deadline("English Paper", new Date(2016, 2, 10, 23, 59), false),
            new Deadline("Game of Thrones Seasons 1-8 Due", new Date(2016, 4, 12, 12, 0), false),
            new Deadline("Math HW Due", new Date(2016, 9, 20), true),
            new Deadline("Cure to Cancer Due", new Date(2016, 11, 25), true),
            new Deadline("Spaces vs Tabs Rant Post Deadline", new Date(2017, 0, 2), true)];
}

class ItemEditor
{
    // NOTE: CANNOT EDIT MULTIPLE ELEMENTS AT ONCE since there will be multiple identical "flatpickr-start" and "flatpickr-end" ids.

    private li: JQuery;
    private item: Item;
    private titleInput: JQuery;
    private currStart: Date;
    private currEnd: Date;
    private startTimePickr: JQuery;
    private endTimePickr: JQuery;
    private allDayInput: JQuery;
    private doneCallback: (li: JQuery, item: Item)=>void;

    public constructor(item: Item, li: JQuery, doneCallback: (li: JQuery, item: Item)=>void)
    {
        this.item = item;
        this.li = li;

        this.li.empty();

        this.titleInput = $("<input>", {type: "text", value: this.item.getTitle()});
        this.li.append(this.titleInput);

        this.currStart = this.item.getStart();
        let startArray: JQuery[] = this.appendFlatPickr("flatpickr-start", this.currStart,
                                                        this.setCurrStartDate.bind(this), this.setCurrStartTime.bind(this));
        this.startTimePickr = startArray[1];
        if(this.item instanceof Task)
        {
            let task: Task = this.item as Task;
            this.currEnd = task.getEnd();
            let endArray: JQuery[] = this.appendFlatPickr("flatpickr-end", this.currEnd,
                                                            this.setCurrEndDate.bind(this), this.setCurrEndTime.bind(this));
            this.endTimePickr = endArray[1];
        }
        else
        {
            this.currEnd = null;
            this.endTimePickr = null;
        }

        this.allDayInput = $("<input>", {type: "checkbox", checked: item.getIsAllDay()});
        this.li.append(this.allDayInput);
        this.allDayInput.click(this.allDayInputChanged.bind(this));

        let doneButton: JQuery = $("<input>", {type: "button", value: "Done"});
        doneButton.click(this.doneButtonClickFn.bind(this));
        this.li.append(doneButton);

        this.doneCallback = doneCallback;
    }

    private static setDateOnly(date: Date, newDate: Date): void
    {
        date.setFullYear(newDate.getFullYear());
        date.setMonth(newDate.getMonth());
        date.setDate(newDate.getDate());
    }

    private setCurrStartDate(dateOnly: Date): void
    {
        ItemEditor.setDateOnly(this.currStart, dateOnly);
    }

    private setCurrEndDate(dateOnly: Date): void
    {
        ItemEditor.setDateOnly(this.currEnd, dateOnly);
    }

    private static setTimeOnly(date: Date, newTime: Date): void
    {
        date.setHours(newTime.getHours());
        date.setMinutes(newTime.getMinutes());
        date.setSeconds(newTime.getSeconds());
        date.setMilliseconds(newTime.getMilliseconds());
    }

    private setCurrStartTime(timeOnly: Date): void
    {
        ItemEditor.setTimeOnly(this.currStart, timeOnly);
    }

    private setCurrEndTime(timeOnly: Date): void
    {
        ItemEditor.setTimeOnly(this.currEnd, timeOnly);
    }

    private allDayInputChanged(): void
    {
        let isChecked: boolean = this.allDayInput.prop("checked");
        $(this.startTimePickr).prop("disabled", isChecked);
        if(this.item instanceof Task)
        {
            $(this.endTimePickr).prop("disabled", isChecked);
        }
    }

    private appendFlatPickr(idPrefix: string, date: Date, onChangeDateFn: (d: Date)=>void, onChangeTimeFn: (d: Date)=>void): JQuery[]
    {
        let dateId: string = idPrefix + "-date";
        let timeId: string = idPrefix + "-time";

        let flatPickrDateEl: JQuery = $("<input>",
            {id: dateId,
                "data-defaultDate": date,
                "data-dateFormat": "F j, Y"});
        let flatPickrTimeEl: JQuery = $("<input>",
            {id: timeId,
                "data-defaultDate": date,
                "data-enabletime": true,
                "data-nocalendar": true});

        this.li.append(flatPickrDateEl);
        this.li.append(flatPickrTimeEl);

        flatpickr("#" + dateId, {onChange: onChangeDateFn});
        flatpickr("#" + timeId, {onChange: onChangeTimeFn});

        if (this.item.getIsAllDay())
        {
            $(flatPickrTimeEl).prop("disabled", true);
        }

        return [flatPickrDateEl, flatPickrTimeEl];
    }

    private doneButtonClickFn(): void
    {
        this.item.setTitle(this.titleInput.val());
        this.item.setIsAllDay(this.allDayInput.prop("checked"));
        this.item.setStart(this.currStart);
        if(this.item instanceof Task)
        {
            let task: Task = this.item as Task;
            task.setEnd(this.currEnd);
        }
        this.li.empty();
        console.log(this.item);
        this.doneCallback(this.li, this.item);
    }
}

class View
{
    public constructor()
    {

    }

    private markItemDone(item: Item, li: JQuery): void
    {
        // stub
        console.log(item.getTitle() + " removed");
        li.slideUp();
    }

    private fillLi(li: JQuery, item: Item): void
    {
        let middle: JQuery = $("<div>", {class: "item-middle"});
        middle.append($("<p>").html(item.getTitle()),
            $("<p>").html(item.getDayTimeString()));
        let check: JQuery = $("<img>", {class: "td-check", src: "img/check.png"});
        let settings: JQuery = $("<img>", {class: "td-settings", src: "img/gear.png"});

        check.click(this.markItemDone.bind(this, item, li));
        settings.click(this.openSettings.bind(this, item, li));

        li.append(check, middle, settings);
    }

    private openSettings(item: Item, li: JQuery)
    {
        new ItemEditor(item, li, this.fillLi.bind(this));
    }

    private createLi(item: Item): JQuery
    {
        let li: JQuery = $("<li>");
        this.fillLi(li, item);
        return li;
    }

    public appendLi(container_name: string, item: Item): void
    {
        let li: JQuery = this.createLi(item);
        $(container_name + " ul").append(li);
    }

    public removeLoading(container_name: string): void
    {
        $(container_name + " .loading").remove();
    }
}

function main(): void
{
    "use strict";

    let tasks: Task[] = loadTasksFromDB(new Date());
    let deadlines: Deadline[] = loadDeadlinesFromDB();

    let view: View = new View();

    for (let i: number = 0; i < tasks.length; i++)
    {
        view.appendLi("#task-container", tasks[i]);
    }
    for (let i: number = 0; i < deadlines.length; i++)
    {
        view.appendLi("#deadline-container", deadlines[i]);
    }

    view.removeLoading("#task-container");
    view.removeLoading("#deadline-container");
}

$(document).ready(main);
