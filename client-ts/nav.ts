/// <reference path="jquery.d.ts" />

export function main(): void
{
    "use strict";

    const MOBILE_MAX_WIDTH: number = 768; // pixels
    const ANIM_TIME: number = 350; // milliseconds

    let isOpen: boolean = false;

    $("#pull").on("click", function (event: JQueryEventObject)
    {
        let animDirection: string = isOpen ? "-" : "+";
        $("nav").animate({ left: (animDirection + '=' + $("nav").width()) }, ANIM_TIME);
        isOpen = !isOpen;
    });

    $(window).resize(function (event: JQueryEventObject)
    {
        let switchToTop: boolean = $(window).width() > MOBILE_MAX_WIDTH;
        if (switchToTop && $("nav").position().left < 0)
        {
            isOpen = true;
            $("nav").css({ left: 0 }); // horizontally center nav (in case collapsed in mobile view)
        }
        else if (!switchToTop) // switch to sidebar
        {
            // hide nav:
            isOpen = false;
            $("nav").css({ left: -$("nav").width() });
        }
    });
}