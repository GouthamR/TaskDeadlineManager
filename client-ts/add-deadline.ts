/// <reference path="./moment_modified.d.ts" />

import { DeadlineJSONWithoutID } from "./item";
import * as DeadlineEditor from "./deadline-editor";
import * as main from "./main";
import * as viewSwitcher from "./view-switcher";

// Module-scope variables:
let mainModel: main.MainModel;

function onDeadlineEditorSubmit(json: DeadlineJSONWithoutID)
{
    event.preventDefault();

    mainModel.addDeadlineToServer(json);

    viewSwitcher.switchToIndexView();
}

export function init($targetContainer: JQuery, mainModelParam: main.MainModel): void
{
    mainModel = mainModelParam;

    let $addDeadlineContainer: JQuery = $targetContainer.find(".add-deadline");

    let start: moment.Moment = moment().startOf("hour").add(1, 'hours');
    let deadlineJSON: DeadlineJSONWithoutID = 
    {
        title: "",
        startEpochMillis: start.valueOf().toString(),
        isAllDay: "false",
        subTasks: []
    };

    let $deadlineEditorTarget: JQuery = $addDeadlineContainer.find(".add-deadline-editor");
    DeadlineEditor.init($deadlineEditorTarget, deadlineJSON,
                        (d: DeadlineJSONWithoutID) => onDeadlineEditorSubmit(d));
}