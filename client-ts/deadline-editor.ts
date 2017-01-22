/// <reference path="./moment_modified.d.ts" />

import { DeadlineJSONWithoutID } from "./item";
import { SubTaskJSONWithoutID } from "./item";
import { DeadlineSerializer } from "./item";
import * as main from "./main"

// Module-scope variables:
let $topContainer: JQuery;
let doneCallback: (d: DeadlineJSONWithoutID) => void;
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

function toDate(dateWithoutTime: string, time: string): Date
{
    let fullDate: string = dateWithoutTime + time;
    return moment(fullDate, "YYYY-MM-DD HH:mm").toDate();
}

function toSubTaskJSONWithoutID($fieldset: JQuery): SubTaskJSONWithoutID
{
    const TITLE_SELECTOR: string = ".deadline-editor-form-subtask-title-input";
    const START_DATE_WITHOUT_TIME_SELECTOR: string = ".deadline-editor-form-subtask-start-date-input";
    const START_TIME_SELECTOR: string = ".deadline-editor-form-subtask-start-time-input";
    const END_DATE_WITHOUT_TIME_SELECTOR: string = ".deadline-editor-form-subtask-end-date-input";
    const END_TIME_SELECTOR: string = ".deadline-editor-form-subtask-end-time-input";

    let title: string = $fieldset.find(TITLE_SELECTOR).val();
    let startDateWithoutTime: string = $fieldset.find(START_DATE_WITHOUT_TIME_SELECTOR).val();
    let startTime: string = $fieldset.find(START_TIME_SELECTOR).val();
    let startDate: Date = toDate(startDateWithoutTime, startTime);
    let endDateWithoutTime: string = $fieldset.find(END_DATE_WITHOUT_TIME_SELECTOR).val();
    let endTime: string = $fieldset.find(END_TIME_SELECTOR).val();
    let endDate: Date = toDate(endDateWithoutTime, endTime);

    let json: SubTaskJSONWithoutID = 
    {
        title: title,
        startEpochMillis: startDate.getTime().toString(),
        endEpochMillis: endDate.getTime().toString(),
        isAllDay: "false",
        isDone: "false"
    };
    return json;
}

function getFormSubtasksJSONsWithoutID(): SubTaskJSONWithoutID[]
{
    let jsons: SubTaskJSONWithoutID[] = [];

    const SUBTASK_FIELDSETS_SELECTOR: string  = ".deadline-editor-form-subtasks .deadline-editor-form-subtask";
    let $subTaskFieldsets: JQuery = $topContainer.find(SUBTASK_FIELDSETS_SELECTOR);
    $subTaskFieldsets.each(function(index: number, element: Element)
    {
        let $currFieldset: JQuery = $(element);
        let currJson: SubTaskJSONWithoutID = toSubTaskJSONWithoutID($currFieldset);
        jsons.push(currJson);
    });

    return jsons;
}

function getFormAsJSON(): DeadlineJSONWithoutID
{
    const TITLE_SELECTOR: string = ".deadline-editor-form-deadline-title-input";
    const DATE_WITHOUT_TIME_SELECTOR: string = ".deadline-editor-form-deadline-start-date-input";
    const TIME_SELECTOR: string = ".deadline-editor-form-deadline-start-time-input";
    
    let title: string = $topContainer.find(TITLE_SELECTOR).val();
    let dateWithoutTime: string = $topContainer.find(DATE_WITHOUT_TIME_SELECTOR).val();
    let time: string = $topContainer.find(TIME_SELECTOR).val();
    let startDate: Date = toDate(dateWithoutTime, time);

    let subTasksJsons: SubTaskJSONWithoutID[] = getFormSubtasksJSONsWithoutID();

    let json: DeadlineJSONWithoutID = 
    {
        title: title,
        startEpochMillis: startDate.getTime().toString(),
        isAllDay: "false",
        subTasks: subTasksJsons
    }
    return json;
}

function toDateInputValue(dateTime: string): string
{
    const FORMAT: string = "YYYY-MM-DD";
    return moment(parseInt(dateTime)).format(FORMAT);
}

function toTimeInputValue(dateTime: string): string
{
    const FORMAT: string = "HH:mm";
    return moment(parseInt(dateTime)).format(FORMAT);
}

function addSubTaskFieldset(): JQuery
{
    let $newFieldSet: JQuery = $($.parseHTML(SUBTASK_FIELDSET_TEMPLATE));
    
    let $removeButton: JQuery = $newFieldSet.find(".deadline-editor-form-subtask-remove-button");
    $removeButton.click(function(event: JQueryEventObject)
    {
        $newFieldSet.remove();
    });

    let $addButton: JQuery = $topContainer.find(".deadline-editor-form-subtask-add-button");
    $addButton.before($newFieldSet);

    return $newFieldSet;
}

function setFormValues(deadlineJson: DeadlineJSONWithoutID)
{
    $topContainer.find(".deadline-editor-form-deadline-title-input")
                    .val(deadlineJson.title);
    $topContainer.find(".deadline-editor-form-deadline-start-date-input")
                    .val(toDateInputValue(deadlineJson.startEpochMillis));
    $topContainer.find(".deadline-editor-form-deadline-start-time-input")
                    .val(toTimeInputValue(deadlineJson.startEpochMillis));

    $topContainer.find(".deadline-editor-form-subtask").remove(); // remove subtasks from previous init, if necessary

    for(let subTask of deadlineJson.subTasks)
    {
        let $newFieldSet: JQuery = addSubTaskFieldset();
        $newFieldSet.find(".deadline-editor-form-subtask-title-input")
                    .val(subTask.title);
        $newFieldSet.find("deadline-editor-form-subtask-start-date-input")
                    .val(toDateInputValue(subTask.startEpochMillis));
        $newFieldSet.find("deadline-editor-form-subtask-start-time-input")
                    .val(toTimeInputValue(subTask.startEpochMillis));
        $newFieldSet.find("deadline-editor-form-subtask-end-date-input")
                    .val(toDateInputValue(subTask.endEpochMillis));
        $newFieldSet.find("deadline-editor-form-subtask-end-time-input")
                    .val(toTimeInputValue(subTask.endEpochMillis));
    }
}

function onFormSubmit(event: JQueryEventObject)
{
    event.preventDefault();

    let json: DeadlineJSONWithoutID = getFormAsJSON();
    doneCallback(json);
}

export function init($targetContainer: JQuery,
                        deadlineJson: DeadlineJSONWithoutID,
                        doneCallbackParam: (d: DeadlineJSONWithoutID) => void): void
{
    "use strict";

    $topContainer = $targetContainer.find(".deadline-editor");
    doneCallback = doneCallbackParam;

    let $editDeadlineForm: JQuery = $topContainer.find(".deadline-editor-form");
    $editDeadlineForm.off(); // remove handlers from previous init, if any
    $editDeadlineForm.on("submit", 
                            (event: JQueryEventObject) => onFormSubmit(event));

    let $subTaskAddButton: JQuery = $topContainer.find(".deadline-editor-form-subtask-add-button");
    $subTaskAddButton.off(); // remove handlers from previous init, if any
    $subTaskAddButton.click((event: JQueryEventObject) => addSubTaskFieldset());

    setFormValues(deadlineJson);
}