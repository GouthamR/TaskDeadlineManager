(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";var flatpickr=function e(t,n){var a=void 0,i=void 0,r=function(t){return t._flatpickr&&t._flatpickr.destroy(),t._flatpickr=new e.init(t,n),t._flatpickr};return t.nodeName?r(t):/^\#[a-zA-Z0-9\-\_]*$/.test(t)?r(document.getElementById(t.slice(1))):(a=/^\.[a-zA-Z0-9\-\_]*$/.test(t)?document.getElementsByClassName(t.slice(1)):document.querySelectorAll(t),i=[].slice.call(a).map(r),{calendars:i,byID:function(e){for(var t=0;t<i.length;t++)if(i[t].element.id===e)return i[t]}})};flatpickr.init=function(e,t){var n=function(e,t,n){var a=document.createElement(e);return n&&(a.innerHTML=n),t&&(a.className=t),a};function a(e,t){var n=!1;return function(){n||(e.call(),n=!0,setTimeout(function(){n=!1},t))}}var i,r,o,l,c,u,s,d,p,f,g,m,h,v,D,b,y,k,w,M,L,C,O,j,E,I,T,S,H,_,Y,x,N,F,A,q,W,B,J,P,U,z=this,$=new Date;i=function(){t=t||{},z.config={},z.element=e;for(var n in z.defaultConfig)z.config[n]=t[n]||z.element.dataset&&z.element.dataset[n.toLowerCase()]||z.element.getAttribute("data-"+n)||z.defaultConfig[n];z.input=z.config.wrap?e.querySelector("[data-input]"):e,z.input.classList.add("flatpickr-input"),z.config.defaultDate&&(z.config.defaultDate=o(z.config.defaultDate)),(z.input.value||z.config.defaultDate)&&(z.selectedDateObj=o(z.config.defaultDate||z.input.value)),r(),g(),E(),z.uDate=o,z.jumpToDate(),y()},j=function(){var e=void 0,t=void 0;do e=Math.round(Math.random()*Math.pow(10,10)),t="flatpickr-"+e;while(null!==document.getElementById(t));return t},o=function(e,t){if(t=t||!1,"today"===e)e=new Date,t=!0;else if("string"==typeof e)if(e=e.trim(),z.config.parseDate)e=z.config.parseDate(e);else if(Date.parse(e))e=new Date(e);else if(/^\d\d\d\d\-\d\d\-\d\d/.test(e))e=new Date(e.replace(/(\d)-(\d)/g,"$1/$2"));else if(/^(\d?\d):(\d\d)/.test(e)){var n=e.match(/(\d?\d):(\d\d)/);e=new Date,e.setHours(n[1],n[2],0,0)}else console.error("flatpickr: invalid date string "+e),console.info(z.element);return t&&e&&e.setHours(0,0,0,0),"true"===String(z.config.utc)&&e&&!e.fp_isUTC&&(e=e.fp_toUTC()),e},l=function(e,t){return e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()&&e.getDate()===t.getDate()},r=function(){q=n("div","flatpickr-wrapper"),z.config.inline||z.config["static"]?(z.element.parentNode.insertBefore(q,z.element),q.appendChild(z.element),q.classList.add(z.config.inline?"inline":"static")):document.body.appendChild(q),z.config.altInput&&(z.altInput=n(z.input.nodeName,z.config.altInputClass+" flatpickr-input"),z.altInput.placeholder=z.input.placeholder,z.altInput.type="text",z.input.type="hidden",z.input.parentNode.insertBefore(z.altInput,z.input.nextSibling))},L=function(e){var t=z.currentYear,n=e||z.currentMonth;return 1===n&&t%4===0&&t%100!==0||t%400===0?29:z.l10n.daysInMonth[n]},y=function(){var e=void 0;if(z.selectedDateObj&&z.config.enableTime){e=z.selectedDateObj.getTime();var t,n=parseInt(W.value,10),a=(60+parseInt(B.value,10))%60;z.config.enableSeconds&&(t=(60+parseInt(J.value,10))%60),z.config.time_24hr||(n=n%12+12*("PM"===P.innerHTML)),z.selectedDateObj.setHours(n,a,t||z.selectedDateObj.getSeconds()),W.value=c(z.config.time_24hr?n:(12+n)%12+12*(n%12===0)),B.value=c(a),t&&(J.value=c(t))}z.altInput&&z.selectedDateObj&&(z.altInput.value=u(z.config.altFormat)),z.selectedDateObj&&(z.input.value=u(z.config.dateFormat)),e&&z.selectedDateObj.getTime()!==e&&I()},c=function(e){return("0"+e).slice(-2)},u=function(e){z.config.noCalendar&&(e=""),z.config.enableTime&&(e+=" "+z.config.timeFormat);for(var t="",n={D:function(){return z.l10n.weekdays.shorthand[n.w()]},F:function(){return s(n.n()-1,!1)},H:function(){return c(z.selectedDateObj.getHours())},J:function(){return n.j()+z.l10n.ordinal(n.j())},K:function(){return z.selectedDateObj.getHours()>11?"PM":"AM"},M:function(){return s(n.n()-1,!0)},S:function(){return c(z.selectedDateObj.getSeconds())},U:function(){return z.selectedDateObj.getTime()/1e3},Y:function(){return z.selectedDateObj.getFullYear()},d:function(){return c(n.j())},h:function(){return z.selectedDateObj.getHours()%12?z.selectedDateObj.getHours()%12:12},i:function(){return c(z.selectedDateObj.getMinutes())},j:function(){return z.selectedDateObj.getDate()},l:function(){return z.l10n.weekdays.longhand[n.w()]},m:function(){return c(n.n())},n:function(){return z.selectedDateObj.getMonth()+1},s:function(){return z.selectedDateObj.getSeconds()},w:function(){return z.selectedDateObj.getDay()},y:function(){return String(n.Y()).substring(2)}},a=e.split(""),i=0;i<a.length;i++){var r=a[i];n[r]&&"\\"!==a[i-1]?t+=n[r]():"\\"!==r&&(t+=r)}return t},s=function(e,t){return t||z.config.shorthandCurrentMonth?z.l10n.months.shorthand[e]:z.l10n.months.longhand[e]},d=function(e){e=o(e,!0);for(var t=void 0,n=0;n<z.config.disable.length;n++){if(t=z.config.disable[n],t instanceof Date||"string"==typeof t)return o(t,!0).getTime()==e.getTime();if(e>=o(t.from)&&e<=o(t.to))return!0}return!1},b=function(e){e.preventDefault();var t=Math.max(-1,Math.min(1,e.wheelDelta||-e.deltaY));z.currentYear=e.target.value=parseInt(e.target.value,10)+t,z.redraw()},D=function(e){e.preventDefault();var t=parseInt(e.target.min,10),n=parseInt(e.target.max,10),a=parseInt(e.target.step,10),i=a*Math.max(-1,Math.min(1,e.wheelDelta||-e.deltaY)),r=(parseInt(e.target.value,10)+i)%(n+(0===t));r<t&&(r=n+(0===t)-a*(0===t)),e.target.value=c(r)},k=function(){x.innerHTML=s(z.currentMonth)+" ",Y.value=z.currentYear},w=function(){(z.currentMonth<0||z.currentMonth>11)&&(z.currentYear+=z.currentMonth%11,z.currentMonth=(z.currentMonth+12)%12)},C=function(e){q.classList.contains("open")&&!q.contains(e.target)&&e.target!==z.element&&e.target!==z.altInput&&z.close()},M=function(e){z.currentMonth+=e,w(),k(),m()},O=function(e){e.preventDefault(),e.target.classList.contains("slot")&&(z.selectedDateObj=new Date(z.currentYear,z.currentMonth,e.target.innerHTML),y(),I(),m(),z.config.inline||z.config.enableTime||z.close())},g=function(){T=n("div","flatpickr-calendar"),T.id=j(),F=n("div","flatpickr-days"),z.config.noCalendar||(p(),f(),z.config.weekNumbers&&h(),m(),T.appendChild(F)),q.appendChild(T),z.config.enableTime&&v()},p=function(){H=n("div","flatpickr-month"),_=n("span","flatpickr-prev-month",z.config.prevArrow),x=n("span","cur_month"),Y=n("input","cur_year"),Y.type="number",Y.title="Scroll to increment",N=n("span","flatpickr-next-month",z.config.nextArrow),S=n("span","flatpickr-current-month"),S.appendChild(x),S.appendChild(Y),H.appendChild(_),H.appendChild(S),H.appendChild(N),k(),T.appendChild(H)},f=function(){var e=n("div","flatpickr-weekdays"),t=z.l10n.firstDayOfWeek,a=z.l10n.weekdays.shorthand.slice();t>0&&t<a.length&&(a=[].concat(a.splice(t,a.length),a.splice(0,t))),e.innerHTML=z.config.weekNumbers?"<span>Wk</span>":"",e.innerHTML+="<span>"+a.join("</span><span>")+"</span>",T.appendChild(e)},h=function(){T.classList.add("hasWeeks"),A=n("div","flatpickr-weeks"),T.appendChild(A)},m=function(){var e=(new Date(z.currentYear,z.currentMonth,1).getDay()-z.l10n.firstDayOfWeek+7)%7,t=L(),a=L((z.currentMonth-1+12)%12),i=a+1-e,r=void 0,c=void 0,u=void 0,s=void 0;for(z.config.weekNumbers&&A&&(A.innerHTML=""),F.innerHTML="",z.config.minDate=o(z.config.minDate,!0),z.config.maxDate=o(z.config.maxDate,!0);i<=a;i++)F.appendChild(n("span","disabled flatpickr-day",i));for(i=1;i<=42-e;i++)(i<=t||i%7===1)&&(c=new Date(z.currentYear,z.currentMonth,i,0,0,0,0)),z.config.weekNumbers&&A&&i%7===1&&A.appendChild(n("span","disabled flatpickr-day",c.fp_getWeek())),s=z.config.minDate&&c<z.config.minDate||z.config.maxDate&&c>z.config.maxDate,u=i>t||s||d(c),r=u?"disabled flatpickr-day":"slot flatpickr-day",!u&&l(c,$)&&(r+=" today"),!u&&z.selectedDateObj&&l(c,z.selectedDateObj)&&(r+=" selected"),F.appendChild(n("span",r,i>t?i%t:i))},v=function(){var e=n("div","flatpickr-time"),t=n("span","flatpickr-time-separator",":");W=n("input","flatpickr-hour"),B=n("input","flatpickr-minute"),W.type=B.type="number",W.value=z.selectedDateObj?c(z.selectedDateObj.getHours()):12,B.value=z.selectedDateObj?c(z.selectedDateObj.getMinutes()):"00",W.step=z.config.hourIncrement,B.step=z.config.minuteIncrement,W.min=+!z.config.time_24hr,W.max=z.config.time_24hr?23:12,B.min=0,B.max=59,W.title=B.title="Scroll to increment",e.appendChild(W),e.appendChild(t),e.appendChild(B),z.config.enableSeconds&&(e.classList.add("has-seconds"),J=n("input","flatpickr-second"),J.type="number",J.value=z.selectedDateObj?c(z.selectedDateObj.getSeconds()):"00",J.step=5,J.min=0,J.max=59,e.appendChild(n("span","flatpickr-time-separator",":")),e.appendChild(J)),z.config.time_24hr||(P=n("span","flatpickr-am-pm",["AM","PM"][W.value>11|0]),P.title="Click to toggle",e.appendChild(P)),z.config.noCalendar&&!z.selectedDateObj&&(z.selectedDateObj=new Date),T.appendChild(e)},E=function(){function e(e){e.preventDefault(),P.innerHTML=["AM","PM"]["AM"===P.innerHTML|0]}"true"===String(z.config.clickOpens)&&(z.input.addEventListener("focus",z.open),z.altInput&&z.altInput.addEventListener("focus",z.open)),z.config.wrap&&z.element.querySelector("[data-open]")&&z.element.querySelector("[data-open]").addEventListener("click",z.open),z.config.wrap&&z.element.querySelector("[data-close]")&&z.element.querySelector("[data-close]").addEventListener("click",z.close),z.config.wrap&&z.element.querySelector("[data-toggle]")&&z.element.querySelector("[data-toggle]").addEventListener("click",z.toggle),z.config.wrap&&z.element.querySelector("[data-clear]")&&z.element.querySelector("[data-clear]").addEventListener("click",z.clear),z.config.noCalendar||(_.addEventListener("click",function(){M(-1)}),N.addEventListener("click",function(){M(1)}),Y.addEventListener("wheel",b),Y.addEventListener("focus",Y.select),Y.addEventListener("input",function(e){Y.blur(),z.currentYear=parseInt(e.target.value,10),z.redraw()}),F.addEventListener("click",O)),document.addEventListener("click",C,!0),document.addEventListener("focus",C,!0),z.config.enableTime&&(W.addEventListener("wheel",D),B.addEventListener("wheel",D),W.addEventListener("mouseout",y),B.addEventListener("mouseout",y),W.addEventListener("change",y),B.addEventListener("change",y),W.addEventListener("click",W.select),B.addEventListener("click",B.select),z.config.enableSeconds&&(J.addEventListener("wheel",D),J.addEventListener("mouseout",y),J.addEventListener("change",y),J.addEventListener("click",J.select)),z.config.time_24hr||(P.addEventListener("focus",P.blur),P.addEventListener("click",e),P.addEventListener("wheel",e),P.addEventListener("mouseout",y))),document.createEvent?(U=document.createEvent("MouseEvent"),U.initMouseEvent("click",!0,!0,window,0,0,0,0,0,!1,!1,!1,!1,0,null)):U=new MouseEvent("click",{view:window,bubbles:!0,cancelable:!0}),window.addEventListener("resize",a(function(){!q.classList.contains("open")||z.input.disabled||z.config.inline||z.config["static"]||z.positionCalendar()},150))},z.open=function(){z.input.disabled||z.config.inline||(z.config["static"]||z.positionCalendar(),q.classList.add("open"),z.altInput?(z.altInput.blur(),z.altInput.classList.add("active")):(z.input.blur(),z.input.classList.add("active")),z.config.onOpen&&z.config.onOpen(z.selectedDateObj,z.input.value))},z.positionCalendar=function(){var e=z.altInput?z.altInput:z.input,t=e.getBoundingClientRect(),n=window.pageYOffset+e.offsetHeight+t.top,a=window.pageXOffset+t.left;q.style.top=n+"px",q.style.left=a+"px"},z.toggle=function(){z.input.disabled||(q.classList.toggle("open"),z.positionCalendar(),z.altInput&&z.altInput.classList.toggle("active"),z.input.classList.toggle("active"))},z.close=function(){q.classList.remove("open"),z.input.classList.remove("active"),z.altInput&&z.altInput.classList.remove("active"),z.config.onClose&&z.config.onClose(z.selectedDateObj,z.input.value)},z.clear=function(){z.input.value="",z.selectedDateObj=null,z.jumpToDate()},I=function(){z.input.dispatchEvent(U),z.config.onChange&&z.config.onChange(z.selectedDateObj,z.input.value)},z.destroy=function(){if(document.removeEventListener("click",C,!1),z.altInput&&z.altInput.parentNode.removeChild(z.altInput),z.config.inline){var e=z.element.parentNode,t=e.removeChild(z.element);e.removeChild(T),e.parentNode.replaceChild(t,e)}else document.getElementsByTagName("body")[0].removeChild(q)},z.redraw=function(){z.config.noCalendar||(k(),m())},z.jumpToDate=function(e){e=o(e||z.selectedDateObj||z.config.defaultDate||z.config.minDate||$),z.currentYear=e.getFullYear(),z.currentMonth=e.getMonth(),z.redraw()},z.setDate=function(e,t){return o(e)instanceof Date?(z.selectedDateObj=o(e),z.jumpToDate(z.selectedDateObj),y(),void(t&&I())):(console.error("flatpickr: setDate() - invalid date: "+e),void console.info(z.element))},z.setTime=function(e,t,n){z.selectedDateObj&&(W.value=parseInt(e,10)%24,B.value=parseInt(t||0,10)%60,z.config.time_24hr||(P.innerHTML=e>11?"PM":"AM"),y(),n&&I())},z.set=function(e,t){e in z.config&&(z.config[e]=t,z.jumpToDate())};try{i()}catch(K){console.error(K),console.info(z.element)}return z},flatpickr.init.prototype={l10n:{weekdays:{shorthand:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],longhand:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]},months:{shorthand:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],longhand:["January","February","March","April","May","June","July","August","September","October","November","December"]},daysInMonth:[31,28,31,30,31,30,31,31,30,31,30,31],firstDayOfWeek:0,ordinal:function(e){var t=e%100;if(t>3&&t<21)return"th";switch(t%10){case 1:return"st";case 2:return"nd";case 3:return"rd";default:return"th"}}},defaultConfig:{utc:!1,noCalendar:!1,wrap:!1,weekNumbers:!1,clickOpens:!0,dateFormat:"Y-m-d",altInput:!1,altInputClass:"",altFormat:"F j, Y",defaultDate:null,minDate:null,maxDate:null,parseDate:!1,disable:[],shorthandCurrentMonth:!1,inline:!1,"static":!1,prevArrow:"&lt;",nextArrow:"&gt;",enableTime:!1,enableSeconds:!1,timeFormat:"h:i K",time_24hr:!1,hourIncrement:1,minuteIncrement:5,onChange:null,onOpen:null,onClose:null}},Date.prototype.fp_incr=function(e){return new Date(this.getFullYear(),this.getMonth(),this.getDate()+parseInt(e,10))},Date.prototype.fp_isUTC=!1,Date.prototype.fp_toUTC=function(){var e=new Date(this.getTime()+6e4*this.getTimezoneOffset());return e.fp_isUTC=!0,e},Date.prototype.fp_getWeek=function(){var e=new Date(this.getTime());e.setHours(0,0,0,0),e.setDate(e.getDate()+3-(e.getDay()+6)%7);var t=new Date(e.getFullYear(),0,4);return 1+Math.round(((e.getTime()-t.getTime())/864e5-3+(t.getDay()+6)%7)/7)},"classList"in document.documentElement||!Object.defineProperty||"undefined"==typeof HTMLElement||Object.defineProperty(HTMLElement.prototype,"classList",{get:function(){var e=this;function t(t){return function(n){var a=e.className.split(/\s+/),i=a.indexOf(n);t(a,i,n),e.className=a.join(" ")}}var n={add:t(function(e,t,n){return~t||e.push(n)}),remove:t(function(e,t){return~t&&e.splice(t,1)}),toggle:t(function(e,t,n){return~t?e.splice(t,1):e.push(n)}),contains:function(t){return!!~e.className.split(/\s+/).indexOf(t)}};return n}}),"undefined"!=typeof module&&(module.exports=flatpickr);
},{}],2:[function(require,module,exports){
/// <reference path="jquery.d.ts" />
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var flatpickr_min_js_1 = require("./flatpickr.min.js");
var Item = (function () {
    function Item(title, start, isAllDay) {
        this.title = title;
        this.start = start;
        this.isAllDay = isAllDay;
    }
    Item.prototype.getDayTimeString = function () {
        // stub:
        var allDayEnding;
        if (this.getIsAllDay()) {
            allDayEnding = '_ALL_DAY';
        }
        else {
            allDayEnding = '';
        }
        return this.getStart().toString() + allDayEnding;
    };
    Item.prototype.getTitle = function () { return this.title; };
    Item.prototype.getStart = function () { return this.start; };
    Item.prototype.getIsAllDay = function () { return this.isAllDay; };
    Item.prototype.setTitle = function (title) {
        this.title = title;
    };
    Item.prototype.setStart = function (start) {
        this.start = start;
    };
    Item.prototype.setIsAllDay = function (isAllDay) {
        this.isAllDay = isAllDay;
    };
    return Item;
}());
var Task = (function (_super) {
    __extends(Task, _super);
    function Task(title, start, end, isAllDay) {
        _super.call(this, title, start, isAllDay);
        this.end = end;
    }
    Task.prototype.getEnd = function () { return this.end; };
    Task.prototype.setEnd = function (end) {
        this.end = end;
    };
    Task.prototype.getDayTimeString = function () {
        // stub:
        var allDayEnding;
        if (this.getIsAllDay()) {
            allDayEnding = '_ALL_DAY';
        }
        else {
            allDayEnding = '';
        }
        return this.getStart().toString() + " - " + this.getEnd().toString() + allDayEnding;
    };
    return Task;
}(Item));
var Deadline = (function (_super) {
    __extends(Deadline, _super);
    function Deadline(title, start, isAllDay) {
        _super.call(this, title, start, isAllDay);
    }
    return Deadline;
}(Item));
function loadTasksFromDB(day) {
    // stub:
    function getTodayAtTime(hours, minutes) {
        var date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        return date;
    }
    function getTodayAllDay() {
        var date = new Date();
        return date;
    }
    return [new Task("Clean Room", getTodayAtTime(8, 0), getTodayAtTime(8, 45), false),
        new Task("Math HW", getTodayAtTime(10, 0), getTodayAtTime(10, 30), false),
        new Task("Lunch", getTodayAtTime(12, 30), getTodayAtTime(13, 30), false),
        new Task("End Poverty", getTodayAllDay(), getTodayAllDay(), true),
        new Task("Game of Thrones Marathon", getTodayAtTime(18, 0), getTodayAtTime(23, 30), false),
        new Task("Solve the Water Stagnation Problem", getTodayAllDay(), getTodayAllDay(), true),
        new Task("Dinner", getTodayAtTime(19, 30), getTodayAtTime(20, 30), false)];
}
function loadDeadlinesFromDB() {
    // stub
    return [new Deadline("English Paper", new Date(2016, 2, 10, 23, 59), false),
        new Deadline("Game of Thrones Seasons 1-8 Due", new Date(2016, 4, 12, 12, 0), false),
        new Deadline("Math HW Due", new Date(2016, 9, 20), true),
        new Deadline("Cure to Cancer Due", new Date(2016, 11, 25), true),
        new Deadline("Spaces vs Tabs Rant Post Deadline", new Date(2017, 0, 2), true)];
}
var ItemEditor = (function () {
    function ItemEditor(item, li, doneCallback) {
        this.item = item;
        this.li = li;
        this.li.empty();
        this.titleInput = $("<input>", { type: "text", value: this.item.getTitle() });
        this.li.append(this.titleInput);
        this.currStart = this.item.getStart();
        var startArray = this.appendFlatPickr("flatpickr-start", this.currStart, this.setCurrStartDate.bind(this), this.setCurrStartTime.bind(this));
        this.startTimePickr = startArray[1];
        if (this.item instanceof Task) {
            var task = this.item;
            this.currEnd = task.getEnd();
            var endArray = this.appendFlatPickr("flatpickr-end", this.currEnd, this.setCurrEndDate.bind(this), this.setCurrEndTime.bind(this));
            this.endTimePickr = endArray[1];
        }
        else {
            this.currEnd = null;
            this.endTimePickr = null;
        }
        this.allDayInput = $("<input>", { type: "checkbox", checked: item.getIsAllDay() });
        this.li.append(this.allDayInput);
        this.allDayInput.click(this.allDayInputChanged.bind(this));
        var doneButton = $("<input>", { type: "button", value: "Done" });
        doneButton.click(this.doneButtonClickFn.bind(this));
        this.li.append(doneButton);
        this.doneCallback = doneCallback;
    }
    ItemEditor.setDateOnly = function (date, newDate) {
        date.setFullYear(newDate.getFullYear());
        date.setMonth(newDate.getMonth());
        date.setDate(newDate.getDate());
    };
    ItemEditor.prototype.setCurrStartDate = function (dateOnly) {
        ItemEditor.setDateOnly(this.currStart, dateOnly);
    };
    ItemEditor.prototype.setCurrEndDate = function (dateOnly) {
        ItemEditor.setDateOnly(this.currEnd, dateOnly);
    };
    ItemEditor.setTimeOnly = function (date, newTime) {
        date.setHours(newTime.getHours());
        date.setMinutes(newTime.getMinutes());
        date.setSeconds(newTime.getSeconds());
        date.setMilliseconds(newTime.getMilliseconds());
    };
    ItemEditor.prototype.setCurrStartTime = function (timeOnly) {
        ItemEditor.setTimeOnly(this.currStart, timeOnly);
    };
    ItemEditor.prototype.setCurrEndTime = function (timeOnly) {
        ItemEditor.setTimeOnly(this.currEnd, timeOnly);
    };
    ItemEditor.prototype.allDayInputChanged = function () {
        var isChecked = this.allDayInput.prop("checked");
        $(this.startTimePickr).prop("disabled", isChecked);
        if (this.item instanceof Task) {
            $(this.endTimePickr).prop("disabled", isChecked);
        }
    };
    ItemEditor.prototype.appendFlatPickr = function (idPrefix, date, onChangeDateFn, onChangeTimeFn) {
        var dateId = idPrefix + "-date";
        var timeId = idPrefix + "-time";
        var flatPickrDateEl = $("<input>", { id: dateId,
            "data-defaultDate": date,
            "data-dateFormat": "F j, Y" });
        var flatPickrTimeEl = $("<input>", { id: timeId,
            "data-defaultDate": date,
            "data-enabletime": true,
            "data-nocalendar": true });
        this.li.append(flatPickrDateEl);
        this.li.append(flatPickrTimeEl);
        flatpickr_min_js_1.flatpickr("#" + dateId, { onChange: onChangeDateFn });
        flatpickr_min_js_1.flatpickr("#" + timeId, { onChange: onChangeTimeFn });
        if (this.item.getIsAllDay()) {
            $(flatPickrTimeEl).prop("disabled", true);
        }
        return [flatPickrDateEl, flatPickrTimeEl];
    };
    ItemEditor.prototype.doneButtonClickFn = function () {
        this.item.setTitle(this.titleInput.val());
        this.item.setIsAllDay(this.allDayInput.prop("checked"));
        this.item.setStart(this.currStart);
        if (this.item instanceof Task) {
            var task = this.item;
            task.setEnd(this.currEnd);
        }
        this.li.empty();
        console.log(this.item);
        this.doneCallback(this.li, this.item);
    };
    return ItemEditor;
}());
var View = (function () {
    function View() {
    }
    View.prototype.markItemDone = function (item, li) {
        // stub
        console.log(item.getTitle() + " removed");
        li.slideUp();
    };
    View.prototype.fillLi = function (li, item) {
        var middle = $("<div>", { class: "item-middle" });
        middle.append($("<p>").html(item.getTitle()), $("<p>").html(item.getDayTimeString()));
        var check = $("<img>", { class: "td-check", src: "img/check.png" });
        var settings = $("<img>", { class: "td-settings", src: "img/gear.png" });
        check.click(this.markItemDone.bind(this, item, li));
        settings.click(this.openSettings.bind(this, item, li));
        li.append(check, middle, settings);
    };
    View.prototype.openSettings = function (item, li) {
        new ItemEditor(item, li, this.fillLi.bind(this));
    };
    View.prototype.createLi = function (item) {
        var li = $("<li>");
        this.fillLi(li, item);
        return li;
    };
    View.prototype.appendLi = function (container_name, item) {
        var li = this.createLi(item);
        $(container_name + " ul").append(li);
    };
    View.prototype.removeLoading = function (container_name) {
        $(container_name + " .loading").remove();
    };
    return View;
}());
function main() {
    "use strict";
    var tasks = loadTasksFromDB(new Date());
    var deadlines = loadDeadlinesFromDB();
    var view = new View();
    for (var i = 0; i < tasks.length; i++) {
        view.appendLi("#task-container", tasks[i]);
    }
    for (var i = 0; i < deadlines.length; i++) {
        view.appendLi("#deadline-container", deadlines[i]);
    }
    view.removeLoading("#task-container");
    view.removeLoading("#deadline-container");
}
$(document).ready(main);

},{"./flatpickr.min.js":1}]},{},[2]);
