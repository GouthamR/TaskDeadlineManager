(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/// <reference path="jquery.d.ts" />
"use strict";
var item_1 = require("./item");
var item_2 = require("./item");
var index;
(function (index) {
    function loadItemsFromServer(route, errorPrefix, callback) {
        $.getJSON(route)
            .done(function (data, textStatus, jqXHR) {
            callback(data);
        })
            .fail(function (jqXHR, textStatus, error) {
            var errorDetails = textStatus + ", " + error;
            showLoadErrorInView(errorPrefix, errorDetails);
            console.log(errorDetails);
        });
    }
    function loadTasksFromServer(callback) {
        loadItemsFromServer("/load-tasks", "Error: failed to load tasks.", callback);
    }
    function loadDeadlinesFromServer(callback) {
        loadItemsFromServer("/load-deadlines", "Error: failed to load deadlines.", callback);
    }
    function showLoadErrorInView(errorPrefix, errorDetails) {
        var errorMessage = errorPrefix + "\nDetails: " + errorDetails;
        new View().showLoadError(errorMessage);
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
            var _this = this;
            $("#task-container > a").click(function (event) { return _this.onAddTaskClicked(event); });
        }
        View.prototype.onAddTaskClicked = function (event) {
            $("#index").addClass("hidden");
            $("#add-task").removeClass("hidden");
        };
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
        View.prototype.showLoadError = function (errorMessage) {
            this.removeLoading("#task-container");
            this.removeLoading("#deadline-container");
            $("#error-container").append($("<p>").html(errorMessage));
            $("#error-container").removeClass("hidden");
        };
        return View;
    }());
    function loadView(tasks, deadlines) {
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
    function main() {
        "use strict";
        var tasks = [];
        var deadlines = [];
        function onLoadDeadlines(data) {
            var deadlineSerializer = new item_2.DeadlineSerializer();
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var i = data_1[_i];
                deadlines.push(deadlineSerializer.fromJSON(i));
            }
            console.log(deadlines);
            loadView(tasks, deadlines);
        }
        function onLoadTasks(data) {
            var taskSerializer = new item_1.TaskSerializer();
            for (var _i = 0, data_2 = data; _i < data_2.length; _i++) {
                var i = data_2[_i];
                tasks.push(taskSerializer.fromJSON(i));
            }
            console.log(tasks);
            loadDeadlinesFromServer(onLoadDeadlines);
        }
        loadTasksFromServer(onLoadTasks);
    }
    index.main = main;
})(index || (index = {}));
$(document).ready(index.main);

},{"./item":2}],2:[function(require,module,exports){
"use strict";
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
exports.Item = Item;
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
exports.Task = Task;
var TaskSerializer = (function () {
    function TaskSerializer() {
    }
    TaskSerializer.prototype.toJSON = function (obj) {
        var json = {
            title: obj.getTitle(),
            startEpochMillis: obj.getStart().getTime().toString(),
            endEpochMillis: obj.getEnd().getTime().toString(),
            isAllDay: obj.getIsAllDay().toString()
        };
        return json;
    };
    TaskSerializer.prototype.fromJSON = function (json) {
        var taskJson = json;
        return new Task(taskJson.title, new Date(parseInt(taskJson.startEpochMillis)), new Date(parseInt(taskJson.endEpochMillis)), taskJson.isAllDay == "true");
    };
    return TaskSerializer;
}());
exports.TaskSerializer = TaskSerializer;
var Deadline = (function (_super) {
    __extends(Deadline, _super);
    function Deadline(title, start, isAllDay) {
        _super.call(this, title, start, isAllDay);
    }
    return Deadline;
}(Item));
exports.Deadline = Deadline;
var DeadlineSerializer = (function () {
    function DeadlineSerializer() {
    }
    DeadlineSerializer.prototype.toJSON = function (obj) {
        var json = {
            title: obj.getTitle(),
            startEpochMillis: obj.getStart().getTime().toString(),
            isAllDay: obj.getIsAllDay().toString()
        };
        return json;
    };
    DeadlineSerializer.prototype.fromJSON = function (json) {
        var deadlineJson = json;
        return new Deadline(deadlineJson.title, new Date(parseInt(deadlineJson.startEpochMillis)), deadlineJson.isAllDay == "true");
    };
    return DeadlineSerializer;
}());
exports.DeadlineSerializer = DeadlineSerializer;

},{}]},{},[1]);
