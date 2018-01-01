/// <reference path="./moment_modified.d.ts" />

import { Deadline, DeadlineJSON, DeadlineJSONWithoutID, DeadlineSerializer } from "./item";
import * as DeadlineEditor from "./deadline-editor"
import * as main from "./main"
import * as viewSwitcher from "./view-switcher";

function onDeadlineEditorSubmit(updatedJsonWithoutID: DeadlineJSONWithoutID, 
                                origDeadline: Deadline,
                                mainModel: main.MainModel)
{
    let updatedJson: DeadlineJSON = $.extend({}, updatedJsonWithoutID, 
                                            { _id: origDeadline.getID() }) as DeadlineJSON;
    let updatedDeadline: Deadline = new DeadlineSerializer().fromJSON(updatedJson);

    mainModel.updateDeadlineOnServer(updatedDeadline);

    viewSwitcher.switchToIndexView();
}

export function init($targetContainer: JQuery, 
                        deadline: Deadline,
                        mainModel: main.MainModel): void
{
    let $topContainer = $targetContainer.find(".edit-deadline");

    let deadlineJSON: DeadlineJSONWithoutID = new DeadlineSerializer().toJSONWithoutID(deadline);

    let $deadlineEditorTarget: JQuery = $topContainer.find(".edit-deadline-editor");
    DeadlineEditor.init($deadlineEditorTarget, deadlineJSON,
                        (d: DeadlineJSONWithoutID) => onDeadlineEditorSubmit(d, deadline, mainModel));
}