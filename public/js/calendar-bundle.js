(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/// <reference path="jquery.d.ts"/>
/// <reference path="fullCalendar.d.ts"/>
var calendar;
(function (calendar) {
    function initFullCalendar() {
        $('#calendar').fullCalendar({
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'month,basicWeek,agendaDay'
            },
            defaultDate: '2016-09-12',
            navLinks: true,
            editable: true,
            events: [
                {
                    title: 'All Day Event',
                    start: '2016-09-01'
                },
                {
                    title: 'All Day Event',
                    start: '2016-09-01'
                },
                {
                    title: 'All Day Event',
                    start: '2016-09-01'
                },
                {
                    title: 'All Day Event',
                    start: '2016-09-01'
                },
                {
                    title: 'All Day Event',
                    start: '2016-09-01'
                },
                {
                    title: 'All Day Event',
                    start: '2016-09-01'
                },
                {
                    title: 'All Day Event',
                    start: '2016-09-01'
                },
                {
                    title: 'All Day Event',
                    start: '2016-09-01'
                },
                {
                    title: 'All Day Event',
                    start: '2016-09-01'
                },
                {
                    title: 'All Day Event',
                    start: '2016-09-01'
                },
                {
                    title: 'All Day Event',
                    start: '2016-09-01'
                },
                {
                    title: 'All Day Event',
                    start: '2016-09-01'
                },
                {
                    title: 'All Day Event',
                    start: '2016-09-01'
                },
                {
                    title: 'Long Event',
                    start: '2016-09-07',
                    end: '2016-09-10'
                },
                {
                    id: 999,
                    title: 'Repeating Event',
                    start: '2016-09-09T16:00:00'
                },
                {
                    id: 999,
                    title: 'Repeating Event',
                    start: '2016-09-16T16:00:00'
                },
                {
                    title: 'Conference',
                    start: '2016-09-11',
                    end: '2016-09-13'
                },
                {
                    title: 'Meeting',
                    start: '2016-09-12T10:30:00',
                    end: '2016-09-12T12:30:00'
                }
            ]
        });
    }
    function main() {
        initFullCalendar();
        $(".loading").remove();
    }
    calendar.main = main;
})(calendar || (calendar = {}));
$(document).ready(calendar.main);

},{}]},{},[1]);
