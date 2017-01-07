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

function toSubTaskJSONWithoutID(formArray: Object, arrayStartIndex: number): SubTaskJSONWithoutID
{
    let title: string = formArray[arrayStartIndex].value;
    let startDate: Date = toDate(formArray[arrayStartIndex + 1].value, formArray[arrayStartIndex + 2].value);
    let endDate: Date = toDate(formArray[arrayStartIndex + 3].value, formArray[arrayStartIndex + 4].value);

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

function toDeadlineJSONWithoutID(formArray: Object): DeadlineJSONWithoutID
{
    // STUB (only considers one subtask):

    let title: string = formArray[0].value;
    let startDate: Date = toDate(formArray[1].value, formArray[2].value);

    let subTask1Json: SubTaskJSONWithoutID = toSubTaskJSONWithoutID(formArray, 3);

    let json: DeadlineJSONWithoutID = 
    {
        title: title,
        startEpochMillis: startDate.getTime().toString(),
        isAllDay: "false",
        subTasks: 
        [
            subTask1Json
        ]
    }
    return json;
}

function getFormAsJSON(): DeadlineJSONWithoutID
{
    let formArray = $addDeadlineContainer.find(".add-deadline-form").serializeArray();
    console.log(formArray);
    return toDeadlineJSONWithoutID(formArray);
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