/// <reference path="./moment_modified.d.ts" />

import { Deadline } from "./item";
import { DeadlineJSONWithoutID } from "./item";
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

function toDeadlineJSONWithoutID(formArray: Object): DeadlineJSONWithoutID
{
    // STUB:
    let json: DeadlineJSONWithoutID = 
    {
        title: "deadline_title",
        startEpochMillis: "100",
        isAllDay: "false",
        subTasks: 
        [
            {
                title: "subtask_title",
                startEpochMillis: "50",
                endEpochMillis: "70",
                isAllDay: "false",
                isDone: "false"
            }
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