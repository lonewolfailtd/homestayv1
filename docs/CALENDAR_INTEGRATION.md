# Calendar Integration Feature

## Overview
This feature allows customers to add their dog boarding bookings directly to their preferred calendar application with one click. It supports all major calendar platforms including Google Calendar, Outlook, Yahoo Calendar, and Apple Calendar.

## Implementation Date
October 19, 2025

## Features

### 1. Universal Calendar Format (.ics)
- **iCalendar (.ics) file generation** - Standard format supported by ALL calendar applications
- Includes complete booking details:
  - Event title: "Dog Boarding - [Dog Name]"
  - Start time: Check-in at 10:00 AM NZST
  - End time: Check-out at 4:00 PM NZST
  - Location: 100% K9 Dog Boarding, Auckland, New Zealand
  - Description: Full booking details including customer name, dog name, total price, booking ID
  - Organiser: 100% K9 (training@100percentk9.co.nz)
  - Attendee: Customer email

### 2. Direct Calendar Links
One-click links to add events to:
- **Google Calendar** - Opens Google Calendar with pre-filled event details
- **Outlook Calendar** - Opens Outlook/Office 365 with pre-filled event details
- **Yahoo Calendar** - Opens Yahoo Calendar with pre-filled event details

### 3. Multiple Integration Points

#### A. Booking Confirmation Page
After successful booking, customers see a prominent "Add to Calendar" section with:
- Download .ics file button (works with Apple Calendar, Thunderbird, etc.)
- Direct links to Google Calendar, Outlook, Yahoo Calendar
- Visual calendar icons for each service
- Check-in/check-out time reminder

#### B. Email Confirmation
Branded email template includes:
- Clickable calendar buttons for Google, Outlook, Yahoo
- Same booking details as .ics file
- Consistent branding with 100% K9 colors

## Technical Implementation

### Core Files

#### 1. `/lib/calendar.ts`
Calendar utility library with functions:
- `generateICalendar()` - Creates RFC 5545 compliant .ics file content
- `generateGoogleCalendarUrl()` - Creates Google Calendar deep link
- `generateOutlookCalendarUrl()` - Creates Outlook Calendar deep link
- `generateYahooCalendarUrl()` - Creates Yahoo Calendar deep link
- `generateBookingCalendarEvent()` - Converts booking data to calendar event format
- `generateAllCalendarLinks()` - Main function that returns all calendar options

#### 2. `/components/booking/steps/SummaryStep.tsx`
Booking confirmation page enhancements:
- Calendar links generation after successful booking
- .ics file download handler
- Calendar button grid UI (2x2 on mobile, 1x4 on desktop)
- Toast notification on download

#### 3. `/lib/email.ts`
Email template enhancements:
- Calendar links section with branded buttons
- Calendar event data generation
- Check-in/check-out time display

#### 4. `/app/api/booking/submit/route.ts`
API route updates:
- Pass `bookingId` to email function for calendar event UID

## Calendar Event Format

### Event Details
```
Title: Dog Boarding - [Dog Name]
Start: [Check-in Date] at 10:00 AM NZST
End: [Check-out Date] at 4:00 PM NZST
Location: 100% K9 Dog Boarding, Auckland, New Zealand
Description:
  Dog boarding stay at 100% K9
  Dog: [Dog Name]
  Customer: [Customer Name]
  Total: $[Total Price]
  Booking ID: [ID]

  Drop-off: 10:00 AM
  Pick-up: 4:00 PM

  Contact: 020 4081 2829
  Email: training@100percentk9.co.nz
```

## User Experience Flow

### After Booking Completion
1. Customer completes booking form
2. Booking confirmation page displays
3. "Add to Calendar" section appears prominently
4. Customer can choose:
   - Download .ics file (opens in default calendar app)
   - Click Google Calendar (opens in new tab)
   - Click Outlook Calendar (opens in new tab)
   - Click Yahoo Calendar (opens in new tab)

### Via Email
1. Customer receives booking confirmation email
2. Email includes "Add to Your Calendar" section
3. Three branded buttons for Google, Outlook, Yahoo
4. Customer clicks preferred calendar service
5. Calendar opens with pre-filled event details

## Browser Compatibility

### .ics File Download
- ✅ Chrome/Edge: Downloads file, opens with default calendar app
- ✅ Firefox: Downloads file, opens with default calendar app
- ✅ Safari: Downloads file, opens with Calendar.app (macOS/iOS)
- ✅ Mobile browsers: Downloads file, prompts to add to device calendar

### Direct Calendar Links
- ✅ Google Calendar: Works on all desktop and mobile browsers
- ✅ Outlook Calendar: Works on all desktop and mobile browsers
- ✅ Yahoo Calendar: Works on all desktop and mobile browsers

## Calendar App Compatibility

### .ics File Support
- ✅ Google Calendar (web, Android, iOS)
- ✅ Outlook (Windows, macOS, web, mobile)
- ✅ Apple Calendar (macOS, iOS, iPadOS)
- ✅ Thunderbird
- ✅ Yahoo Calendar
- ✅ Any RFC 5545 compliant calendar application

## Testing Checklist

### Functionality Tests
- [ ] .ics file downloads correctly
- [ ] .ics file opens in default calendar app
- [ ] Google Calendar link opens with correct details
- [ ] Outlook Calendar link opens with correct details
- [ ] Yahoo Calendar link opens with correct details
- [ ] Email includes calendar buttons
- [ ] Email calendar buttons are clickable
- [ ] Check-in time is 10:00 AM
- [ ] Check-out time is 4:00 PM
- [ ] Event includes all required details

### Cross-Platform Tests
- [ ] Desktop Chrome
- [ ] Desktop Firefox
- [ ] Desktop Safari
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)
- [ ] Desktop Outlook app
- [ ] Apple Calendar app
- [ ] Google Calendar web
- [ ] Outlook web

### Edge Cases
- [ ] Long dog names display correctly
- [ ] Special characters in customer names
- [ ] Multi-day bookings span correctly
- [ ] Check-in and check-out on same day
- [ ] Bookings crossing month boundaries
- [ ] Bookings crossing year boundaries

## NZ Localisation

### Time Zone
All calendar events use **NZST (New Zealand Standard Time)** or **NZDT (New Zealand Daylight Time)** depending on the date.

### Date Format
- iCalendar uses ISO 8601 format (YYYYMMDDTHHMMSSZ)
- Display format uses NZ standard: DD/MM/YYYY

### Business Hours
- Check-in: 10:00 AM
- Check-out: 4:00 PM

## Future Enhancements

### Potential Additions
1. **Reminders**
   - Add automatic reminders (24 hours before check-in)
   - Pre-visit preparation checklist

2. **Recurring Bookings**
   - Support for recurring dog boarding events
   - Weekly/monthly boarding schedules

3. **Calendar Sync**
   - Two-way calendar synchronisation
   - Availability checking against customer calendars

4. **SMS Integration**
   - Send calendar invites via SMS
   - Text-to-calendar functionality

5. **Payment Reminders**
   - Separate calendar events for payment deadlines
   - 3-week payment reminder integration

## Maintenance Notes

### Dependencies
- No external libraries required
- Uses native JavaScript Date objects
- RFC 5545 compliant iCalendar format

### Update Considerations
- If business hours change, update `generateBookingCalendarEvent()` in `/lib/calendar.ts`
- If location changes, update the `location` field
- If contact details change, update the `description` field

## Support Information

### Common Customer Questions

**Q: Which calendar should I use?**
A: Choose the calendar you use most often. The .ics download works with any calendar app.

**Q: Can I add this to my phone calendar?**
A: Yes! The .ics file works on iPhone (Apple Calendar) and Android (Google Calendar).

**Q: The event didn't add to my calendar**
A: Try downloading the .ics file instead of using the direct links. The .ics file is universal.

**Q: Can I change the times?**
A: Yes! After adding to your calendar, you can edit the event times. Standard times are 10:00 AM check-in and 4:00 PM check-out.

**Q: Will this send calendar invites to 100% K9?**
A: The calendar event includes 100% K9 as the organiser, but no automatic invites are sent. It's for your personal calendar only.

## Related Documentation
- [Email Template System](./EMAIL_TEMPLATES.md)
- [Booking Flow Documentation](./BOOKING_FLOW.md)
- [Payment Method Tracking](../CLAUDE.md#payment-method-tracking-system)
