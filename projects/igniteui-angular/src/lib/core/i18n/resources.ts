import { DateRangePickerResourceStringsEN, IDateRangePickerResourceStrings } from './date-range-picker-resources';
import { IGridResourceStrings, GridResourceStringsEN } from './grid-resources';
import { ITimePickerResourceStrings, TimePickerResourceStringsEN } from './time-picker-resources';
import { IPaginatorResourceStrings, PaginatorResourceStringsEN } from './paginator-resources';
import { cloneValue } from '../utils';
import { ICarouselResourceStrings, CarouselResourceStringsEN } from './carousel-resources';
import { IListResourceStrings, ListResourceStringsEN } from './list-resources';
import { CalendarResourceStringsEN, ICalendarResourceStrings } from './calendar-resources';
import { IInputResourceStrings, InputResourceStringsEN } from './input-resources';

export interface IResourceStrings extends IGridResourceStrings, ITimePickerResourceStrings, ICalendarResourceStrings,
    ICarouselResourceStrings, IInputResourceStrings, IDateRangePickerResourceStrings, IListResourceStrings, IPaginatorResourceStrings { }

/**
 * @hidden
 */
export const CurrentResourceStrings = {
    GridResStrings: cloneValue(GridResourceStringsEN),
    PaginatorResStrings: cloneValue(PaginatorResourceStringsEN),
    TimePickerResStrings: cloneValue(TimePickerResourceStringsEN),
    CalendarResStrings: cloneValue(CalendarResourceStringsEN),
    DateRangePickerResStrings: cloneValue(DateRangePickerResourceStringsEN),
    CarouselResStrings: cloneValue(CarouselResourceStringsEN),
    ListResStrings: cloneValue(ListResourceStringsEN),
    InputResStrings: cloneValue(InputResourceStringsEN),
};

const updateResourceStrings = (currentStrings: IResourceStrings, newStrings: IResourceStrings) => {
    for (const key of Object.keys(newStrings)) {
        if (key in currentStrings) {
            currentStrings[key] = newStrings[key];
        }
    }
};

/**
 * Changes the resource strings for all components in the application
 * ```
 * @param resourceStrings to be applied
 */
export const changei18n = (resourceStrings: IResourceStrings) => {
    for (const key of Object.keys(CurrentResourceStrings)) {
        updateResourceStrings(CurrentResourceStrings[key], resourceStrings);
    }
};

/**
 * Returns current resource strings for all components
 */
export const getCurrentResourceStrings = (): IResourceStrings => ({
    ...CurrentResourceStrings.CalendarResStrings,
    ...CurrentResourceStrings.CarouselResStrings,
    ...CurrentResourceStrings.DateRangePickerResStrings,
    ...CurrentResourceStrings.GridResStrings,
    ...CurrentResourceStrings.InputResStrings,
    ...CurrentResourceStrings.ListResStrings,
    ...CurrentResourceStrings.PaginatorResStrings,
    ...CurrentResourceStrings.TimePickerResStrings
});
