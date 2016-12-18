/// <reference path="jquery.d.ts" />
/// <reference path="moment.d.ts" />

import { Task } from "./item";
import { TaskSerializer } from "./item";

function toDate(dateWithoutTime: string, time: string): Date
{
    let fullDate: string = dateWithoutTime + time;
    return moment(fullDate, "YYYY-MM-DD HH:mm").toDate();
}

function toTaskJSON(formArray: Object): Object
{
    let title: string = formArray[0].value;
    let start: Date = toDate(formArray[1].value, formArray[2].value);
    let end: Date = toDate(formArray[3].value, formArray[4].value);

    let task: Task = new Task(title, start, end, false);
    let json: Object = new TaskSerializer().toJSON(task);

    return json;
}

// Side effect: event.preventDefault(), to prevent form POST request
function getFormAsJSON(event: JQueryEventObject)
{
    event.preventDefault();

    let formArray = $(this).serializeArray();
    return toTaskJSON(formArray);
}

function postFormJSON(json: Object)
{
    $.post("add-task", json)
    .fail(function(jqXHR: JQueryXHR, textStatus: string, error: string)
    {
        let errorDetails: string = textStatus + ", " + error;
        alert("ERROR: Add Task failed.\nDetails: " + errorDetails);
        console.log(errorDetails);
    });
}

export function processForm(event: JQueryEventObject)
{
    let json: Object = getFormAsJSON(event);
    postFormJSON(json);
}

export function main($targetContainer: JQuery, onAddTaskSubmit: (event: JQueryEventObject) => void): void
{
    "use strict";

    let $navContainer: JQuery = $targetContainer.find(".nav");

    $navContainer.find(".add-task-form").on("submit", onAddTaskSubmit);
};