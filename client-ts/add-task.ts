/// <reference path="./moment_modified.d.ts" />

import { TaskJSONWithoutID } from "./item";
import { TaskEditor } from "./task-editor"
import * as main from "./main"

function onTaskEditorSubmit(json: TaskJSONWithoutID, 
                            addTaskModel: main.AddTaskModel,
                            mainModel: main.MainModel)
{
    mainModel.switchToView(main.View.Index);
    
    addTaskModel.addTask(json);
}

export function init($targetContainer: JQuery, 
                        addTaskModel: main.AddTaskModel,
                        mainModel: main.MainModel): void
{
    let $addTaskContainer = $targetContainer.find(".add-task");

    let start: moment.Moment = moment().startOf("hour").add(1, 'hours');
    let end: moment.Moment = moment().startOf("hour").add(2, 'hours');
    let taskJSON: TaskJSONWithoutID = 
    {
        title: "",
        startEpochMillis: start.valueOf().toString(),
        endEpochMillis: end.valueOf().toString(),
        isAllDay: "false"
    };

    let $taskEditorTarget: JQuery = $addTaskContainer.find(".add-task-editor");
    new TaskEditor($taskEditorTarget, taskJSON,
                    (t: TaskJSONWithoutID) => onTaskEditorSubmit(t, addTaskModel, mainModel));
}