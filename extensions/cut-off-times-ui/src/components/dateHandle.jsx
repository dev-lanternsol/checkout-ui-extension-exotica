import React, { useState } from 'react';
import { DatePicker } from '@shopify/checkout-ui-extensions-react';

// Get today's date
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth() + 1;
const currentDay = today.getDate();

export function DatePickerComponent() {
  // Initialize the state for selected date
  const [selectedDate, setSelectedDate] = useState({ year: currentYear, month: currentMonth, day: currentDay });

  // Function to handle date changes
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  return (
    <DatePicker
      selected={selectedDate}  // Bind the selected date from state
      onChange={handleDateChange}  // Update state on date change
      disabled={[
        { start: { year: 2000, month: 1, day: 1 }, end: { year: currentYear, month: currentMonth, day: currentDay } }  // Disable past dates
      ]}
    />
  );
}
