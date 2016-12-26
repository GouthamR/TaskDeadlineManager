import * as AddTask from "./add-task"
import * as index from "./index"
import * as nav from "./nav"
import * as calendar from "./calendar"
import { Task } from "./item";
import { TaskSerializer } from "./item";
import { Deadline } from "./item";
import { DeadlineSerializer } from "./item";

enum View
{
	Index, AddTask, Calendar
}

function setVisibility(elementClass: string, isVisible: boolean): void
{
	const HIDING_CLASS_NAME: string = "hidden";

	if(isVisible)
	{
		$(elementClass).removeClass(HIDING_CLASS_NAME);
	}
	else
	{
		$(elementClass).addClass(HIDING_CLASS_NAME);
	}
}

// Returns keys of enum e.
// e.g. given enum E { A, B, C } returns [0, 1, 2]
function getEnumValues(e): number[]
{
	let valueStrings: string[] = Object.keys(e).filter((k) => typeof e[k] === "string");
	return valueStrings.map((v) => parseInt(v));
}

function switchToView(newView: View): void
{
	const CLASS_NAME_TO_VIEW_VALUE_MAP = 
	{
		".main-index": View.Index,
		".main-add-task": View.AddTask,
		".main-calendar": View.Calendar
	};

	for(let className in CLASS_NAME_TO_VIEW_VALUE_MAP)
	{
		let viewValue = CLASS_NAME_TO_VIEW_VALUE_MAP[className];
		setVisibility(className, viewValue == newView);
	}
}

function loadItemDataFromServer(route: string, onSuccess: (data) => void, 
									onFailure: (errorDetails: string) => void): void
{
	$.getJSON(route)
    .done(function(data, textStatus: string, jqXHR: JQueryXHR)
    {
    	onSuccess(data);
    })
    .fail(function(jqXHR: JQueryXHR, textStatus: string, error: string)
    {
        let errorDetails: string = textStatus + ", " + error;
        onFailure(errorDetails);
    });
}

function loadTasksFromServer(onSuccess: (tasks: Task[]) => void, 
								onFailure: (errorDetails: string) => void): void
{
	function onLoadSuccess(data): void
	{
		let tasks: Task[] = [];
	    let taskSerializer: TaskSerializer = new TaskSerializer();
	    for(let i of data)
	    {
	        tasks.push(taskSerializer.fromJSON(i));
	    }
	    console.log(tasks);
	    onSuccess(tasks);
	}

	loadItemDataFromServer("/load-tasks", onLoadSuccess, onFailure);
}

function loadDeadlinesFromServer(onSuccess: (deadlines: Deadline[]) => void, 
								onFailure: (errorDetails: string) => void): void
{
	function onLoadSuccess(data): void
	{
		let deadlines: Deadline[] = [];
	    let deadlineSerializer: DeadlineSerializer = new DeadlineSerializer();
	    for(let i of data)
	    {
	        deadlines.push(deadlineSerializer.fromJSON(i));
	    }
	    console.log(deadlines);
	    onSuccess(deadlines);
	}

	loadItemDataFromServer("/load-deadlines", onLoadSuccess, onFailure);
}

function loadTasksAndDeadlinesFromServer(onSuccess: (tasks: Task[], deadlines: Deadline[]) => any,
											onFailure: (error: string) => any): void
{
	let isTasksLoaded: boolean = false;
	let isDeadlinesLoaded: boolean = false;

	let tasks: Task[] = [];
	let deadlines: Deadline[] = [];

	function onTasksLoaded(loadedTasks: Task[])
	{
		tasks = loadedTasks;
		isTasksLoaded = true;

		if(isDeadlinesLoaded)
		{
			onSuccess(tasks, deadlines);
		}
	}

	function onDeadlinesLoaded(loadedDeadlines: Deadline[])
	{
		deadlines = loadedDeadlines;
		isDeadlinesLoaded = true;

		if(isTasksLoaded)
		{
			onSuccess(tasks, deadlines);
		}
	}

	function onTasksFailure(errorDetails: string)
	{
		onFailure("Error loading tasks. Details: " + errorDetails);
	}

	function onDeadlinesFailure(errorDetails: string)
	{
		onFailure("Error loading deadlines. Details: " + errorDetails);
	}

	loadTasksFromServer(onTasksLoaded, onTasksFailure);
	loadDeadlinesFromServer(onDeadlinesLoaded, onDeadlinesFailure);
}

namespace IndexFunctions
{
	export function onIndexAddTaskClicked(event: JQueryEventObject): void
	{
	    switchToView(View.AddTask);
	}

	export function loadFromServer(): void
	{
		index.clearViewAndShowLoading();

		loadTasksAndDeadlinesFromServer(index.loadView, index.showLoadError);
	}
}

namespace AddTaskFunctions
{
	function postFormJSON(json: Object)
	{
		$.post("add-task", json)
		.done(function(data, textStatus: string, jqXHR: JQueryXHR)
		{
			console.log("Add Task success:");
			console.log(data);
			IndexFunctions.loadFromServer();
		})
		.fail(function(jqXHR: JQueryXHR, textStatus: string, error: string)
		{
			let errorDetails: string = textStatus + ", " + error;
			alert("ERROR: Add Task failed.\nDetails: " + errorDetails);
			console.log(errorDetails);
		});
	}

	export function onAddTaskSubmit(event: JQueryEventObject)
	{
		event.preventDefault();

		switchToView(View.Index);

		let json: Object = AddTask.getFormAsJSON();
		postFormJSON(json);
	}
}

namespace NavFunctions
{
	export function onCalendarClicked(event: JQueryEventObject): void
	{
		console.log("Nav calendar clicked");
		switchToView(View.Calendar);
	}
}

namespace CalendarFunctions
{
	export function loadFromServer(onSuccess: (tasks: Task[], deadlines: Deadline[]) => any,
									onFailure: (error: string) => any): void
	{
		loadTasksAndDeadlinesFromServer(onSuccess, onFailure);
	}
}

function main(): void
{
	AddTask.main($(".main-add-task"), AddTaskFunctions.onAddTaskSubmit);
	index.main($(".main-index"), IndexFunctions.onIndexAddTaskClicked);
	nav.main($(".main-nav"), NavFunctions.onCalendarClicked);
	calendar.main($(".main-calendar"), CalendarFunctions.loadFromServer);

	IndexFunctions.loadFromServer();

	switchToView(View.Index);
}

$(document).ready(main);