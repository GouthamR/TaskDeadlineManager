import { Task } from "./item";
import { TaskJSON } from "./item";
import { TaskSerializer } from "./item";

// Module-scope variables:
let $addTaskContainer: JQuery;

function toDate(dateWithoutTime: string, time: string): Date
{
    let fullDate: string = dateWithoutTime + time;
    return moment(fullDate, "YYYY-MM-DD HH:mm").toDate();
}

function toTaskJSON(formArray: Object): TaskJSON
{
    let title: string = formArray[0].value;
    let start: Date = toDate(formArray[1].value, formArray[2].value);
    let end: Date = toDate(formArray[3].value, formArray[4].value);

    let task: Task = new Task(title, start, end, false);
    let taskJson: TaskJSON = new TaskSerializer().toJSON(task);

    return taskJson;
}

export function getFormAsJSON(): TaskJSON
{
    let formArray = $addTaskContainer.find(".add-task-form").serializeArray();
    return toTaskJSON(formArray);
}

export function main($targetContainer: JQuery, onAddTaskSubmit: (event: JQueryEventObject) => void): void
{
    "use strict";

    $addTaskContainer = $targetContainer.find(".add-task");

    $addTaskContainer.find(".add-task-form").on("submit", onAddTaskSubmit);
};