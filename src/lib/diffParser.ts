type DiffFileType = 'add' | 'delete' | 'modify' | 'rename' | 'copy';
type ChangeType = 'insert' | 'delete' | 'normal';

interface PathInfo {
	oldPath: string | null;
	newPath: string | null;
}

interface InsertChange {
	content: string;
	type: 'insert';
	isInsert: true;
	lineNumber: number;
}

interface DeleteChange {
	content: string;
	type: 'delete';
	isDelete: true;
	lineNumber: number;
}

interface NormalChange {
	content: string;
	type: 'normal';
	isNormal: true;
	oldLineNumber: number;
	newLineNumber: number;
}

type Change = InsertChange | DeleteChange | NormalChange;

interface Hunk {
	content: string;
	oldStart: number;
	newStart: number;
	oldLines: number;
	newLines: number;
	changes: Change[];
}

interface DiffInfo {
	hunks: Hunk[];
	oldEndingNewLine: boolean;
	newEndingNewLine: boolean;
	oldPath: string | null;
	newPath: string | null;
	type: DiffFileType;
	additions: number;
	deletions: number;
	totalLines: number;
	similarity?: number;
	oldRevision?: string;
	newRevision?: string;
	oldMode?: string;
	newMode?: string;
	isBinary?: boolean;
	newFileExt?: string;
	oldFileExt?: string;
	name?: string;
}

const STAT_START = 2;
const STAT_HUNK = 5;

function parsePathFromFirstLine(line: string): PathInfo {
	const filesStr = line.slice(11);
	let oldPath: string | null = null;
	let newPath: string | null = null;

	const quoteIndex = filesStr.indexOf('"');
	switch (quoteIndex) {
		case -1: {
			const spaceIdx = filesStr.indexOf(' ');
			oldPath = filesStr.slice(2, spaceIdx);
			newPath = filesStr.slice(spaceIdx + 3);
			break;
		}

		case 0: {
			const nextQuoteIndex = filesStr.indexOf('"', 2);
			oldPath = filesStr.slice(3, nextQuoteIndex);
			const newQuoteIndex = filesStr.indexOf('"', nextQuoteIndex + 1);
			if (newQuoteIndex < 0) {
				newPath = filesStr.slice(nextQuoteIndex + 4);
			} else {
				newPath = filesStr.slice(newQuoteIndex + 3, -1);
			}
			break;
		}

		default: {
			const spaceIdx = filesStr.indexOf(' ');
			oldPath = filesStr.slice(2, spaceIdx);
			newPath = filesStr.slice(spaceIdx + 3, -1);
			break;
		}
	}

	return {
		oldPath,
		newPath
	};
}

/**
 * Compute additional stats for a DiffInfo
 */
function computeFileStats(info: DiffInfo): void {
	let additions = 0;
	let deletions = 0;
	let totalLines = 0;

	for (const hunk of info.hunks) {
		for (const change of hunk.changes) {
			totalLines++;
			if (change.type === 'insert') {
				additions++;
			} else if (change.type === 'delete') {
				deletions++;
			}
		}
	}

	info.additions = additions;
	info.deletions = deletions;
	info.totalLines = totalLines;
	info.newFileExt = info.newPath?.split('.').pop()?.toLowerCase() || '';
	info.oldFileExt = info.oldPath?.split('.').pop()?.toLowerCase() || '';
	info.name =
		info.type === 'delete' ? info.oldPath?.split('/').pop() : info.newPath?.split('/').pop();
}

// Pre-compiled regex for better performance
const hunkHeaderRegex = /^@@\s+-([0-9]+)(,([0-9]+))?\s+\+([0-9]+)(,([0-9]+))?/;

const parser = {
	/**
	 * Parse git diff message
	 *
	 * @param {string} source git diff message content
	 * @return {DiffInfo[]}
	 */
	parse: function (source: string): DiffInfo[] {
		const infos: DiffInfo[] = [];
		let stat = STAT_START;
		let currentInfo: DiffInfo | null = null;
		let currentHunk: Hunk | null = null;
		let changeOldLine: number = 0;
		let changeNewLine: number = 0;
		let paths: PathInfo;

		const lines = source.split('\n');
		const linesLen = lines.length;
		let i = 0;

		while (i < linesLen) {
			const line = lines[i];
			const firstChar = line.charCodeAt(0);

			// Check for "diff --git" (d = 100)
			if (
				firstChar === 100 &&
				line.charCodeAt(1) === 105 &&
				line.charCodeAt(2) === 102 &&
				line.charCodeAt(3) === 102
			) {
				// Compute stats for previous file before starting new one
				if (currentInfo) {
					computeFileStats(currentInfo);
				}

				// read file
				paths = parsePathFromFirstLine(line);
				currentInfo = {
					hunks: [],
					oldEndingNewLine: true,
					newEndingNewLine: true,
					oldPath: paths.oldPath,
					newPath: paths.newPath,
					type: 'modify', // default, will be updated
					additions: 0,
					deletions: 0,
					totalLines: 0
				};

				infos.push(currentInfo);

				// 1. If oldPath is /dev/null it's an add
				// 2. If newPath is /dev/null it's a delete
				// 3. If there's "rename from foo.js" it's a rename
				// 4. If there's "copy from foo.js" it's a copy
				// 5. Otherwise it's a modify
				let currentInfoType: DiffFileType | null = null;

				// read type and index
				let simiLine: string;
				simiLoop: while ((simiLine = lines[++i])) {
					const spaceIndex = simiLine.indexOf(' ');
					const infoType = spaceIndex > -1 ? simiLine.slice(0, spaceIndex) : simiLine;

					switch (infoType) {
						case 'diff': // diff --git
							i--;
							break simiLoop;

						case 'deleted':
						case 'new': {
							const leftStr = simiLine.slice(spaceIndex + 1);
							if (leftStr.charCodeAt(0) === 102 && leftStr.charCodeAt(5) === 109) {
								// "file mode"
								currentInfo[infoType === 'new' ? 'newMode' : 'oldMode'] = leftStr.slice(10);
							}
							break;
						}

						case 'similarity': {
							// Faster parsing without split
							const lastSpace = simiLine.lastIndexOf(' ');
							currentInfo.similarity = parseInt(simiLine.slice(lastSpace + 1), 10);
							break;
						}

						case 'index': {
							const restStr = simiLine.slice(spaceIndex + 1);
							const dotDotIndex = restStr.indexOf('..');
							const spaceIdx = restStr.indexOf(' ');

							currentInfo.oldRevision = restStr.slice(0, dotDotIndex);
							currentInfo.newRevision =
								spaceIdx > -1
									? restStr.slice(dotDotIndex + 2, spaceIdx)
									: restStr.slice(dotDotIndex + 2);

							if (spaceIdx > -1) {
								currentInfo.oldMode = currentInfo.newMode = restStr.slice(spaceIdx + 1);
							}
							break;
						}

						case 'copy':
						case 'rename': {
							const infoStr = simiLine.slice(spaceIndex + 1);
							if (infoStr.charCodeAt(0) === 102) {
								// 'f' for "from"
								currentInfo.oldPath = infoStr.slice(5);
							} else {
								// rename to / copy to
								currentInfo.newPath = infoStr.slice(3);
							}
							currentInfoType = infoType as 'copy' | 'rename';
							break;
						}

						case '---': {
							let oldPath = simiLine.slice(spaceIndex + 1);
							let newPath = lines[++i].slice(4); // next line must be "+++ xxx"
							if (oldPath === '/dev/null') {
								newPath = newPath.slice(2);
								currentInfoType = 'add';
							} else if (newPath === '/dev/null') {
								oldPath = oldPath.slice(2);
								currentInfoType = 'delete';
							} else {
								currentInfoType = 'modify';
								oldPath = oldPath.slice(2);
								newPath = newPath.slice(2);
							}

							if (oldPath) {
								currentInfo.oldPath = oldPath;
							}
							if (newPath) {
								currentInfo.newPath = newPath;
							}
							stat = STAT_HUNK;
							break simiLoop;
						}
					}
				}

				currentInfo.type = currentInfoType || 'modify';
			}
			// Check for "Binary" (B = 66)
			else if (firstChar === 66 && line.charCodeAt(1) === 105 && line.charCodeAt(2) === 110) {
				if (currentInfo) {
					currentInfo.isBinary = true;
					currentInfo.type =
						line.indexOf('/dev/null and') >= 0
							? 'add'
							: line.indexOf('and /dev/null') >= 0
								? 'delete'
								: 'modify';
				}
				stat = STAT_START;
				currentInfo = null;
			} else if (stat === STAT_HUNK) {
				// Check for "@@" (@ = 64)
				if (firstChar === 64 && line.charCodeAt(1) === 64) {
					const match = hunkHeaderRegex.exec(line);
					if (match && currentInfo) {
						currentHunk = {
							content: line,
							oldStart: Number(match[1]),
							newStart: Number(match[4]),
							oldLines: Number(match[3]) || 1,
							newLines: Number(match[6]) || 1,
							changes: []
						};

						currentInfo.hunks.push(currentHunk);
						changeOldLine = currentHunk.oldStart;
						changeNewLine = currentHunk.newStart;
					}
				} else if (currentHunk) {
					const typeChar = firstChar;
					let change: Change | null = null;

					switch (typeChar) {
						case 43: {
							// '+' = 43
							change = {
								content: line.slice(1),
								type: 'insert',
								isInsert: true,
								lineNumber: changeNewLine
							};
							changeNewLine++;
							currentHunk.changes.push(change);
							break;
						}

						case 45: {
							// '-' = 45
							change = {
								content: line.slice(1),
								type: 'delete',
								isDelete: true,
								lineNumber: changeOldLine
							};
							changeOldLine++;
							currentHunk.changes.push(change);
							break;
						}

						case 32: {
							// ' ' = 32
							change = {
								content: line.slice(1),
								type: 'normal',
								isNormal: true,
								oldLineNumber: changeOldLine,
								newLineNumber: changeNewLine
							};
							changeOldLine++;
							changeNewLine++;
							currentHunk.changes.push(change);
							break;
						}

						case 92: {
							// '\\' = 92 - Seems "no newline" is the only case starting with \
							const changesLen = currentHunk.changes.length;
							if (changesLen > 0 && currentInfo) {
								const lastChange = currentHunk.changes[changesLen - 1];
								if (lastChange.type !== 'delete') {
									currentInfo.newEndingNewLine = false;
								}
								if (lastChange.type !== 'insert') {
									currentInfo.oldEndingNewLine = false;
								}
							}
							break;
						}
					}
				}
			}

			i++;
		}

		// Compute stats for the last file
		if (currentInfo) {
			computeFileStats(currentInfo);
		}

		// Sort by path
		return infos.sort((a, b) => {
			const aPath = a.type === 'delete' ? a.oldPath : a.newPath;
			const bPath = b.type === 'delete' ? b.oldPath : b.newPath;
			if (aPath && bPath) {
				return aPath.localeCompare(bPath);
			}
			return 0;
		});
	}
};

// Split view data structures
interface SplitLineData {
	content: string;
	type: 'insert' | 'delete' | 'normal' | 'empty';
	lineNumber: number | null;
	originalIndex?: number;
}

interface SplitViewData {
	left: SplitLineData[];
	right: SplitLineData[];
	totalLines: number;
}

/**
 * Convert a DiffInfo to split view format for side-by-side rendering
 * This aligns changes line-by-line for canvas-based diff viewers
 *
 * @param diff The parsed diff information
 * @return Split view data with left (original) and right (modified) lines
 */
function convertToSplitView(diff: DiffInfo): SplitViewData {
	if (diff.isBinary) {
		return {
			left: [{ content: '// Binary file', type: 'normal', lineNumber: 1 }],
			right: [{ content: '// Binary file', type: 'normal', lineNumber: 1 }],
			totalLines: 1
		};
	}

	const left: SplitLineData[] = [];
	const right: SplitLineData[] = [];

	for (const hunk of diff.hunks) {
		for (const change of hunk.changes) {
			if (change.type === 'normal') {
				// Unchanged lines appear on both sides
				left.push({
					content: change.content,
					type: 'normal',
					lineNumber: change.oldLineNumber
				});
				right.push({
					content: change.content,
					type: 'normal',
					lineNumber: change.newLineNumber
				});
			} else if (change.type === 'delete') {
				// Deletions appear on left, empty on right
				left.push({
					content: change.content,
					type: 'delete',
					lineNumber: change.lineNumber
				});
				right.push({
					content: '',
					type: 'empty',
					lineNumber: null
				});
			} else if (change.type === 'insert') {
				// Insertions appear on right, empty on left
				left.push({
					content: '',
					type: 'empty',
					lineNumber: null
				});
				right.push({
					content: change.content,
					type: 'insert',
					lineNumber: change.lineNumber
				});
			}
		}
	}

	return {
		left,
		right,
		totalLines: Math.max(left.length, right.length)
	};
}

/**
 * Batch convert multiple diffs to split view format
 */
function convertMultipleToSplitView(diffs: DiffInfo[]): SplitViewData[] {
	return diffs.map(convertToSplitView);
}

export default parser;
export { convertToSplitView, convertMultipleToSplitView };
export type {
	DiffInfo,
	Hunk,
	Change,
	InsertChange,
	DeleteChange,
	NormalChange,
	DiffFileType,
	ChangeType,
	SplitLineData,
	SplitViewData
};
