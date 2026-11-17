import { PUBLIC_EVENTS_SPREADSHEET_ID } from '$env/static/public';
import { getSpreadSheetValues, initSheetsAuth } from './spreadsheet';

const CLUB_EVENTS_SHEET_NAME = 'Responses';

function parseEventDate(value: string, rowNumber: number): Date {
	const parts = value.trim().split('/');

	if (parts.length === 3) {
		const [month, day, year] = parts.map(Number);
		const date = new Date(year, month - 1, day);

		if (
			Number.isInteger(month) &&
			Number.isInteger(day) &&
			Number.isInteger(year) &&
			date.getFullYear() === year &&
			date.getMonth() === month - 1 &&
			date.getDate() === day
		) {
			return date;
		}
	}

	const date = new Date(value);
	if (!Number.isNaN(date.getTime())) {
		return new Date(date.getFullYear(), date.getMonth(), date.getDate());
	}

	throw new Error(`Invalid club event date in row ${rowNumber}: "${value}"`);
}

const getAuxEvents = async (): Promise<SchoolEvent[]> => {
	await initSheetsAuth();

	let values: string[][] | undefined;

	try {
		values = (await getSpreadSheetValues(
			PUBLIC_EVENTS_SPREADSHEET_ID,
			CLUB_EVENTS_SHEET_NAME,
			'A:D'
		)) as string[][] | undefined;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		const status =
			typeof error === 'object' && error !== null && 'code' in error
				? (error as { code?: number }).code
				: undefined;

		if (message.includes('Unable to parse range')) {
			console.warn(
				`Optional "${CLUB_EVENTS_SHEET_NAME}" sheet was not found; continuing without club events.`
			);
			return [];
		}

		if (status === 403 || message.includes('The caller does not have permission')) {
			console.warn(
				`Optional club events spreadsheet "${PUBLIC_EVENTS_SPREADSHEET_ID}" is not readable by the configured service account; continuing without club events.`
			);
			return [];
		}

		throw error;
	}

	return (values ?? []).slice(1).flatMap((row, index) => {
		const rowNumber = index + 2;
		const [_, name, eventDate, description] = row;

		if (!name?.trim() && !eventDate?.trim() && !description?.trim()) {
			return [];
		}

		if (!name?.trim() || !eventDate?.trim()) {
			throw new Error(`Missing club event title or date in row ${rowNumber}`);
		}

		const date = parseEventDate(eventDate, rowNumber);

		return [
			{
				name: name.trim(),
				description: description?.trim() ?? '',
				startDate: date,
				endDate: date,
				type: 'club',
				isAuxiliary: true
			}
		];
	});
};

export default getAuxEvents;
