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

export enum View
{
	Index, AddTask, Calendar
}

export class MainModel
{
	private setVisibility(elementClass: string, isVisible: boolean): void
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
	private getEnumValues(e): number[]
	{
		let valueStrings: string[] = Object.keys(e).filter((k) => typeof e[k] === "string");
		return valueStrings.map((v) => parseInt(v));
	}

	public switchToView(newView: View): void
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
			this.setVisibility(className, viewValue == newView);
		}

		if(newView == View.Calendar)
		{
			calendar.reloadCalendar();
		}
		else if(newView == View.Index)
		{
			index.reloadFromServer();
		}
	}


	private loadItemDataFromServer(route: string, onSuccess: (data) => void, 
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

	private loadTasksFromServer(onSuccess: (tasks: Task[]) => void, 
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

		this.loadItemDataFromServer("/load-tasks", onLoadSuccess, onFailure);
	}

	private loadDeadlinesFromServer(onSuccess: (deadlines: Deadline[]) => void, 
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

		this.loadItemDataFromServer("/load-deadlines", onLoadSuccess, onFailure);
	}

	public loadTasksAndDeadlinesFromServer(onSuccess: (tasks: Task[], deadlines: Deadline[]) => any,
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

		this.loadTasksFromServer(onTasksLoaded, onTasksFailure);
		this.loadDeadlinesFromServer(onDeadlinesLoaded, onDeadlinesFailure);
	}
}

export class IndexModel
{
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
			index.reloadFromServer();
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

		mainModel.switchToView(View.Index);

		let json: TaskJSONWithoutID = AddTask.getFormAsJSON();
		postFormJSON(json);
	}
}

namespace NavFunctions
{
	export function onCalendarClicked(event: JQueryEventObject): void
	{
		console.log("Nav calendar clicked");
		mainModel.switchToView(View.Calendar);
	}

	export function onSchedulerClicked(event: JQueryEventObject): void
	{
		console.log("Nav scheduler clicked");
		mainModel.switchToView(View.Index);
	}
}

namespace CalendarFunctions
{
	export function loadFromServer(onSuccess: (tasks: Task[], deadlines: Deadline[]) => any,
									onFailure: (error: string) => any): void
	{
		mainModel.loadTasksAndDeadlinesFromServer(onSuccess, onFailure);
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
let mainModel: MainModel;
let indexModel: IndexModel;

function main(): void
{
	mainModel = new MainModel();
	indexModel = new IndexModel();

	AddTask.main($(".main-add-task"), AddTaskFunctions.onAddTaskSubmit);
	index.init($(".main-index"), indexModel, mainModel);
	nav.main($(".main-nav"), NavFunctions.onCalendarClicked, NavFunctions.onSchedulerClicked);
	calendar.main($(".main-calendar"), CalendarFunctions.loadFromServer, CalendarFunctions.updateTaskOnServer);

	index.reloadFromServer();

	mainModel.switchToView(View.Index);
}

$(document).ready(main);