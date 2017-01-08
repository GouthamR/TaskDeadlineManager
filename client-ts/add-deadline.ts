/// <reference path="./moment_modified.d.ts" />

import { DeadlineJSONWithoutID } from "./item";
import { SubTaskJSONWithoutID } from "./item";
import { DeadlineSerializer } from "./item";
import * as main from "./main"

// Module-scope variables:
let $addDeadlineContainer: JQuery;
let mainModel: main.MainModel;

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
    let $subTaskFieldsets: JQuery = $(SUBTASK_FIELDSETS_SELECTOR);
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

function setDefaultDateTimeInputValues()
{
    let dateInputs: HTMLElement[] = $addDeadlineContainer.find(".add-deadline-form input[type='date']").toArray();
    for(let dateInput of dateInputs)
    {
        $(dateInput).val(moment().format("YYYY-MM-DD"));
    }

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

export function init($targetContainer: JQuery, mainModelParam: main.MainModel): void
{
    "use strict";

    $addDeadlineContainer = $targetContainer.find(".add-deadline");
    mainModel = mainModelParam;

    let $addDeadlineForm: JQuery = $addDeadlineContainer.find(".add-deadline-form");
    $addDeadlineForm.on("submit", 
                        (event: JQueryEventObject) => onAddDeadlineSubmit(event));

    setDefaultDateTimeInputValues();
}