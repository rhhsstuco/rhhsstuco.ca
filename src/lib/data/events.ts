import { PUBLIC_SPREADSHEET_ID } from '$env/static/public';
import { getSpreadSheetValues, initSheetsAuth } from './spreadsheet';
import getAuxEvents from './auxEvents';

/**
 * @param maxResults the maximum size of the response set or undefined if no limit is specified.
 * @param minDate the earliest the event date can be
 * @param removeDuplicates if duplicates should be removed
 */
interface GetEventsParams {
	maxResults?: number;
	minDate?: Date;
	removeDuplicates?: boolean;
}

/**
 * Gets events from the Google spreadsheet
 * @param params parameters to modify the events to retrieve
 * @returns an array of SchoolEvents
 */
const getEvents = async (params?: GetEventsParams): Promise<SchoolEvent[]> => {
	const maxResults = params?.maxResults;
	const minDate = params?.minDate;
	const removeDuplicates = params?.removeDuplicates;
	
	// Initialize service account connection with Google Sheet
	await initSheetsAuth();

	// Grab the 2D array of cells from the Google Sheet
	const values = <string[][]> (await getSpreadSheetValues(PUBLIC_SPREADSHEET_ID, "Events", "A:F")) || [];

	// Create set for deduping values
	const seenNames = new Set<string>();

	// Remove metadata row and transform the values
	const primaryEvents = values.slice(1).map(row => {
		const splitStartDate = row[2].split('/');
		const splitEndDate = row[3].split('/');

		let type = row[4]

		if (type === "School Event") {
			type = "school"
		} else if (type === "Club Event") {
			type = "club"
		} else {
			throw Error("Event type is not either 'School Event' or 'Club Event'.");
		}

		return {
			name: row[0],
			description: row[1],
			startDate: new Date(+splitStartDate[2], +splitStartDate[0] - 1, +splitStartDate[1]),
			endDate: new Date(+splitEndDate[2], +splitEndDate[0] - 1, +splitEndDate[1]),
			type: <"school" | "club"> type,
			useHTML: row[5] ? (row[5].toLowerCase() === "true") : undefined
		} as SchoolEvent
	});

	const auxiliaryEvents = await getAuxEvents();

	const transformedValues = primaryEvents.concat(auxiliaryEvents).filter(schoolEvent => {
		if (minDate) {
			return schoolEvent.startDate > minDate;
		}

		return true;
	}).filter(schoolEvent => {
		if (removeDuplicates) {
			const eventName = schoolEvent.name;

			if (seenNames.has(eventName)) {
				return false;
			}

			seenNames.add(eventName);
		}

		return true;
	}).sort((firstEvent, secondEvent) =>
		firstEvent.startDate.getTime() - secondEvent.startDate.getTime()
	).slice(0, maxResults);

	return transformedValues;
};

export default getEvents;