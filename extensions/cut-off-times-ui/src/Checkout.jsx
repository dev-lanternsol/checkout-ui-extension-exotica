import {
  reactExtension,
  BlockStack,
  DateField,
  Select,
  Heading,
  useTranslate,
  Text,
  useAppMetafields,
  Banner,
  useSettings,
  useApplyAttributeChange,
  useAttributeValues,
  useLocalizationCountry,
} from "@shopify/ui-extensions-react/checkout";
import React, { useEffect, useState } from "react";

// 1. Choose an extension target
export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  // Available time slots
  const { monday, monday_cot, 
    tuesday, tuesday_cot, 
    wednesday, wednesday_cot,
    thursday, thursday_cot,
    friday, friday_cot,
    saturday, saturday_cot,
    sunday, sunday_cot, disabledDates } = useSettings();
    // Example usage dummy data for first installation:
    const data_monday_enabled = monday ? true : false;
    const data_tuesday_enabled = tuesday ? true : false;
    const data_wednesday_enabled = wednesday ? true : false;
    const data_thursday_enabled = thursday ? true : false;
    const data_friday_enabled = friday ? true : false;
    const data_saturday_enabled = saturday ? true : false;
    const data_sunday_enabled = sunday ? true : false;

    const data_monday_cot = monday_cot || "";
    const data_tuesday_cot = tuesday_cot || "";
    const data_wednesday_cot = wednesday_cot || "";
    const data_thursday_cot = thursday_cot || "";
    const data_friday_cot = friday_cot || "";
    const data_saturday_cot = saturday_cot || "";
    const data_sunday_cot = sunday_cot || "";
  
    const data_monday = monday || "";
    const data_tuesday = tuesday || "";
    const data_wednesday = wednesday || "";
    const data_thursday = thursday || "";
    const data_friday = friday || "";
    const data_saturday = saturday || "";
    const data_sunday = sunday || "";
  
    const weeklySchedule = `
    monday: ${data_monday_enabled ? data_monday : 'disabled'}
    tuesday: ${data_tuesday_enabled ? data_tuesday : 'disabled'}
    wednesday: ${data_wednesday_enabled ? data_wednesday : 'disabled'}
    thursday: ${data_thursday_enabled ? data_thursday : 'disabled'}
    friday: ${data_friday_enabled ? data_friday : 'disabled'}
    saturday: ${data_saturday_enabled ? data_saturday : 'disabled'}
    sunday: ${data_sunday_enabled ? data_sunday : 'disabled'}
    `;

  const cutOffTimes = {
    monday: data_monday_cot,
    tuesday: data_tuesday_cot,
    wednesday: data_wednesday_cot,
    thursday: data_thursday_cot,
    friday: data_friday_cot,
    saturday: data_saturday_cot,
    sunday: data_sunday_cot
  };

  const translate = useTranslate();
  const appMetafields = useAppMetafields({
    type: "product",
    namespace: "custom",
    key: "second_day_delivery"
  }); 
  const [hasSecondDay, setHasSecondDay] = useState(false);
  const [datePickerError, setDatePickerError] = useState("");
  const [selectedDayName, setSelectedDayName] = useState("");
  const [selectedDate, setSelectedDate] = useState();
  const [enableSameDay] = useAttributeValues(['hasSameDay']);
  const applyAttributeChange = useApplyAttributeChange();
  const country = useLocalizationCountry();
  const isLebanon = country.isoCode === 'LB';

  if (!hasSecondDay && appMetafields.some(metafield => metafield.metafield.key === 'second_day_delivery')) {
    setHasSecondDay(true);
  }

  return (
    <BlockStack padding={"none"}>
      {enableSameDay === 'true' && 
        <BlockStack padding={"none"}>
          <Heading level={3}>
            {hasSecondDay ? translate("secondDayBlockHeader") : translate("sameDayBlockHeader") }
          </Heading>
          <DatePickerComponent 
            translate={translate} 
            isLebanon={isLebanon}
            disabledDatesList={disabledDates}
            applyAttributeChange={applyAttributeChange}
            hasSecondDay={hasSecondDay} 
            datePickerError={datePickerError} 
            selectedDate={selectedDate} 
            setDatePickerError={setDatePickerError} 
            setSelectedDayName={setSelectedDayName}
            setSelectedDate={setSelectedDate} />
          {weeklySchedule && selectedDate && 
            <TimeSlotPickerComponent 
              translate={translate} 
              applyAttributeChange={applyAttributeChange}
              selectedDayName={selectedDayName} 
              weeklySchedule={weeklySchedule} 
              cutOffTimes={cutOffTimes}
              selectedDate={selectedDate} />}
        </BlockStack>
      }
    </BlockStack>
  );
}

function DatePickerComponent({translate, isLebanon, disabledDatesList, applyAttributeChange, hasSecondDay, datePickerError, selectedDate, setDatePickerError, setSelectedDayName, setSelectedDate}) {
  const [dateLimitEnd_localISOTimeFormatted, setDateLimitEnd_localISOTimeFormatted] = useState()
  var dayNames = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  if (isLebanon) {
    dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  }
  var disabledDates = [ {start:'2000-01-01', end: dateLimitEnd_localISOTimeFormatted} ];

  if (disabledDatesList) {
    if (disabledDatesList.includes(",")) {
      let disabledDatesListArray = disabledDatesList.split(",");
      disabledDates = disabledDates.concat(disabledDatesListArray);
    }
    disabledDates.push(disabledDatesList);
  }

  var currentDate = new Date;
  var dateLimitEnd = new Date;
  
  useEffect(() => {
    if (hasSecondDay) {
      currentDate.setDate(currentDate.getDate() + 1);
      dateLimitEnd.setDate(dateLimitEnd.getDate()); 
    } else {
      currentDate.setDate(currentDate.getDate());
      dateLimitEnd.setDate(dateLimitEnd.getDate() - 1); 
    }
    var currentDate_tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    var currentDate_localISOTime = (new Date(currentDate - currentDate_tzoffset)).toISOString().slice(0, -1);
    var currentDate_localISOTimeFormatted = currentDate_localISOTime.split('T')[0];

    var dateLimitEnd_tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    var dateLimitEnd_localISOTime = (new Date(dateLimitEnd - dateLimitEnd_tzoffset)).toISOString().slice(0, -1);
    var dateLimitEnd_localISOTimeFormatted = dateLimitEnd_localISOTime.split('T')[0];
    var current_day_number = new Date(currentDate_localISOTimeFormatted).getDay()

    //setSelectedDate(currentDate_localISOTimeFormatted);
    setDateLimitEnd_localISOTimeFormatted(dateLimitEnd_localISOTimeFormatted);
    setSelectedDayName(dayNames[current_day_number])
  }, [hasSecondDay])

  useEffect(() => {
    updateDateAtribute(selectedDate)
  }, [selectedDate])
  

  // Function to handle date changes
  const handleDateChange = (newDate) => {
    if (newDate) {
      setSelectedDate(newDate);
      setDatePickerError("");
      var selected_day_number = new Date(newDate).getDay();
      setSelectedDayName(dayNames[selected_day_number]);
    }
  };

  // Function to handle the invalid dates
  const handleInvalidDate = () => {
    setDatePickerError("Please select a valid date.");
  }

  async function updateDateAtribute(date) {
    // 4. Call the API to modify checkout
    const result = await applyAttributeChange({
      key: "Delivery Date",
      type: "updateAttribute",
      value: `${date}`,
    });
    console.log("applyAttributeChange result", result);
  }

  return (
    <DateField
      label="Select the desired date" 
      value={selectedDate}
      onChange={handleDateChange}
      disabled={disabledDates}
      error={datePickerError}
      required={true}
      onInvalid={handleInvalidDate}
    />
  );
}

function TimeSlotPickerComponent({translate, applyAttributeChange, selectedDayName, weeklySchedule, cutOffTimes, selectedDate}) {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState();
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [parsedWeeklySchedule, setParsedWeeklySchedule] = useState(parseWeeklySchedule(weeklySchedule, cutOffTimes, selectedDate));
  //const parsedWeeklySchedule = parseWeeklySchedule(weeklySchedule, cutOffTimes, selectedDate);

  function handleTimeSlotChange(newTimeSlot) {
    setSelectedTimeSlot(newTimeSlot);
  }

  useEffect(() => {
    updateTimeSlotAtribute(selectedTimeSlot);
  }, [selectedTimeSlot])

  async function updateTimeSlotAtribute(time) {
    if (time) {
      // 4. Call the API to modify checkout
      const result = await applyAttributeChange({
        key: "Time slot",
        type: "updateAttribute",
        value: `${time}`,
      });
      console.log("applyAttributeChange result", result);
    }
  }

  useEffect(() => {
    setAvailableTimeSlots(getDaySchedule(parsedWeeklySchedule,selectedDayName));
  }, [selectedDayName, parsedWeeklySchedule])

  useEffect(() => {
    setParsedWeeklySchedule(parseWeeklySchedule(weeklySchedule, cutOffTimes, selectedDate));
  }, [selectedDate])

  function parseWeeklySchedule(weeklySchedule, cutOffTimes, selectedDate) {
    const days = weeklySchedule.split(/(?=\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b)/i);
    const result = {};
    
    const now = new Date(); // Current date and time
    const today = now.toISOString().split('T')[0]; // Get today's date in 'YYYY-MM-DD' format
    
    const isToday = selectedDate === today; // Check if the picked date is today
    
    days.forEach((dayBlock) => {
      if (dayBlock.includes(':')) {
        const [day, schedule] = dayBlock.split(': ');
        const dayLower = day.trim().toLowerCase();
    
        // Apply cut-off time logic only if it's today, otherwise render all schedules
        if (isToday && cutOffTimes[dayLower] && isPastCutOffTime(cutOffTimes[dayLower])) {
          result[dayLower] = { enabled: false, schedule: [] };
        } else if (schedule.trim() === 'disabled') {
          result[dayLower] = { enabled: false, schedule: [] };
        } else {
          const timeBlocks = schedule.split(", ");
          const parsedBlocks = timeBlocks.map((block) => {
            const timeMatch = block.match(/From (.*?) to (.*?) Prep/);
            const prepMatch = block.match(/Prep ([\d.]+)hrs/);
    
            if (timeMatch && prepMatch) {
              const fromTime = timeMatch[1].trim();
              const toTime = timeMatch[2].trim();
              const prepTime = parseFloat(prepMatch[1]);

              // Convert "From" time to a Date object
              const fromDateTime = convertToDateTime(fromTime, dayLower);
    
              // Subtract the preparation time from the "From" time
              fromDateTime.setHours(fromDateTime.getHours() - Math.floor(prepTime));
              fromDateTime.setMinutes(fromDateTime.getMinutes() - Math.floor((prepTime * 60) % 60));
    
              // Apply the time comparison logic only if the picked date is today
              if (!isToday || now < fromDateTime) {
                return {
                  value: `${fromTime} to ${toTime}`,
                  label: `${fromTime} to ${toTime}`,
                  prep: prepTime,
                };
              }
            }
            return null; // Filter out if not matching or passed
          }).filter(Boolean);
    
          result[dayLower] = { enabled: true, schedule: parsedBlocks };
        }
      }
    });
  
    return result;
  }
  
  // Helper function to check if current time is past the cut-off time
  function isPastCutOffTime(cutOffTime) {
    const now = new Date();
    const [hours, minutes] = cutOffTime.split(':').map(Number);
    const cutOffDateTime = new Date();
    cutOffDateTime.setHours(hours, minutes, 0, 0);
  
    return now > cutOffDateTime; // True if current time is past the cut-off time
  }
  
  // Helper function to convert time string (e.g., "10:00") to a Date object for the specific day
  function convertToDateTime(time, day) {
    const [hours, minutes] = time.split(":").map(Number);
    const now = new Date();
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    const targetDay = dayOfWeek.indexOf(day);
    const currentDay = now.getDay();
  
    const daysAhead = targetDay >= currentDay ? targetDay - currentDay : 7 - (currentDay - targetDay);
  
    const dateTime = new Date(now);
    dateTime.setDate(now.getDate() + daysAhead); // Adjust to the correct day
    dateTime.setHours(hours);
    dateTime.setMinutes(minutes);
    dateTime.setSeconds(0);
    dateTime.setMilliseconds(0);
  
    return dateTime;
  }

  function getDaySchedule(parsedSchedule, day) {
    const dayLowerCase = day.toLowerCase();
    
    // Check if the day exists in the parsed schedule and if it's enabled
    if (parsedSchedule[dayLowerCase] && parsedSchedule[dayLowerCase].enabled) {
      return parsedSchedule[dayLowerCase].schedule;
    } else {
      return []; // Return an empty array if the day is disabled or doesn't exist
    }
  }
  
  return (
    <BlockStack padding={"none"}>
      {availableTimeSlots.length > 0 ? 
        <BlockStack padding={"none"}>
          <Text>{translate("timeSlotHeader")}</Text> 
          <Select
            label={translate("timeSlotSelect", {selectedDayName})}
            value={selectedTimeSlot}
            required={true}
            options={availableTimeSlots}
            onChange={handleTimeSlotChange}
          />
        </BlockStack> : 
        <Banner
          status="info"
          title={translate("noTimeSlotAvailable", {selectedDayName})}
        />
      }
    </BlockStack>
  );
}