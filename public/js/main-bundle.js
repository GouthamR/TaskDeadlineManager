(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/// <reference path="./moment_modified.d.ts" />
"use strict";
var DeadlineEditor = require("./deadline-editor");
// Module-scope variables:
var mainModel;
function onDeadlineEditorSubmit(json) {
    event.preventDefault();
    mainModel.addDeadlineToServer(json);
    mainModel.switchToIndexView();
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

},{"./deadline-editor":5}],2:[function(require,module,exports){
/// <reference path="./moment_modified.d.ts" />
"use strict";
var task_editor_1 = require("./task-editor");
function onTaskEditorSubmit(json, addTaskModel, mainModel) {
    mainModel.switchToIndexView();
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

},{"./task-editor":12}],3:[function(require,module,exports){
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
    ItemEventObject.prototype.switchToEditView = function () {
        // do nothing. to be implemented by subclasses.
    };
    return ItemEventObject;
}());
var TaskEventObject = (function (_super) {
    __extends(TaskEventObject, _super);
    function TaskEventObject(title, start, allDay, end, task) {
        var _this = _super.call(this, title, start, allDay, task) || this;
        _this.end = end;
        return _this;
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
    TaskEventObject.prototype.switchToEditView = function () {
        mainModel.switchToEditTaskView(this.item.getID());
    };
    return TaskEventObject;
}(ItemEventObject));
var DeadlineEventObject = (function (_super) {
    __extends(DeadlineEventObject, _super);
    function DeadlineEventObject(title, start, allDay, deadline) {
        var _this = _super.call(this, title, start, allDay, deadline) || this;
        _this.color = "green";
        return _this;
    }
    DeadlineEventObject.prototype.updateItemOnServer = function () {
        var updatedDeadline = this.item;
        mainModel.updateDeadlineOnServer(updatedDeadline);
    };
    DeadlineEventObject.prototype.switchToEditView = function () {
        mainModel.switchToEditDeadlineView(this.item.getID());
    };
    return DeadlineEventObject;
}(ItemEventObject));
var SubTaskEventObject = (function (_super) {
    __extends(SubTaskEventObject, _super);
    function SubTaskEventObject(title, start, allDay, end, deadline, subTask) {
        var _this = _super.call(this, title, start, allDay, end, subTask) || this;
        _this.deadline = deadline;
        return _this;
    }
    SubTaskEventObject.prototype.updateItemOnServer = function () {
        mainModel.updateDeadlineOnServer(this.deadline);
    };
    SubTaskEventObject.prototype.switchToEditView = function () {
        mainModel.switchToEditDeadlineView(this.deadline.getID());
    };
    return SubTaskEventObject;
}(TaskEventObject));
function clearAndShowLoading() {
    // STUB (does not clear):
    var $fullCalendarDiv = $calendarContainer.find(".calendar-fullcalendar");
    var $loading = $("<p>", { "class": LOADING_CLASS_NAME }).html("Loading...");
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
        alert("Error: failed to load tasks and deadlines. Try refreshing the page.");
        callback([]);
    }
    mainModel.loadTasksAndDeadlinesFromServer(onSuccess, onFailure);
}
function onEventChanged(event, delta, revertFunc, jsEvent, ui, view) {
    var itemEvent = event;
    itemEvent.updateItemToMatchEvent();
    itemEvent.updateItemOnServer();
}
function onEventClicked(event, jsEvent, view) {
    var itemEvent = event;
    itemEvent.switchToEditView();
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
        eventClick: onEventClicked,
        forceEventDuration: true,
        defaultTimedEventDuration: '01:00:00',
        defaultAllDayEventDuration: { days: 1 }
    });
    removeLoading();
}
function reloadCalendar() {
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
/**
 * init takes a set of start and end date and time input fields as arguments.
 * This module synchronizes the start and end input fields, as follows:
 * When the start date is changed, updates the end date to maintain the same
 * date duration. Also does the same for the start time and end time.
 */
var DATE_FORMAT = "YYYY-MM-DD";
var TIME_FORMAT = "HH:mm";
var DateTimeGroupSynchronizer = (function () {
    function DateTimeGroupSynchronizer($startDateInput, $endDateInput, $startTimeInput, $endTimeInput) {
        var _this = this;
        this.$startDateInput = $startDateInput;
        this.$endDateInput = $endDateInput;
        this.$startTimeInput = $startTimeInput;
        this.$endTimeInput = $endTimeInput;
        this.previousStartDate = this.dateInputToMoment(this.$startDateInput);
        this.previousStartTime = this.timeInputToMoment(this.$startTimeInput);
        // Removes event handlers from previous DateTimeGroupSynchronizer, if any,
        // before attaching new handlers:
        this.$startDateInput.off();
        this.$startTimeInput.off();
        this.$startDateInput.change(function (e) { return _this.updateEndDate(); });
        this.$startTimeInput.change(function (e) { return _this.updateEndTime(); });
    }
    DateTimeGroupSynchronizer.prototype.dateInputToMoment = function ($dateInput) {
        var dateString = $dateInput.val();
        return moment(dateString, DATE_FORMAT);
    };
    DateTimeGroupSynchronizer.prototype.timeInputToMoment = function ($timeInput) {
        var timeString = $timeInput.val();
        return moment(timeString, TIME_FORMAT);
    };
    DateTimeGroupSynchronizer.prototype.setDateInputToMoment = function ($dateInput, dateValue) {
        $dateInput.val(dateValue.format(DATE_FORMAT));
    };
    DateTimeGroupSynchronizer.prototype.setTimeInputToMoment = function ($timeInput, timeValue) {
        $timeInput.val(timeValue.format(TIME_FORMAT));
    };
    DateTimeGroupSynchronizer.prototype.updateEndDate = function () {
        var newStartDate = this.dateInputToMoment(this.$startDateInput);
        var startDateDaysIncrement = newStartDate.diff(this.previousStartDate, "days");
        var newEndDate = this.dateInputToMoment(this.$endDateInput)
            .add(startDateDaysIncrement, "days");
        this.setDateInputToMoment(this.$endDateInput, newEndDate);
        this.previousStartDate = newStartDate;
    };
    DateTimeGroupSynchronizer.prototype.updateEndTime = function () {
        var newStartTime = this.timeInputToMoment(this.$startTimeInput);
        var startTimeMillisIncrement = newStartTime.diff(this.previousStartTime);
        var newEndTime = this.timeInputToMoment(this.$endTimeInput)
            .add(startTimeMillisIncrement, "milliseconds");
        this.setTimeInputToMoment(this.$endTimeInput, newEndTime);
        this.previousStartTime = newStartTime;
    };
    return DateTimeGroupSynchronizer;
}());
function init($startDateInput, $endDateInput, $startTimeInput, $endTimeInput) {
    new DateTimeGroupSynchronizer($startDateInput, $endDateInput, $startTimeInput, $endTimeInput);
}
exports.init = init;

},{}],5:[function(require,module,exports){
/// <reference path="./moment_modified.d.ts" />
"use strict";
var DateTimeGroupSynchronizer = require("./date-time-group-synchronizer");
// Module-scope variables:
var $topContainer;
var doneCallback;
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
    var IS_DONE_SELECTOR = ".deadline-editor-form-subtask-done-input";
    var title = $fieldset.find(TITLE_SELECTOR).val();
    var startDateWithoutTime = $fieldset.find(START_DATE_WITHOUT_TIME_SELECTOR).val();
    var startTime = $fieldset.find(START_TIME_SELECTOR).val();
    var startDate = toDate(startDateWithoutTime, startTime);
    var endDateWithoutTime = $fieldset.find(END_DATE_WITHOUT_TIME_SELECTOR).val();
    var endTime = $fieldset.find(END_TIME_SELECTOR).val();
    var endDate = toDate(endDateWithoutTime, endTime);
    var isDone = $fieldset.find(IS_DONE_SELECTOR).is(":checked");
    var json = {
        title: title,
        startEpochMillis: startDate.getTime().toString(),
        endEpochMillis: endDate.getTime().toString(),
        isAllDay: "false",
        isDone: isDone.toString()
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
function addSubTaskFieldset(subTask) {
    var templateContext = {
        title: subTask.title,
        startDate: toDateInputValue(subTask.startEpochMillis),
        startTime: toTimeInputValue(subTask.startEpochMillis),
        endDate: toDateInputValue(subTask.endEpochMillis),
        endTime: toTimeInputValue(subTask.endEpochMillis),
        isDone: subTask.isDone == "true"
    };
    var subTaskFieldSetHTML = Handlebars.templates['deadline-editor-subtask-template'](templateContext);
    var $newFieldSet = $($.parseHTML(subTaskFieldSetHTML));
    var $removeButton = $newFieldSet.find(".deadline-editor-form-subtask-remove-button");
    $removeButton.click(function (event) {
        $newFieldSet.remove();
    });
    var $startDateInput = $newFieldSet.find(".deadline-editor-form-subtask-start-date-input");
    var $endDateInput = $newFieldSet.find(".deadline-editor-form-subtask-end-date-input");
    var $startTimeInput = $newFieldSet.find(".deadline-editor-form-subtask-start-time-input");
    var $endTimeInput = $newFieldSet.find(".deadline-editor-form-subtask-end-time-input");
    DateTimeGroupSynchronizer.init($startDateInput, $endDateInput, $startTimeInput, $endTimeInput);
    var $addButton = $topContainer.find(".deadline-editor-form-subtask-add-button");
    $addButton.before($newFieldSet);
}
function addSubTaskFieldsetWithDefaults() {
    var defaultValuesSubTask = {
        title: "",
        startEpochMillis: moment().startOf("hour").add(1, 'hours').valueOf().toString(),
        endEpochMillis: moment().startOf("hour").add(2, 'hours').valueOf().toString(),
        isAllDay: "false",
        isDone: "false"
    };
    addSubTaskFieldset(defaultValuesSubTask);
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
        addSubTaskFieldset(subTask);
    }
}
function deadlineIsDone(json) {
    return json.subTasks.every(function (s) { return s.isDone == "true"; });
}
function onFormSubmit(event) {
    event.preventDefault();
    var json = getFormAsJSON();
    if (deadlineIsDone(json)) {
        alert("Please include at least one unfinished subtask. You can check off all subtasks from the homepage.");
    }
    else {
        doneCallback(json);
    }
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
    $subTaskAddButton.click(function (event) { return addSubTaskFieldsetWithDefaults(); });
    setFormValues(deadlineJson);
}
exports.init = init;

},{"./date-time-group-synchronizer":4}],6:[function(require,module,exports){
/// <reference path="./moment_modified.d.ts" />
"use strict";
var item_1 = require("./item");
var DeadlineEditor = require("./deadline-editor");
function onDeadlineEditorSubmit(updatedJsonWithoutID, origDeadline, mainModel) {
    var updatedJson = $.extend({}, updatedJsonWithoutID, { _id: origDeadline.getID() });
    var updatedDeadline = new item_1.DeadlineSerializer().fromJSON(updatedJson);
    mainModel.updateDeadlineOnServer(updatedDeadline);
    mainModel.switchToIndexView();
}
function init($targetContainer, deadline, mainModel) {
    var $topContainer = $targetContainer.find(".edit-deadline");
    var deadlineJSON = new item_1.DeadlineSerializer().toJSONWithoutID(deadline);
    var $deadlineEditorTarget = $topContainer.find(".edit-deadline-editor");
    DeadlineEditor.init($deadlineEditorTarget, deadlineJSON, function (d) { return onDeadlineEditorSubmit(d, deadline, mainModel); });
}
exports.init = init;

},{"./deadline-editor":5,"./item":9}],7:[function(require,module,exports){
/// <reference path="./moment_modified.d.ts" />
"use strict";
var item_1 = require("./item");
var task_editor_1 = require("./task-editor");
function onTaskEditorSubmit(updatedJsonWithoutID, origTask, mainModel) {
    var updatedJson = $.extend({}, updatedJsonWithoutID, { _id: origTask.getID() });
    var updatedTask = new item_1.TaskSerializer().fromJSON(updatedJson);
    mainModel.updateTaskOnServer(updatedTask);
    mainModel.switchToIndexView();
}
function init($targetContainer, task, mainModel) {
    var $topContainer = $targetContainer.find(".edit-task");
    var taskJSON = new item_1.TaskSerializer().toJSONWithoutID(task);
    var $taskEditorTarget = $topContainer.find(".edit-task-editor");
    new task_editor_1.TaskEditor($taskEditorTarget, taskJSON, function (t) { return onTaskEditorSubmit(t, task, mainModel); });
}
exports.init = init;

},{"./item":9,"./task-editor":12}],8:[function(require,module,exports){
/// <reference path="./moment_modified.d.ts" />
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ItemLi = (function () {
    // Note that the constructor does NOT automatically append the Li to the $targetUl.
    // appendToUl() must be called to do this,
    function ItemLi(item, $targetUl, removeFromServer, updateOnServer) {
        this.item = item;
        this.$li = $("<li>");
        this.$targetUl = $targetUl;
        this.removeFromServer = removeFromServer;
        this.updateOnServer = updateOnServer;
        this.fillLiForNormalMode();
    }
    ItemLi.prototype.appendToUl = function () {
        this.$targetUl.append(this.$li);
    };
    ItemLi.prototype.getItem = function () { return this.item; };
    ItemLi.prototype.onMarkDoneClicked = function (event) {
        this.removeFromServer();
        this.animateOutOfView();
    };
    ItemLi.prototype.animateOutOfView = function () {
        var _this = this;
        this.$li.slideUp({ complete: function () { return _this.$li.remove(); } });
    };
    ItemLi.prototype.onEditTitleClicked = function (event) {
        this.fillLiForTitleEditMode();
    };
    ItemLi.prototype.onCloseTitleEditClicked = function (event) {
        event.preventDefault(); // prevents form submission
        var $titleInput = this.$li.find(".index-edit-mode-form-title");
        this.item.setTitle($titleInput.val());
        this.fillLiForNormalMode();
        this.updateOnServer();
    };
    ItemLi.prototype.fillLiForTitleEditMode = function () {
        var _this = this;
        var templateContext = {
            title: this.item.getTitle()
        };
        var editModeHTML = Handlebars.templates['index-edit-mode-template'](templateContext);
        this.$li.html(editModeHTML);
        this.$li.find('input[type="submit"]').click(function (e) { return _this.onCloseTitleEditClicked(e); });
    };
    ItemLi.prototype.fillLiForNormalMode = function () {
        var _this = this;
        var templateContext = {
            title: this.item.getTitle(),
            dayTimeString: this.item.getDayTimeString()
        };
        var normalModeHTML = Handlebars.templates['index-normal-mode-template'](templateContext);
        this.$li.html(normalModeHTML);
        this.$li.find(".td-check").click(function (e) { return _this.onMarkDoneClicked(e); });
        this.$li.find(".item-title").click(function (e) { return _this.onEditTitleClicked(e); });
        this.$li.find(".td-settings").click(function (e) { return _this.onOpenSettingsClicked(e); });
    };
    return ItemLi;
}());
var TaskLi = (function (_super) {
    __extends(TaskLi, _super);
    function TaskLi(task, $targetUl, indexModel, mainModel) {
        var _this = _super.call(this, task, $targetUl, function () { return indexModel.removeTaskFromServer(task); }, function () { return mainModel.updateTaskOnServer(task); }) || this;
        _this.indexModel = indexModel;
        _this.mainModel = mainModel;
        return _this;
    }
    // Override
    TaskLi.prototype.onOpenSettingsClicked = function (event) {
        this.mainModel.switchToEditTaskView(this.getItem().getID());
    };
    return TaskLi;
}(ItemLi));
var DeadlineAndSubTaskLiManager = (function () {
    function DeadlineAndSubTaskLiManager() {
        this.deadlineLi = undefined;
        this.subTaskLis = [];
    }
    DeadlineAndSubTaskLiManager.prototype.registerDeadlineLi = function (deadlineLi) {
        this.deadlineLi = deadlineLi;
    };
    DeadlineAndSubTaskLiManager.prototype.registerSubTaskLi = function (subTaskLi) {
        this.subTaskLis.push(subTaskLi);
    };
    DeadlineAndSubTaskLiManager.prototype.animateOutDeadlineLi = function () {
        if (!this.deadlineLi) {
            throw new Error("DeadlineAndSubTaskLiManager: deadlineLi not registered");
        }
        this.deadlineLi.animateOutOfView();
    };
    DeadlineAndSubTaskLiManager.prototype.animateOutSubTaskLis = function () {
        for (var _i = 0, _a = this.subTaskLis; _i < _a.length; _i++) {
            var subTaskLi = _a[_i];
            subTaskLi.animateOutOfView();
        }
    };
    return DeadlineAndSubTaskLiManager;
}());
var SubTaskLi = (function (_super) {
    __extends(SubTaskLi, _super);
    function SubTaskLi(subTask, $targetUl, deadline, mainModel, indexModel, deadlineAndSubTaskLiManager) {
        var _this = _super.call(this, subTask, $targetUl, function () { return _this.removeSubTaskFromServer(mainModel); }, function () { return mainModel.updateDeadlineOnServer(deadline); }) || this;
        _this.deadline = deadline;
        _this.deadlineAndSubTaskLiManager = deadlineAndSubTaskLiManager;
        _this.deadlineAndSubTaskLiManager.registerSubTaskLi(_this);
        _this.removeDeadlineFromServer = function () { return indexModel.removeDeadlineFromServer(deadline); };
        _this.indexModel = indexModel;
        _this.mainModel = mainModel;
        return _this;
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
            this.deadlineAndSubTaskLiManager.animateOutDeadlineLi();
        }
    };
    // Override
    SubTaskLi.prototype.onOpenSettingsClicked = function (event) {
        this.mainModel.switchToEditDeadlineView(this.deadline.getID());
    };
    return SubTaskLi;
}(ItemLi));
var DeadlineLi = (function (_super) {
    __extends(DeadlineLi, _super);
    function DeadlineLi(deadline, $targetUl, mainModel, indexModel, deadlineAndSubTaskLiManager) {
        var _this = _super.call(this, deadline, $targetUl, function () { return indexModel.removeDeadlineFromServer(deadline); }, function () { return mainModel.updateDeadlineOnServer(deadline); }) || this;
        _this.indexModel = indexModel;
        _this.mainModel = mainModel;
        _this.deadlineAndSubTaskLiManager = deadlineAndSubTaskLiManager;
        _this.deadlineAndSubTaskLiManager.registerDeadlineLi(_this);
        return _this;
    }
    // Override
    DeadlineLi.prototype.onMarkDoneClicked = function (event) {
        _super.prototype.onMarkDoneClicked.call(this, event); // calls removeDeadlineFromServer
        this.deadlineAndSubTaskLiManager.animateOutSubTaskLis();
    };
    // Override
    DeadlineLi.prototype.onOpenSettingsClicked = function (event) {
        this.mainModel.switchToEditDeadlineView(this.getItem().getID());
    };
    return DeadlineLi;
}(ItemLi));
var View = (function () {
    function View($targetContainer, indexModel, mainModel) {
        this.$indexContainer = $targetContainer.find(".index");
        this.indexModel = indexModel;
        this.mainModel = mainModel;
    }
    View.prototype.clearAndShowLoadingOnContainer = function ($container) {
        var $ul = $container.find("ul");
        $ul.empty();
        var $loading = $("<p>", { "class": "index-loading" }).html("Loading...");
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
    View.prototype.showLoadError = function (errorMessage) {
        var $indexErrorContainer = this.$indexContainer.find(".index-error-container");
        $indexErrorContainer.append($("<p>").html(errorMessage));
        $indexErrorContainer.removeClass("hidden");
    };
    // Note: appends error after any existing errors.
    View.prototype.showItemLoadError = function (errorMessage) {
        this.removeTaskViewLoadingText();
        this.removeDeadlineViewLoadingText();
        this.showLoadError(errorMessage);
    };
    View.prototype.loadView = function (tasks, deadlines) {
        this.clearAndShowLoading();
        var $taskUl = this.$indexContainer.find(".index-task-container ul");
        var $deadlineUl = this.$indexContainer.find(".index-deadline-container ul");
        var taskLis = [];
        var deadlineLis = [];
        for (var _i = 0, tasks_1 = tasks; _i < tasks_1.length; _i++) {
            var task = tasks_1[_i];
            if (task.occursToday()) {
                taskLis.push(new TaskLi(task, $taskUl, this.indexModel, this.mainModel));
            }
        }
        var deadlineAndSubTaskLiManager = new DeadlineAndSubTaskLiManager();
        for (var _a = 0, deadlines_1 = deadlines; _a < deadlines_1.length; _a++) {
            var deadline = deadlines_1[_a];
            var deadlineLi = new DeadlineLi(deadline, $deadlineUl, this.mainModel, this.indexModel, deadlineAndSubTaskLiManager);
            deadlineLis.push(deadlineLi);
            for (var _b = 0, _c = deadline.getUnfinishedSubTasks(); _b < _c.length; _b++) {
                var subTask = _c[_b];
                if (subTask.occursToday()) {
                    var subTaskLi = new SubTaskLi(subTask, $taskUl, deadline, this.mainModel, this.indexModel, deadlineAndSubTaskLiManager);
                    taskLis.push(subTaskLi);
                }
            }
        }
        var sortFunction = function (a, b) { return moment(a.getItem().getStart()).diff(b.getItem().getStart()); };
        taskLis.sort(sortFunction);
        deadlineLis.sort(sortFunction);
        for (var _d = 0, taskLis_1 = taskLis; _d < taskLis_1.length; _d++) {
            var taskLi = taskLis_1[_d];
            taskLi.appendToUl();
        }
        for (var _e = 0, deadlineLis_1 = deadlineLis; _e < deadlineLis_1.length; _e++) {
            var deadlineLi = deadlineLis_1[_e];
            deadlineLi.appendToUl();
        }
        this.removeTaskViewLoadingText(); // only remove after loading deadlines because deadlines may contain subtasks
        this.removeDeadlineViewLoadingText();
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

},{}],9:[function(require,module,exports){
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
        var _this = _super.call(this, title, start, isAllDay, id) || this;
        _this.end = end;
        return _this;
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
        var _this = _super.call(this, title, start, end, isAllDay, id) || this;
        _this.deadlineId = deadlineId;
        _this.isDone = isDone;
        return _this;
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
        var _this = _super.call(this, title, start, isAllDay, id) || this;
        _this.subTasks = subTasks;
        return _this;
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

},{}],10:[function(require,module,exports){
"use strict";
var AddTask = require("./add-task");
var EditTask = require("./edit-task");
var AddDeadline = require("./add-deadline");
var EditDeadline = require("./edit-deadline");
var index = require("./index");
var nav = require("./nav");
var calendar = require("./calendar");
var item_1 = require("./item");
var item_2 = require("./item");
// Module-scope variables:
var mainModel;
var indexModel;
var addTaskModel;
function initAddTask() {
    AddTask.init($(".main-add-task"), addTaskModel, mainModel);
}
function initAddDeadline() {
    AddDeadline.init($(".main-add-deadline"), mainModel);
}
var View;
(function (View) {
    View[View["Index"] = 0] = "Index";
    View[View["AddTask"] = 1] = "AddTask";
    View[View["EditTask"] = 2] = "EditTask";
    View[View["AddDeadline"] = 3] = "AddDeadline";
    View[View["EditDeadline"] = 4] = "EditDeadline";
    View[View["Calendar"] = 5] = "Calendar";
})(View = exports.View || (exports.View = {}));
var VIEW_TO_URL_MAP = (_a = {},
    _a[View.Index] = "index",
    _a[View.AddTask] = "add-task",
    _a[View.EditTask] = "edit-task",
    _a[View.AddDeadline] = "add-deadline",
    _a[View.EditDeadline] = "edit-deadline",
    _a[View.Calendar] = "calendar",
    _a);
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
    MainModel.prototype.switchToView = function (newView, changeURL, data) {
        if (changeURL === void 0) { changeURL = true; }
        var CLASS_NAME_TO_VIEW_VALUE_MAP = {
            ".main-index": View.Index,
            ".main-add-task": View.AddTask,
            ".main-edit-task": View.EditTask,
            ".main-add-deadline": View.AddDeadline,
            ".main-edit-deadline": View.EditDeadline,
            ".main-calendar": View.Calendar
        };
        for (var className in CLASS_NAME_TO_VIEW_VALUE_MAP) {
            var viewValue = CLASS_NAME_TO_VIEW_VALUE_MAP[className];
            this.setVisibility(className, viewValue == newView);
            if (viewValue == newView && changeURL) {
                this.pushViewURL(newView, data);
            }
        }
    };
    MainModel.prototype.switchToIndexView = function (changeURL) {
        if (changeURL === void 0) { changeURL = true; }
        this.switchToView(View.Index, changeURL);
        index.reloadFromServer();
    };
    MainModel.prototype.switchToCalendarView = function (changeURL) {
        if (changeURL === void 0) { changeURL = true; }
        this.switchToView(View.Calendar, changeURL);
        calendar.reloadCalendar();
    };
    MainModel.prototype.switchToAddTaskView = function (changeURL) {
        if (changeURL === void 0) { changeURL = true; }
        initAddTask();
        this.switchToView(View.AddTask, changeURL);
    };
    MainModel.prototype.switchToAddDeadlineView = function (changeURL) {
        if (changeURL === void 0) { changeURL = true; }
        initAddDeadline();
        this.switchToView(View.AddDeadline, changeURL);
    };
    // TODO: make more efficient. Currently loads all tasks.
    MainModel.prototype.getTaskByID = function (taskID, onSuccess, onFailure) {
        function onLoadSuccess(tasks) {
            var found = false;
            for (var _i = 0, tasks_1 = tasks; _i < tasks_1.length; _i++) {
                var task = tasks_1[_i];
                if (task.getID() == taskID) {
                    onSuccess(task);
                    found = true;
                }
            }
            if (!found) {
                onFailure("Error: task not found");
            }
        }
        this.loadTasksFromServer(onLoadSuccess, onFailure);
    };
    // TODO: make more efficient. Currently loads all deadlines.
    MainModel.prototype.getDeadlineByID = function (deadlineID, onSuccess, onFailure) {
        function onLoadSuccess(deadlines) {
            var found = false;
            for (var _i = 0, deadlines_1 = deadlines; _i < deadlines_1.length; _i++) {
                var deadline = deadlines_1[_i];
                if (deadline.getID() == deadlineID) {
                    onSuccess(deadline);
                    found = true;
                }
            }
            if (!found) {
                onFailure("Error: deadline not found");
            }
        }
        this.loadDeadlinesFromServer(onLoadSuccess, onFailure);
    };
    // TODO: make more efficient by adding version of this method that takes Task object, for the
    // cases where the caller already loaded it.
    MainModel.prototype.switchToEditTaskView = function (taskID, changeURL) {
        var _this = this;
        if (changeURL === void 0) { changeURL = true; }
        var onSuccess = function (task) {
            _this.initEditTask(task);
            _this.switchToView(View.EditTask, changeURL, taskID);
        };
        this.getTaskByID(taskID, onSuccess, function (e) { return alert(e); });
    };
    // TODO: make more efficient by adding version of this method that takes Deadline object, for
    // the cases where the caller already loaded it.
    MainModel.prototype.switchToEditDeadlineView = function (deadlineID, changeURL) {
        var _this = this;
        if (changeURL === void 0) { changeURL = true; }
        var onSuccess = function (deadline) {
            _this.initEditDeadline(deadline);
            _this.switchToView(View.EditDeadline, changeURL, deadlineID);
        };
        this.getDeadlineByID(deadlineID, onSuccess, function (e) { return alert(e); });
    };
    MainModel.prototype.viewToURL = function (view, data) {
        return "/" + VIEW_TO_URL_MAP[view] + (data ? "/" + data : "");
    };
    MainModel.prototype.pushViewURL = function (view, data) {
        var state = { view: view, data: data };
        window.history.pushState(state, "", this.viewToURL(view, data));
    };
    MainModel.prototype.replaceViewURL = function (view, data) {
        var state = { view: view, data: data };
        window.history.replaceState(state, "", this.viewToURL(view, data));
    };
    MainModel.prototype.initEditTask = function (task) {
        EditTask.init($(".main-edit-task"), task, mainModel);
    };
    MainModel.prototype.initEditDeadline = function (deadline) {
        EditDeadline.init($(".main-edit-deadline"), deadline, mainModel);
    };
    MainModel.prototype.loadJSONFromServer = function (route, onSuccess, onFailure) {
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
            onSuccess(tasks);
        }
        this.loadJSONFromServer("/load-tasks", onLoadSuccess, onFailure);
    };
    MainModel.prototype.loadDeadlinesFromServer = function (onSuccess, onFailure) {
        function onLoadSuccess(data) {
            var deadlines = [];
            var deadlineSerializer = new item_2.DeadlineSerializer();
            for (var _i = 0, data_2 = data; _i < data_2.length; _i++) {
                var i = data_2[_i];
                deadlines.push(deadlineSerializer.fromJSON(i));
            }
            onSuccess(deadlines);
        }
        this.loadJSONFromServer("/load-deadlines", onLoadSuccess, onFailure);
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
            onFailure("Error loading tasks. Try refreshing the page.");
        }
        function onDeadlinesFailure(errorDetails) {
            onFailure("Error loading deadlines. Try refreshing the page.");
        }
        this.loadTasksFromServer(onTasksLoaded, onTasksFailure);
        this.loadDeadlinesFromServer(onDeadlinesLoaded, onDeadlinesFailure);
    };
    MainModel.prototype.updateTaskOnServer = function (updatedTask) {
        var updatedJSON = new item_1.TaskSerializer().toJSON(updatedTask);
        $.post("/update-task", updatedJSON)
            .done(function (data, textStatus, jqXHR) {
            calendar.reloadCalendar();
        })
            .fail(function (jqXHR, textStatus, error) {
            alert("Error: Update Task failed.");
        });
    };
    MainModel.prototype.addDeadlineToServer = function (json) {
        $.post("/add-deadline", json)
            .done(function (data, textStatus, jqXHR) {
            index.reloadFromServer();
        })
            .fail(function (jqXHR, textStatus, error) {
            alert("Error: Add Deadline failed.");
        });
    };
    MainModel.prototype.updateDeadlineOnServer = function (updatedDeadline) {
        var updatedJSON = new item_2.DeadlineSerializer().toJSON(updatedDeadline);
        $.post("/update-deadline", updatedJSON)
            .done(function (data, textStatus, jqXHR) {
            calendar.reloadCalendar();
        })
            .fail(function (jqXHR, textStatus, error) {
            alert("Error: Update Deadline failed.");
        });
    };
    MainModel.prototype.logout = function () {
        $.post('/logout', {}, function (data, status, jqXHR) {
            if (data.success) {
                console.log('Logged out successfully');
                window.location.href = '/';
            }
            else {
                alert('Error: failed to log out.');
            }
        });
    };
    return MainModel;
}());
exports.MainModel = MainModel;
var IndexModel = (function () {
    function IndexModel() {
    }
    IndexModel.prototype.removeDeadlineFromServer = function (deadlineToRemove) {
        var json = new item_2.DeadlineSerializer().toJSON(deadlineToRemove);
        $.post("/delete-deadline", json)
            .fail(function (jqXHR, textStatus, error) {
            alert("Error: Remove Deadline failed.");
        });
    };
    IndexModel.prototype.removeTaskFromServer = function (taskToRemove) {
        var json = new item_1.TaskSerializer().toJSON(taskToRemove);
        $.post("/delete-task", json)
            .fail(function (jqXHR, textStatus, error) {
            alert("Error: Remove Task failed.");
        });
    };
    return IndexModel;
}());
exports.IndexModel = IndexModel;
var AddTaskModel = (function () {
    function AddTaskModel() {
    }
    AddTaskModel.prototype.addTask = function (json) {
        $.post("/add-task", json)
            .done(function (data, textStatus, jqXHR) {
            index.reloadFromServer();
        })
            .fail(function (jqXHR, textStatus, error) {
            alert("Error: Add Task failed.");
        });
    };
    return AddTaskModel;
}());
exports.AddTaskModel = AddTaskModel;
// Note: does not change url.
function switchToViewUsingHistoryState(windowHistoryState) {
    if (windowHistoryState.view == View.Index) {
        mainModel.switchToIndexView(false);
    }
    else if (windowHistoryState.view == View.AddTask) {
        mainModel.switchToAddTaskView(false);
    }
    else if (windowHistoryState.view == View.EditTask) {
        mainModel.switchToEditTaskView(windowHistoryState.data, false);
    }
    else if (windowHistoryState.view == View.AddDeadline) {
        mainModel.switchToAddDeadlineView(false);
    }
    else if (windowHistoryState.view == View.EditDeadline) {
        mainModel.switchToEditDeadlineView(windowHistoryState.data, false);
    }
    else if (windowHistoryState.view == View.Calendar) {
        mainModel.switchToCalendarView(false);
    }
}
function parseWindowHistoryStateFromURLPathname(pathname) {
    var pathnameGetSuffix = function (routeName) {
        // Roughly equivalent to pathname.startsWith . See https://stackoverflow.com/a/4579228
        var pathnameStartsWith = function (other) {
            return pathname.lastIndexOf(other, 0) == 0;
        };
        var routeWithSlashes = "/" + routeName + "/";
        if (pathnameStartsWith(routeWithSlashes)) {
            var suffix = pathname.substring(routeWithSlashes.length);
            if (suffix != "") {
                return suffix;
            }
        }
        return undefined;
    };
    var pathnameMatches = function (routeName) {
        return pathname == ("/" + routeName);
    };
    if (pathnameMatches(VIEW_TO_URL_MAP[View.AddTask])) {
        return { view: View.AddTask };
    }
    var taskID = pathnameGetSuffix(VIEW_TO_URL_MAP[View.EditTask]);
    if (taskID) {
        return { view: View.EditTask, data: taskID };
    }
    if (pathnameMatches(VIEW_TO_URL_MAP[View.AddDeadline])) {
        return { view: View.AddDeadline };
    }
    var deadlineID = pathnameGetSuffix(VIEW_TO_URL_MAP[View.EditDeadline]);
    if (deadlineID) {
        return { view: View.EditDeadline, data: deadlineID };
    }
    if (pathnameMatches(VIEW_TO_URL_MAP[View.Calendar])) {
        return { view: View.Calendar };
    }
    // If index path, or not matching any of the known paths, go to index:
    return { view: View.Index };
}
function main() {
    mainModel = new MainModel();
    indexModel = new IndexModel();
    addTaskModel = new AddTaskModel();
    index.init($(".main-index"), indexModel, mainModel);
    nav.init($(".main-nav"), mainModel);
    calendar.init($(".main-calendar"), mainModel);
    index.reloadFromServer();
    if (window.history.state) {
        console.log('has history.state:');
        console.log(window.history.state);
        switchToViewUsingHistoryState(window.history.state);
    }
    else {
        console.log('no history state');
        var windowHistoryState = parseWindowHistoryStateFromURLPathname(window.location.pathname);
        switchToViewUsingHistoryState(windowHistoryState);
        mainModel.replaceViewURL(windowHistoryState.view, windowHistoryState.data);
    }
    window.onpopstate = (function (e) { return switchToViewUsingHistoryState(e.state); });
}
$(document).ready(main);
var _a;

},{"./add-deadline":1,"./add-task":2,"./calendar":3,"./edit-deadline":6,"./edit-task":7,"./index":8,"./item":9,"./nav":11}],11:[function(require,module,exports){
"use strict";
// Module-scope variables:
var MOBILE_MAX_WIDTH = 768; // pixels
var ANIM_TIME = 350; // milliseconds
var Nav = (function () {
    function Nav($navContainer, mainModel) {
        var _this = this;
        this.$navContainer = $navContainer;
        this.isOpen = false;
        this.mainModel = mainModel;
        $navContainer.find(".nav-pull-link").click(function (e) { return _this.toggleSidebarExpansion(); });
        $(window).resize(function (e) { return _this.toggleSidebarVsHeader(); });
        $navContainer.find(".nav-grtdm-button").click(function (e) {
            _this.navButtonPreAction();
            _this.mainModel.switchToIndexView();
        });
        $navContainer.find(".nav-add-task-button").click(function (e) {
            _this.navButtonPreAction();
            _this.mainModel.switchToAddTaskView();
        });
        $navContainer.find(".nav-add-deadline-button").click(function (e) {
            _this.navButtonPreAction();
            _this.mainModel.switchToAddDeadlineView();
        });
        $navContainer.find(".nav-calendar-button").click(function (e) {
            _this.navButtonPreAction();
            _this.mainModel.switchToCalendarView();
        });
        $navContainer.find(".nav-logout-button").click(function (e) {
            _this.navButtonPreAction();
            _this.mainModel.logout();
        });
    }
    Nav.prototype.navButtonPreAction = function () {
        if (!this.isDesktopWindowSize()) {
            this.toggleSidebarExpansion();
        }
    };
    Nav.prototype.isDesktopWindowSize = function () {
        return $(window).width() > MOBILE_MAX_WIDTH;
    };
    Nav.prototype.toggleSidebarExpansion = function () {
        var $nav = this.$navContainer.find("nav");
        var animDirection = this.isOpen ? "-" : "+";
        $nav.animate({ left: (animDirection + '=' + $nav.width()) }, ANIM_TIME);
        this.isOpen = !this.isOpen;
    };
    Nav.prototype.toggleSidebarVsHeader = function () {
        var $nav = this.$navContainer.find("nav");
        var switchToTop = this.isDesktopWindowSize();
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

},{}],12:[function(require,module,exports){
/// <reference path="./moment_modified.d.ts" />
"use strict";
var DateTimeGroupSynchronizer = require("./date-time-group-synchronizer");
var TaskEditor = (function () {
    function TaskEditor($targetContainer, taskJSON, doneCallback) {
        var _this = this;
        this.$topContainer = $targetContainer.find(".task-editor");
        this.setFormValues(taskJSON);
        var form = this.$topContainer.find(".task-editor-form");
        form.off(); // remove event handlers from previous TaskEditor, if any
        form.on("submit", function (event) { return _this.onFormSubmit(event, doneCallback); });
        var $startDateInput = this.$topContainer.find(".task-editor-form-start-date-input");
        var $endDateInput = this.$topContainer.find(".task-editor-form-end-date-input");
        var $startTimeInput = this.$topContainer.find(".task-editor-form-start-time-input");
        var $endTimeInput = this.$topContainer.find(".task-editor-form-end-time-input");
        DateTimeGroupSynchronizer.init($startDateInput, $endDateInput, $startTimeInput, $endTimeInput);
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

},{"./date-time-group-synchronizer":4}]},{},[10]);
