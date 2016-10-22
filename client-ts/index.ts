/// <reference path="jquery.d.ts" />

import { Item } from "./item";
import { Task } from "./item";
import { Deadline } from "./item";

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
    private item: Item;
    private li: JQuery;
    private titleInput: JQuery;
    private doneCallback: (li: JQuery, item: Item)=>void;

    public constructor(item: Item, li: JQuery, doneCallback: (li: JQuery, item: Item)=>void)
    {
        this.item = item;
        this.li = li;

        this.li.empty();

        this.titleInput = $("<input>", {type: "text", value: this.item.getTitle()});
        this.li.append(this.titleInput);

        let doneButton: JQuery = $("<input>", {type: "button", value: "Done"});
        doneButton.click(this.doneButtonClickFn.bind(this));
        this.li.append(doneButton);

        this.doneCallback = doneCallback;
    }

    private doneButtonClickFn(): void
    {
        this.item.setTitle(this.titleInput.val());
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
