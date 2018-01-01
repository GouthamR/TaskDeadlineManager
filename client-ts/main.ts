import * as AddTask from "./add-task";
import * as EditTask from "./edit-task";
import * as AddDeadline from "./add-deadline";
import * as EditDeadline from "./edit-deadline";
import * as index from "./index";
import * as nav from "./nav";
import * as calendar from "./calendar";
import * as viewSwitcher from "./view-switcher";
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

export class MainModel
{
	public initAddTask()
	{
		AddTask.init($(".main-add-task"), addTaskModel, mainModel);
	}

	public initAddDeadline()
	{
		AddDeadline.init($(".main-add-deadline"), mainModel);
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

	public loadTasksFromServer(onSuccess: (tasks: Task[]) => void, 
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

	public loadDeadlinesFromServer(onSuccess: (deadlines: Deadline[]) => void, 
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
		
		$.post("/update-task", updatedJSON)
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
		$.post("/add-deadline", json)
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
		
		$.post("/update-deadline", updatedJSON)
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

		$.post("/delete-deadline", json)
		.fail(function(jqXHR: JQueryXHR, textStatus: string, error: string)
		{
			alert("Error: Remove Deadline failed.");
		});
	}

	public removeTaskFromServer(taskToRemove: Task): void
	{
		let json: TaskJSON = new TaskSerializer().toJSON(taskToRemove);

		$.post("/delete-task", json)
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
		$.post("/add-task", json)
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

function main(): void
{
	mainModel = new MainModel();
	indexModel = new IndexModel();
	addTaskModel = new AddTaskModel();

	index.init($(".main-index"), indexModel, mainModel);
	nav.init($(".main-nav"), mainModel);
	calendar.init($(".main-calendar"), mainModel);

	index.reloadFromServer();

	viewSwitcher.init(mainModel);
}

$(document).ready(main);