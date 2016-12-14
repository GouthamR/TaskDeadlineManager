(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}]},{},[1]);
