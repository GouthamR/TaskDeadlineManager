import * as AddTask from "./add-task"
import * as index from "./index"
import * as nav from "./nav"

function main(): void
{
	AddTask.main();
	index.main();
	nav.main();
}

$(document).ready(main);