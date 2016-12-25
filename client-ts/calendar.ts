import { Item } from "./item";
import { Task } from "./item";
import { Deadline } from "./item";

// Module-level variables:
let $calendarContainer: JQuery;
const LOADING_CLASS_NAME: string = "calendar-loading";
let loadFromServer: (onSuccess: (tasks: Task[], deadlines: Deadline[]) => any,
						onFailure: (error: string) => any) => void;

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
		let events: FC.EventObject[] = [];

		for(let task of tasks)
		{
			let event: FC.EventObject = 
			{
				title: task.getTitle(),
				start: task.getStart(),
				allDay: task.getIsAllDay(),
				end: task.getEnd()
			};
			events.push(event);
		}

		for(let deadline of deadlines)
		{
			let event: FC.EventObject = 
			{
				title: deadline.getTitle(),
				start: deadline.getStart(),
				allDay: deadline.getIsAllDay(),
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

	loadFromServer(onSuccess, onFailure);
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
		defaultDate: '2016-09-12',
		navLinks: true,
		editable: true,
		events: getEventsFromServer
	});

	removeLoading();
}

export function main($targetContainer: JQuery, 
						loadFromServerFn: (onSuccess: (tasks: Task[], deadlines: Deadline[]) => any,
											onFailure: (error: string) => any) => void)
{
	$calendarContainer = $targetContainer.find(".calendar");
	loadFromServer = loadFromServerFn;

	clearAndShowLoading();
	initFullCalendar();
}