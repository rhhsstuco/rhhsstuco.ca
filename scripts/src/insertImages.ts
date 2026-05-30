import * as path from 'path';
import { fileURLToPath } from 'url';
import { rename, readdir } from "fs/promises";
import inquirer from 'inquirer';

/* The renaming portion of this script can also be completed by pasting the following command in a Windows PowerShell terminals.
 * $i=[STARTING INDEX]; Get-ChildItem -Filter "*.jpg" | Sort-Object {[int]([regex]::Match($_.BaseName,'\d+').Value)} | ForEach-Object { Rename-Item $_.FullName "$i.jpg"; $i++ }
 * Make sure to replace [STARTING INDEX] with the index you want to start with, e.g. 220.
 * This command assumes that all files are .jpg and that the file names contain a number which determines their order. 
 * It also sorts the files by this number before renaming to avoid name conflicts.
*/

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ImageEntry {
	filepath: string;
	basename: string;
}

async function main() {
	const answers = await inquirer.prompt(
		[
			{
				name: "main",
				type: "input",
				message: "What is the path of the folder to be inserted into?",

			},
			{
				name: "input",
				type: "input",
				message: "What is the path of the folder to insert?",
			},
		]
	);

	// Get absolute paths of the two folders
	const mainPath = path.join(
		__dirname, 
		"..",
		answers.main,
	);

	const inputPath = path.join(
		__dirname, 
		"..",
		answers.input,
	);
	
	// Read files from folders
	const mainFiles = (await readdir(mainPath)).filter(file => file !== ".DS_Store");
	const inputFiles = (await readdir(inputPath)).filter(file => file !== ".DS_Store");

	// Calculate file name length
	const numFiles = mainFiles.length + inputFiles.length;
	const digits = Math.ceil(Math.log10(numFiles))

	// Map filenames to ImageEntries
	const orderArray = mainFiles.map(file => ({
		basename: file,
		filepath: path.join(mainPath, file),
	}) as ImageEntry)

	const inputArray = inputFiles.map(file => ({
		basename: file,
		filepath: path.join(inputPath, file),
	}) as ImageEntry)

	// Prompt for insertion
	for (const input of inputArray) {
		const answer = await inquirer.prompt([
			{
				name: "choice",
				type: "select",
				loop: true,
				message: `Where do you want to insert '${input.basename}'?`,
				choices: [...orderArray.map(entry => entry.basename), "<append>"],
			}
		])

		// Find and insert item
		if (answer.choice === "<append>") {
			orderArray.push(input)
		} else {
			const position = orderArray.findIndex(entry => entry.basename === answer.choice);
			orderArray.splice(position, 0, input);
		}
	}

	// Prompt for deletion
	const answer = await inquirer.prompt([
		{
			name: "checked",
			type: "checkbox",
			loop: true,
			message: `Select files to delete`,
			choices: orderArray.map(entry => entry.basename),
		}
	]);

	// Delete selected items
	const deleted = new Set<string>(answer.checked)
	const filteredArray = orderArray.filter(entry => !deleted.has(entry.basename))

	/** 
	 * Helper function which renames a file to a zero-padded integer
	 * @param position the new name of the file
	 * @param oldPath the old path to the file
	 * @param ext the file extension
	 */
	function renameWithExt(position: number, oldPath: string, ext: string) {
		const name = position.toString().padStart(digits, "0") + ext;
	
		const newPath = path.join(mainPath, name);
	
		return rename(oldPath, newPath);
	}

	// Rename to temp files then to image files to avoid name conflicts
	await Promise.all(filteredArray.map(({ filepath }, i) => renameWithExt(i + 1, filepath, ".temp")))
	await Promise.all(filteredArray.map(({ filepath }, i) => {
		const tempName = (i + 1).toString().padStart(digits, "0") + ".temp";
		const tempPath = path.join(mainPath, tempName);

		renameWithExt(i + 1, tempPath, path.extname(filepath).toLowerCase())
	}))
}


main()