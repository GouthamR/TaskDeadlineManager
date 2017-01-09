import { Item } from "./item";
import { Task } from "./item";
import { Deadline } from "./item";
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

    private markTaskDone(task: Task, li: JQuery): void
    {
        this.indexModel.removeTaskFromServer(task);
        console.log(task.getTitle() + " removed");
        li.slideUp({complete: function()
        {
            li.remove();
        }});
    }

    private fillTaskLiForNormalMode(li: JQuery, task: Task): void
    {
        li.empty();

        let middle: JQuery = $("<div>", {class: "item-middle"});
        middle.append($("<p>").html(task.getTitle()),
                        $("<p>").html(task.getDayTimeString()));
        let check: JQuery = $("<img>", {class: "td-check", src: "img/check.png"});
        let settings: JQuery = $("<img>", {class: "td-settings", src: "img/gear.png"});

        check.click((e: JQueryEventObject) => this.markTaskDone(task, li));
        settings.click((e: JQueryEventObject) => this.onOpenTaskSettingsClicked(task, li));

        li.append(check, middle, settings);
    }

    private fillTaskLiForEditMode(li: JQuery, task: Task): void
    {
        li.empty();

        let $form = $("<form>");
        let $titleInput = $("<input>", {type: "text", value: task.getTitle()});
        $form.append($titleInput);
        let doneButton: JQuery = $("<input>", {type: "submit", value: "Done"});
        doneButton.click((e: JQueryEventObject) => this.onCloseTaskSettingsClicked(e, li, task));
        $form.append(doneButton);

        li.append($form);
    }

    private onOpenTaskSettingsClicked(task: Task, li: JQuery)
    {
        this.fillTaskLiForEditMode(li, task);
    }

    private onCloseTaskSettingsClicked(event: JQueryEventObject, li: JQuery, task: Task)
    {
        event.preventDefault(); // prevents form submission

        let $titleInput = li.find("input[type='text']");
        task.setTitle($titleInput.val());
        console.log(task);

        this.fillTaskLiForNormalMode(li, task);
        this.mainModel.updateTaskOnServer(task);
    }

    private addTaskToView(task: Task): void
    {
        let $newLi: JQuery = $("<li>");
        this.fillTaskLiForNormalMode($newLi, task);
        
        let $list: JQuery = this.$indexContainer.find(".index-task-container ul");
        $list.append($newLi);
    }

    private addDeadlineToDeadlinesView(deadline: Deadline): void
    {
        // STUB (does not add deadline):

        let $deadlineContainer: JQuery = this.$indexContainer.find(".index-deadline-container");
    }

    private addDeadlineSubTasksToTasksView(deadline: Deadline): void
    {
        // STUB (does not add deadline subtasks):

        let $taskContainer: JQuery = this.$indexContainer.find(".index-task-container");
        
        for(let subTask of deadline.getSubTasks())
        {
            
        }
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