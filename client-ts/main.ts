import * as AddTask from "./add-task"
import * as index from "./index"
import * as nav from "./nav"
import { Task } from "./item";
import { TaskSerializer } from "./item";
import { Deadline } from "./item";
import { DeadlineSerializer } from "./item";

enum View
{
	Index, AddTask
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

function switchToView(view: View): void
{
	let index: boolean, addtask: boolean;
	index = addtask = false;

	if(view == View.Index)
	{
		index = true;
	}
	else if(view == View.AddTask)
	{
		addtask = true;
	}

	setVisibility(".main-index", index);
	setVisibility(".main-add-task", addtask);
}

function onIndexAddTaskClicked(event: JQueryEventObject): void
{
    switchToView(View.AddTask);
}

function postFormJSON(json: Object)
{
    $.post("add-task", json)
    .fail(function(jqXHR: JQueryXHR, textStatus: string, error: string)
    {
        let errorDetails: string = textStatus + ", " + error;
        alert("ERROR: Add Task failed.\nDetails: " + errorDetails);
        console.log(errorDetails);
    });
}

function onAddTaskSubmit(event: JQueryEventObject)
{
    switchToView(View.Index);

    let json: Object = AddTask.getFormAsJSON(event);
	postFormJSON(json);
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

function loadTasksAndDeadlinesFromServer(onSuccess: (tasks: Task[], deadlines: Deadline[]) => void,
											onFailure: (errorMessage: string) => void): void
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

function main(): void
{
	switchToView(View.Index);

	AddTask.main($(".main-add-task"), onAddTaskSubmit);
	index.main($(".main-index"), onIndexAddTaskClicked);
	nav.main($(".main-nav"));

	loadTasksAndDeadlinesFromServer(index.loadView, index.showLoadError);
}

$(document).ready(main);