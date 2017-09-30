import * as main from "./main"

// Module-scope variables:
const MOBILE_MAX_WIDTH: number = 768; // pixels
const ANIM_TIME: number = 350; // milliseconds

class Nav
{
    private $navContainer: JQuery;
    private isOpen: boolean;
    private mainModel: main.MainModel;

    public constructor($navContainer: JQuery, mainModel: main.MainModel)
    {
        this.$navContainer = $navContainer;
        this.isOpen = false;
        this.mainModel = mainModel;

        let onPullLinkClicked = (e: JQueryEventObject) => { this.toggleSidebarExpansion(); };
        $navContainer.find(".nav-pull-link").click(onPullLinkClicked);

        let onWindowResize = (e: JQueryEventObject) => { this.toggleSidebarVsHeader(); };
        $(window).resize(onWindowResize);

        $navContainer.find(".nav-calendar-button").click((event: JQueryEventObject) => this.onCalendarClicked(event));
        $navContainer.find(".nav-scheduler-button").click((event: JQueryEventObject) => this.onSchedulerClicked(event));
    }

    private onCalendarClicked(event: JQueryEventObject): void
    {
        this.mainModel.switchToView(main.View.Calendar);
    }

    private onSchedulerClicked(event: JQueryEventObject): void
    {
        this.mainModel.switchToView(main.View.Index);
    }

    private toggleSidebarExpansion(): void
    {
        let $nav: JQuery = this.$navContainer.find("nav");

        let animDirection: string = this.isOpen ? "-" : "+";
        $nav.animate({ left: (animDirection + '=' + $nav.width()) }, ANIM_TIME);
        this.isOpen = !this.isOpen;
    }

    private toggleSidebarVsHeader(): void
    {
        let $nav: JQuery = this.$navContainer.find("nav");

        let switchToTop: boolean = $(window).width() > MOBILE_MAX_WIDTH;
        if (switchToTop && $nav.position().left < 0)
        {
            this.isOpen = true;
            $nav.css({ left: 0 }); // horizontally center nav (in case collapsed in mobile view)
        }
        else if (!switchToTop) // switch to sidebar
        {
            // hide nav:
            this.isOpen = false;
            $nav.css({ left: -$nav.width() });
        }
    }
}

export function init($targetContainer: JQuery, mainModel: main.MainModel): void
{
    let $navContainer: JQuery = $targetContainer.find(".nav");
    let nav: Nav = new Nav($navContainer, mainModel);
}