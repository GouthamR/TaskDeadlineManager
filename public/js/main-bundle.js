(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var item_1 = require("./item");
var item_2 = require("./item");
// Module-scope variables:
var $addTaskContainer;
function toDate(dateWithoutTime, time) {
    var fullDate = dateWithoutTime + time;
    return moment(fullDate, "YYYY-MM-DD HH:mm").toDate();
}
function toTaskJSON(formArray) {
    var title = formArray[0].value;
    var start = toDate(formArray[1].value, formArray[2].value);
    var end = toDate(formArray[3].value, formArray[4].value);
    var task = new item_1.Task(title, start, end, false);
    var json = new item_2.TaskSerializer().toJSON(task);
    return json;
}
function getFormAsJSON() {
    var formArray = $addTaskContainer.find(".add-task-form").serializeArray();
    return toTaskJSON(formArray);
}
exports.getFormAsJSON = getFormAsJSON;
function main($targetContainer, onAddTaskSubmit) {
    "use strict";
    $addTaskContainer = $targetContainer.find(".add-task");
    $addTaskContainer.find(".add-task-form").on("submit", onAddTaskSubmit);
}
exports.main = main;
;

},{"./item":4}],2:[function(require,module,exports){
"use strict";
// Module-level variables:
var $calendarContainer;
var LOADING_CLASS_NAME = "calendar-loading";
var loadFromServer;
function clearAndShowLoading() {
    // STUB (does not clear):
    var $fullCalendarDiv = $calendarContainer.find(".calendar-fullcalendar");
    var $loading = $("<p>", { class: LOADING_CLASS_NAME }).html("Loading...");
    $fullCalendarDiv.append($loading);
}
function removeLoading() {
    var $fullCalendarDiv = $calendarContainer.find(".calendar-fullcalendar");
    $fullCalendarDiv.find("." + LOADING_CLASS_NAME).remove();
}
function getEventsFromServer(start, end, timezone, callback) {
    function onSuccess(tasks, deadlines) {
        var events = [];
        for (var _i = 0, tasks_1 = tasks; _i < tasks_1.length; _i++) {
            var task = tasks_1[_i];
            var event_1 = {
                title: task.getTitle(),
                start: task.getStart(),
                allDay: task.getIsAllDay(),
                end: task.getEnd()
            };
            events.push(event_1);
        }
        for (var _a = 0, deadlines_1 = deadlines; _a < deadlines_1.length; _a++) {
            var deadline = deadlines_1[_a];
            var event_2 = {
                title: deadline.getTitle(),
                start: deadline.getStart(),
                allDay: deadline.getIsAllDay()
            };
            events.push(event_2);
        }
        callback(events);
    }
    function onFailure(error) {
        alert("Failed to load from server. Details: " + error);
        callback([]);
    }
    loadFromServer(onSuccess, onFailure);
}
function initFullCalendar() {
    $calendarContainer.find(".calendar-fullcalendar").fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,basicWeek,agendaDay'
        },
        defaultDate: '2016-09-12',
        navLinks: true,
        editable: true,
        events: getEventsFromServer
    });
    removeLoading();
}
function main($targetContainer, loadFromServerFn) {
    $calendarContainer = $targetContainer.find(".calendar");
    loadFromServer = loadFromServerFn;
    clearAndShowLoading();
    initFullCalendar();
}
exports.main = main;

},{}],3:[function(require,module,exports){
"use strict";
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
    function View($targetContainer, onAddTaskClicked) {
        this.$indexContainer = $targetContainer.find(".index");
        var $addTaskButton = this.$indexContainer.find(".index-task-container > a");
        $addTaskButton.click(onAddTaskClicked);
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
        this.$indexContainer.find(container_name).find("ul").append(li);
    };
    View.prototype.clearAndShowLoading = function (container_name) {
        var $ul = this.$indexContainer.find(container_name).find("ul");
        $ul.empty();
        var $loading = $("<p>", { class: "index-loading" }).html("Loading...");
        $ul.append($loading);
    };
    View.prototype.removeLoading = function (container_name) {
        this.$indexContainer.find(container_name).find(".index-loading").remove();
    };
    // Note: appends error after any existing errors.
    View.prototype.showLoadError = function (errorMessage) {
        console.log("loadError!");
        this.removeLoading(".index-task-container");
        this.removeLoading(".index-deadline-container");
        var $indexErrorContainer = this.$indexContainer.find(".index-error-container");
        $indexErrorContainer.append($("<p>").html(errorMessage));
        $indexErrorContainer.removeClass("hidden");
    };
    return View;
}());
// module-scope variables:
var view;
function loadView(tasks, deadlines) {
    clearViewAndShowLoading();
    for (var i = 0; i < tasks.length; i++) {
        view.appendLi(".index-task-container", tasks[i]);
    }
    for (var i = 0; i < deadlines.length; i++) {
        view.appendLi(".index-deadline-container", deadlines[i]);
    }
    view.removeLoading(".index-task-container");
    view.removeLoading(".index-deadline-container");
}
exports.loadView = loadView;
function showLoadError(errorMessage) {
    view.showLoadError(errorMessage);
}
exports.showLoadError = showLoadError;
function clearViewAndShowLoading() {
    console.log("clearViewAndShowLoading");
    view.clearAndShowLoading(".index-task-container");
    view.clearAndShowLoading(".index-deadline-container");
}
exports.clearViewAndShowLoading = clearViewAndShowLoading;
function main($targetContainer, onAddTaskClicked) {
    "use strict";
    view = new View($targetContainer, onAddTaskClicked);
}
exports.main = main;

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
"use strict";
var AddTask = require("./add-task");
var index = require("./index");
var nav = require("./nav");
var calendar = require("./calendar");
var item_1 = require("./item");
var item_2 = require("./item");
var View;
(function (View) {
    View[View["Index"] = 0] = "Index";
    View[View["AddTask"] = 1] = "AddTask";
    View[View["Calendar"] = 2] = "Calendar";
})(View || (View = {}));
function setVisibility(elementClass, isVisible) {
    var HIDING_CLASS_NAME = "hidden";
    if (isVisible) {
        $(elementClass).removeClass(HIDING_CLASS_NAME);
    }
    else {
        $(elementClass).addClass(HIDING_CLASS_NAME);
    }
}
function switchToView(view) {
    var index, addtask, calendar;
    index = addtask = calendar = false;
    if (view == View.Index) {
        index = true;
    }
    else if (view == View.AddTask) {
        addtask = true;
    }
    else if (view == View.Calendar) {
        calendar = true;
    }
    setVisibility(".main-index", index);
    setVisibility(".main-add-task", addtask);
    setVisibility(".main-calendar", calendar);
}
function loadItemDataFromServer(route, onSuccess, onFailure) {
    $.getJSON(route)
        .done(function (data, textStatus, jqXHR) {
        onSuccess(data);
    })
        .fail(function (jqXHR, textStatus, error) {
        var errorDetails = textStatus + ", " + error;
        onFailure(errorDetails);
    });
}
function loadTasksFromServer(onSuccess, onFailure) {
    function onLoadSuccess(data) {
        var tasks = [];
        var taskSerializer = new item_1.TaskSerializer();
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var i = data_1[_i];
            tasks.push(taskSerializer.fromJSON(i));
        }
        console.log(tasks);
        onSuccess(tasks);
    }
    loadItemDataFromServer("/load-tasks", onLoadSuccess, onFailure);
}
function loadDeadlinesFromServer(onSuccess, onFailure) {
    function onLoadSuccess(data) {
        var deadlines = [];
        var deadlineSerializer = new item_2.DeadlineSerializer();
        for (var _i = 0, data_2 = data; _i < data_2.length; _i++) {
            var i = data_2[_i];
            deadlines.push(deadlineSerializer.fromJSON(i));
        }
        console.log(deadlines);
        onSuccess(deadlines);
    }
    loadItemDataFromServer("/load-deadlines", onLoadSuccess, onFailure);
}
function loadTasksAndDeadlinesFromServer(onSuccess, onFailure) {
    var isTasksLoaded = false;
    var isDeadlinesLoaded = false;
    var tasks = [];
    var deadlines = [];
    function onTasksLoaded(loadedTasks) {
        tasks = loadedTasks;
        isTasksLoaded = true;
        if (isDeadlinesLoaded) {
            onSuccess(tasks, deadlines);
        }
    }
    function onDeadlinesLoaded(loadedDeadlines) {
        deadlines = loadedDeadlines;
        isDeadlinesLoaded = true;
        if (isTasksLoaded) {
            onSuccess(tasks, deadlines);
        }
    }
    function onTasksFailure(errorDetails) {
        onFailure("Error loading tasks. Details: " + errorDetails);
    }
    function onDeadlinesFailure(errorDetails) {
        onFailure("Error loading deadlines. Details: " + errorDetails);
    }
    loadTasksFromServer(onTasksLoaded, onTasksFailure);
    loadDeadlinesFromServer(onDeadlinesLoaded, onDeadlinesFailure);
}
var IndexFunctions;
(function (IndexFunctions) {
    function onIndexAddTaskClicked(event) {
        switchToView(View.AddTask);
    }
    IndexFunctions.onIndexAddTaskClicked = onIndexAddTaskClicked;
    function loadFromServer() {
        index.clearViewAndShowLoading();
        loadTasksAndDeadlinesFromServer(index.loadView, index.showLoadError);
    }
    IndexFunctions.loadFromServer = loadFromServer;
})(IndexFunctions || (IndexFunctions = {}));
var AddTaskFunctions;
(function (AddTaskFunctions) {
    function postFormJSON(json) {
        $.post("add-task", json)
            .done(function (data, textStatus, jqXHR) {
            console.log("Add Task success:");
            console.log(data);
            IndexFunctions.loadFromServer();
        })
            .fail(function (jqXHR, textStatus, error) {
            var errorDetails = textStatus + ", " + error;
            alert("ERROR: Add Task failed.\nDetails: " + errorDetails);
            console.log(errorDetails);
        });
    }
    function onAddTaskSubmit(event) {
        event.preventDefault();
        switchToView(View.Index);
        var json = AddTask.getFormAsJSON();
        postFormJSON(json);
    }
    AddTaskFunctions.onAddTaskSubmit = onAddTaskSubmit;
})(AddTaskFunctions || (AddTaskFunctions = {}));
var NavFunctions;
(function (NavFunctions) {
    function onCalendarClicked(event) {
        console.log("Nav calendar clicked");
        switchToView(View.Calendar);
    }
    NavFunctions.onCalendarClicked = onCalendarClicked;
})(NavFunctions || (NavFunctions = {}));
var CalendarFunctions;
(function (CalendarFunctions) {
    function loadFromServer(onSuccess, onFailure) {
        loadTasksAndDeadlinesFromServer(onSuccess, onFailure);
    }
    CalendarFunctions.loadFromServer = loadFromServer;
})(CalendarFunctions || (CalendarFunctions = {}));
function main() {
    switchToView(View.Index);
    AddTask.main($(".main-add-task"), AddTaskFunctions.onAddTaskSubmit);
    index.main($(".main-index"), IndexFunctions.onIndexAddTaskClicked);
    nav.main($(".main-nav"), NavFunctions.onCalendarClicked);
    calendar.main($(".main-calendar"), CalendarFunctions.loadFromServer);
    IndexFunctions.loadFromServer();
}
$(document).ready(main);

},{"./add-task":1,"./calendar":2,"./index":3,"./item":4,"./nav":6}],6:[function(require,module,exports){
"use strict";
// Module-scope variables:
var MOBILE_MAX_WIDTH = 768; // pixels
var ANIM_TIME = 350; // milliseconds
var Nav = (function () {
    function Nav($navContainer, onCalendarClicked) {
        var _this = this;
        this.$navContainer = $navContainer;
        this.isOpen = false;
        var onPullLinkClicked = function (e) { _this.toggleSidebarExpansion(); };
        $navContainer.find(".nav-pull-link").click(onPullLinkClicked);
        var onWindowResize = function (e) { _this.toggleSidebarVsHeader(); };
        $(window).resize(onWindowResize);
        $navContainer.find(".nav-calendar-button").click(onCalendarClicked);
    }
    Nav.prototype.toggleSidebarExpansion = function () {
        var $nav = this.$navContainer.find("nav");
        var animDirection = this.isOpen ? "-" : "+";
        $nav.animate({ left: (animDirection + '=' + $nav.width()) }, ANIM_TIME);
        this.isOpen = !this.isOpen;
    };
    Nav.prototype.toggleSidebarVsHeader = function () {
        var $nav = this.$navContainer.find("nav");
        var switchToTop = $(window).width() > MOBILE_MAX_WIDTH;
        if (switchToTop && $nav.position().left < 0) {
            this.isOpen = true;
            $nav.css({ left: 0 }); // horizontally center nav (in case collapsed in mobile view)
        }
        else if (!switchToTop) {
            // hide nav:
            this.isOpen = false;
            $nav.css({ left: -$nav.width() });
        }
    };
    return Nav;
}());
function main($targetContainer, onCalendarClicked) {
    var $navContainer = $targetContainer.find(".nav");
    var nav = new Nav($navContainer, onCalendarClicked);
}
exports.main = main;

},{}]},{},[5]);
