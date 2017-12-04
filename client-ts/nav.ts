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

        $navContainer.find(".nav-pull-link").click((e: JQueryEventObject) => this.toggleSidebarExpansion());

        $(window).resize((e: JQueryEventObject) => this.toggleSidebarVsHeader());

        $navContainer.find(".nav-grtdm-button").click((e: JQueryEventObject) =>
        {
            this.navButtonPreAction();
            this.mainModel.switchToView(main.View.Index);
        });
        $navContainer.find(".nav-add-task-button").click((e: JQueryEventObject) =>
        {
            this.navButtonPreAction();
            this.mainModel.switchToView(main.View.AddTask);
        });
        $navContainer.find(".nav-add-deadline-button").click((e: JQueryEventObject) =>
        {
            this.navButtonPreAction();
            this.mainModel.switchToView(main.View.AddDeadline);
        });
        $navContainer.find(".nav-calendar-button").click((e: JQueryEventObject) =>
        {
            this.navButtonPreAction();
            this.mainModel.switchToView(main.View.Calendar);
        });
        $navContainer.find(".nav-logout-button").click((e: JQueryEventObject) =>
        {
            this.navButtonPreAction();
            this.mainModel.logout();
        });
    }

    private navButtonPreAction()
    {
        if(!this.isDesktopWindowSize())
        {
            this.toggleSidebarExpansion();
        }
    }

    private isDesktopWindowSize(): boolean
    {
        return $(window).width() > MOBILE_MAX_WIDTH;
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

        let switchToTop: boolean = this.isDesktopWindowSize();
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