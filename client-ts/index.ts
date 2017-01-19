/// <reference path="./moment_modified.d.ts" />

import { Item } from "./item";
import { Task } from "./item";
import { Deadline } from "./item";
import { SubTask } from "./item";
import * as main from "./main"

class ItemLi
{
    private item: Item;
    private $li: JQuery;
    private removeFromServer: () => void;
    private updateOnServer: () => void;

    public constructor(item: Item, $targetUl: JQuery, 
                        removeFromServer: () => void,
                        updateOnServer: () => void)
    {
        this.item = item;
        this.$li = $("<li>");
        this.removeFromServer = removeFromServer;
        this.updateOnServer = updateOnServer;

        this.fillLiForNormalMode();

        $targetUl.append(this.$li);
    }

    public getItem(): Item { return this.item; }

    protected onMarkDoneClicked(event: JQueryEventObject): void
    {
        console.log(this.item.getTitle() + " removed");
        this.removeFromServer();
        this.animateOutOfView();
    }

    public animateOutOfView()
    {
        this.$li.slideUp({complete: function()
        {
            this.$li.remove();
        }});
    }

    protected onOpenSettingsClicked(event: JQueryEventObject): void
    {
        this.fillLiForEditMode();
    }

    protected onCloseSettingsClicked(event: JQueryEventObject): void
    {
        event.preventDefault(); // prevents form submission

        let $titleInput = this.$li.find("input[type='text']");
        this.item.setTitle($titleInput.val());
        console.log(this.item);

        this.fillLiForNormalMode();
        this.updateOnServer();
    }

    protected fillLiForEditMode(): void
    {
        this.$li.empty();

        let $form = $("<form>");
        let $titleInput = $("<input>", {type: "text", value: this.item.getTitle()});
        $form.append($titleInput);
        let doneButton: JQuery = $("<input>", {type: "submit", value: "Done"});
        doneButton.click((e) => this.onCloseSettingsClicked(e));
        $form.append(doneButton);

        this.$li.append($form);
    }

    protected fillLiForNormalMode(): void
    {
        this.$li.empty();

        let middle: JQuery = $("<div>", {class: "item-middle"});
        middle.append($("<p>").html(this.item.getTitle()),
                        $("<p>").html(this.item.getDayTimeString()));
        let check: JQuery = $("<img>", {class: "td-check", src: "img/check.png"});
        let settings: JQuery = $("<img>", {class: "td-settings", src: "img/gear.png"});

        check.click((e) => this.onMarkDoneClicked(e));
        settings.click((e) => this.onOpenSettingsClicked(e));

        this.$li.append(check, middle, settings);
    }
}

class TaskLi extends ItemLi
{
    public constructor (task: Task, $targetUl: JQuery,
                        indexModel: main.IndexModel,
                        mainModel: main.MainModel)
    {
        super(task as Item, $targetUl, 
                () => indexModel.removeTaskFromServer(task),
                () => mainModel.updateTaskOnServer(task));
    }
}

class SubTaskLi extends ItemLi
{
    private deadline: Deadline;
    private animateOutDeadlineLi: () => void;
    private removeDeadlineFromServer: () => void;

    public constructor(subTask: SubTask, $targetUl: JQuery,
                        deadline: Deadline, mainModel: main.MainModel,
                        indexModel: main.IndexModel,
                        animateOutDeadlineLi: () => void)
    {
        super(subTask as Item, $targetUl,
                () => this.removeSubTaskFromServer(mainModel),
                () => mainModel.updateDeadlineOnServer(deadline));

        this.deadline = deadline;
        this.animateOutDeadlineLi = animateOutDeadlineLi;
        this.removeDeadlineFromServer = () => indexModel.removeDeadlineFromServer(deadline);
    }

    private removeSubTaskFromServer(mainModel: main.MainModel): void
    {
        let subTask: SubTask = this.getItem() as SubTask;
        subTask.markAsDone();
        
        mainModel.updateDeadlineOnServer(this.deadline);

        if(this.deadline.isDone())
        {
            this.removeDeadlineFromServer();
        }
    }

    // Override
    protected onMarkDoneClicked(event: JQueryEventObject): void
    {
        super.onMarkDoneClicked(event); // calls removeSubTaskFromServer

        if(this.deadline.isDone())
        {
            this.animateOutDeadlineLi();
        }
    }
}

class DeadlineLi extends ItemLi
{
    private animateOutSubtaskLis: () => void;

    public constructor(deadline: Deadline, $targetUl: JQuery,
                        mainModel: main.MainModel,
                        indexModel: main.IndexModel,
                        animateOutSubtaskLis: () => void)
    {
        super(deadline as Item, $targetUl,
                () => indexModel.removeDeadlineFromServer(deadline),
                () => mainModel.updateDeadlineOnServer(deadline));

        this.animateOutSubtaskLis = animateOutSubtaskLis;
    }

    // Override
    protected onMarkDoneClicked(event: JQueryEventObject): void
    {
        super.onMarkDoneClicked(event); // calls removeDeadlineFromServer

        this.animateOutSubtaskLis();
    }
}

class DeadlineAndSubTaskLiManager
{
    private deadlineLi: DeadlineLi;
    private subTaskLis: SubTaskLi[];

    public constructor(deadline: Deadline, $targetDeadlineUl: JQuery,
                        $targetSubTaskUl: JQuery, mainModel: main.MainModel,
                        indexModel: main.IndexModel)
    {
        this.deadlineLi = new DeadlineLi(deadline, $targetDeadlineUl,
                                            mainModel, indexModel,
                                            () => this.animateOutSubtaskLis());

        this.subTaskLis = [];
        for(let subTask of deadline.getUnfinishedSubTasks())
        {
            if(subTask.occursToday())
            {
                let subTaskLi: SubTaskLi = new SubTaskLi(subTask, 
                                                            $targetSubTaskUl,
                                                            deadline,
                                                            mainModel,
                                                            indexModel,
                                                            () => this.animateOutDeadlineLi());
                this.subTaskLis.push(subTaskLi);
            }
        }
    }

    private animateOutSubtaskLis()
    {
        for(let subTaskLi of this.subTaskLis)
        {
            subTaskLi.animateOutOfView();
        }
    }

    private animateOutDeadlineLi()
    {
        this.deadlineLi.animateOutOfView();
    }
}

class View
{
    private $indexContainer: JQuery;
    private indexModel: main.IndexModel;
    private mainModel: main.MainModel;

    public constructor($targetContainer: JQuery, indexModel: main.IndexModel,
                        mainModel: main.MainModel)
    {
        this.$indexContainer = $targetContainer.find(".index");
        this.indexModel = indexModel;
        this.mainModel = mainModel;

        let $addTaskButton: JQuery = this.$indexContainer.find(".index-task-container > a");
        $addTaskButton.click((event: JQueryEventObject) => this.mainModel.switchToView(main.View.AddTask));
        let $addDeadlineButton: JQuery = this.$indexContainer.find(".index-deadline-container > a");
        $addDeadlineButton.click((event: JQueryEventObject) => this.mainModel.switchToView(main.View.AddDeadline));

        let $helloHeading = this.$indexContainer.find(".index-name-heading");
        $helloHeading.html("Hello, " + this.mainModel.getUserName());
    }

    private clearAndShowLoadingOnContainer($container: JQuery): void
    {
        let $ul: JQuery = $container.find("ul");
        
        $ul.empty();
        
        let $loading: JQuery = $("<p>", {class: "index-loading"}).html("Loading...");
        $ul.append($loading);
    }

    private clearAndShowLoadingTasks(): void
    {
        let $taskContainer: JQuery = this.$indexContainer.find(".index-task-container");
        this.clearAndShowLoadingOnContainer($taskContainer);
    }

    private clearAndShowLoadingDeadlines(): void
    {
        let $deadlineContainer: JQuery = this.$indexContainer.find(".index-deadline-container");
        this.clearAndShowLoadingOnContainer($deadlineContainer);
    }

    public clearAndShowLoading(): void
    {
        console.log("clearViewAndShowLoading");
        this.clearAndShowLoadingTasks();
        this.clearAndShowLoadingDeadlines();
    }

    private removeLoadingText($container: JQuery): void
    {
        $container.find(".index-loading").remove();
    }

    private removeTaskViewLoadingText(): void
    {
        let $taskContainer: JQuery = this.$indexContainer.find(".index-task-container");
        this.removeLoadingText($taskContainer);
    }

    private removeDeadlineViewLoadingText(): void
    {
        let $deadlineContainer: JQuery = this.$indexContainer.find(".index-deadline-container");
        this.removeLoadingText($deadlineContainer);
    }

    // Note: appends error after any existing errors.
    public showLoadError(errorMessage: string): void
    {
        console.log("loadError!");
        this.removeTaskViewLoadingText();
        this.removeDeadlineViewLoadingText();
        let $indexErrorContainer = this.$indexContainer.find(".index-error-container");
        $indexErrorContainer.append($("<p>").html(errorMessage));
        $indexErrorContainer.removeClass("hidden");
    }

    public loadView(tasks: Task[], deadlines: Deadline[]): void
    {
        this.clearAndShowLoading();

        let $taskUl: JQuery = this.$indexContainer.find(".index-task-container ul");
        let $deadlineUl: JQuery = this.$indexContainer.find(".index-deadline-container ul");

        for(let task of tasks)
        {
            if(task.occursToday())
            {
                new TaskLi(task, $taskUl, this.indexModel, this.mainModel);
            }
        }

        for(let deadline of deadlines)
        {
            new DeadlineAndSubTaskLiManager(deadline, $deadlineUl, $taskUl, this.mainModel, this.indexModel);
        }
        
        this.removeTaskViewLoadingText(); // only remove after loading deadlines because deadlines may contain subtasks
        this.removeDeadlineViewLoadingText();
    }

    private loadDateHeading(): void
    {
        let $dateHeading = this.$indexContainer.find(".index-date-heading");
        $dateHeading.html(moment().format("MMMM Do, YYYY"));
    }

    public reloadFromServer(): void
    {
        this.clearAndShowLoading();
        this.mainModel.loadTasksAndDeadlinesFromServer((t: Task[], d: Deadline[]) => this.loadView(t, d),
                                                        (e: string) => this.showLoadError(e));
        this.loadDateHeading(); // loads date heading on every reload in case date changes (e.g. at midnight)
    }
}

// Module-scope variables:
let view: View;

export function reloadFromServer(): void
{
    view.reloadFromServer();
}

export function init($targetContainer: JQuery, indexModel: main.IndexModel,
                        mainModel: main.MainModel): void
{
    "use strict";

    view = new View($targetContainer, indexModel, mainModel);
}