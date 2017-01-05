import * as AddTask from "./add-task"
import * as index from "./index"
import * as nav from "./nav"
import * as calendar from "./calendar"
import { Task } from "./item";
import { TaskJSONWithoutID } from "./item";
import { TaskJSON } from "./item";
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

	if(newView == View.Calendar)
	{
		calendar.reloadCalendar();
	}
	else if(newView == View.Index)
	{
		indexModel.loadFromServer();
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
	    	let taskJson: TaskJSON = i as TaskJSON;
	    	let task: Task = taskSerializer.fromJSON(taskJson);
	        tasks.push(task);
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

export class IndexModel
{
	public onAddTaskClicked(event: JQueryEventObject): void
	{
	    switchToView(View.AddTask);
	}

	public loadFromServer(): void
	{
		index.clearViewAndShowLoading();

		loadTasksAndDeadlinesFromServer(index.loadView, index.showLoadError);
	}

	public removeTaskFromServer(taskToRemove: Task): void
	{
		let json: TaskJSON = new TaskSerializer().toJSON(taskToRemove);

		$.post("delete-task", json)
		.done(function(data, textStatus: string, jqXHR: JQueryXHR)
		{
			console.log("Remove Task success:");
			console.log(data);
		})
		.fail(function(jqXHR: JQueryXHR, textStatus: string, error: string)
		{
			let errorDetails: string = textStatus + ", " + error;
			alert("ERROR: Remove Task failed.\nDetails: " + errorDetails);
			console.log(errorDetails);
		});
	}
}

namespace AddTaskFunctions
{
	function postFormJSON(json: TaskJSONWithoutID)
	{
		$.post("add-task", json)
		.done(function(data, textStatus: string, jqXHR: JQueryXHR)
		{
			console.log("Add Task success:");
			console.log(data);
			indexModel.loadFromServer();
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

		let json: TaskJSONWithoutID = AddTask.getFormAsJSON();
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

	export function onSchedulerClicked(event: JQueryEventObject): void
	{
		console.log("Nav scheduler clicked");
		switchToView(View.Index);
	}
}

namespace CalendarFunctions
{
	export function loadFromServer(onSuccess: (tasks: Task[], deadlines: Deadline[]) => any,
									onFailure: (error: string) => any): void
	{
		loadTasksAndDeadlinesFromServer(onSuccess, onFailure);
	}

	// Replaces task that has the id of updatedTask with updatedTask.
	export function updateTaskOnServer(updatedTask: Task): void
	{
		let updatedJSON: TaskJSON = new TaskSerializer().toJSON(updatedTask);
		
		$.post("update-task", updatedJSON)
		.done(function(data, textStatus: string, jqXHR: JQueryXHR)
		{
			console.log("Update Task success:");
			console.log(data);
			calendar.reloadCalendar();
		})
		.fail(function(jqXHR: JQueryXHR, textStatus: string, error: string)
		{
			let errorDetails: string = textStatus + ", " + error;
			alert("ERROR: Update Task failed.\nDetails: " + errorDetails);
			console.log(errorDetails);
		});
	}
}

// Module-scope variables:
let indexModel: IndexModel;

function main(): void
{
	indexModel = new IndexModel();

	AddTask.main($(".main-add-task"), AddTaskFunctions.onAddTaskSubmit);
	index.main($(".main-index"), indexModel);
	nav.main($(".main-nav"), NavFunctions.onCalendarClicked, NavFunctions.onSchedulerClicked);
	calendar.main($(".main-calendar"), CalendarFunctions.loadFromServer, CalendarFunctions.updateTaskOnServer);

	indexModel.loadFromServer();

	switchToView(View.Index);
}

$(document).ready(main);