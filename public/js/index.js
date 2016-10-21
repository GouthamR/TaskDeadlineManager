/// <reference path="jquery.d.ts" />
"use strict";
var item_1 = require("./item");
var item_2 = require("./item");
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
    return [new item_1.Task("Clean Room", getTodayAtTime(8, 0), getTodayAtTime(8, 45), false),
        new item_1.Task("Math HW", getTodayAtTime(10, 0), getTodayAtTime(10, 30), false),
        new item_1.Task("Lunch", getTodayAtTime(12, 30), getTodayAtTime(13, 30), false),
        new item_1.Task("End Poverty", getTodayAllDay(), getTodayAllDay(), true),
        new item_1.Task("Game of Thrones Marathon", getTodayAtTime(18, 0), getTodayAtTime(23, 30), false),
        new item_1.Task("Solve the Water Stagnation Problem", getTodayAllDay(), getTodayAllDay(), true),
        new item_1.Task("Dinner", getTodayAtTime(19, 30), getTodayAtTime(20, 30), false)];
}
function loadDeadlinesFromDB() {
    // stub
    return [new item_2.Deadline("English Paper", new Date(2016, 2, 10, 23, 59), false),
        new item_2.Deadline("Game of Thrones Seasons 1-8 Due", new Date(2016, 4, 12, 12, 0), false),
        new item_2.Deadline("Math HW Due", new Date(2016, 9, 20), true),
        new item_2.Deadline("Cure to Cancer Due", new Date(2016, 11, 25), true),
        new item_2.Deadline("Spaces vs Tabs Rant Post Deadline", new Date(2017, 0, 2), true)];
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
