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

export class MainModel
{
	// Value of undefined indicates that needs to be updated from server:
	private cachedTasks: Task[];
	private cachedDeadlines: Deadline[];

	public constructor()
	{
		this.cachedTasks = undefined;
		this.cachedDeadlines = undefined;
	}

	public initAddTask()
	{
		AddTask.init($(".main-add-task"), mainModel);
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
	    .done((data, textStatus: string, jqXHR: JQueryXHR) => onSuccess(data))
	    .fail((jqXHR: JQueryXHR, textStatus: string, error: string) => onFailure(textStatus + ", " + error));
	}

	public loadTasks(onSuccess: (tasks: Task[]) => void, 
						onFailure: (errorDetails: string) => void): void
	{
		if(this.cachedTasks)
		{
			onSuccess(this.cachedTasks);
		}
		else
		{
			let onLoadSuccess = (data) =>
			{
				let tasks: Task[] = [];
				let taskSerializer: TaskSerializer = new TaskSerializer();
				for(let i of data)
				{
					let taskJson: TaskJSON = i as TaskJSON;
					let task: Task = taskSerializer.fromJSON(taskJson);
					tasks.push(task);
				}
				this.cachedTasks = tasks;
				onSuccess(tasks);
			}

			this.loadJSONFromServer("/load-tasks", onLoadSuccess, onFailure);
		}
	}

	public loadDeadlines(onSuccess: (deadlines: Deadline[]) => void, 
							onFailure: (errorDetails: string) => void): void
	{
		if(this.cachedDeadlines)
		{
			onSuccess(this.cachedDeadlines);
		}
		else
		{
			let onLoadSuccess = (data) =>
			{
				let deadlines: Deadline[] = [];
				let deadlineSerializer: DeadlineSerializer = new DeadlineSerializer();
				for(let i of data)
				{
					deadlines.push(deadlineSerializer.fromJSON(i));
				}
				this.cachedDeadlines = deadlines;
				onSuccess(deadlines);
			}

			this.loadJSONFromServer("/load-deadlines", onLoadSuccess, onFailure);
		}
	}

	public loadTasksAndDeadlinesFromServer(onSuccess: (tasks: Task[], deadlines: Deadline[]) => any,
												onFailure: (error: string) => any): void
	{
		let isTasksLoaded: boolean = false;
		let isDeadlinesLoaded: boolean = false;

		let tasks: Task[] = [];
		let deadlines: Deadline[] = [];

		let onTasksLoaded = (loadedTasks: Task[]) =>
		{
			tasks = loadedTasks;
			isTasksLoaded = true;

			if(isDeadlinesLoaded)
			{
				onSuccess(tasks, deadlines);
			}
		};

		let onDeadlinesLoaded = (loadedDeadlines: Deadline[]) =>
		{
			deadlines = loadedDeadlines;
			isDeadlinesLoaded = true;

			if(isTasksLoaded)
			{
				onSuccess(tasks, deadlines);
			}
		};

		let onTasksFailure = (errorDetails: string) => onFailure("Error loading tasks. Try refreshing the page.");

		let onDeadlinesFailure = (errorDetails: string) => onFailure("Error loading deadlines. Try refreshing the page.");

		this.loadTasks(onTasksLoaded, onTasksFailure);
		this.loadDeadlines(onDeadlinesLoaded, onDeadlinesFailure);
	}

	public addTaskToServer(json: TaskJSONWithoutID)
	{
		$.post("/add-task", json)
		.done((data, textStatus: string, jqXHR: JQueryXHR) => index.reloadFromServer())
		.fail((jqXHR: JQueryXHR, textStatus: string, error: string) => alert("Error: Add Task failed."));
		
		this.cachedTasks = undefined;
	}

	public updateTaskOnServer(updatedTask: Task): void
	{
		let updatedJSON: TaskJSON = new TaskSerializer().toJSON(updatedTask);
		
		$.post("/update-task", updatedJSON)
		.done((data, textStatus: string, jqXHR: JQueryXHR) => calendar.reloadCalendar())
		.fail((jqXHR: JQueryXHR, textStatus: string, error: string) => alert("Error: Update Task failed."));

		this.cachedTasks = undefined;
	}

	public removeTaskFromServer(taskToRemove: Task): void
	{
		let json: TaskJSON = new TaskSerializer().toJSON(taskToRemove);

		$.post("/delete-task", json)
		.fail((jqXHR: JQueryXHR, textStatus: string, error: string) => alert("Error: Remove Task failed."));
		
		this.cachedTasks = undefined;
	}

	public addDeadlineToServer(json: DeadlineJSONWithoutID): void
	{
		$.post("/add-deadline", json)
		.done((data, textStatus: string, jqXHR: JQueryXHR) => index.reloadFromServer())
		.fail((jqXHR: JQueryXHR, textStatus: string, error: string) => alert("Error: Add Deadline failed."));
		
		this.cachedDeadlines = undefined;
	}

	public updateDeadlineOnServer(updatedDeadline: Deadline): void
	{
		let updatedJSON: DeadlineJSON = new DeadlineSerializer().toJSON(updatedDeadline);
		
		$.post("/update-deadline", updatedJSON)
		.done((data, textStatus: string, jqXHR: JQueryXHR) => calendar.reloadCalendar())
		.fail((jqXHR: JQueryXHR, textStatus: string, error: string) => alert("Error: Update Deadline failed."));
		
		this.cachedDeadlines = undefined;
	}

	public removeDeadlineFromServer(deadlineToRemove: Deadline): void
	{
		let json: DeadlineJSON = new DeadlineSerializer().toJSON(deadlineToRemove);

		$.post("/delete-deadline", json)
		.fail((jqXHR: JQueryXHR, textStatus: string, error: string) => alert("Error: Remove Deadline failed."));

		this.cachedDeadlines = undefined;
	}

	public logout()
	{
		$.post('/logout', {}, (data, status, jqXHR) =>
		{
			if(data.success)
			{
                window.location.href = '/';
			}
			else
			{
                alert('Error: failed to log out.');
            }
        });
	}
}

function main(): void
{
	mainModel = new MainModel();

	index.init($(".main-index"), mainModel);
	nav.init($(".main-nav"), mainModel);
	calendar.init($(".main-calendar"), mainModel);

	index.reloadFromServer();

	viewSwitcher.init(mainModel);
}

$(document).ready(main);