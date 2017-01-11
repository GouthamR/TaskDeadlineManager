/// <reference path="./fullcalendar_modified.d.ts" />
/// <reference path="./moment_modified.d.ts" />

import { Item } from "./item";
import { Task } from "./item";
import { Deadline } from "./item";
import * as main from "./main"

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

enum ItemType
{
	Task, Deadline
}

class ItemEventObject implements FC.EventObject
{
	public title: string;
	public start: moment.Moment;
	public allDay: boolean;
	public itemType: ItemType;
	public item: Item;

	public constructor(title: string, start: moment.Moment, allDay: boolean,
						itemType: ItemType, item: Item)
	{
		this.title = title;
		this.start = start;
		this.allDay = allDay;
		this.itemType = itemType;
		this.item = item;
	}

	public updateItemToMatchEvent()
	{
		this.item.setStart(convertMomentToDate(this.start));
		this.item.setIsAllDay(isAllDay(this as FC.EventObject));
	}
}

class TaskEventObject extends ItemEventObject
{
	public end: moment.Moment;

	public constructor(title: string, start: moment.Moment, allDay: boolean,
						end: moment.Moment, itemType: ItemType, task: Task)
	{
		super(title, start, allDay, itemType, task as Item);
		this.end = end;
	}

	public updateItemToMatchEvent()
	{
		super.updateItemToMatchEvent();
		
		let task: Task = this.item as Task;
		task.setEnd(convertMomentToDate(this.end as moment.Moment));
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
		// STUB: (does not add deadlines to calendar)

		let events: ItemEventObject[] = [];

		for(let task of tasks)
		{
			let event: TaskEventObject = new TaskEventObject(task.getTitle(),
																moment(task.getStart()),
																task.getIsAllDay(),
																moment(task.getEnd()),
																ItemType.Task,
																task)
			events.push(event);
		}

		callback(events);
	}

	function onFailure (error: string)
	{
		alert("Failed to load from server. Details: " + error);
		callback([]);
	}

	mainModel.loadTasksAndDeadlinesFromServer(onSuccess, onFailure);
}

function onEventChanged(event: FC.EventObject, delta: moment.Duration, 
						revertFunc: Function, jsEvent: Event, ui: any, 
						view: FC.ViewObject): void
{
	let itemEvent = event as ItemEventObject;
	console.log("Event changed: ");
	console.log(itemEvent);
	
	itemEvent.updateItemToMatchEvent();
	
	if(itemEvent.itemType == ItemType.Task)
	{
		let updatedTask: Task = itemEvent.item as Task;
		mainModel.updateTaskOnServer(updatedTask);
	}
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
		forceEventDuration: true, // to set a default end date when moving to/from all-day. default is based on defaultTimedEventDuration and defaultAllDayEventDuration.
		defaultTimedEventDuration: '01:00:00',
		defaultAllDayEventDuration: {days: 1}
	});

	removeLoading();
}

export function reloadCalendar(): void
{
	console.log("Reloading calendar");
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