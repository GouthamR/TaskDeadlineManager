import * as AddTask from "./add-task"
import * as index from "./index"
import * as nav from "./nav"

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

function onAddTaskSubmit(event: JQueryEventObject)
{
    switchToView(View.Index);

    AddTask.processForm(event);
}

function main(): void
{
	switchToView(View.Index);

	AddTask.main($(".main-add-task"), onAddTaskSubmit);
	index.main($(".main-index"), onIndexAddTaskClicked);
	nav.main($(".main-nav"));
}

$(document).ready(main);