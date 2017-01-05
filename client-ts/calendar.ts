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

enum ItemType
{
	Task, Deadline
}

interface ItemEventObject extends FC.EventObject
{
	itemType: ItemType;
	item: Item;
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
			let event: ItemEventObject = 
			{
				title: task.getTitle(),
				start: moment(task.getStart()),
				allDay: task.getIsAllDay(),
				end: moment(task.getEnd()),
				itemType: ItemType.Task,
				item: task
			};
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

// While event.start.toDate would seemingly work, it often returns invalid results.
// But event.start.format() is always valid, so this mehod uses that to get the equivalent date.
function convertStartToDate(event: FC.EventObject): Date
{
	return convertMomentToDate(event.start as moment.Moment);
}

// While event.end.toDate would seemingly work, it often returns invalid results.
// But event.end.format() is always valid, so this mehod uses that to get the equivalent date.
function convertEndToDate(event: FC.EventObject): Date
{
	return convertMomentToDate(event.end as moment.Moment);
}

function convertToTask(itemEvent: ItemEventObject): Task
{
	let task: Task = itemEvent.item as Task;

	task.setStart(convertStartToDate(itemEvent as FC.EventObject));
	task.setEnd(convertEndToDate(itemEvent as FC.EventObject));
	task.setIsAllDay(isAllDay(itemEvent as FC.EventObject));

	return task;
}

function onEventChanged(event: FC.EventObject, delta: moment.Duration, 
						revertFunc: Function, jsEvent: Event, ui: any, 
						view: FC.ViewObject): void
{
	let itemEventObj = event as ItemEventObject;
	console.log("Event changed: ");
	console.log(itemEventObj);
	if(itemEventObj.itemType == ItemType.Task)
	{
		let updatedTask: Task = convertToTask(itemEventObj);
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