/// <reference path="./moment_modified.d.ts" />

import { Item } from "./item";
import { Task } from "./item";
import { Deadline } from "./item";
import { SubTask } from "./item";
import * as main from "./main"

abstract class ItemLi
{
    private item: Item;
    private $li: JQuery;
    private $targetUl: JQuery;
    private removeFromServer: () => void;
    private updateOnServer: () => void;

    // Note that the constructor does NOT automatically append the Li to the $targetUl.
    // appendToUl() must be called to do this,
    public constructor(item: Item, $targetUl: JQuery, 
                        removeFromServer: () => void,
                        updateOnServer: () => void)
    {
        this.item = item;
        this.$li = $("<li>");
        this.$targetUl = $targetUl;
        this.removeFromServer = removeFromServer;
        this.updateOnServer = updateOnServer;

        this.fillLiForNormalMode();
    }

    public appendToUl(): void
    {
        this.$targetUl.append(this.$li);
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
        this.$li.slideUp({complete: () => this.$li.remove() });
    }

    protected abstract onOpenSettingsClicked(event: JQueryEventObject): void;

    protected onEditTitleClicked(event: JQueryEventObject): void
    {
        this.fillLiForTitleEditMode();
    }

    protected onCloseTitleEditClicked(event: JQueryEventObject): void
    {
        event.preventDefault(); // prevents form submission

        let $titleInput = this.$li.find("input[type='text']");
        this.item.setTitle($titleInput.val());
        console.log(this.item);

        this.fillLiForNormalMode();
        this.updateOnServer();
    }

    protected fillLiForTitleEditMode(): void
    {
        let templateContext = 
        {
            title: this.item.getTitle()
        };
        let editModeHTML = Handlebars.templates['index-edit-mode-template'](templateContext);
        this.$li.html(editModeHTML);

        this.$li.find('input[type="submit"]').click((e) => this.onCloseTitleEditClicked(e));
    }

    protected fillLiForNormalMode(): void
    {
        let templateContext = 
        {
            title: this.item.getTitle(),
            dayTimeString: this.item.getDayTimeString()
        };
        let normalModeHTML = Handlebars.templates['index-normal-mode-template'](templateContext);
        this.$li.html(normalModeHTML);

        this.$li.find(".td-check").click((e) => this.onMarkDoneClicked(e));
        this.$li.find(".item-title").click((e) => this.onEditTitleClicked(e));
        this.$li.find(".td-settings").click((e) => this.onOpenSettingsClicked(e));
    }
}

class TaskLi extends ItemLi
{
    private indexModel: main.IndexModel;
    private mainModel: main.MainModel;

    public constructor (task: Task, $targetUl: JQuery,
                        indexModel: main.IndexModel,
                        mainModel: main.MainModel)
    {
        super(task as Item, $targetUl, 
                () => indexModel.removeTaskFromServer(task),
                () => mainModel.updateTaskOnServer(task));

        this.indexModel = indexModel;
        this.mainModel = mainModel;
    }

    // Override
    protected onOpenSettingsClicked(event: JQueryEventObject): void
    {
        this.indexModel.initEditTask(this.getItem() as Task);
        this.mainModel.switchToView(main.View.EditTask);
    }
}

class DeadlineAndSubTaskLiManager
{
    private deadlineLi: DeadlineLi;
    private subTaskLis: SubTaskLi[];

    public constructor()
    {
        this.deadlineLi = undefined;
        this.subTaskLis = [];
    }

    public registerDeadlineLi(deadlineLi: DeadlineLi): void
    {
        this.deadlineLi = deadlineLi;
    }

    public registerSubTaskLi(subTaskLi: SubTaskLi): void
    {
        this.subTaskLis.push(subTaskLi);
    }

    public animateOutDeadlineLi(): void
    {
        if(!this.deadlineLi)
        {
            throw new Error("DeadlineAndSubTaskLiManager: deadlineLi not registered");
        }

        this.deadlineLi.animateOutOfView();
    }

    public animateOutSubTaskLis(): void
    {
        for(let subTaskLi of this.subTaskLis)
        {
            subTaskLi.animateOutOfView();
        }
    }
}

class SubTaskLi extends ItemLi
{
    private deadline: Deadline;
    private deadlineAndSubTaskLiManager: DeadlineAndSubTaskLiManager;
    private removeDeadlineFromServer: () => void;
    private indexModel: main.IndexModel;
    private mainModel: main.MainModel;

    public constructor(subTask: SubTask, $targetUl: JQuery, deadline: Deadline,
                        mainModel: main.MainModel, indexModel: main.IndexModel,
                        deadlineAndSubTaskLiManager: DeadlineAndSubTaskLiManager)
    {
        super(subTask as Item, $targetUl,
                () => this.removeSubTaskFromServer(mainModel),
                () => mainModel.updateDeadlineOnServer(deadline));

        this.deadline = deadline;
        this.deadlineAndSubTaskLiManager = deadlineAndSubTaskLiManager;
        this.deadlineAndSubTaskLiManager.registerSubTaskLi(this);        
        this.removeDeadlineFromServer = () => indexModel.removeDeadlineFromServer(deadline);
        this.indexModel = indexModel;
        this.mainModel = mainModel;
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
            this.deadlineAndSubTaskLiManager.animateOutDeadlineLi();
        }
    }

    // Override
    protected onOpenSettingsClicked(event: JQueryEventObject): void
    {
        this.indexModel.initEditDeadline(this.deadline);
        this.mainModel.switchToView(main.View.EditDeadline);
    }
}

class DeadlineLi extends ItemLi
{
    private indexModel: main.IndexModel;
    private mainModel: main.MainModel;
    private deadlineAndSubTaskLiManager: DeadlineAndSubTaskLiManager;

    public constructor(deadline: Deadline, $targetUl: JQuery,
                        mainModel: main.MainModel, indexModel: main.IndexModel,
                        deadlineAndSubTaskLiManager: DeadlineAndSubTaskLiManager)
    {
        super(deadline as Item, $targetUl,
                () => indexModel.removeDeadlineFromServer(deadline),
                () => mainModel.updateDeadlineOnServer(deadline));

        this.indexModel = indexModel;
        this.mainModel = mainModel;
        this.deadlineAndSubTaskLiManager = deadlineAndSubTaskLiManager;
        this.deadlineAndSubTaskLiManager.registerDeadlineLi(this);
    }

    // Override
    protected onMarkDoneClicked(event: JQueryEventObject): void
    {
        super.onMarkDoneClicked(event); // calls removeDeadlineFromServer

        this.deadlineAndSubTaskLiManager.animateOutSubTaskLis();
    }

    // Override
    protected onOpenSettingsClicked(event: JQueryEventObject): void
    {
        this.indexModel.initEditDeadline(this.getItem() as Deadline);
        this.mainModel.switchToView(main.View.EditDeadline);
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

        let taskLis: ItemLi[] = [];
        let deadlineLis: DeadlineLi[] = [];

        for(let task of tasks)
        {
            if(task.occursToday())
            {
                taskLis.push(new TaskLi(task, $taskUl, this.indexModel, this.mainModel));
            }
        }

        let deadlineAndSubTaskLiManager: DeadlineAndSubTaskLiManager = new DeadlineAndSubTaskLiManager();

        for(let deadline of deadlines)
        {
            let deadlineLi: DeadlineLi = new DeadlineLi(deadline, $deadlineUl,
                                                        this.mainModel, this.indexModel, 
                                                        deadlineAndSubTaskLiManager);
            deadlineLis.push(deadlineLi);

            for(let subTask of deadline.getUnfinishedSubTasks())
            {
                if(subTask.occursToday())
                {
                    let subTaskLi: SubTaskLi = new SubTaskLi(subTask, $taskUl, deadline,
                                                                this.mainModel, this.indexModel,
                                                                deadlineAndSubTaskLiManager);
                    taskLis.push(subTaskLi);
                }
            }
        }

        let sortFunction: (a: ItemLi, b: ItemLi) => number = (a, b) => moment(a.getItem().getStart()).diff(b.getItem().getStart());
        taskLis.sort(sortFunction);
        deadlineLis.sort(sortFunction);

        for(let taskLi of taskLis)
        {
            taskLi.appendToUl();
        }

        for(let deadlineLi of deadlineLis)
        {
            deadlineLi.appendToUl();
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