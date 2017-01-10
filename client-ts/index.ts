import { Item } from "./item";
import { Task } from "./item";
import { Deadline } from "./item";
import { SubTask } from "./item";
import * as main from "./main"

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
    }

    // GENERIC METHODS FOR TASK AND DEADLINE:

    private markItemDone(item: Item, li: JQuery, removeFromServer: () => void): void
    {
        removeFromServer();
        console.log(item.getTitle() + " removed");
        li.slideUp({complete: function()
        {
            li.remove();
        }});
    }

    private onCloseItemSettingsClicked(event: JQueryEventObject, li: JQuery, item: Item,
                                        fillForNormalMode: () => void, updateOnServer: () => void): void
    {
        event.preventDefault(); // prevents form submission

        let $titleInput = li.find("input[type='text']");
        item.setTitle($titleInput.val());
        console.log(item);

        fillForNormalMode();
        updateOnServer();
    }

    private fillItemLiForEditMode(li: JQuery, item: Item,
                                    onDoneClicked: (e: JQueryEventObject) => void): void
    {
        li.empty();

        let $form = $("<form>");
        let $titleInput = $("<input>", {type: "text", value: item.getTitle()});
        $form.append($titleInput);
        let doneButton: JQuery = $("<input>", {type: "submit", value: "Done"});
        doneButton.click(onDoneClicked);
        $form.append(doneButton);

        li.append($form);
    }

    private fillItemLiForNormalMode(li: JQuery, item: Item, 
                                    onMarkDoneClicked: (event: JQueryEventObject) => void, 
                                    onOpenSettingsClicked: (event: JQueryEventObject) => void): void
    {
        li.empty();

        let middle: JQuery = $("<div>", {class: "item-middle"});
        middle.append($("<p>").html(item.getTitle()),
                        $("<p>").html(item.getDayTimeString()));
        let check: JQuery = $("<img>", {class: "td-check", src: "img/check.png"});
        let settings: JQuery = $("<img>", {class: "td-settings", src: "img/gear.png"});

        check.click(onMarkDoneClicked);
        settings.click(onOpenSettingsClicked);

        li.append(check, middle, settings);
    }

    // TASK METHODS:

    private markTaskDone(task: Task, li: JQuery): void
    {
        this.markItemDone(task as Item, li, () => this.indexModel.removeTaskFromServer(task));
    }

    private onOpenTaskSettingsClicked(task: Task, li: JQuery)
    {
        this.fillTaskLiForEditMode(li, task);
    }

    private onCloseTaskSettingsClicked(event: JQueryEventObject, li: JQuery, task: Task)
    {
        this.onCloseItemSettingsClicked(event, li, task as Item, 
                                    () => this.fillTaskLiForNormalMode(li, task),
                                    () => this.mainModel.updateTaskOnServer(task));
    }

    private fillTaskLiForEditMode(li: JQuery, task: Task): void
    {
        this.fillItemLiForEditMode(li, task as Item,
                                (e: JQueryEventObject) => this.onCloseTaskSettingsClicked(e, li, task));
    }

    private fillTaskLiForNormalMode(li: JQuery, task: Task): void
    {
        this.fillItemLiForNormalMode(li, task as Item, 
                                (e: JQueryEventObject) => this.markTaskDone(task, li),
                                (e: JQueryEventObject) => this.onOpenTaskSettingsClicked(task, li));
    }

    private addTaskToView(task: Task): void
    {
        let $newLi: JQuery = $("<li>");
        this.fillTaskLiForNormalMode($newLi, task);
        
        let $list: JQuery = this.$indexContainer.find(".index-task-container ul");
        $list.append($newLi);
    }

    // DEADLINE IN DEADLINE VIEW METHODS:

    private markDeadlineDone(deadline: Deadline, li: JQuery): void
    {
        this.markItemDone(deadline as Item, li, () => this.indexModel.removeDeadlineFromServer(deadline));
    }

    private onOpenDeadlineSettingsClicked(deadline: Deadline, li: JQuery)
    {
        this.fillDeadlineLiForEditMode(li, deadline);
    }

    private onCloseDeadlineSettingsClicked(event: JQueryEventObject, li: JQuery, deadline: Deadline)
    {
        this.onCloseItemSettingsClicked(event, li, deadline as Item, 
                                    () => this.fillDeadlineLiForNormalMode(li, deadline),
                                    () => this.mainModel.updateDeadlineOnServer(deadline));
    }

    private fillDeadlineLiForEditMode(li: JQuery, deadline: Deadline): void
    {
        this.fillItemLiForEditMode(li, deadline as Item,
                                    (e: JQueryEventObject) => this.onCloseDeadlineSettingsClicked(e, li, deadline));
    }

    private fillDeadlineLiForNormalMode(li: JQuery, deadline: Deadline): void
    {
        this.fillItemLiForNormalMode(li, deadline as Item, 
                                (e: JQueryEventObject) => this.markDeadlineDone(deadline, li),
                                (e: JQueryEventObject) => this.onOpenDeadlineSettingsClicked(deadline, li));
    }

    private addDeadlineToDeadlinesView(deadline: Deadline): void
    {
        let $newLi: JQuery = $("<li>");
        this.fillDeadlineLiForNormalMode($newLi, deadline);
        
        let $list: JQuery = this.$indexContainer.find(".index-deadline-container ul");
        $list.append($newLi);
    }

    // DEADLINE IN SUBTASK VIEW METHODS:

    private addDeadlineSubTasksToTasksView(deadline: Deadline): void
    {
        // STUB (does not add deadline subtasks):

        let $taskContainer: JQuery = this.$indexContainer.find(".index-task-container");
        
        for(let subTask of deadline.getSubTasks())
        {
            
        }
    }

    // General methods:

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

    private removeTaskLoadingText(): void
    {
        let $taskContainer: JQuery = this.$indexContainer.find(".index-task-container");
        this.removeLoadingText($taskContainer);
    }

    private removeDeadlineLoadingText(): void
    {
        let $deadlineContainer: JQuery = this.$indexContainer.find(".index-deadline-container");
        this.removeLoadingText($deadlineContainer);
    }

    // Note: appends error after any existing errors.
    public showLoadError(errorMessage: string): void
    {
        console.log("loadError!");
        this.removeTaskLoadingText();
        this.removeDeadlineLoadingText();
        let $indexErrorContainer = this.$indexContainer.find(".index-error-container");
        $indexErrorContainer.append($("<p>").html(errorMessage));
        $indexErrorContainer.removeClass("hidden");
    }

    public loadView(tasks: Task[], deadlines: Deadline[]): void
    {
        this.clearAndShowLoading();

        for(let task of tasks)
        {
            this.addTaskToView(task);
        }
        this.removeTaskLoadingText();

        for(let deadline of deadlines)
        {
            this.addDeadlineToDeadlinesView(deadline);
            this.addDeadlineSubTasksToTasksView(deadline);
        }
        this.removeDeadlineLoadingText();
    }

    public reloadFromServer(): void
    {
        this.clearAndShowLoading();
        this.mainModel.loadTasksAndDeadlinesFromServer((t: Task[], d: Deadline[]) => this.loadView(t, d), 
                                                        (e: string) => this.showLoadError(e));
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