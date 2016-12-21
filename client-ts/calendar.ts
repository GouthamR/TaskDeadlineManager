namespace calendar
{
	function initFullCalendar()
	{
		$('#calendar').fullCalendar(
		{
			header:
			{
				left: 'prev,next today',
				center: 'title',
				right: 'month,basicWeek,agendaDay'
			},
			defaultDate: '2016-09-12',
			navLinks: true,
			editable: true,
			events:
			[
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

	export function main()
	{
		initFullCalendar();
		$(".loading").remove();
	}
}

$(document).ready(calendar.main);