/**
 * Calendar Integration Utility
 * Generates calendar events in multiple formats (iCalendar .ics, Google Calendar, Outlook)
 */

interface CalendarEventData {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  organizerEmail?: string;
  organizerName?: string;
  attendeeEmail?: string;
  attendeeName?: string;
}

/**
 * Format date for iCalendar format (YYYYMMDDTHHMMSSZ)
 */
function formatICalDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Generate unique identifier for calendar event
 */
function generateUID(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}@100percentk9.co.nz`;
}

/**
 * Escape special characters for iCalendar format
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate iCalendar (.ics) file content
 * Universal format compatible with Google Calendar, Outlook, Apple Calendar, etc.
 */
export function generateICalendar(event: CalendarEventData): string {
  const now = new Date();
  const uid = generateUID();
  const dtstamp = formatICalDate(now);
  const dtstart = formatICalDate(event.startDate);
  const dtend = formatICalDate(event.endDate);

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//100% K9//Dog Boarding Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${escapeICalText(event.title)}`,
    `DESCRIPTION:${escapeICalText(event.description)}`,
    `LOCATION:${escapeICalText(event.location)}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
  ];

  // Add organiser if provided
  if (event.organizerEmail && event.organizerName) {
    lines.push(`ORGANIZER;CN=${escapeICalText(event.organizerName)}:mailto:${event.organizerEmail}`);
  }

  // Add attendee if provided
  if (event.attendeeEmail && event.attendeeName) {
    lines.push(`ATTENDEE;CN=${escapeICalText(event.attendeeName)};RSVP=FALSE:mailto:${event.attendeeEmail}`);
  }

  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

/**
 * Generate Google Calendar URL
 * Creates a direct link to add event to Google Calendar
 */
export function generateGoogleCalendarUrl(event: CalendarEventData): string {
  const startDate = event.startDate.toISOString().replace(/-|:|\.\d+/g, '');
  const endDate = event.endDate.toISOString().replace(/-|:|\.\d+/g, '');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description,
    location: event.location,
    dates: `${startDate}/${endDate}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook Calendar URL
 * Creates a direct link to add event to Outlook/Office 365 Calendar
 */
export function generateOutlookCalendarUrl(event: CalendarEventData): string {
  const startDate = event.startDate.toISOString();
  const endDate = event.endDate.toISOString();

  const params = new URLSearchParams({
    subject: event.title,
    body: event.description,
    location: event.location,
    startdt: startDate,
    enddt: endDate,
    path: '/calendar/action/compose',
    rru: 'addevent',
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate Yahoo Calendar URL
 * Creates a direct link to add event to Yahoo Calendar
 */
export function generateYahooCalendarUrl(event: CalendarEventData): string {
  const startDate = event.startDate.toISOString().replace(/-|:|\.\d+/g, '');
  const endDate = event.endDate.toISOString().replace(/-|:|\.\d+/g, '');

  // Yahoo uses different duration format
  const durationHours = Math.floor((event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60 * 60));
  const durationMinutes = Math.floor(((event.endDate.getTime() - event.startDate.getTime()) % (1000 * 60 * 60)) / (1000 * 60));
  const duration = `${String(durationHours).padStart(2, '0')}${String(durationMinutes).padStart(2, '0')}`;

  const params = new URLSearchParams({
    v: '60',
    title: event.title,
    desc: event.description,
    in_loc: event.location,
    st: startDate,
    dur: duration,
  });

  return `https://calendar.yahoo.com/?${params.toString()}`;
}

/**
 * Generate booking calendar event data
 * Creates calendar event data specifically for dog boarding bookings
 */
export function generateBookingCalendarEvent(bookingData: {
  dogName: string;
  customerName: string;
  customerEmail: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: string;
  bookingId?: string | number;
}): CalendarEventData {
  const { dogName, customerName, customerEmail, checkIn, checkOut, totalPrice, bookingId } = bookingData;

  // Set check-in time to 10:00 AM NZST
  const checkInDate = new Date(checkIn);
  checkInDate.setHours(10, 0, 0, 0);

  // Set check-out time to 4:00 PM NZST
  const checkOutDate = new Date(checkOut);
  checkOutDate.setHours(16, 0, 0, 0);

  const title = `Dog Boarding - ${dogName}`;

  const description = [
    `Dog boarding stay at 100% K9`,
    `Dog: ${dogName}`,
    `Customer: ${customerName}`,
    `Total: ${totalPrice}`,
    bookingId ? `Booking ID: ${bookingId}` : '',
    '',
    'Drop-off: 10:00 AM',
    'Pick-up: 4:00 PM',
    '',
    'Contact: 020 4081 2829',
    'Email: training@100percentk9.co.nz',
  ].filter(Boolean).join('\\n');

  const location = '100% K9 Dog Boarding, Auckland, New Zealand';

  return {
    title,
    description,
    location,
    startDate: checkInDate,
    endDate: checkOutDate,
    organizerEmail: 'training@100percentk9.co.nz',
    organizerName: '100% K9',
    attendeeEmail: customerEmail,
    attendeeName: customerName,
  };
}

/**
 * Generate all calendar links for a booking
 * Returns download link for .ics file and direct links for popular calendar services
 */
export function generateAllCalendarLinks(bookingData: {
  dogName: string;
  customerName: string;
  customerEmail: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: string;
  bookingId?: string | number;
}): {
  icsContent: string;
  icsDataUrl: string;
  googleUrl: string;
  outlookUrl: string;
  yahooUrl: string;
} {
  const eventData = generateBookingCalendarEvent(bookingData);
  const icsContent = generateICalendar(eventData);

  // Create data URL for download
  const icsBlob = Buffer.from(icsContent).toString('base64');
  const icsDataUrl = `data:text/calendar;charset=utf-8;base64,${icsBlob}`;

  return {
    icsContent,
    icsDataUrl,
    googleUrl: generateGoogleCalendarUrl(eventData),
    outlookUrl: generateOutlookCalendarUrl(eventData),
    yahooUrl: generateYahooCalendarUrl(eventData),
  };
}
