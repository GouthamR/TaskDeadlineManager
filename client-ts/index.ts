import { Item } from "./item";
import { Task } from "./item";
import { Deadline } from "./item";
import * as main from "./main"

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
    }

    private markItemDone(item: Item, li: JQuery): void
    {
        // STUB (does not remove deadlines correctly):
        this.indexModel.removeTaskFromServer(item as Task);
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

    private addItemToContainer(item: Item, $container: JQuery)
    {
        let $newLi: JQuery = this.createLi(item);
        let $list: JQuery = $container.find("ul");
        $list.append($newLi);
    }

    private addTaskToView(task: Task): void
    {
        let $taskContainer: JQuery = this.$indexContainer.find(".index-task-container");
        this.addItemToContainer(task as Item, $taskContainer);
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

        for (let i: number = 0; i < tasks.length; i++)
        {
            this.addTaskToView(tasks[i]);
        }
        this.removeTaskLoadingText();

        // STUB (does not add deadlines to view):
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