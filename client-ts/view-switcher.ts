import * as main from "./main"
import * as index from "./index"
import * as calendar from "./calendar"
import { Task, Deadline } from "./item";
import { MainModel } from "./main";

enum View
{
	Index, AddTask, EditTask, AddDeadline, EditDeadline, Calendar
}

interface WindowHistoryState
{
	view: View;
	data?: string;
}

const VIEW_TO_URL_MAP = 
{
	[View.Index]: "index",
	[View.AddTask]: "add-task",
	[View.EditTask]: "edit-task",
	[View.AddDeadline]: "add-deadline",
	[View.EditDeadline]: "edit-deadline",
	[View.Calendar]: "calendar"
};

class ViewSwitcher
{
    public constructor(private mainModel: MainModel)
    {
    }

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

    private switchToView(newView: View, changeURL: boolean, data?: string): void
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
		const MAIN_LOADING_CLASS_NAME = ".main-loading";

		this.setVisibility(MAIN_LOADING_CLASS_NAME, false);

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

	public switchToIndexView(changeURL: boolean): void
	{
		this.switchToView(View.Index, changeURL);
		index.reloadFromServer();
	}

	public switchToCalendarView(changeURL: boolean): void
	{
		this.switchToView(View.Calendar, changeURL);
		calendar.reloadCalendar();
	}

	public switchToAddTaskView(changeURL: boolean): void
	{
		this.mainModel.initAddTask();
		this.switchToView(View.AddTask, changeURL);
	}

	public switchToAddDeadlineView(changeURL: boolean): void
	{
		this.mainModel.initAddDeadline();
		this.switchToView(View.AddDeadline, changeURL);
    }
    
    // TODO: make more efficient by adding version of this method that takes Task object, for the
	// cases where the caller already loaded it.
	public switchToEditTaskView(taskID: string, changeURL: boolean): void
	{
		let onSuccess = (task: Task) => 
		{
			this.mainModel.initEditTask(task);
			this.switchToView(View.EditTask, changeURL, taskID);
		}

		this.getTaskByID(taskID, onSuccess, (e) => alert(e));
	}

	// TODO: make more efficient by adding version of this method that takes Deadline object, for
	// the cases where the caller already loaded it.
	public switchToEditDeadlineView(deadlineID: string, changeURL: boolean): void
	{
		let onSuccess = (deadline: Deadline) => 
		{
			this.mainModel.initEditDeadline(deadline);
			this.switchToView(View.EditDeadline, changeURL, deadlineID);
		}

		this.getDeadlineByID(deadlineID, onSuccess, (e) => alert(e));
	}

	// TODO: make more efficient. Currently loads all tasks.
	private getTaskByID(taskID: string, onSuccess: (task: Task) => void, onFailure: (errorDetails: string) => void): void
	{
		let onLoadSuccess = (tasks: Task[]) =>
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
		};

		this.mainModel.loadTasks(onLoadSuccess, onFailure);
	}

	// TODO: make more efficient. Currently loads all deadlines.
	private getDeadlineByID(deadlineID: string, onSuccess: (deadline: Deadline) => void, onFailure: (errorDetails: string) => void): void
	{
		let onLoadSuccess = (deadlines: Deadline[]) =>
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
		};

		this.mainModel.loadDeadlines(onLoadSuccess, onFailure);
	}

	private viewToURL(view: View, data?: string): string
	{
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

    // Note: does not change url.
    public switchToViewUsingHistoryState(windowHistoryState: WindowHistoryState): void
    {
        if(windowHistoryState.view == View.Index)
        {
            this.switchToIndexView(false);
        }
        else if(windowHistoryState.view == View.AddTask)
        {
            this.switchToAddTaskView(false);
        }
        else if(windowHistoryState.view == View.EditTask)
        {
            this.switchToEditTaskView(windowHistoryState.data, false);
        }
        else if(windowHistoryState.view == View.AddDeadline)
        {
            this.switchToAddDeadlineView(false);
        }
        else if(windowHistoryState.view == View.EditDeadline)
        {
            this.switchToEditDeadlineView(windowHistoryState.data, false);
        }
        else if(windowHistoryState.view == View.Calendar)
        {
            this.switchToCalendarView(false);
        }
    }
}

// Module-scope variables:
let viewSwitcher: ViewSwitcher;

function parseWindowHistoryStateFromURLPathname(pathname: string): WindowHistoryState
{
	let pathnameGetSuffix = (routeName: string) => 
	{
		// Roughly equivalent to pathname.startsWith . See https://stackoverflow.com/a/4579228
		let pathnameStartsWith = (other: string) => 
		{
			return pathname.lastIndexOf(other, 0) == 0;
		};

		let routeWithSlashes = "/" + routeName + "/";
		if(pathnameStartsWith(routeWithSlashes))
		{
			let suffix = pathname.substring(routeWithSlashes.length);
			if(suffix != "")
			{
				return suffix;
			}
		}

		return undefined;
	};

	let pathnameMatches = (routeName: string) => 
	{
		return pathname == ("/" + routeName);
	};

	if(pathnameMatches(VIEW_TO_URL_MAP[View.AddTask]))
	{
		return {view: View.AddTask};
	}

	let taskID = pathnameGetSuffix(VIEW_TO_URL_MAP[View.EditTask]);
	if(taskID)
	{
		return {view: View.EditTask, data: taskID};
	}
	
	if(pathnameMatches(VIEW_TO_URL_MAP[View.AddDeadline]))
	{
		return {view: View.AddDeadline};
	}
	
	let deadlineID = pathnameGetSuffix(VIEW_TO_URL_MAP[View.EditDeadline]);
	if(deadlineID)
	{
		return {view: View.EditDeadline, data: deadlineID};
	}

	if(pathnameMatches(VIEW_TO_URL_MAP[View.Calendar]))
	{
		return {view: View.Calendar};
	}

	// If index path, or not matching any of the known paths, go to index:
	return {view: View.Index};
}

export function switchToIndexView(): void
{
    viewSwitcher.switchToIndexView(true);
}

export function switchToCalendarView(): void
{
    viewSwitcher.switchToCalendarView(true);
}

export function switchToAddTaskView(): void
{
    viewSwitcher.switchToAddTaskView(true);
}

export function switchToAddDeadlineView(): void
{
    viewSwitcher.switchToAddDeadlineView(true);
}

export function switchToEditTaskView(taskID: string): void
{
    viewSwitcher.switchToEditTaskView(taskID, true);
}

export function switchToEditDeadlineView(deadlineID: string): void
{
    viewSwitcher.switchToEditDeadlineView(deadlineID, true);
}

export function init(mainModel: main.MainModel): void
{
    viewSwitcher = new ViewSwitcher(mainModel);

    if(window.history.state)
	{
		console.log('has history.state:');
		console.log(window.history.state);
		viewSwitcher.switchToViewUsingHistoryState(window.history.state as WindowHistoryState);
	}
	else
	{
		console.log('no history state');
		let windowHistoryState = parseWindowHistoryStateFromURLPathname(window.location.pathname);
		viewSwitcher.switchToViewUsingHistoryState(windowHistoryState);
		viewSwitcher.replaceViewURL(windowHistoryState.view, windowHistoryState.data);
	}

	window.onpopstate = ((e) => viewSwitcher.switchToViewUsingHistoryState(e.state as WindowHistoryState));
}