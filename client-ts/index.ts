/// <reference path="jquery.d.ts" />

import { Item } from "./item";
import { Task } from "./item";
import { TaskSerializer } from "./item";
import { Deadline } from "./item";
import { DeadlineSerializer } from "./item";

namespace index
{
    function loadItemsFromServer(route: string, errorPrefix: string, callback: (data) => void): void
    {
        $.getJSON(route)
        .done(function(data, textStatus: string, jqXHR: JQueryXHR)
        {
            callback(data);
        })
        .fail(function(jqXHR: JQueryXHR, textStatus: string, error: string)
        {
            let errorDetails: string = textStatus + ", " + error;
            showLoadErrorInView(errorPrefix, errorDetails);
            console.log(errorDetails);
        });
    }

    function loadTasksFromServer(callback: (data) => void): void
    {
        loadItemsFromServer("/load-tasks", "Error: failed to load tasks.", callback);
    }

    function loadDeadlinesFromServer(callback: (data) => void): void
    {
        loadItemsFromServer("/load-deadlines", "Error: failed to load deadlines.", callback);
    }

    function showLoadErrorInView(errorPrefix: string, errorDetails: string): void
    {
        let errorMessage: string = errorPrefix + "\nDetails: " + errorDetails;
        new View().showLoadError(errorMessage);
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
            $("#task-container > a").click((event: JQueryEventObject) => this.onAddTaskClicked(event));
        }

        private onAddTaskClicked(event: JQueryEventObject): void
        {
            $("#index").addClass("hidden");
            $("#add-task").removeClass("hidden");
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

        public showLoadError(errorMessage: string)
        {
            this.removeLoading("#task-container");
            this.removeLoading("#deadline-container");
            $("#error-container").append($("<p>").html(errorMessage));
            $("#error-container").removeClass("hidden");
        }
    }

    function loadView(tasks: Task[], deadlines: Deadline[])
    {
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

    export function main(): void
    {
        "use strict";

        let tasks: Task[] = [];
        let deadlines: Deadline[] = [];

        function onLoadDeadlines(data): void
        {
            let deadlineSerializer: DeadlineSerializer = new DeadlineSerializer();
            for(let i of data)
            {
                deadlines.push(deadlineSerializer.fromJSON(i));
            }
            console.log(deadlines);

            loadView(tasks, deadlines);
        }

        function onLoadTasks(data): void
        {
            let taskSerializer: TaskSerializer = new TaskSerializer();
            for(let i of data)
            {
                tasks.push(taskSerializer.fromJSON(i));
            }
            console.log(tasks);

            loadDeadlinesFromServer(onLoadDeadlines);
        }

        loadTasksFromServer(onLoadTasks);
    }
}

$(document).ready(index.main);
