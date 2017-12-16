/// <reference path="./fullcalendar_modified.d.ts" />
/// <reference path="./moment_modified.d.ts" />

import { Item } from "./item";
import { Task } from "./item";
import { Deadline } from "./item";
import { SubTask } from "./item";
import * as main from "./main"
import { View } from "./main";

// Module-level variables:
const LOADING_CLASS_NAME: string = "calendar-loading";
let $calendarContainer: JQuery;
let mainModel: main.MainModel;

// While FC.EventObject has an allDay field, that field yields inaccurate values.
function isAllDay(event: FC.EventObject)
{
	const NUM_CHARS_IN_ALL_DAY_FORMAT: number = 10;

	let formatted: string = (event.start as moment.Moment).format();
	let numCharsInFormat: number = formatted.length;
	return (numCharsInFormat == NUM_CHARS_IN_ALL_DAY_FORMAT);
}

// This function uses the momentObj.format() to convert to date, since that
// method always returns correct results, unlike momentObj.toDate().
function convertMomentToDate(momentObj: moment.Moment): Date
{
	return moment(momentObj.format()).toDate();
}

class ItemEventObject implements FC.EventObject
{
	public title: string;
	public start: moment.Moment;
	public allDay: boolean;
	public item: Item;

	public constructor(title: string, start: moment.Moment, allDay: boolean,
						item: Item)
	{
		this.title = title;
		this.start = start;
		this.allDay = allDay;
		this.item = item;
	}

	public updateItemToMatchEvent()
	{
		this.item.setStart(convertMomentToDate(this.start));
		this.item.setIsAllDay(isAllDay(this as FC.EventObject));
	}

	public updateItemOnServer()
	{
		// do nothing. to be implemented by subclasses.
	}

	public switchToEditView()
	{
		// do nothing. to be implemented by subclasses.
	}
}

class TaskEventObject extends ItemEventObject
{
	public end: moment.Moment;

	public constructor(title: string, start: moment.Moment, allDay: boolean,
						end: moment.Moment, task: Task)
	{
		super(title, start, allDay, task as Item);
		this.end = end;
	}

	public updateItemToMatchEvent()
	{
		super.updateItemToMatchEvent();
		
		let task: Task = this.item as Task;
		task.setEnd(convertMomentToDate(this.end as moment.Moment));
	}

	public updateItemOnServer()
	{
		let updatedTask: Task = this.item as Task;
		mainModel.updateTaskOnServer(updatedTask);
	}

	public switchToEditView()
	{
		mainModel.initEditTask(this.item as Task);
		mainModel.switchToView(View.EditTask);
	}
}

class DeadlineEventObject extends ItemEventObject
{
	public color: string;

	public constructor(title: string, start: moment.Moment, allDay: boolean,
						deadline: Deadline)
	{
		super(title, start, allDay, deadline as Item);

		this.color = "green";
	}

	public updateItemOnServer()
	{
		let updatedDeadline: Deadline = this.item as Deadline;
		mainModel.updateDeadlineOnServer(updatedDeadline);
	}

	public switchToEditView()
	{
		mainModel.initEditDeadline(this.item as Deadline);
		mainModel.switchToView(View.EditDeadline);
	}
}

class SubTaskEventObject extends TaskEventObject
{
	private deadline: Deadline;

	public constructor(title: string, start: moment.Moment, allDay: boolean,
						end: moment.Moment, deadline: Deadline, subTask: SubTask)
	{
		super(title, start, allDay, end, subTask as Task);
		this.deadline = deadline;
	}

	public updateItemOnServer()
	{
		mainModel.updateDeadlineOnServer(this.deadline);
	}

	public switchToEditView()
	{
		mainModel.initEditDeadline(this.deadline);
		mainModel.switchToView(View.EditDeadline);
	}
}

function clearAndShowLoading(): void
{
	// STUB (does not clear):
    
    let $fullCalendarDiv: JQuery = $calendarContainer.find(".calendar-fullcalendar");
    
    let $loading: JQuery = $("<p>", {class: LOADING_CLASS_NAME}).html("Loading...");
    $fullCalendarDiv.append($loading);
}

function removeLoading(): void
{
    let $fullCalendarDiv: JQuery = $calendarContainer.find(".calendar-fullcalendar");
    $fullCalendarDiv.find("." + LOADING_CLASS_NAME).remove();
}

function getEventsFromServer(start: moment.Moment, end: moment.Moment, 
								timezone: string | boolean, 
								callback: (events: FC.EventObject[]) => void): void
{
	function onSuccess (tasks: Task[], deadlines: Deadline[])
	{
		let events: ItemEventObject[] = [];

		for(let task of tasks)
		{
			let event: TaskEventObject = new TaskEventObject(task.getTitle(),
																moment(task.getStart()),
																task.getIsAllDay(),
																moment(task.getEnd()),
																task);
			events.push(event);
		}

		for(let deadline of deadlines)
		{
			let deadlineEvent: DeadlineEventObject = new DeadlineEventObject(deadline.getTitle(),
																				moment(deadline.getStart()),
																				deadline.getIsAllDay(),
																				deadline);
			events.push(deadlineEvent);
			for(let subTask of deadline.getUnfinishedSubTasks()) // only display unfinished subtasks in calendar
			{
				let subTaskEvent: SubTaskEventObject = new SubTaskEventObject(subTask.getTitle(),
																				moment(subTask.getStart()),
																				subTask.getIsAllDay(),
																				moment(subTask.getEnd()),
																				deadline,
																				subTask);
				events.push(subTaskEvent);
			}
		}

		callback(events);
	}

	function onFailure (error: string)
	{
		alert("Error: failed to load tasks and deadlines. Try refreshing the page.");
		callback([]);
	}

	mainModel.loadTasksAndDeadlinesFromServer(onSuccess, onFailure);
}

function onEventChanged(event: FC.EventObject, delta: moment.Duration, 
						revertFunc: Function, jsEvent: Event, ui: any, 
						view: FC.ViewObject): void
{
	let itemEvent = event as ItemEventObject;
	
	itemEvent.updateItemToMatchEvent();
	itemEvent.updateItemOnServer();
}

function onEventClicked(event: FC.EventObject, jsEvent: MouseEvent, view: FC.ViewObject): void
{
	let itemEvent = event as ItemEventObject;
	itemEvent.switchToEditView();
}

function initFullCalendar(): void
{
	$calendarContainer.find(".calendar-fullcalendar").fullCalendar(
	{
		header:
		{
			left: 'prev,next today',
			center: 'title',
			right: 'month,basicWeek,agendaDay'
		},
		navLinks: true,
		editable: true,
		timezone: 'local', // to avoid ambiguous timezone
		events: getEventsFromServer,
		eventDrop: onEventChanged,
		eventResize: onEventChanged,
		eventClick: onEventClicked,
		forceEventDuration: true, // to set a default end date when moving to/from all-day. default is based on defaultTimedEventDuration and defaultAllDayEventDuration.
		defaultTimedEventDuration: '01:00:00',
		defaultAllDayEventDuration: {days: 1}
	});

	removeLoading();
}

export function reloadCalendar(): void
{
	let $fullCalendar: JQuery = $calendarContainer.find(".calendar-fullcalendar");
	$fullCalendar.fullCalendar("refetchEvents");
}

export function init($targetContainer: JQuery, mainModelParam: main.MainModel)
{
	$calendarContainer = $targetContainer.find(".calendar");
	mainModel = mainModelParam;

	clearAndShowLoading();
	initFullCalendar();
}