/// <reference path="./moment_modified.d.ts" />

import { Task, TaskJSON, TaskJSONWithoutID, TaskSerializer } from "./item";
import { TaskEditor } from "./task-editor"
import * as main from "./main"

function onTaskEditorSubmit(updatedJsonWithoutID: TaskJSONWithoutID, 
                            origTask: Task,
                            mainModel: main.MainModel)
{
    let updatedJson: TaskJSON = $.extend({}, updatedJsonWithoutID, 
                                            { _id: origTask.getID() }) as TaskJSON;
    let updatedTask: Task = new TaskSerializer().fromJSON(updatedJson);

    mainModel.updateTaskOnServer(updatedTask);

    mainModel.switchToIndexView();
}

export function init($targetContainer: JQuery, 
                        task: Task,
                        mainModel: main.MainModel): void
{
    let $topContainer = $targetContainer.find(".edit-task");

    let taskJSON: TaskJSONWithoutID = new TaskSerializer().toJSONWithoutID(task);

    let $taskEditorTarget: JQuery = $topContainer.find(".edit-task-editor");
    new TaskEditor($taskEditorTarget, taskJSON,
                    (t: TaskJSONWithoutID) => onTaskEditorSubmit(t, task, mainModel));
}