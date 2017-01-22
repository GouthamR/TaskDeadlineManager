(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/// <reference path="./moment_modified.d.ts" />
"use strict";
var DeadlineEditor = require("./deadline-editor");
var main = require("./main");
// Module-scope variables:
var mainModel;
function onDeadlineEditorSubmit(json) {
    event.preventDefault();
    mainModel.addDeadlineToServer(json);
    mainModel.switchToView(main.View.Index);
}
function init($targetContainer, mainModelParam) {
    mainModel = mainModelParam;
    var $addDeadlineContainer = $targetContainer.find(".add-deadline");
    var start = moment().startOf("hour").add(1, 'hours');
    var deadlineJSON = {
        title: "",
        startEpochMillis: start.valueOf().toString(),
        isAllDay: "false",
        subTasks: []
    };
    var $deadlineEditorTarget = $addDeadlineContainer.find(".add-deadline-editor");
    DeadlineEditor.init($deadlineEditorTarget, deadlineJSON, function (d) { return onDeadlineEditorSubmit(d); });
}
exports.init = init;

},{"./deadline-editor":4,"./main":8}],2:[function(require,module,exports){
/// <reference path="./moment_modified.d.ts" />
"use strict";
var task_editor_1 = require("./task-editor");
var main = require("./main");
function onTaskEditorSubmit(json, addTaskModel, mainModel) {
    mainModel.switchToView(main.View.Index);
    addTaskModel.addTask(json);
}
function init($targetContainer, addTaskModel, mainModel) {
    var $addTaskContainer = $targetContainer.find(".add-task");
    var start = moment().startOf("hour").add(1, 'hours');
    var end = moment().startOf("hour").add(2, 'hours');
    var taskJSON = {
        title: "",
        startEpochMillis: start.valueOf().toString(),
        endEpochMillis: end.valueOf().toString(),
        isAllDay: "false"
    };
    var $taskEditorTarget = $addTaskContainer.find(".add-task-editor");
    new task_editor_1.TaskEditor($taskEditorTarget, taskJSON, function (t) { return onTaskEditorSubmit(t, addTaskModel, mainModel); });
}
exports.init = init;

},{"./main":8,"./task-editor":10}],3:[function(require,module,exports){
/// <reference path="./fullcalendar_modified.d.ts" />
/// <reference path="./moment_modified.d.ts" />
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
// Module-level variables:
var LOADING_CLASS_NAME = "calendar-loading";
var $calendarContainer;
var mainModel;
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
var ItemEventObject = (function () {
    function ItemEventObject(title, start, allDay, item) {
        this.title = title;
        this.start = start;
        this.allDay = allDay;
        this.item = item;
    }
    ItemEventObject.prototype.updateItemToMatchEvent = function () {
        this.item.setStart(convertMomentToDate(this.start));
        this.item.setIsAllDay(isAllDay(this));
    };
    ItemEventObject.prototype.updateItemOnServer = function () {
        // do nothing. to be implemented by subclasses.
    };
    return ItemEventObject;
}());
var TaskEventObject = (function (_super) {
    __extends(TaskEventObject, _super);
    function TaskEventObject(title, start, allDay, end, task) {
        _super.call(this, title, start, allDay, task);
        this.end = end;
    }
    TaskEventObject.prototype.updateItemToMatchEvent = function () {
        _super.prototype.updateItemToMatchEvent.call(this);
        var task = this.item;
        task.setEnd(convertMomentToDate(this.end));
    };
    TaskEventObject.prototype.updateItemOnServer = function () {
        var updatedTask = this.item;
        mainModel.updateTaskOnServer(updatedTask);
    };
    return TaskEventObject;
}(ItemEventObject));
var DeadlineEventObject = (function (_super) {
    __extends(DeadlineEventObject, _super);
    function DeadlineEventObject(title, start, allDay, deadline) {
        _super.call(this, title, start, allDay, deadline);
        this.color = "green";
    }
    DeadlineEventObject.prototype.updateItemOnServer = function () {
        var updatedDeadline = this.item;
        mainModel.updateDeadlineOnServer(updatedDeadline);
    };
    return DeadlineEventObject;
}(ItemEventObject));
var SubTaskEventObject = (function (_super) {
    __extends(SubTaskEventObject, _super);
    function SubTaskEventObject(title, start, allDay, end, deadline, subTask) {
        _super.call(this, title, start, allDay, end, subTask);
        this.deadline = deadline;
    }
    SubTaskEventObject.prototype.updateItemOnServer = function () {
        mainModel.updateDeadlineOnServer(this.deadline);
    };
    return SubTaskEventObject;
}(TaskEventObject));
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
            var event_1 = new TaskEventObject(task.getTitle(), moment(task.getStart()), task.getIsAllDay(), moment(task.getEnd()), task);
            events.push(event_1);
        }
        for (var _a = 0, deadlines_1 = deadlines; _a < deadlines_1.length; _a++) {
            var deadline = deadlines_1[_a];
            var deadlineEvent = new DeadlineEventObject(deadline.getTitle(), moment(deadline.getStart()), deadline.getIsAllDay(), deadline);
            events.push(deadlineEvent);
            for (var _b = 0, _c = deadline.getUnfinishedSubTasks(); _b < _c.length; _b++) {
                var subTask = _c[_b];
                var subTaskEvent = new SubTaskEventObject(subTask.getTitle(), moment(subTask.getStart()), subTask.getIsAllDay(), moment(subTask.getEnd()), deadline, subTask);
                events.push(subTaskEvent);
            }
        }
        callback(events);
    }
    function onFailure(error) {
        alert("Failed to load from server. Details: " + error);
        callback([]);
    }
    mainModel.loadTasksAndDeadlinesFromServer(onSuccess, onFailure);
}
function onEventChanged(event, delta, revertFunc, jsEvent, ui, view) {
    var itemEvent = event;
    console.log("Event changed: ");
    console.log(itemEvent);
    itemEvent.updateItemToMatchEvent();
    itemEvent.updateItemOnServer();
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
/// <reference path="./moment_modified.d.ts" />
"use strict";
// Module-scope variables:
var $topContainer;
var doneCallback;
var SUBTASK_FIELDSET_TEMPLATE = "";
SUBTASK_FIELDSET_TEMPLATE += "<fieldset class=\"deadline-editor-form-subtask\">";
SUBTASK_FIELDSET_TEMPLATE += " <legend>SubTask:<\/legend>";
SUBTASK_FIELDSET_TEMPLATE += " <label>";
SUBTASK_FIELDSET_TEMPLATE += "     Title";
SUBTASK_FIELDSET_TEMPLATE += "     <input type=\"text\" class=\"deadline-editor-form-subtask-title-input\" name=\"title\" autofocus=\"true\">";
SUBTASK_FIELDSET_TEMPLATE += " <\/label>";
SUBTASK_FIELDSET_TEMPLATE += " <label>";
SUBTASK_FIELDSET_TEMPLATE += "     Start";
SUBTASK_FIELDSET_TEMPLATE += "     <input type=\"date\" class=\"deadline-editor-form-subtask-start-date-input\" name=\"start-date\">";
SUBTASK_FIELDSET_TEMPLATE += " <\/label>";
SUBTASK_FIELDSET_TEMPLATE += " <input type=\"time\" class=\"deadline-editor-form-subtask-start-time-input\" name=\"start-time\">";
SUBTASK_FIELDSET_TEMPLATE += " <label>";
SUBTASK_FIELDSET_TEMPLATE += "     End";
SUBTASK_FIELDSET_TEMPLATE += "     <input type=\"date\" class=\"deadline-editor-form-subtask-end-date-input\" name=\"end-date\">";
SUBTASK_FIELDSET_TEMPLATE += " <\/label>";
SUBTASK_FIELDSET_TEMPLATE += " <input type=\"time\" class=\"deadline-editor-form-subtask-end-time-input\" name=\"end-time\">";
SUBTASK_FIELDSET_TEMPLATE += " <input type=\"button\" class=\"deadline-editor-form-subtask-remove-button\" value=\"-\">";
SUBTASK_FIELDSET_TEMPLATE += "<\/fieldset>";
function toDate(dateWithoutTime, time) {
    var fullDate = dateWithoutTime + time;
    return moment(fullDate, "YYYY-MM-DD HH:mm").toDate();
}
function toSubTaskJSONWithoutID($fieldset) {
    var TITLE_SELECTOR = ".deadline-editor-form-subtask-title-input";
    var START_DATE_WITHOUT_TIME_SELECTOR = ".deadline-editor-form-subtask-start-date-input";
    var START_TIME_SELECTOR = ".deadline-editor-form-subtask-start-time-input";
    var END_DATE_WITHOUT_TIME_SELECTOR = ".deadline-editor-form-subtask-end-date-input";
    var END_TIME_SELECTOR = ".deadline-editor-form-subtask-end-time-input";
    var title = $fieldset.find(TITLE_SELECTOR).val();
    var startDateWithoutTime = $fieldset.find(START_DATE_WITHOUT_TIME_SELECTOR).val();
    var startTime = $fieldset.find(START_TIME_SELECTOR).val();
    var startDate = toDate(startDateWithoutTime, startTime);
    var endDateWithoutTime = $fieldset.find(END_DATE_WITHOUT_TIME_SELECTOR).val();
    var endTime = $fieldset.find(END_TIME_SELECTOR).val();
    var endDate = toDate(endDateWithoutTime, endTime);
    var json = {
        title: title,
        startEpochMillis: startDate.getTime().toString(),
        endEpochMillis: endDate.getTime().toString(),
        isAllDay: "false",
        isDone: "false"
    };
    return json;
}
function getFormSubtasksJSONsWithoutID() {
    var jsons = [];
    var SUBTASK_FIELDSETS_SELECTOR = ".deadline-editor-form-subtasks .deadline-editor-form-subtask";
    var $subTaskFieldsets = $topContainer.find(SUBTASK_FIELDSETS_SELECTOR);
    $subTaskFieldsets.each(function (index, element) {
        var $currFieldset = $(element);
        var currJson = toSubTaskJSONWithoutID($currFieldset);
        jsons.push(currJson);
    });
    return jsons;
}
function getFormAsJSON() {
    var TITLE_SELECTOR = ".deadline-editor-form-deadline-title-input";
    var DATE_WITHOUT_TIME_SELECTOR = ".deadline-editor-form-deadline-start-date-input";
    var TIME_SELECTOR = ".deadline-editor-form-deadline-start-time-input";
    var title = $topContainer.find(TITLE_SELECTOR).val();
    var dateWithoutTime = $topContainer.find(DATE_WITHOUT_TIME_SELECTOR).val();
    var time = $topContainer.find(TIME_SELECTOR).val();
    var startDate = toDate(dateWithoutTime, time);
    var subTasksJsons = getFormSubtasksJSONsWithoutID();
    var json = {
        title: title,
        startEpochMillis: startDate.getTime().toString(),
        isAllDay: "false",
        subTasks: subTasksJsons
    };
    return json;
}
function toDateInputValue(dateTime) {
    var FORMAT = "YYYY-MM-DD";
    return moment(parseInt(dateTime)).format(FORMAT);
}
function toTimeInputValue(dateTime) {
    var FORMAT = "HH:mm";
    return moment(parseInt(dateTime)).format(FORMAT);
}
function addSubTaskFieldset() {
    var $newFieldSet = $($.parseHTML(SUBTASK_FIELDSET_TEMPLATE));
    var $removeButton = $newFieldSet.find(".deadline-editor-form-subtask-remove-button");
    $removeButton.click(function (event) {
        $newFieldSet.remove();
    });
    var $addButton = $topContainer.find(".deadline-editor-form-subtask-add-button");
    $addButton.before($newFieldSet);
    return $newFieldSet;
}
function setFormValues(deadlineJson) {
    $topContainer.find(".deadline-editor-form-deadline-title-input")
        .val(deadlineJson.title);
    $topContainer.find(".deadline-editor-form-deadline-start-date-input")
        .val(toDateInputValue(deadlineJson.startEpochMillis));
    $topContainer.find(".deadline-editor-form-deadline-start-time-input")
        .val(toTimeInputValue(deadlineJson.startEpochMillis));
    $topContainer.find(".deadline-editor-form-subtask").remove(); // remove subtasks from previous init, if necessary
    for (var _i = 0, _a = deadlineJson.subTasks; _i < _a.length; _i++) {
        var subTask = _a[_i];
        var $newFieldSet = addSubTaskFieldset();
        $newFieldSet.find(".deadline-editor-form-subtask-title-input")
            .val(subTask.title);
        $newFieldSet.find(".deadline-editor-form-subtask-start-date-input")
            .val(toDateInputValue(subTask.startEpochMillis));
        $newFieldSet.find(".deadline-editor-form-subtask-start-time-input")
            .val(toTimeInputValue(subTask.startEpochMillis));
        $newFieldSet.find(".deadline-editor-form-subtask-end-date-input")
            .val(toDateInputValue(subTask.endEpochMillis));
        $newFieldSet.find(".deadline-editor-form-subtask-end-time-input")
            .val(toTimeInputValue(subTask.endEpochMillis));
    }
}
function onFormSubmit(event) {
    event.preventDefault();
    var json = getFormAsJSON();
    doneCallback(json);
}
function init($targetContainer, deadlineJson, doneCallbackParam) {
    "use strict";
    $topContainer = $targetContainer.find(".deadline-editor");
    doneCallback = doneCallbackParam;
    var $editDeadlineForm = $topContainer.find(".deadline-editor-form");
    $editDeadlineForm.off(); // remove handlers from previous init, if any
    $editDeadlineForm.on("submit", function (event) { return onFormSubmit(event); });
    var $subTaskAddButton = $topContainer.find(".deadline-editor-form-subtask-add-button");
    $subTaskAddButton.off(); // remove handlers from previous init, if any
    $subTaskAddButton.click(function (event) { return addSubTaskFieldset(); });
    setFormValues(deadlineJson);
}
exports.init = init;

},{}],5:[function(require,module,exports){
/// <reference path="./moment_modified.d.ts" />
"use strict";
var item_1 = require("./item");
var task_editor_1 = require("./task-editor");
var main = require("./main");
function onTaskEditorSubmit(updatedJsonWithoutID, origTask, mainModel) {
    var updatedJson = $.extend({}, updatedJsonWithoutID, { _id: origTask.getID() });
    var updatedTask = new item_1.TaskSerializer().fromJSON(updatedJson);
    mainModel.updateTaskOnServer(updatedTask);
    mainModel.switchToView(main.View.Index);
}
function init($targetContainer, task, mainModel) {
    var $topContainer = $targetContainer.find(".edit-task");
    var taskJSON = new item_1.TaskSerializer().toJSONWithoutID(task);
    var $taskEditorTarget = $topContainer.find(".edit-task-editor");
    new task_editor_1.TaskEditor($taskEditorTarget, taskJSON, function (t) { return onTaskEditorSubmit(t, task, mainModel); });
}
exports.init = init;

},{"./item":7,"./main":8,"./task-editor":10}],6:[function(require,module,exports){
/// <reference path="./moment_modified.d.ts" />
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var main = require("./main");
var ItemLi = (function () {
    function ItemLi(item, $targetUl, removeFromServer, updateOnServer) {
        this.item = item;
        this.$li = $("<li>");
        this.removeFromServer = removeFromServer;
        this.updateOnServer = updateOnServer;
        this.fillLiForNormalMode();
        $targetUl.append(this.$li);
    }
    ItemLi.prototype.getItem = function () { return this.item; };
    ItemLi.prototype.onMarkDoneClicked = function (event) {
        console.log(this.item.getTitle() + " removed");
        this.removeFromServer();
        this.animateOutOfView();
    };
    ItemLi.prototype.animateOutOfView = function () {
        this.$li.slideUp({ complete: function () {
                this.$li.remove();
            } });
    };
    ItemLi.prototype.onEditTitleClicked = function (event) {
        this.fillLiForTitleEditMode();
    };
    ItemLi.prototype.onCloseTitleEditClicked = function (event) {
        event.preventDefault(); // prevents form submission
        var $titleInput = this.$li.find("input[type='text']");
        this.item.setTitle($titleInput.val());
        console.log(this.item);
        this.fillLiForNormalMode();
        this.updateOnServer();
    };
    ItemLi.prototype.fillLiForTitleEditMode = function () {
        var _this = this;
        this.$li.empty();
        var $form = $("<form>");
        var $titleInput = $("<input>", { type: "text", value: this.item.getTitle() });
        $form.append($titleInput);
        var doneButton = $("<input>", { type: "submit", value: "Done" });
        doneButton.click(function (e) { return _this.onCloseTitleEditClicked(e); });
        $form.append(doneButton);
        this.$li.append($form);
    };
    ItemLi.prototype.fillLiForNormalMode = function () {
        var _this = this;
        this.$li.empty();
        var middle = $("<div>", { class: "item-middle" });
        var title = $("<p>", { class: "item-title" }).html(this.item.getTitle());
        var dayTime = $("<p>").html(this.item.getDayTimeString());
        middle.append(title, dayTime);
        var check = $("<img>", { class: "td-check", src: "img/check.png" });
        var settings = $("<img>", { class: "td-settings", src: "img/gear.png" });
        check.click(function (e) { return _this.onMarkDoneClicked(e); });
        title.click(function (e) { return _this.onEditTitleClicked(e); });
        settings.click(function (e) { return _this.onOpenSettingsClicked(e); });
        this.$li.append(check, middle, settings);
    };
    return ItemLi;
}());
var TaskLi = (function (_super) {
    __extends(TaskLi, _super);
    function TaskLi(task, $targetUl, indexModel, mainModel) {
        _super.call(this, task, $targetUl, function () { return indexModel.removeTaskFromServer(task); }, function () { return mainModel.updateTaskOnServer(task); });
        this.indexModel = indexModel;
        this.mainModel = mainModel;
    }
    // Override
    TaskLi.prototype.onOpenSettingsClicked = function (event) {
        this.indexModel.initEditTask(this.getItem());
        this.mainModel.switchToView(main.View.EditTask);
    };
    return TaskLi;
}(ItemLi));
var SubTaskLi = (function (_super) {
    __extends(SubTaskLi, _super);
    function SubTaskLi(subTask, $targetUl, deadline, mainModel, indexModel, animateOutDeadlineLi) {
        var _this = this;
        _super.call(this, subTask, $targetUl, function () { return _this.removeSubTaskFromServer(mainModel); }, function () { return mainModel.updateDeadlineOnServer(deadline); });
        this.deadline = deadline;
        this.animateOutDeadlineLi = animateOutDeadlineLi;
        this.removeDeadlineFromServer = function () { return indexModel.removeDeadlineFromServer(deadline); };
    }
    SubTaskLi.prototype.removeSubTaskFromServer = function (mainModel) {
        var subTask = this.getItem();
        subTask.markAsDone();
        mainModel.updateDeadlineOnServer(this.deadline);
        if (this.deadline.isDone()) {
            this.removeDeadlineFromServer();
        }
    };
    // Override
    SubTaskLi.prototype.onMarkDoneClicked = function (event) {
        _super.prototype.onMarkDoneClicked.call(this, event); // calls removeSubTaskFromServer
        if (this.deadline.isDone()) {
            this.animateOutDeadlineLi();
        }
    };
    // Override
    SubTaskLi.prototype.onOpenSettingsClicked = function (event) {
        console.log("subtask open settings clicked");
    };
    return SubTaskLi;
}(ItemLi));
var DeadlineLi = (function (_super) {
    __extends(DeadlineLi, _super);
    function DeadlineLi(deadline, $targetUl, mainModel, indexModel, animateOutSubtaskLis) {
        _super.call(this, deadline, $targetUl, function () { return indexModel.removeDeadlineFromServer(deadline); }, function () { return mainModel.updateDeadlineOnServer(deadline); });
        this.animateOutSubtaskLis = animateOutSubtaskLis;
    }
    // Override
    DeadlineLi.prototype.onMarkDoneClicked = function (event) {
        _super.prototype.onMarkDoneClicked.call(this, event); // calls removeDeadlineFromServer
        this.animateOutSubtaskLis();
    };
    // Override
    DeadlineLi.prototype.onOpenSettingsClicked = function (event) {
        console.log("deadline open settings clicked");
    };
    return DeadlineLi;
}(ItemLi));
var DeadlineAndSubTaskLiManager = (function () {
    function DeadlineAndSubTaskLiManager(deadline, $targetDeadlineUl, $targetSubTaskUl, mainModel, indexModel) {
        var _this = this;
        this.deadlineLi = new DeadlineLi(deadline, $targetDeadlineUl, mainModel, indexModel, function () { return _this.animateOutSubtaskLis(); });
        this.subTaskLis = [];
        for (var _i = 0, _a = deadline.getUnfinishedSubTasks(); _i < _a.length; _i++) {
            var subTask = _a[_i];
            if (subTask.occursToday()) {
                var subTaskLi = new SubTaskLi(subTask, $targetSubTaskUl, deadline, mainModel, indexModel, function () { return _this.animateOutDeadlineLi(); });
                this.subTaskLis.push(subTaskLi);
            }
        }
    }
    DeadlineAndSubTaskLiManager.prototype.animateOutSubtaskLis = function () {
        for (var _i = 0, _a = this.subTaskLis; _i < _a.length; _i++) {
            var subTaskLi = _a[_i];
            subTaskLi.animateOutOfView();
        }
    };
    DeadlineAndSubTaskLiManager.prototype.animateOutDeadlineLi = function () {
        this.deadlineLi.animateOutOfView();
    };
    return DeadlineAndSubTaskLiManager;
}());
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
        var $helloHeading = this.$indexContainer.find(".index-name-heading");
        $helloHeading.html("Hello, " + this.mainModel.getUserName());
    }
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
    View.prototype.removeTaskViewLoadingText = function () {
        var $taskContainer = this.$indexContainer.find(".index-task-container");
        this.removeLoadingText($taskContainer);
    };
    View.prototype.removeDeadlineViewLoadingText = function () {
        var $deadlineContainer = this.$indexContainer.find(".index-deadline-container");
        this.removeLoadingText($deadlineContainer);
    };
    // Note: appends error after any existing errors.
    View.prototype.showLoadError = function (errorMessage) {
        console.log("loadError!");
        this.removeTaskViewLoadingText();
        this.removeDeadlineViewLoadingText();
        var $indexErrorContainer = this.$indexContainer.find(".index-error-container");
        $indexErrorContainer.append($("<p>").html(errorMessage));
        $indexErrorContainer.removeClass("hidden");
    };
    View.prototype.loadView = function (tasks, deadlines) {
        this.clearAndShowLoading();
        var $taskUl = this.$indexContainer.find(".index-task-container ul");
        var $deadlineUl = this.$indexContainer.find(".index-deadline-container ul");
        for (var _i = 0, tasks_1 = tasks; _i < tasks_1.length; _i++) {
            var task = tasks_1[_i];
            if (task.occursToday()) {
                new TaskLi(task, $taskUl, this.indexModel, this.mainModel);
            }
        }
        for (var _a = 0, deadlines_1 = deadlines; _a < deadlines_1.length; _a++) {
            var deadline = deadlines_1[_a];
            new DeadlineAndSubTaskLiManager(deadline, $deadlineUl, $taskUl, this.mainModel, this.indexModel);
        }
        this.removeTaskViewLoadingText(); // only remove after loading deadlines because deadlines may contain subtasks
        this.removeDeadlineViewLoadingText();
    };
    View.prototype.loadDateHeading = function () {
        var $dateHeading = this.$indexContainer.find(".index-date-heading");
        $dateHeading.html(moment().format("MMMM Do, YYYY"));
    };
    View.prototype.reloadFromServer = function () {
        var _this = this;
        this.clearAndShowLoading();
        this.mainModel.loadTasksAndDeadlinesFromServer(function (t, d) { return _this.loadView(t, d); }, function (e) { return _this.showLoadError(e); });
        this.loadDateHeading(); // loads date heading on every reload in case date changes (e.g. at midnight)
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

},{"./main":8}],7:[function(require,module,exports){
/// <reference path="./moment_modified.d.ts" />
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
// Returns true if dateTime is within first millisecond of today and last
// millisecond of today, inclusive.
function dateTimeInToday(dateTime) {
    var startOfDay = moment().startOf("day");
    var endOfDay = moment().endOf("day");
    return dateTime.isBetween(startOfDay, endOfDay, null, "[]");
}
var Item = (function () {
    function Item(title, start, isAllDay, id) {
        this.title = title;
        this.start = start;
        this.isAllDay = isAllDay;
        this.id = id;
    }
    Item.prototype.getDayTimeString = function () {
        // STUB (does not hide times when all day):
        var allDayStr;
        if (this.getIsAllDay()) {
            allDayStr = '_ALL_DAY';
        }
        else {
            allDayStr = '';
        }
        var startStr = moment(this.getStart())
            .format("dddd, MMMM Do YYYY, h:mm:ss a");
        return startStr + allDayStr;
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
    Item.prototype.occursToday = function () {
        var itemStart = moment(this.getStart());
        return dateTimeInToday(itemStart); // inclusive of 12:00am, to be compatible with all-day events.
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
        // STUB (does not hide times when all day):
        var allDayStr;
        if (this.getIsAllDay()) {
            allDayStr = '_ALL_DAY';
        }
        else {
            allDayStr = '';
        }
        var DATETIME_FORMAT = "dddd, MMMM Do YYYY, h:mm:ss a";
        var startStr = moment(this.getStart()).format(DATETIME_FORMAT);
        var endStr = moment(this.getEnd()).format(DATETIME_FORMAT);
        return startStr + " - " + endStr + allDayStr;
    };
    Task.prototype.occursToday = function () {
        var taskEnd = moment(this.getEnd());
        return (dateTimeInToday(taskEnd) || _super.prototype.occursToday.call(this));
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
    TaskSerializer.prototype.toJSONWithoutID = function (obj) {
        var objWithoutId = this.toJSON(obj);
        delete objWithoutId._id;
        var jsonWithoutId = objWithoutId;
        return jsonWithoutId;
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
    SubTask.prototype.markAsDone = function () {
        this.isDone = true;
    };
    return SubTask;
}(Task));
exports.SubTask = SubTask;
function convertSubTaskToWithoutIds(json) {
    var objWithoutId = $.extend({}, json);
    delete objWithoutId._id;
    delete objWithoutId.deadlineId;
    var subTaskJsonWithoutId = objWithoutId;
    return subTaskJsonWithoutId;
}
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
    SubTaskSerializer.prototype.toJSONWithoutID = function (obj) {
        var objWithId = this.toJSON(obj);
        var objWithoutId = convertSubTaskToWithoutIds(objWithId);
        return objWithoutId;
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
    Deadline.prototype.isDone = function () {
        for (var _i = 0, _a = this.getSubTasks(); _i < _a.length; _i++) {
            var currSubTask = _a[_i];
            if (!currSubTask.getIsDone()) {
                return false;
            }
        }
        return true;
    };
    Deadline.prototype.getUnfinishedSubTasks = function () {
        var unfinished = [];
        for (var _i = 0, _a = this.getSubTasks(); _i < _a.length; _i++) {
            var subTask = _a[_i];
            if (!subTask.getIsDone()) {
                unfinished.push(subTask);
            }
        }
        return unfinished;
    };
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
    DeadlineSerializer.prototype.toJSONWithoutID = function (obj) {
        var objWithoutId = $.extend({}, this.toJSON(obj));
        delete objWithoutId._id;
        for (var i = 0; i < objWithoutId.subTasks.length; i++) {
            var subTaskWithId = objWithoutId.subTasks[i];
            objWithoutId.subTasks[i] = convertSubTaskToWithoutIds(subTaskWithId);
        }
        var jsonWithoutId = objWithoutId;
        return jsonWithoutId;
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

},{}],8:[function(require,module,exports){
"use strict";
var AddTask = require("./add-task");
var EditTask = require("./edit-task");
var AddDeadline = require("./add-deadline");
var index = require("./index");
var nav = require("./nav");
var calendar = require("./calendar");
var item_1 = require("./item");
var item_2 = require("./item");
(function (View) {
    View[View["Index"] = 0] = "Index";
    View[View["AddTask"] = 1] = "AddTask";
    View[View["EditTask"] = 2] = "EditTask";
    View[View["AddDeadline"] = 3] = "AddDeadline";
    View[View["Calendar"] = 4] = "Calendar";
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
            ".main-edit-task": View.EditTask,
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
    MainModel.prototype.addDeadlineToServer = function (json) {
        $.post("add-deadline", json)
            .done(function (data, textStatus, jqXHR) {
            console.log("Add Deadline success:");
            console.log(data);
            index.reloadFromServer();
        })
            .fail(function (jqXHR, textStatus, error) {
            var errorDetails = textStatus + ", " + error;
            alert("ERROR: Add Deadline failed.\nDetails: " + errorDetails);
            console.log(errorDetails);
        });
    };
    MainModel.prototype.updateDeadlineOnServer = function (updatedDeadline) {
        var updatedJSON = new item_2.DeadlineSerializer().toJSON(updatedDeadline);
        $.post("update-deadline", updatedJSON)
            .done(function (data, textStatus, jqXHR) {
            console.log("Update Deadline success:");
            console.log(data);
            calendar.reloadCalendar();
        })
            .fail(function (jqXHR, textStatus, error) {
            var errorDetails = textStatus + ", " + error;
            alert("ERROR: Update Deadline failed.\nDetails: " + errorDetails);
            console.log(errorDetails);
        });
    };
    MainModel.prototype.getUserName = function () {
        return "Goutham";
    };
    return MainModel;
}());
exports.MainModel = MainModel;
var IndexModel = (function () {
    function IndexModel() {
    }
    IndexModel.prototype.removeDeadlineFromServer = function (deadlineToRemove) {
        var json = new item_2.DeadlineSerializer().toJSON(deadlineToRemove);
        $.post("delete-deadline", json)
            .done(function (data, textStatus, jqXHR) {
            console.log("Remove Deadline success:");
            console.log(data);
        })
            .fail(function (jqXHR, textStatus, error) {
            var errorDetails = textStatus + ", " + error;
            alert("ERROR: Remove Deadline failed.\nDetails: " + errorDetails);
            console.log(errorDetails);
        });
    };
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
    IndexModel.prototype.initEditTask = function (task) {
        EditTask.init($(".main-edit-task"), task, mainModel);
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

},{"./add-deadline":1,"./add-task":2,"./calendar":3,"./edit-task":5,"./index":6,"./item":7,"./nav":9}],9:[function(require,module,exports){
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

},{"./main":8}],10:[function(require,module,exports){
/// <reference path="./moment_modified.d.ts" />
"use strict";
var TaskEditor = (function () {
    function TaskEditor($targetContainer, taskJSON, doneCallback) {
        var _this = this;
        this.$topContainer = $targetContainer.find(".task-editor");
        this.setFormValues(taskJSON);
        var form = this.$topContainer.find(".task-editor-form");
        form.off(); // remove event handlers from previous TaskEditor, if any
        form.on("submit", function (event) { return _this.onFormSubmit(event, doneCallback); });
    }
    TaskEditor.prototype.setFormValues = function (taskJSON) {
        this.$topContainer.find(".task-editor-form-title-input").val(taskJSON.title);
        this.$topContainer.find(".task-editor-form-start-date-input")
            .val(this.toDateInputValue(taskJSON.startEpochMillis));
        this.$topContainer.find(".task-editor-form-end-date-input")
            .val(this.toDateInputValue(taskJSON.endEpochMillis));
        this.$topContainer.find(".task-editor-form-start-time-input")
            .val(this.toTimeInputValue(taskJSON.startEpochMillis));
        this.$topContainer.find(".task-editor-form-end-time-input")
            .val(this.toTimeInputValue(taskJSON.endEpochMillis));
    };
    TaskEditor.prototype.toDateInputValue = function (dateTime) {
        var FORMAT = "YYYY-MM-DD";
        return moment(parseInt(dateTime)).format(FORMAT);
    };
    TaskEditor.prototype.toTimeInputValue = function (dateTime) {
        var FORMAT = "HH:mm";
        return moment(parseInt(dateTime)).format(FORMAT);
    };
    TaskEditor.prototype.onFormSubmit = function (event, doneCallback) {
        event.preventDefault();
        doneCallback(this.getFormAsJSON());
    };
    TaskEditor.prototype.getFormAsJSON = function () {
        var formArray = this.$topContainer.find(".task-editor-form").serializeArray();
        var title = formArray[0].value;
        var startDate = this.toDate(formArray[1].value, formArray[2].value);
        var endDate = this.toDate(formArray[3].value, formArray[4].value);
        var json = {
            title: title,
            startEpochMillis: startDate.getTime().toString(),
            endEpochMillis: endDate.getTime().toString(),
            isAllDay: "false"
        };
        return json;
    };
    TaskEditor.prototype.toDate = function (dateWithoutTime, time) {
        var fullDate = dateWithoutTime + time;
        return moment(fullDate, "YYYY-MM-DD HH:mm").toDate();
    };
    return TaskEditor;
}());
exports.TaskEditor = TaskEditor;

},{}]},{},[8]);
