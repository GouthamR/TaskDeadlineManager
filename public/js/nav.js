/// <reference path="jquery.d.ts" />
var nav;
(function (nav) {
    function main() {
        "use strict";
        var MOBILE_MAX_WIDTH = 768; // pixels
        var ANIM_TIME = 350; // milliseconds
        var isOpen = false;
        $("#pull").on("click", function (event) {
            var animDirection = isOpen ? "-" : "+";
            $("nav").animate({ left: (animDirection + '=' + $("nav").width()) }, ANIM_TIME);
            isOpen = !isOpen;
        });
        $(window).resize(function (event) {
            var switchToTop = $(window).width() > MOBILE_MAX_WIDTH;
            if (switchToTop && $("nav").position().left < 0) {
                isOpen = true;
                $("nav").css({ left: 0 }); // horizontally center nav (in case collapsed in mobile view)
            }
            else if (!switchToTop) {
                // hide nav:
                isOpen = false;
                $("nav").css({ left: -$("nav").width() });
            }
        });
    }
    nav.main = main;
})(nav || (nav = {}));
$(document).ready(nav.main);
