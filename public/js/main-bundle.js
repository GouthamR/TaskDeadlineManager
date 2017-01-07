(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/// <reference path="./moment_modified.d.ts" />
"use strict";
var main = require("./main");
// Module-scope variables:
var $addDeadlineContainer;
var mainModel;
function toDate(dateWithoutTime, time) {
    var fullDate = dateWithoutTime + time;
    return moment(fullDate, "YYYY-MM-DD HH:mm").toDate();
}
function toSubTaskJSONWithoutID(formArray, arrayStartIndex) {
    var title = formArray[arrayStartIndex].value;
    var startDate = toDate(formArray[arrayStartIndex + 1].value, formArray[arrayStartIndex + 2].value);
    var endDate = toDate(formArray[arrayStartIndex + 3].value, formArray[arrayStartIndex + 4].value);
    var json = {
        title: title,
        startEpochMillis: startDate.getTime().toString(),
        endEpochMillis: endDate.getTime().toString(),
        isAllDay: "false",
        isDone: "false"
    };
    return json;
}
function toDeadlineJSONWithoutID(formArray) {
    // STUB (only considers one subtask):
    var title = formArray[0].value;
    var startDate = toDate(formArray[1].value, formArray[2].value);
    var subTask1Json = toSubTaskJSONWithoutID(formArray, 3);
    var json = {
        title: title,
        startEpochMillis: startDate.getTime().toString(),
        isAllDay: "false",
        subTasks: [
            subTask1Json
        ]
    };
    return json;
}
function getFormAsJSON() {
    var formArray = $addDeadlineContainer.find(".add-deadline-form").serializeArray();
    console.log(formArray);
    return toDeadlineJSONWithoutID(formArray);
}
function setDefaultDateTimeInputValues() {
    var dateInputs = $addDeadlineContainer.find(".add-deadline-form input[type='date']").toArray();
    for (var _i = 0, dateInputs_1 = dateInputs; _i < dateInputs_1.length; _i++) {
        var dateInput = dateInputs_1[_i];
        $(dateInput).val(moment().format("YYYY-MM-DD"));
    }
    var $startTimeInput = $addDeadlineContainer.find(".add-deadline-form-deadline-start-time-input");
    $startTimeInput.val(moment().startOf("hour").add(1, 'hours').format("HH:mm"));
}
function onAddDeadlineSubmit(event) {
    event.preventDefault();
    mainModel.switchToView(main.View.Index);
    var json = getFormAsJSON();
    mainModel.addDeadlineToServer(json);
}
function init($targetContainer, mainModelParam) {
    "use strict";
    $addDeadlineContainer = $targetContainer.find(".add-deadline");
    mainModel = mainModelParam;
    var $addDeadlineForm = $addDeadlineContainer.find(".add-deadline-form");
    $addDeadlineForm.on("submit", function (event) { return onAddDeadlineSubmit(event); });
    setDefaultDateTimeInputValues();
}
exports.init = init;

},{"./main":6}],2:[function(require,module,exports){
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

},{"./main":6}],3:[function(require,module,exports){
/// <reference path="./fullcalendar_modified.d.ts" />
/// <reference path="./moment_modified.d.ts" />
"use strict";
// Module-level variables:
var LOADING_CLASS_NAME = "calendar-loading";
var $calendarContainer;
var mainModel;
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
    mainModel.loadTasksAndDeadlinesFromServer(onSuccess, onFailure);
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
        mainModel.updateTaskOnServer(updatedTask);
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
function init($targetContainer, mainModelParam) {
    $calendarContainer = $targetContainer.find(".calendar");
    mainModel = mainModelParam;
    clearAndShowLoading();
    initFullCalendar();
}
exports.init = init;

},{}],4:[function(require,module,exports){
"use strict";
var main = require("./main");
var View = (function () {
    function View($targetContainer, indexModel, mainModel) {
        var _this = this;
        this.$indexContainer = $targetContainer.find(".index");
        this.indexModel = indexModel;
        this.mainModel = mainModel;
        var $addTaskButton = this.$indexContainer.find(".index-task-container > a");
        $addTaskButton.click(function (event) { return _this.mainModel.switchToView(main.View.AddTask); });
        var $addDeadlineButton = this.$indexContainer.find(".index-deadline-container > a");
        $addDeadlineButton.click(function (event) { return _this.mainModel.switchToView(main.View.AddDeadline); });
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
        settings.click(this.onOpenSettingsClicked.bind(this, item, li));
        li.append(check, middle, settings);
    };
    View.prototype.onOpenSettingsClicked = function (item, li) {
        var _this = this;
        li.empty();
        var $form = $("<form>");
        var $titleInput = $("<input>", { type: "text", value: item.getTitle() });
        $form.append($titleInput);
        var doneButton = $("<input>", { type: "submit", value: "Done" });
        doneButton.click(function (e) { return _this.onCloseSettingsClicked(e, li, item); });
        $form.append(doneButton);
        li.append($form);
    };
    View.prototype.onCloseSettingsClicked = function (event, li, item) {
        // STUB (does not update deadlines correctly):
        event.preventDefault(); // prevents form submission
        var $titleInput = li.find("input[type='text']");
        item.setTitle($titleInput.val());
        console.log(item);
        li.empty();
        this.fillLi(li, item);
        this.mainModel.updateTaskOnServer(item);
    };
    View.prototype.createLi = function (item) {
        var li = $("<li>");
        this.fillLi(li, item);
        return li;
    };
    View.prototype.addItemToContainer = function (item, $container) {
        var $newLi = this.createLi(item);
        var $list = $container.find("ul");
        $list.append($newLi);
    };
    View.prototype.addTaskToView = function (task) {
        var $taskContainer = this.$indexContainer.find(".index-task-container");
        this.addItemToContainer(task, $taskContainer);
    };
    View.prototype.clearAndShowLoadingOnContainer = function ($container) {
        var $ul = $container.find("ul");
        $ul.empty();
        var $loading = $("<p>", { class: "index-loading" }).html("Loading...");
        $ul.append($loading);
    };
    View.prototype.clearAndShowLoadingTasks = function () {
        var $taskContainer = this.$indexContainer.find(".index-task-container");
        this.clearAndShowLoadingOnContainer($taskContainer);
    };
    View.prototype.clearAndShowLoadingDeadlines = function () {
        var $deadlineContainer = this.$indexContainer.find(".index-deadline-container");
        this.clearAndShowLoadingOnContainer($deadlineContainer);
    };
    View.prototype.clearAndShowLoading = function () {
        console.log("clearViewAndShowLoading");
        this.clearAndShowLoadingTasks();
        this.clearAndShowLoadingDeadlines();
    };
    View.prototype.removeLoadingText = function ($container) {
        $container.find(".index-loading").remove();
    };
    View.prototype.removeTaskLoadingText = function () {
        var $taskContainer = this.$indexContainer.find(".index-task-container");
        this.removeLoadingText($taskContainer);
    };
    View.prototype.removeDeadlineLoadingText = function () {
        var $deadlineContainer = this.$indexContainer.find(".index-deadline-container");
        this.removeLoadingText($deadlineContainer);
    };
    // Note: appends error after any existing errors.
    View.prototype.showLoadError = function (errorMessage) {
        console.log("loadError!");
        this.removeTaskLoadingText();
        this.removeDeadlineLoadingText();
        var $indexErrorContainer = this.$indexContainer.find(".index-error-container");
        $indexErrorContainer.append($("<p>").html(errorMessage));
        $indexErrorContainer.removeClass("hidden");
    };
    View.prototype.loadView = function (tasks, deadlines) {
        this.clearAndShowLoading();
        for (var i = 0; i < tasks.length; i++) {
            this.addTaskToView(tasks[i]);
        }
        this.removeTaskLoadingText();
        // STUB (does not add deadlines to view):
        this.removeDeadlineLoadingText();
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

},{"./main":6}],5:[function(require,module,exports){
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
var SubTask = (function (_super) {
    __extends(SubTask, _super);
    function SubTask(title, start, end, isAllDay, id, deadlineId, isDone) {
        if (isDone === void 0) { isDone = false; }
        _super.call(this, title, start, end, isAllDay, id);
        this.deadlineId = deadlineId;
        this.isDone = isDone;
    }
    SubTask.prototype.getDeadlineID = function () { return this.deadlineId; };
    SubTask.prototype.getIsDone = function () { return this.isDone; };
    SubTask.prototype.getDayTimeString = function () {
        var begin = _super.prototype.getDayTimeString.call(this);
        var end = "[" + this.deadlineId + "]";
        return (begin + end);
    };
    return SubTask;
}(Task));
exports.SubTask = SubTask;
var SubTaskSerializer = (function () {
    function SubTaskSerializer() {
    }
    SubTaskSerializer.prototype.toJSON = function (obj) {
        var json = {
            title: obj.getTitle(),
            startEpochMillis: obj.getStart().getTime().toString(),
            endEpochMillis: obj.getEnd().getTime().toString(),
            isAllDay: obj.getIsAllDay().toString(),
            deadlineId: obj.getDeadlineID(),
            isDone: obj.getIsDone().toString(),
            _id: obj.getID()
        };
        return json;
    };
    SubTaskSerializer.prototype.fromJSON = function (json) {
        return new SubTask(json.title, new Date(parseInt(json.startEpochMillis)), new Date(parseInt(json.endEpochMillis)), json.isAllDay == "true", json._id, json.deadlineId, json.isDone == "true");
    };
    return SubTaskSerializer;
}());
exports.SubTaskSerializer = SubTaskSerializer;
var Deadline = (function (_super) {
    __extends(Deadline, _super);
    function Deadline(title, start, isAllDay, id, subTasks) {
        _super.call(this, title, start, isAllDay, id);
        this.subTasks = subTasks;
    }
    Deadline.prototype.getSubTasks = function () { return this.subTasks; };
    return Deadline;
}(Item));
exports.Deadline = Deadline;
var DeadlineSerializer = (function () {
    function DeadlineSerializer() {
    }
    DeadlineSerializer.prototype.toJSON = function (obj) {
        var subTasksJsons = [];
        var subTaskSerializer = new SubTaskSerializer();
        for (var _i = 0, _a = obj.getSubTasks(); _i < _a.length; _i++) {
            var currSubTask = _a[_i];
            var currSubTaskJson = subTaskSerializer.toJSON(currSubTask);
            subTasksJsons.push(currSubTaskJson);
        }
        var json = {
            title: obj.getTitle(),
            startEpochMillis: obj.getStart().getTime().toString(),
            isAllDay: obj.getIsAllDay().toString(),
            _id: obj.getID(),
            subTasks: subTasksJsons
        };
        return json;
    };
    DeadlineSerializer.prototype.fromJSON = function (json) {
        var subTasks = [];
        var subTaskSerializer = new SubTaskSerializer();
        for (var _i = 0, _a = json.subTasks; _i < _a.length; _i++) {
            var currSubTaskJson = _a[_i];
            var currSubTask = subTaskSerializer.fromJSON(currSubTaskJson);
            subTasks.push(currSubTask);
        }
        return new Deadline(json.title, new Date(parseInt(json.startEpochMillis)), json.isAllDay == "true", json._id, subTasks);
    };
    return DeadlineSerializer;
}());
exports.DeadlineSerializer = DeadlineSerializer;

},{}],6:[function(require,module,exports){
"use strict";
var AddTask = require("./add-task");
var AddDeadline = require("./add-deadline");
var index = require("./index");
var nav = require("./nav");
var calendar = require("./calendar");
var item_1 = require("./item");
var item_2 = require("./item");
(function (View) {
    View[View["Index"] = 0] = "Index";
    View[View["AddTask"] = 1] = "AddTask";
    View[View["AddDeadline"] = 2] = "AddDeadline";
    View[View["Calendar"] = 3] = "Calendar";
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
            ".main-add-deadline": View.AddDeadline,
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
    MainModel.prototype.updateTaskOnServer = function (updatedTask) {
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
    };
    MainModel.prototype.addDeadlineToServer = function (deadline) {
        // STUB:
        console.log("addDeadlineToServer:");
        console.log(deadline);
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
// Module-scope variables:
var mainModel;
var indexModel;
var addTaskModel;
function main() {
    mainModel = new MainModel();
    indexModel = new IndexModel();
    addTaskModel = new AddTaskModel();
    AddTask.init($(".main-add-task"), addTaskModel, mainModel);
    AddDeadline.init($(".main-add-deadline"), mainModel);
    index.init($(".main-index"), indexModel, mainModel);
    nav.init($(".main-nav"), mainModel);
    calendar.init($(".main-calendar"), mainModel);
    index.reloadFromServer();
    mainModel.switchToView(View.Index);
}
$(document).ready(main);

},{"./add-deadline":1,"./add-task":2,"./calendar":3,"./index":4,"./item":5,"./nav":7}],7:[function(require,module,exports){
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

},{"./main":6}]},{},[6]);
