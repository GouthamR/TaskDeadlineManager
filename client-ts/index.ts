/// <reference path="jquery.d.ts" />

import { Item } from "./item";
import { Task } from "./item";
import { TaskSerializer } from "./item";
import { Deadline } from "./item";
import { DeadlineSerializer } from "./item";

function loadItemsFromServer(view: View, route: string, errorPrefix: string, callback: (view: View, data) => void): void
{
    $.getJSON(route)
    .done(function(data, textStatus: string, jqXHR: JQueryXHR)
    {
        callback(view, data);
    })
    .fail(function(jqXHR: JQueryXHR, textStatus: string, error: string)
    {
        let errorDetails: string = textStatus + ", " + error;
        showLoadErrorInView(view, errorPrefix, errorDetails);
        console.log(errorDetails);
    });
}

function loadTasksFromServer(view: View, callback: (view: View, data) => void): void
{
    loadItemsFromServer(view, "/load-tasks", "Error: failed to load tasks.", callback);
}

function loadDeadlinesFromServer(view: View, callback: (view: View, data) => void): void
{
    loadItemsFromServer(view, "/load-deadlines", "Error: failed to load deadlines.", callback);
}

function showLoadErrorInView(view: View, errorPrefix: string, errorDetails: string): void
{
    let errorMessage: string = errorPrefix + "\nDetails: " + errorDetails;
    view.showLoadError(errorMessage);
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
    private $indexContainer: JQuery;

    public constructor($targetContainer: JQuery, onAddTaskClicked: (event: JQueryEventObject) => void)
    {
        this.$indexContainer = $targetContainer.find(".index");
        
        let $addTaskButton: JQuery = this.$indexContainer.find(".index-task-container > a");
        $addTaskButton.click(onAddTaskClicked);
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
        this.$indexContainer.find(container_name).find("ul").append(li);
    }

    public removeLoading(container_name: string): void
    {
        this.$indexContainer.find(container_name).find(".index-loading").remove();
    }

    public showLoadError(errorMessage: string)
    {
        console.log("loadError!");
        this.removeLoading(".index-task-container");
        this.removeLoading(".index-deadline-container");
        let $indexErrorContainer = this.$indexContainer.find(".index-error-container");
        $indexErrorContainer.append($("<p>").html(errorMessage));
        $indexErrorContainer.removeClass("hidden");
    }
}

function loadView(view: View, tasks: Task[], deadlines: Deadline[])
{
    for (let i: number = 0; i < tasks.length; i++)
    {
        view.appendLi(".index-task-container", tasks[i]);
    }
    for (let i: number = 0; i < deadlines.length; i++)
    {
        view.appendLi(".index-deadline-container", deadlines[i]);
    }

    view.removeLoading(".index-task-container");
    view.removeLoading(".index-deadline-container");
}

export function main($targetContainer: JQuery, onAddTaskClicked: (event: JQueryEventObject) => void): void
{
    "use strict";

    let view: View = new View($targetContainer, onAddTaskClicked);

    let tasks: Task[] = [];
    let deadlines: Deadline[] = [];

    function onLoadDeadlines(view: View, data): void
    {
        let deadlineSerializer: DeadlineSerializer = new DeadlineSerializer();
        for(let i of data)
        {
            deadlines.push(deadlineSerializer.fromJSON(i));
        }
        console.log(deadlines);

        loadView(view, tasks, deadlines);
    }

    function onLoadTasks(view: View, data): void
    {
        let taskSerializer: TaskSerializer = new TaskSerializer();
        for(let i of data)
        {
            tasks.push(taskSerializer.fromJSON(i));
        }
        console.log(tasks);

        loadDeadlinesFromServer(view, onLoadDeadlines);
    }

    loadTasksFromServer(view, onLoadTasks);
}