/// <reference path="./moment_modified.d.ts" />

import { DeadlineJSONWithoutID } from "./item";
import { SubTaskJSONWithoutID } from "./item";
import { DeadlineSerializer } from "./item";
import * as main from "./main"

// Module-scope variables:
let $addDeadlineContainer: JQuery;
let mainModel: main.MainModel;
var SUBTASK_FIELDSET_TEMPLATE = "";
SUBTASK_FIELDSET_TEMPLATE += "<fieldset class=\"add-deadline-form-subtask\">";
SUBTASK_FIELDSET_TEMPLATE += " <legend>SubTask:<\/legend>";
SUBTASK_FIELDSET_TEMPLATE += " <label>";
SUBTASK_FIELDSET_TEMPLATE += "     Title";
SUBTASK_FIELDSET_TEMPLATE += "     <input type=\"text\" class=\"add-deadline-form-subtask-title-input\" name=\"title\" autofocus=\"true\">";
SUBTASK_FIELDSET_TEMPLATE += " <\/label>";
SUBTASK_FIELDSET_TEMPLATE += " <label>";
SUBTASK_FIELDSET_TEMPLATE += "     Start";
SUBTASK_FIELDSET_TEMPLATE += "     <input type=\"date\" class=\"add-deadline-form-subtask-start-date-input\" name=\"start-date\">";
SUBTASK_FIELDSET_TEMPLATE += " <\/label>";
SUBTASK_FIELDSET_TEMPLATE += " <input type=\"time\" class=\"add-deadline-form-subtask-start-time-input\" name=\"start-time\">";
SUBTASK_FIELDSET_TEMPLATE += " <label>";
SUBTASK_FIELDSET_TEMPLATE += "     End";
SUBTASK_FIELDSET_TEMPLATE += "     <input type=\"date\" class=\"add-deadline-form-subtask-end-date-input\" name=\"end-date\">";
SUBTASK_FIELDSET_TEMPLATE += " <\/label>";
SUBTASK_FIELDSET_TEMPLATE += " <input type=\"time\" class=\"add-deadline-form-subtask-end-time-input\" name=\"end-time\">";
SUBTASK_FIELDSET_TEMPLATE += " <input type=\"button\" class=\"add-deadline-form-subtask-remove-button\" value=\"-\">";
SUBTASK_FIELDSET_TEMPLATE += "<\/fieldset>";

function toDate(dateWithoutTime: string, time: string): Date
{
    let fullDate: string = dateWithoutTime + time;
    return moment(fullDate, "YYYY-MM-DD HH:mm").toDate();
}

function toSubTaskJSONWithoutID($fieldset: JQuery): SubTaskJSONWithoutID
{
    const TITLE_SELECTOR: string = ".add-deadline-form-subtask-title-input";
    const START_DATE_WITHOUT_TIME_SELECTOR: string = ".add-deadline-form-subtask-start-date-input";
    const START_TIME_SELECTOR: string = ".add-deadline-form-subtask-start-time-input";
    const END_DATE_WITHOUT_TIME_SELECTOR: string = ".add-deadline-form-subtask-end-date-input";
    const END_TIME_SELECTOR: string = ".add-deadline-form-subtask-end-time-input";

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

    const SUBTASK_FIELDSETS_SELECTOR: string  = ".add-deadline-form-subtasks .add-deadline-form-subtask";
    let $subTaskFieldsets: JQuery = $addDeadlineContainer.find(SUBTASK_FIELDSETS_SELECTOR);
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
    const TITLE_SELECTOR: string = ".add-deadline-form-deadline-title-input";
    const DATE_WITHOUT_TIME_SELECTOR: string = ".add-deadline-form-deadline-start-date-input";
    const TIME_SELECTOR: string = ".add-deadline-form-deadline-start-time-input";
    
    let title: string = $addDeadlineContainer.find(TITLE_SELECTOR).val();
    let dateWithoutTime: string = $addDeadlineContainer.find(DATE_WITHOUT_TIME_SELECTOR).val();
    let time: string = $addDeadlineContainer.find(TIME_SELECTOR).val();
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

function setDefaultDeadlineDateTimeInputValues()
{
    let $dateInput: JQuery = $addDeadlineContainer.find(".add-deadline-form-deadline-start-date-input");
    $dateInput.val(moment().format("YYYY-MM-DD"));

    let $startTimeInput: JQuery = $addDeadlineContainer.find(".add-deadline-form-deadline-start-time-input");
    $startTimeInput.val(moment().startOf("hour").add(1, 'hours').format("HH:mm"));
}

function onAddDeadlineSubmit(event: JQueryEventObject)
{
    event.preventDefault();

    mainModel.switchToView(main.View.Index);

    let json: DeadlineJSONWithoutID = getFormAsJSON();
    mainModel.addDeadlineToServer(json);
}

function onAddSubTaskClicked(event: JQueryEventObject)
{
    let $newFieldSet: JQuery = $($.parseHTML(SUBTASK_FIELDSET_TEMPLATE));
    
    let $removeButton: JQuery = $newFieldSet.find(".add-deadline-form-subtask-remove-button");
    $removeButton.click(function(event: JQueryEventObject)
    {
        $newFieldSet.remove();
    });

    let $addButton: JQuery = $addDeadlineContainer.find(".add-deadline-form-subtask-add-button");
    $addButton.before($newFieldSet);
}

export function init($targetContainer: JQuery, mainModelParam: main.MainModel): void
{
    "use strict";

    $addDeadlineContainer = $targetContainer.find(".add-deadline");
    mainModel = mainModelParam;

    let $addDeadlineForm: JQuery = $addDeadlineContainer.find(".add-deadline-form");
    $addDeadlineForm.on("submit", 
                        (event: JQueryEventObject) => onAddDeadlineSubmit(event));

    let $subTaskAddButton: JQuery = $addDeadlineContainer.find(".add-deadline-form-subtask-add-button");
    $subTaskAddButton.click((event: JQueryEventObject) => onAddSubTaskClicked(event));

    setDefaultDeadlineDateTimeInputValues();
}