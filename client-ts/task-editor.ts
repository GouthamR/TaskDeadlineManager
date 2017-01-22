/// <reference path="./moment_modified.d.ts" />

import { Task } from "./item";
import { TaskJSONWithoutID } from "./item";
import { TaskSerializer } from "./item";
import * as main from "./main"

export class TaskEditor
{
    private $topContainer: JQuery;

    public constructor($targetContainer: JQuery,
                        taskJSON: TaskJSONWithoutID,
                        doneCallback: (t: TaskJSONWithoutID) => void)
    {
        this.$topContainer = $targetContainer.find(".task-editor");

        this.setFormValues(taskJSON);

        let form: JQuery = this.$topContainer.find(".task-editor-form");
        form.off(); // remove event handlers from previous TaskEditor, if any
        form.on("submit", 
                (event: JQueryEventObject) => this.onFormSubmit(event, doneCallback));
    }

    private setFormValues(taskJSON: TaskJSONWithoutID)
    {
        this.$topContainer.find(".task-editor-form-title-input").val(taskJSON.title);

        this.$topContainer.find(".task-editor-form-start-date-input")
                            .val(this.toDateInputValue(taskJSON.startEpochMillis));
        this.$topContainer.find(".task-editor-form-end-date-input")
                            .val(this.toDateInputValue(taskJSON.endEpochMillis));

        this.$topContainer.find(".task-editor-form-start-time-input")
                            .val(this.toTimeInputValue(taskJSON.startEpochMillis));
        this.$topContainer.find(".task-editor-form-end-time-input")
                            .val(this.toTimeInputValue(taskJSON.endEpochMillis));
    }

    private toDateInputValue(dateTime: string): string
    {
        const FORMAT: string = "YYYY-MM-DD";
        return moment(parseInt(dateTime)).format(FORMAT);
    }

    private toTimeInputValue(dateTime: string): string
    {
        const FORMAT: string = "HH:mm";
        return moment(parseInt(dateTime)).format(FORMAT);
    }

    private onFormSubmit(event: JQueryEventObject, 
                            doneCallback: (t: TaskJSONWithoutID) => void)
    {
        event.preventDefault();

        doneCallback(this.getFormAsJSON());
    }

    private getFormAsJSON(): TaskJSONWithoutID
    {
        let formArray = this.$topContainer.find(".task-editor-form").serializeArray();
        let title: string = formArray[0].value;
        let startDate: Date = this.toDate(formArray[1].value, formArray[2].value);
        let endDate: Date = this.toDate(formArray[3].value, formArray[4].value);

        let json: TaskJSONWithoutID = 
        {
            title: title,
            startEpochMillis: startDate.getTime().toString(),
            endEpochMillis: endDate.getTime().toString(),
            isAllDay: "false"
        }
        return json;
    }

    private toDate(dateWithoutTime: string, time: string): Date
    {
        let fullDate: string = dateWithoutTime + time;
        return moment(fullDate, "YYYY-MM-DD HH:mm").toDate();
    }
}