(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/// <reference path="./moment_modified.d.ts" />
"use strict";
var main = require("./main");
// Module-scope variables:
var $addTaskContainer;
var addTaskModel;
var mainModel;
function toDate(dateWithoutTime, time) {
    var fullDate = dateWithoutTime + time;
    return moment(fullDate, "YYYY-MM-DD HH:mm").toDate();
}
function toTaskJSONWithoutID(formArray) {
    var title = formArray[0].value;
    var startDate = toDate(formArray[1].value, formArray[2].value);
    var endDate = toDate(formArray[3].value, formArray[4].value);
    var json = {
        title: title,
        startEpochMillis: startDate.getTime().toString(),
        endEpochMillis: endDate.getTime().toString(),
        isAllDay: "false"
    };
    return json;
}
function getFormAsJSON() {
    var formArray = $addTaskContainer.find(".add-task-form").serializeArray();
    return toTaskJSONWithoutID(formArray);
}
function setDefaultDateTimeInputValues() {
    var dateInputs = $addTaskContainer.find(".add-task-form input[type='date']").toArray();
    for (var _i = 0, dateInputs_1 = dateInputs; _i < dateInputs_1.length; _i++) {
        var dateInput = dateInputs_1[_i];
        $(dateInput).val(moment().format("YYYY-MM-DD"));
    }
    var $startTimeInput = $addTaskContainer.find(".add-task-form-start-time-input");
    var $endTimeInput = $addTaskContainer.find(".add-task-form-end-time-input");
    $startTimeInput.val(moment().startOf("hour").add(1, 'hours').format("HH:mm"));
    $endTimeInput.val(moment().startOf("hour").add(2, 'hours').format("HH:mm"));
}
function onAddTaskSubmit(event) {
    event.preventDefault();
    mainModel.switchToView(main.View.Index);
    var json = getFormAsJSON();
    addTaskModel.addTask(json);
}
function init($targetContainer, addTaskModelParam, mainModelParam) {
    "use strict";
    $addTaskContainer = $targetContainer.find(".add-task");
    addTaskModel = addTaskModelParam;
    mainModel = mainModelParam;
    var addTaskForm = $addTaskContainer.find(".add-task-form");
    addTaskForm.on("submit", function (event) { return onAddTaskSubmit(event); });
    setDefaultDateTimeInputValues();
}
exports.init = init;

},{"./main":5}],2:[function(require,module,exports){
/// <reference path="./fullcalendar_modified.d.ts" />
/// <reference path="./moment_modified.d.ts" />
"use strict";
// Module-level variables:
var $calendarContainer;
var LOADING_CLASS_NAME = "calendar-loading";
var loadFromServer;
var updateTaskOnServer;
var ItemType;
(function (ItemType) {
    ItemType[ItemType["Task"] = 0] = "Task";
    ItemType[ItemType["Deadline"] = 1] = "Deadline";
})(ItemType || (ItemType = {}));
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
        // STUB: (does not add deadlines to calendar)
        var events = [];
        for (var _i = 0, tasks_1 = tasks; _i < tasks_1.length; _i++) {
            var task = tasks_1[_i];
            var event_1 = {
                title: task.getTitle(),
                start: moment(task.getStart()),
                allDay: task.getIsAllDay(),
                end: moment(task.getEnd()),
                itemType: ItemType.Task,
                item: task
            };
            events.push(event_1);
        }
        callback(events);
    }
    function onFailure(error) {
        alert("Failed to load from server. Details: " + error);
        callback([]);
    }
    loadFromServer(onSuccess, onFailure);
}
// While FC.EventObject has an allDay field, that field yields inaccurate values.
function isAllDay(event) {
    var NUM_CHARS_IN_ALL_DAY_FORMAT = 10;
    var formatted = event.start.format();
    var numCharsInFormat = formatted.length;
    return (numCharsInFormat == NUM_CHARS_IN_ALL_DAY_FORMAT);
}
// This function uses the momentObj.format() to convert to date, since that
// method always returns correct results, unlike momentObj.toDate().
function convertMomentToDate(momentObj) {
    return moment(momentObj.format()).toDate();
}
// While event.start.toDate would seemingly work, it often returns invalid results.
// But event.start.format() is always valid, so this mehod uses that to get the equivalent date.
function convertStartToDate(event) {
    return convertMomentToDate(event.start);
}
// While event.end.toDate would seemingly work, it often returns invalid results.
// But event.end.format() is always valid, so this mehod uses that to get the equivalent date.
function convertEndToDate(event) {
    return convertMomentToDate(event.end);
}
function convertToTask(itemEvent) {
    var task = itemEvent.item;
    task.setStart(convertStartToDate(itemEvent));
    task.setEnd(convertEndToDate(itemEvent));
    task.setIsAllDay(isAllDay(itemEvent));
    return task;
}
function onEventChanged(event, delta, revertFunc, jsEvent, ui, view) {
    var itemEventObj = event;
    console.log("Event changed: ");
    console.log(itemEventObj);
    if (itemEventObj.itemType == ItemType.Task) {
        var updatedTask = convertToTask(itemEventObj);
        updateTaskOnServer(updatedTask);
    }
}
function initFullCalendar() {
    $calendarContainer.find(".calendar-fullcalendar").fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,basicWeek,agendaDay'
        },
        navLinks: true,
        editable: true,
        timezone: 'local',
        events: getEventsFromServer,
        eventDrop: onEventChanged,
        eventResize: onEventChanged,
        forceEventDuration: true,
        defaultTimedEventDuration: '01:00:00',
        defaultAllDayEventDuration: { days: 1 }
    });
    removeLoading();
}
function reloadCalendar() {
    console.log("Reloading calendar");
    var $fullCalendar = $calendarContainer.find(".calendar-fullcalendar");
    $fullCalendar.fullCalendar("refetchEvents");
}
exports.reloadCalendar = reloadCalendar;
function main($targetContainer, loadFromServerFn, updateTaskOnServerFn) {
    $calendarContainer = $targetContainer.find(".calendar");
    loadFromServer = loadFromServerFn;
    updateTaskOnServer = updateTaskOnServerFn;
    clearAndShowLoading();
    initFullCalendar();
}
exports.main = main;

},{}],3:[function(require,module,exports){
"use strict";
var main = require("./main");
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
    function View($targetContainer, indexModel, mainModel) {
        var _this = this;
        this.$indexContainer = $targetContainer.find(".index");
        this.indexModel = indexModel;
        this.mainModel = mainModel;
        var $addTaskButton = this.$indexContainer.find(".index-task-container > a");
        $addTaskButton.click(function (event) { return _this.mainModel.switchToView(main.View.AddTask); });
    }
    View.prototype.markItemDone = function (item, li) {
        // STUB (does not remove deadlines correctly):
        this.indexModel.removeTaskFromServer(item);
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
    View.prototype.clearAndShowLoadingOnContainer = function (container_name) {
        var $ul = this.$indexContainer.find(container_name).find("ul");
        $ul.empty();
        var $loading = $("<p>", { class: "index-loading" }).html("Loading...");
        $ul.append($loading);
    };
    View.prototype.clearAndShowLoading = function () {
        console.log("clearViewAndShowLoading");
        this.clearAndShowLoadingOnContainer(".index-task-container");
        this.clearAndShowLoadingOnContainer(".index-deadline-container");
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
    View.prototype.loadView = function (tasks, deadlines) {
        this.clearAndShowLoading();
        for (var i = 0; i < tasks.length; i++) {
            this.appendLi(".index-task-container", tasks[i]);
        }
        for (var i = 0; i < deadlines.length; i++) {
            this.appendLi(".index-deadline-container", deadlines[i]);
        }
        this.removeLoading(".index-task-container");
        this.removeLoading(".index-deadline-container");
    };
    View.prototype.reloadFromServer = function () {
        var _this = this;
        this.clearAndShowLoading();
        this.mainModel.loadTasksAndDeadlinesFromServer(function (t, d) { return _this.loadView(t, d); }, function (e) { return _this.showLoadError(e); });
    };
    return View;
}());
// Module-scope variables:
var view;
function reloadFromServer() {
    view.reloadFromServer();
}
exports.reloadFromServer = reloadFromServer;
function init($targetContainer, indexModel, mainModel) {
    "use strict";
    view = new View($targetContainer, indexModel, mainModel);
}
exports.init = init;

},{"./main":5}],4:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Item = (function () {
    function Item(title, start, isAllDay, id) {
        this.title = title;
        this.start = start;
        this.isAllDay = isAllDay;
        this.id = id;
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
    Item.prototype.getID = function () { return this.id; };
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
    function Task(title, start, end, isAllDay, id) {
        _super.call(this, title, start, isAllDay, id);
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
            isAllDay: obj.getIsAllDay().toString(),
            _id: obj.getID()
        };
        return json;
    };
    TaskSerializer.prototype.fromJSON = function (taskJson) {
        return new Task(taskJson.title, new Date(parseInt(taskJson.startEpochMillis)), new Date(parseInt(taskJson.endEpochMillis)), taskJson.isAllDay == "true", taskJson._id);
    };
    return TaskSerializer;
}());
exports.TaskSerializer = TaskSerializer;
var Deadline = (function (_super) {
    __extends(Deadline, _super);
    function Deadline(title, start, isAllDay, id) {
        _super.call(this, title, start, isAllDay, id);
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
            isAllDay: obj.getIsAllDay().toString(),
            _id: obj.getID()
        };
        return json;
    };
    DeadlineSerializer.prototype.fromJSON = function (deadlineJson) {
        return new Deadline(deadlineJson.title, new Date(parseInt(deadlineJson.startEpochMillis)), deadlineJson.isAllDay == "true", deadlineJson._id);
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
(function (View) {
    View[View["Index"] = 0] = "Index";
    View[View["AddTask"] = 1] = "AddTask";
    View[View["Calendar"] = 2] = "Calendar";
})(exports.View || (exports.View = {}));
var View = exports.View;
var MainModel = (function () {
    function MainModel() {
    }
    MainModel.prototype.setVisibility = function (elementClass, isVisible) {
        var HIDING_CLASS_NAME = "hidden";
        if (isVisible) {
            $(elementClass).removeClass(HIDING_CLASS_NAME);
        }
        else {
            $(elementClass).addClass(HIDING_CLASS_NAME);
        }
    };
    // Returns keys of enum e.
    // e.g. given enum E { A, B, C } returns [0, 1, 2]
    MainModel.prototype.getEnumValues = function (e) {
        var valueStrings = Object.keys(e).filter(function (k) { return typeof e[k] === "string"; });
        return valueStrings.map(function (v) { return parseInt(v); });
    };
    MainModel.prototype.switchToView = function (newView) {
        var CLASS_NAME_TO_VIEW_VALUE_MAP = {
            ".main-index": View.Index,
            ".main-add-task": View.AddTask,
            ".main-calendar": View.Calendar
        };
        for (var className in CLASS_NAME_TO_VIEW_VALUE_MAP) {
            var viewValue = CLASS_NAME_TO_VIEW_VALUE_MAP[className];
            this.setVisibility(className, viewValue == newView);
        }
        if (newView == View.Calendar) {
            calendar.reloadCalendar();
        }
        else if (newView == View.Index) {
            index.reloadFromServer();
        }
    };
    MainModel.prototype.loadItemDataFromServer = function (route, onSuccess, onFailure) {
        $.getJSON(route)
            .done(function (data, textStatus, jqXHR) {
            onSuccess(data);
        })
            .fail(function (jqXHR, textStatus, error) {
            var errorDetails = textStatus + ", " + error;
            onFailure(errorDetails);
        });
    };
    MainModel.prototype.loadTasksFromServer = function (onSuccess, onFailure) {
        function onLoadSuccess(data) {
            var tasks = [];
            var taskSerializer = new item_1.TaskSerializer();
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var i = data_1[_i];
                var taskJson = i;
                var task = taskSerializer.fromJSON(taskJson);
                tasks.push(task);
            }
            console.log(tasks);
            onSuccess(tasks);
        }
        this.loadItemDataFromServer("/load-tasks", onLoadSuccess, onFailure);
    };
    MainModel.prototype.loadDeadlinesFromServer = function (onSuccess, onFailure) {
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
        this.loadItemDataFromServer("/load-deadlines", onLoadSuccess, onFailure);
    };
    MainModel.prototype.loadTasksAndDeadlinesFromServer = function (onSuccess, onFailure) {
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
        this.loadTasksFromServer(onTasksLoaded, onTasksFailure);
        this.loadDeadlinesFromServer(onDeadlinesLoaded, onDeadlinesFailure);
    };
    return MainModel;
}());
exports.MainModel = MainModel;
var IndexModel = (function () {
    function IndexModel() {
    }
    IndexModel.prototype.removeTaskFromServer = function (taskToRemove) {
        var json = new item_1.TaskSerializer().toJSON(taskToRemove);
        $.post("delete-task", json)
            .done(function (data, textStatus, jqXHR) {
            console.log("Remove Task success:");
            console.log(data);
        })
            .fail(function (jqXHR, textStatus, error) {
            var errorDetails = textStatus + ", " + error;
            alert("ERROR: Remove Task failed.\nDetails: " + errorDetails);
            console.log(errorDetails);
        });
    };
    return IndexModel;
}());
exports.IndexModel = IndexModel;
var AddTaskModel = (function () {
    function AddTaskModel() {
    }
    AddTaskModel.prototype.addTask = function (json) {
        $.post("add-task", json)
            .done(function (data, textStatus, jqXHR) {
            console.log("Add Task success:");
            console.log(data);
            index.reloadFromServer();
        })
            .fail(function (jqXHR, textStatus, error) {
            var errorDetails = textStatus + ", " + error;
            alert("ERROR: Add Task failed.\nDetails: " + errorDetails);
            console.log(errorDetails);
        });
    };
    return AddTaskModel;
}());
exports.AddTaskModel = AddTaskModel;
var CalendarFunctions;
(function (CalendarFunctions) {
    function loadFromServer(onSuccess, onFailure) {
        mainModel.loadTasksAndDeadlinesFromServer(onSuccess, onFailure);
    }
    CalendarFunctions.loadFromServer = loadFromServer;
    // Replaces task that has the id of updatedTask with updatedTask.
    function updateTaskOnServer(updatedTask) {
        var updatedJSON = new item_1.TaskSerializer().toJSON(updatedTask);
        $.post("update-task", updatedJSON)
            .done(function (data, textStatus, jqXHR) {
            console.log("Update Task success:");
            console.log(data);
            calendar.reloadCalendar();
        })
            .fail(function (jqXHR, textStatus, error) {
            var errorDetails = textStatus + ", " + error;
            alert("ERROR: Update Task failed.\nDetails: " + errorDetails);
            console.log(errorDetails);
        });
    }
    CalendarFunctions.updateTaskOnServer = updateTaskOnServer;
})(CalendarFunctions || (CalendarFunctions = {}));
// Module-scope variables:
var mainModel;
var indexModel;
var addTaskModel;
function main() {
    mainModel = new MainModel();
    indexModel = new IndexModel();
    addTaskModel = new AddTaskModel();
    AddTask.init($(".main-add-task"), addTaskModel, mainModel);
    index.init($(".main-index"), indexModel, mainModel);
    nav.init($(".main-nav"), mainModel);
    calendar.main($(".main-calendar"), CalendarFunctions.loadFromServer, CalendarFunctions.updateTaskOnServer);
    index.reloadFromServer();
    mainModel.switchToView(View.Index);
}
$(document).ready(main);

},{"./add-task":1,"./calendar":2,"./index":3,"./item":4,"./nav":6}],6:[function(require,module,exports){
"use strict";
var main = require("./main");
// Module-scope variables:
var MOBILE_MAX_WIDTH = 768; // pixels
var ANIM_TIME = 350; // milliseconds
var Nav = (function () {
    function Nav($navContainer, mainModel) {
        var _this = this;
        this.$navContainer = $navContainer;
        this.isOpen = false;
        this.mainModel = mainModel;
        var onPullLinkClicked = function (e) { _this.toggleSidebarExpansion(); };
        $navContainer.find(".nav-pull-link").click(onPullLinkClicked);
        var onWindowResize = function (e) { _this.toggleSidebarVsHeader(); };
        $(window).resize(onWindowResize);
        $navContainer.find(".nav-calendar-button").click(function (event) { return _this.onCalendarClicked(event); });
        $navContainer.find(".nav-scheduler-button").click(function (event) { return _this.onSchedulerClicked(event); });
    }
    Nav.prototype.onCalendarClicked = function (event) {
        console.log("Nav calendar clicked");
        this.mainModel.switchToView(main.View.Calendar);
    };
    Nav.prototype.onSchedulerClicked = function (event) {
        console.log("Nav scheduler clicked");
        this.mainModel.switchToView(main.View.Index);
    };
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
function init($targetContainer, mainModel) {
    var $navContainer = $targetContainer.find(".nav");
    var nav = new Nav($navContainer, mainModel);
}
exports.init = init;

},{"./main":5}]},{},[5]);
