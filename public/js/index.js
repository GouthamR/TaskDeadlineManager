/// <reference path="jquery.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Item = (function () {
    function Item(title, start, isAllDay) {
        this.title = title;
        this.start = start;
        this.isAllDay = isAllDay;
    }
    Item.prototype.getDayTimeString = function () {
        // stub:
        var allDayEnding;
        if (this.getIsAllDay()) {
            allDayEnding = '_ALL_DAY';
        }
        else {
            allDayEnding = '';
        }
        return this.getStart().toString() + allDayEnding;
    };
    Item.prototype.getTitle = function () { return this.title; };
    Item.prototype.getStart = function () { return this.start; };
    Item.prototype.getIsAllDay = function () { return this.isAllDay; };
    Item.prototype.setTitle = function (title) {
        this.title = title;
    };
    Item.prototype.setStart = function (start) {
        this.start = start;
    };
    Item.prototype.setIsAllDay = function (isAllDay) {
        this.isAllDay = isAllDay;
    };
    return Item;
}());
var Task = (function (_super) {
    __extends(Task, _super);
    function Task(title, start, end, isAllDay) {
        _super.call(this, title, start, isAllDay);
        this.end = end;
    }
    Task.prototype.getEnd = function () { return this.end; };
    Task.prototype.setEnd = function (end) {
        this.end = end;
    };
    Task.prototype.getDayTimeString = function () {
        // stub:
        var allDayEnding;
        if (this.getIsAllDay()) {
            allDayEnding = '_ALL_DAY';
        }
        else {
            allDayEnding = '';
        }
        return this.getStart().toString() + " - " + this.getEnd().toString() + allDayEnding;
    };
    return Task;
}(Item));
var Deadline = (function (_super) {
    __extends(Deadline, _super);
    function Deadline(title, start, isAllDay) {
        _super.call(this, title, start, isAllDay);
    }
    return Deadline;
}(Item));
function loadTasksFromDB(day) {
    // stub:
    function getTodayAtTime(hours, minutes) {
        var date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        return date;
    }
    function getTodayAllDay() {
        var date = new Date();
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
function loadDeadlinesFromDB() {
    // stub
    return [new Deadline("English Paper", new Date(2016, 2, 10, 23, 59), false),
        new Deadline("Game of Thrones Seasons 1-8 Due", new Date(2016, 4, 12, 12, 0), false),
        new Deadline("Math HW Due", new Date(2016, 9, 20), true),
        new Deadline("Cure to Cancer Due", new Date(2016, 11, 25), true),
        new Deadline("Spaces vs Tabs Rant Post Deadline", new Date(2017, 0, 2), true)];
}
var ItemEditor = (function () {
    function ItemEditor(item, li, doneCallback) {
        this.item = item;
        this.li = li;
        this.li.empty();
        this.titleInput = $("<input>", { type: "text", value: this.item.getTitle() });
        this.li.append(this.titleInput);
        var doneButton = $("<input>", { type: "button", value: "Done" });
        doneButton.click(this.doneButtonClickFn.bind(this));
        this.li.append(doneButton);
        this.doneCallback = doneCallback;
    }
    ItemEditor.prototype.doneButtonClickFn = function () {
        this.item.setTitle(this.titleInput.val());
        this.li.empty();
        console.log(this.item);
        this.doneCallback(this.li, this.item);
    };
    return ItemEditor;
}());
var View = (function () {
    function View() {
    }
    View.prototype.markItemDone = function (item, li) {
        // stub
        console.log(item.getTitle() + " removed");
        li.slideUp();
    };
    View.prototype.fillLi = function (li, item) {
        var middle = $("<div>", { class: "item-middle" });
        middle.append($("<p>").html(item.getTitle()), $("<p>").html(item.getDayTimeString()));
        var check = $("<img>", { class: "td-check", src: "img/check.png" });
        var settings = $("<img>", { class: "td-settings", src: "img/gear.png" });
        check.click(this.markItemDone.bind(this, item, li));
        settings.click(this.openSettings.bind(this, item, li));
        li.append(check, middle, settings);
    };
    View.prototype.openSettings = function (item, li) {
        new ItemEditor(item, li, this.fillLi.bind(this));
    };
    View.prototype.createLi = function (item) {
        var li = $("<li>");
        this.fillLi(li, item);
        return li;
    };
    View.prototype.appendLi = function (container_name, item) {
        var li = this.createLi(item);
        $(container_name + " ul").append(li);
    };
    View.prototype.removeLoading = function (container_name) {
        $(container_name + " .loading").remove();
    };
    return View;
}());
function main() {
    "use strict";
    var tasks = loadTasksFromDB(new Date());
    var deadlines = loadDeadlinesFromDB();
    var view = new View();
    for (var i = 0; i < tasks.length; i++) {
        view.appendLi("#task-container", tasks[i]);
    }
    for (var i = 0; i < deadlines.length; i++) {
        view.appendLi("#deadline-container", deadlines[i]);
    }
    view.removeLoading("#task-container");
    view.removeLoading("#deadline-container");
}
$(document).ready(main);
