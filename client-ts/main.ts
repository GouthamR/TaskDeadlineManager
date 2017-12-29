import * as AddTask from "./add-task"
import * as EditTask from "./edit-task"
import * as AddDeadline from "./add-deadline"
import * as EditDeadline from "./edit-deadline"
import * as index from "./index"
import * as nav from "./nav"
import * as calendar from "./calendar"
import { Task } from "./item";
import { TaskJSONWithoutID } from "./item";
import { TaskJSON } from "./item";
import { TaskSerializer } from "./item";
import { Deadline } from "./item";
import { DeadlineJSONWithoutID } from "./item";
import { DeadlineJSON } from "./item";
import { DeadlineSerializer } from "./item";

// Module-scope variables:
let mainModel: MainModel;
let indexModel: IndexModel;
let addTaskModel: AddTaskModel;

function initAddTask()
{
	AddTask.init($(".main-add-task"), addTaskModel, mainModel);
}

function initAddDeadline()
{
	AddDeadline.init($(".main-add-deadline"), mainModel);
}

export enum View
{
	Index, AddTask, EditTask, AddDeadline, EditDeadline, Calendar
}

interface WindowHistoryState
{
	view: View;
	data?: string;
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

	private switchToView(newView: View, changeURL=true, data?: string): void
	{
		const CLASS_NAME_TO_VIEW_VALUE_MAP = 
		{
			".main-index": View.Index,
			".main-add-task": View.AddTask,
			".main-edit-task": View.EditTask,
			".main-add-deadline": View.AddDeadline,
			".main-edit-deadline": View.EditDeadline,
			".main-calendar": View.Calendar
		};

		for(let className in CLASS_NAME_TO_VIEW_VALUE_MAP)
		{
			let viewValue = CLASS_NAME_TO_VIEW_VALUE_MAP[className];
			this.setVisibility(className, viewValue == newView);
			if(viewValue == newView && changeURL)
			{
				this.pushViewURL(newView, data);
			}
		}
	}

	public switchToIndexView(changeURL=true): void
	{
		this.switchToView(View.Index, changeURL);
		index.reloadFromServer();
	}

	public switchToCalendarView(changeURL=true): void
	{
		this.switchToView(View.Calendar, changeURL);
		calendar.reloadCalendar();
	}

	public switchToAddTaskView(changeURL=true): void
	{
		initAddTask();
		this.switchToView(View.AddTask, changeURL);
	}

	public switchToAddDeadlineView(changeURL=true): void
	{
		initAddDeadline();
		this.switchToView(View.AddDeadline, changeURL);
	}

	// TODO: make more efficient. Currently loads all tasks.
	private getTaskByID(taskID: string, onSuccess: (task: Task) => void, onFailure: (errorDetails: string) => void): void
	{
		function onLoadSuccess(tasks: Task[]): void
		{
			let found = false;
			for(let task of tasks)
			{
				if(task.getID() == taskID)
				{
					onSuccess(task);
					found = true;
				}
			}

			if(!found)
			{
				onFailure("Error: task not found");
			}
		}

		this.loadTasksFromServer(onLoadSuccess, onFailure);
	}

	// TODO: make more efficient. Currently loads all deadlines.
	private getDeadlineByID(deadlineID: string, onSuccess: (deadline: Deadline) => void, onFailure: (errorDetails: string) => void): void
	{
		function onLoadSuccess(deadlines: Deadline[]): void
		{
			let found = false;
			for(let deadline of deadlines)
			{
				if(deadline.getID() == deadlineID)
				{
					onSuccess(deadline);
					found = true;
				}
			}

			if(!found)
			{
				onFailure("Error: deadline not found");
			}
		}

		this.loadDeadlinesFromServer(onLoadSuccess, onFailure);
	}

	// TODO: make more efficient by adding version of this method that takes Task object, for the
	// cases where the caller already loaded it.
	public switchToEditTaskView(taskID: string, changeURL=true): void
	{
		let onSuccess = (task: Task) => 
		{
			this.initEditTask(task);
			this.switchToView(View.EditTask, changeURL, taskID);
		}

		this.getTaskByID(taskID, onSuccess, (e) => alert(e));
	}

	// TODO: make more efficient by adding version of this method that takes Deadline object, for
	// the cases where the caller already loaded it.
	public switchToEditDeadlineView(deadlineID: string, changeURL=true): void
	{
		let onSuccess = (deadline: Deadline) => 
		{
			this.initEditDeadline(deadline);
			this.switchToView(View.EditDeadline, changeURL, deadlineID);
		}

		this.getDeadlineByID(deadlineID, onSuccess, (e) => alert(e));
	}

	private viewToURL(view: View, data?: string): string
	{
		const VIEW_TO_URL_MAP = 
		{
			[View.Index]: "index",
			[View.AddTask]: "add-task",
			[View.EditTask]: "edit-task",
			[View.AddDeadline]: "add-deadline",
			[View.EditDeadline]: "edit-deadline",
			[View.Calendar]: "calendar"
		};
		return "/" + VIEW_TO_URL_MAP[view] + (data ? "/" + data : "");
	}

	public pushViewURL(view: View, data?: string)
	{
		let state: WindowHistoryState = {view: view, data: data};
		window.history.pushState(state, "", this.viewToURL(view, data));
	}

	public replaceViewURL(view: View, data?: string)
	{
		let state: WindowHistoryState = {view: view, data: data};
		window.history.replaceState(state, "", this.viewToURL(view, data));
	}

	public initEditTask(task: Task)
	{
		EditTask.init($(".main-edit-task"), task, mainModel);
	}

	public initEditDeadline(deadline: Deadline)
	{
		EditDeadline.init($(".main-edit-deadline"), deadline, mainModel);
	}

	private loadJSONFromServer(route: string, onSuccess: (data) => void, 
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
		    onSuccess(tasks);
		}

		this.loadJSONFromServer("/load-tasks", onLoadSuccess, onFailure);
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
		    onSuccess(deadlines);
		}

		this.loadJSONFromServer("/load-deadlines", onLoadSuccess, onFailure);
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
			onFailure("Error loading tasks. Try refreshing the page.");
		}

		function onDeadlinesFailure(errorDetails: string)
		{
			onFailure("Error loading deadlines. Try refreshing the page.");
		}

		this.loadTasksFromServer(onTasksLoaded, onTasksFailure);
		this.loadDeadlinesFromServer(onDeadlinesLoaded, onDeadlinesFailure);
	}

	public updateTaskOnServer(updatedTask: Task): void
	{
		let updatedJSON: TaskJSON = new TaskSerializer().toJSON(updatedTask);
		
		$.post("update-task", updatedJSON)
		.done(function(data, textStatus: string, jqXHR: JQueryXHR)
		{
			calendar.reloadCalendar();
		})
		.fail(function(jqXHR: JQueryXHR, textStatus: string, error: string)
		{
			alert("Error: Update Task failed.");
		});
	}

	public addDeadlineToServer(json: DeadlineJSONWithoutID): void
	{
		$.post("add-deadline", json)
		.done(function(data, textStatus: string, jqXHR: JQueryXHR)
		{
			index.reloadFromServer();
		})
		.fail(function(jqXHR: JQueryXHR, textStatus: string, error: string)
		{
			alert("Error: Add Deadline failed.");
		});
	}

	public updateDeadlineOnServer(updatedDeadline: Deadline): void
	{
		let updatedJSON: DeadlineJSON = new DeadlineSerializer().toJSON(updatedDeadline);
		
		$.post("update-deadline", updatedJSON)
		.done(function(data, textStatus: string, jqXHR: JQueryXHR)
		{
			calendar.reloadCalendar();
		})
		.fail(function(jqXHR: JQueryXHR, textStatus: string, error: string)
		{
			alert("Error: Update Deadline failed.");
		});
	}

	public logout()
	{
		$.post('/logout', {}, (data, status, jqXHR) => {
			if(data.success)
			{
                console.log('Logged out successfully');
                window.location.href = '/';
			}
			else
			{
                alert('Error: failed to log out.');
            }
        });
	}
}

export class IndexModel
{
	public removeDeadlineFromServer(deadlineToRemove: Deadline): void
	{
		let json: DeadlineJSON = new DeadlineSerializer().toJSON(deadlineToRemove);

		$.post("delete-deadline", json)
		.fail(function(jqXHR: JQueryXHR, textStatus: string, error: string)
		{
			alert("Error: Remove Deadline failed.");
		});
	}

	public removeTaskFromServer(taskToRemove: Task): void
	{
		let json: TaskJSON = new TaskSerializer().toJSON(taskToRemove);

		$.post("delete-task", json)
		.fail(function(jqXHR: JQueryXHR, textStatus: string, error: string)
		{
			alert("Error: Remove Task failed.");
		});
	}
}

export class AddTaskModel
{
	public addTask(json: TaskJSONWithoutID)
	{
		$.post("add-task", json)
		.done(function(data, textStatus: string, jqXHR: JQueryXHR)
		{
			index.reloadFromServer();
		})
		.fail(function(jqXHR: JQueryXHR, textStatus: string, error: string)
		{
			alert("Error: Add Task failed.");
		});
	}
}

// Note: does not change url.
function switchToViewUsingHistoryState(windowHistoryState: WindowHistoryState): void
{
	if(windowHistoryState.view == View.Index)
	{
		mainModel.switchToIndexView(false);
	}
	else if(windowHistoryState.view == View.AddTask)
	{
		mainModel.switchToAddTaskView(false);
	}
	else if(windowHistoryState.view == View.EditTask)
	{
		mainModel.switchToEditTaskView(windowHistoryState.data, false);
	}
	else if(windowHistoryState.view == View.AddDeadline)
	{
		mainModel.switchToAddDeadlineView(false);
	}
	else if(windowHistoryState.view == View.EditDeadline)
	{
		mainModel.switchToEditDeadlineView(windowHistoryState.data, false);
	}
	else if(windowHistoryState.view == View.Calendar)
	{
		mainModel.switchToCalendarView(false);
	}
}

function main(): void
{
	mainModel = new MainModel();
	indexModel = new IndexModel();
	addTaskModel = new AddTaskModel();

	index.init($(".main-index"), indexModel, mainModel);
	nav.init($(".main-nav"), mainModel);
	calendar.init($(".main-calendar"), mainModel);

	index.reloadFromServer();

	if(window.history.state)
	{
		console.log('has history.state:');
		console.log(window.history.state);
		switchToViewUsingHistoryState(window.history.state as WindowHistoryState);
	}
	else
	{
		console.log('no history state');
		mainModel.switchToIndexView(false);
		mainModel.replaceViewURL(View.Index);
	}

	window.onpopstate = ((e) => switchToViewUsingHistoryState(e.state as WindowHistoryState));
}

$(document).ready(main);