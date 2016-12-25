// Module-scope variables:
const MOBILE_MAX_WIDTH: number = 768; // pixels
const ANIM_TIME: number = 350; // milliseconds

class Nav
{
    private $navContainer: JQuery;
    private isOpen: boolean;

    public constructor($navContainer: JQuery, onCalendarClicked: (event: JQueryEventObject) => void)
    {
        this.$navContainer = $navContainer;
        this.isOpen = false;

        let onPullLinkClicked = (e: JQueryEventObject) => { this.toggleSidebarExpansion(); };
        $navContainer.find(".nav-pull-link").click(onPullLinkClicked);

        let onWindowResize = (e: JQueryEventObject) => { this.toggleSidebarVsHeader(); };
        $(window).resize(onWindowResize);

        $navContainer.find(".nav-calendar-button").click(onCalendarClicked);
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

export function main($targetContainer: JQuery, onCalendarClicked: (event: JQueryEventObject) => void): void
{
    let $navContainer: JQuery = $targetContainer.find(".nav");
    let nav: Nav = new Nav($navContainer, onCalendarClicked);
}