/// <reference path="./moment_modified.d.ts" />

/**
 * init takes a set of start and end date and time input fields as arguments.
 * This module synchronizes the start and end input fields, as follows:
 * When the start date is changed, updates the end date to maintain the same
 * date duration. Also does the same for the start time and end time.
 */

const DATE_FORMAT: string = "YYYY-MM-DD";
const TIME_FORMAT: string = "HH:mm";

class DateTimeGroupSynchronizer
{
    private previousStartDate: moment.Moment;
    private previousStartTime: moment.Moment;

    public constructor(private $startDateInput: JQuery,
                        private $endDateInput: JQuery, 
                        private $startTimeInput: JQuery,
                        private $endTimeInput: JQuery)
    {
        this.previousStartDate = this.dateInputToMoment(this.$startDateInput);
        this.previousStartTime = this.timeInputToMoment(this.$startTimeInput);

        // Removes event handlers from previous DateTimeGroupSynchronizer, if any,
        // before attaching new handlers:
        this.$startDateInput.off();
        this.$startTimeInput.off();
        this.$startDateInput.change((e: JQueryEventObject) => this.updateEndDate());
        this.$startTimeInput.change((e: JQueryEventObject) => this.updateEndTime());
    }

    private dateInputToMoment($dateInput: JQuery): moment.Moment
    {
        let dateString: string = $dateInput.val();
        return moment(dateString, DATE_FORMAT);
    }

    private timeInputToMoment($timeInput: JQuery): moment.Moment
    {
        let timeString: string = $timeInput.val();
        return moment(timeString, TIME_FORMAT);
    }

    private setDateInputToMoment($dateInput: JQuery, dateValue: moment.Moment): void
    {
        $dateInput.val(dateValue.format(DATE_FORMAT));
    }
    
    private setTimeInputToMoment($timeInput: JQuery, timeValue: moment.Moment): void
    {
        $timeInput.val(timeValue.format(TIME_FORMAT));
    }

    private updateEndDate()
    {
        let newStartDate: moment.Moment = this.dateInputToMoment(this.$startDateInput);

        let startDateDaysIncrement: number = newStartDate.diff(this.previousStartDate, "days");
        let newEndDate: moment.Moment = this.dateInputToMoment(this.$endDateInput)
                                            .add(startDateDaysIncrement, "days");
        this.setDateInputToMoment(this.$endDateInput, newEndDate);
        
        this.previousStartDate = newStartDate;
    }

    private updateEndTime()
    {
        let newStartTime: moment.Moment = this.timeInputToMoment(this.$startTimeInput);

        let startTimeMillisIncrement: number = newStartTime.diff(this.previousStartTime);
        let newEndTime: moment.Moment = this.timeInputToMoment(this.$endTimeInput)
                                            .add(startTimeMillisIncrement, "milliseconds");
        this.setTimeInputToMoment(this.$endTimeInput, newEndTime);
        
        this.previousStartTime = newStartTime;
    }
}

export function init($startDateInput: JQuery, $endDateInput: JQuery, $startTimeInput: JQuery,
                        $endTimeInput: JQuery)
{
     new DateTimeGroupSynchronizer($startDateInput, $endDateInput, $startTimeInput, $endTimeInput);
}