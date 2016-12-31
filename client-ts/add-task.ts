/// <reference path="./moment_modified.d.ts" />

import { Task } from "./item";
import { TaskJSONWithoutID } from "./item";
import { TaskSerializer } from "./item";

// Module-scope variables:
let $addTaskContainer: JQuery;

function toDate(dateWithoutTime: string, time: string): Date
{
    let fullDate: string = dateWithoutTime + time;
    return moment(fullDate, "YYYY-MM-DD HH:mm").toDate();
}

function toTaskJSONWithoutID(formArray: Object): TaskJSONWithoutID
{
    let title: string = formArray[0].value;
    let startDate: Date = toDate(formArray[1].value, formArray[2].value);
    let endDate: Date = toDate(formArray[3].value, formArray[4].value);

    let json: TaskJSONWithoutID = 
    {
        title: title,
        startEpochMillis: startDate.getTime().toString(),
        endEpochMillis: endDate.getTime().toString(),
        isAllDay: "false"
    }
    return json;
}

export function getFormAsJSON(): TaskJSONWithoutID
{
    let formArray = $addTaskContainer.find(".add-task-form").serializeArray();
    return toTaskJSONWithoutID(formArray);
}

function setDefaultDateTimeInputValues()
{
    let dateInputs: HTMLElement[] = $addTaskContainer.find(".add-task-form input[type='date']").toArray();
    for(let dateInput of dateInputs)
    {
        $(dateInput).val(moment().format("YYYY-MM-DD"));
    }

    let timeInputs: HTMLElement[] = $addTaskContainer.find(".add-task-form input[type='time']").toArray();
    for(let timeInput of timeInputs)
    {
        $(timeInput).val(moment().format("HH:mm"));
    }
}

export function main($targetContainer: JQuery, onAddTaskSubmit: (event: JQueryEventObject) => void): void
{
    "use strict";

    $addTaskContainer = $targetContainer.find(".add-task");

    $addTaskContainer.find(".add-task-form").on("submit", onAddTaskSubmit);

    setDefaultDateTimeInputValues();
};