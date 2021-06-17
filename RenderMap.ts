import { getUUID, UUID } from './UUID';
import { Option } from './Utility';

export interface IRenderMapIndex {
	row: number;
	index: number;
	width: number;
}
const MAX_ELEMENTS_PER_ROW = 10;
export interface IRenderMapEntry {
	type: 'block' | 'empty';
	id: UUID;
	// How many columns does this entry fill in relation to other blocks
	scale: number;
}
export type BlockRenderMap = Array<Array<IRenderMapEntry>>; // RenderMap<typeof columnLength>;

const trimMap = (map: BlockRenderMap): BlockRenderMap => {
	const newMap = [];
	for (const row of map) {
		let containsOnlyEmpty = true;
		for (const entry of row) {
			if (entry.type === 'block') {
				containsOnlyEmpty = false;
				break;
			}
		}
		if (!containsOnlyEmpty) {
			newMap.push(row);
		}
	}
	return newMap;
};

const findGridPositionById = ({
	id,
	renderMap,
}: {
	id: UUID;
	renderMap: BlockRenderMap;
}): Option<{ row: number; column: number }> => {
	for (const [y, row] of renderMap.entries()) {
		for (const [x, entry] of row.entries()) {
			if (entry.id === id) {
				return { row: y, column: x };
			}
		}
	}
	return null;
};

interface IFreeGridParams {
	mode: 'up' | 'down';
	startRow: number;
	startColumn: number;
	renderMap: BlockRenderMap;
}

const findFreeGridSpace = ({
	mode,
	startRow,
	startColumn,
	renderMap,
}: IFreeGridParams): Option<{ row: number; column: number }> => {
	const numberOfRows = renderMap.length;
	let startIndex = startColumn;
	if (mode === 'down') {
		for (let y = startRow; y < numberOfRows; y++) {
			const row = renderMap[y];
			const numberOfColumns = row.length;
			for (let x = startIndex; x < numberOfColumns; x++) {
				const entry = row[x];
				if (entry.type === 'empty') {
					return { row: y, column: x };
				}
			}
			startIndex = 0;
		}
	} else {
		for (let y = startRow; y + 1 > 0; y--) {
			const row = renderMap[y];
			// eslint-disable-next-line for-direction
			startIndex = y === startRow ? startColumn : row.length - 1;
			for (let x = startIndex; x + 1 > 0; x--) {
				const entry = row[x];
				if (entry.type === 'empty') {
					return { row: y, column: x };
				}
			}
		}
	}
	return null;
};

const findAdjacentCell = ({
	startRow,
	startColumn,
	direction,
	renderMap,
}: {
	startRow: number;
	startColumn: number;
	direction: 'up' | 'down';
	renderMap: BlockRenderMap;
}): Option<{ row: number; column: number }> => {
	if (direction === 'up') {
		let rowIndex = startRow;
		while (rowIndex > -1) {
			const row = renderMap[rowIndex];
			const columnIndex =
				rowIndex === startRow ? startColumn - 1 : row.length - 1;
			if (columnIndex > -1) {
				return { row: rowIndex, column: columnIndex };
			}
			rowIndex--;
		}
	} else {
		const numOfRows = renderMap.length;
		let rowIndex = startRow;
		while (rowIndex < numOfRows) {
			const row = renderMap[rowIndex];
			const rowWidth = row.length;
			const columnIndex = rowIndex === startRow ? startColumn + 1 : 0;
			if (columnIndex < rowWidth) {
				return { row: rowIndex, column: columnIndex };
			}
			rowIndex++;
		}
	}
	return null;
};

const moveEntryToEmpty = ({
	id,
	direction,
	renderMap,
}: {
	id: UUID;
	direction: 'up' | 'down';
	renderMap: BlockRenderMap;
}): Option<BlockRenderMap> => {
	const gridPosition = findGridPositionById({ id, renderMap });
	if (!gridPosition) {
		return null;
	}
	const { row: blockRowIndex, column: blockColumnIndex } = gridPosition;
	const freeGridPosition = findFreeGridSpace({
		mode: direction,
		startRow: blockRowIndex,
		startColumn: blockColumnIndex,
		renderMap,
	});
	if (!freeGridPosition) {
		return null;
	}
	const { row: emptyRowIndex, column: emptyColumnIndex } = freeGridPosition;

	const emptyBlock = renderMap[blockRowIndex][blockColumnIndex];
	const newBlock = renderMap[emptyRowIndex][emptyColumnIndex];

	const emptyBlockScale = newBlock.scale;
	const newBlockScale = emptyBlock.scale;

	const newMap = renderMap.map((inner) => inner.slice());

	newMap[emptyRowIndex].splice(emptyColumnIndex, 1, {
		...emptyBlock,
		scale: emptyBlockScale,
	});

	newMap[blockRowIndex].splice(blockColumnIndex, 1, {
		...newBlock,
		scale: newBlockScale,
	});
	const trimmedMap = trimMap(newMap);
	return trimmedMap;
};

const moveEntry = ({
	currentRow,
	currentColumn,
	targetRow,
	targetColumn,
	renderMap,
}: {
	currentRow: number;
	currentColumn: number;
	targetRow: number;
	targetColumn: number;
	renderMap: BlockRenderMap;
}): Option<BlockRenderMap> => {
	const current = renderMap[currentRow][currentColumn];

	const isHead = targetRow < 0;
	const isTail = targetRow >= renderMap.length;
	const isNewRow = isHead || isTail;
	const newTargetRow = isNewRow ? [] : [...renderMap[targetRow]];
	const newCurrentRow = [...renderMap[currentRow]];

	const newMap = [...renderMap];
	newTargetRow.splice(targetColumn, 0, current);
	newCurrentRow.splice(currentColumn, 1);

	newMap.splice(currentRow, 1, newCurrentRow);

	if (isNewRow) {
		if (isTail) {
			newMap.push(newTargetRow);
		} else {
			newMap.splice(0, 0, newTargetRow);
		}
	} else {
		newMap.splice(targetRow, 1, newTargetRow);
	}

	const trimmedMap = trimMap(newMap);
	return trimmedMap;
};

const slideEntry = ({
	id,
	direction,
	renderMap,
}: {
	id: UUID;
	direction: 'up' | 'down';
	renderMap: BlockRenderMap;
}): Option<BlockRenderMap> => {
	const gridPosition = findGridPositionById({ id, renderMap });
	if (!gridPosition) {
		return null;
	}

	const { row: blockRowIndex, column: blockColumnIndex } = gridPosition;
	const swapPostition = findAdjacentCell({
		startRow: blockRowIndex,
		startColumn: blockColumnIndex,
		direction,
		renderMap,
	});
	if (!swapPostition) {
		return null;
	}
	const { row: swapRowIndex, column: swapColumnIndex } = swapPostition;

	const block = renderMap[blockRowIndex][blockColumnIndex];
	const swap = renderMap[swapRowIndex][swapColumnIndex];

	const newMap = renderMap.map((inner) => inner.slice());
	newMap[blockRowIndex].splice(blockColumnIndex, 1, {
		...swap,
		scale: block.scale,
	});
	newMap[swapRowIndex].splice(swapColumnIndex, 1, {
		...block,
		scale: swap.scale,
	});
	const trimmedMap = trimMap(newMap);
	return trimmedMap;
};

const scaleEntry = ({
	id,
	mode,
	renderMap,
}: {
	id: UUID;
	mode: 'up' | 'down';
	renderMap: BlockRenderMap;
}): Option<BlockRenderMap> => {
	const mapIndex = findGridPositionById({ id, renderMap });
	if (!mapIndex) {
		return null;
	}
	const { row, column } = mapIndex;

	const currentRow = renderMap[row];
	const rowElementCount = currentRow.length;
	if (!rowElementCount || rowElementCount < 2) {
		return null;
	}

	const newRow = [...currentRow];
	const entryToScale = newRow[column];

	const currentScale = entryToScale.scale;
	const newScale = Math.max(
		mode === 'up' ? currentScale + 1 : currentScale - 1,
		1
	);
	newRow.splice(column, 1, {
		...entryToScale,
		scale: newScale,
	});

	const newMap = [...renderMap];
	newMap.splice(row, 1, newRow);

	return newMap;
};

const balance = ({
	row,
	mode,
	renderMap,
}: {
	row: number;
	mode: 'left' | 'right';
	renderMap: BlockRenderMap;
}): Option<BlockRenderMap> => {
	if (row >= renderMap.length) {
		return null;
	}
	const currentRow = renderMap[row];
	const rowElementCount = currentRow.length;
	if (!rowElementCount || rowElementCount < 2) {
		return null;
	}

	const newRow = [...currentRow].map((entry) => ({
		...entry,
		width: entry.scale + 1,
	}));
	newRow.splice(mode === 'left' ? 0 : 1, 1, {
		...newRow[0],
		scale: newRow[0].scale ? newRow[0].scale + 1 : 2,
	});

	const newMap = [...renderMap];
	newMap.splice(row, 1, newRow);

	return newMap;
};

const mergeRow = ({
	row,
	renderMap,
}: {
	row: number;
	renderMap: BlockRenderMap;
}): Option<BlockRenderMap> => {
	if (row >= renderMap.length) {
		return null;
	}
	const currentRow = renderMap[row];
	const rowElementCount = currentRow.length;
	if (!rowElementCount || rowElementCount < 2) {
		return null;
	}

	const emptyCellIndex = currentRow.findIndex(
		(entry) => entry.type === 'empty'
	);
	if (emptyCellIndex < 0) {
		return null;
	}
	const newRow = [...currentRow];
	newRow.splice(emptyCellIndex, 1);

	const newMap = [...renderMap];
	newMap.splice(row, 1, newRow);

	return newMap;
};

const splitRow = ({
	row,
	renderMap,
}: {
	row: number;
	renderMap: BlockRenderMap;
}): Option<BlockRenderMap> => {
	/* const rowIndex = getRenderMapRowIndex({
			id: block.id.substr(0, 8),
			renderMap,
		});
		if (!rowIndex) {
			return;
		}
		const { row, index, width } = rowIndex;
		*/
	if (row >= renderMap.length) {
		return null;
	}
	const currentRow = renderMap[row];
	const rowElementCount = currentRow.length;
	if (!rowElementCount || rowElementCount >= MAX_ELEMENTS_PER_ROW) {
		return null;
	}

	const newRowElements = new Array<IRenderMapEntry>();
	for (let i = 0; i < rowElementCount + 1; i++) {
		const mapEntry = currentRow[i];
		if (mapEntry) {
			newRowElements.push({ ...mapEntry });
		} else {
			newRowElements.push({
				type: 'empty',
				id: getUUID(),
				scale: 1,
			});
		}
	}

	const newRow = [...newRowElements.flat()];
	const newRenderMap = [...renderMap];
	newRenderMap.splice(row, 1, newRow);
	return newRenderMap;
};

const addRow = ({
	id,
	position,
	renderMap,
}: {
	id: UUID;
	position: 'start' | 'end';
	renderMap: BlockRenderMap;
}): Option<BlockRenderMap> => {
	const newRow: IRenderMapEntry = {
		type: 'block',
		id,
		scale: 1,
	};
	let newRenderMap: BlockRenderMap | null = null;
	if (position === 'end') {
		newRenderMap = [...renderMap, [newRow]];
	} else {
		newRenderMap = [[newRow], ...renderMap];
	}
	return newRenderMap;
};

const swapEntries = ({
	sourceRow,
	sourceColumn,
	targetRow,
	targetColumn,
	renderMap,
}: {
	sourceRow: number;
	sourceColumn: number;
	targetRow: number;
	targetColumn: number;
	renderMap: BlockRenderMap;
}): Option<BlockRenderMap> => {
	const numOfRows = renderMap.length;

	if (sourceRow === targetRow && sourceColumn === targetColumn) {
		return null;
	}

	if (
		sourceRow < 0 ||
		sourceRow >= numOfRows ||
		targetRow < 0 ||
		targetRow >= numOfRows
	) {
		return null;
	}
	const sourceMapRow = [...renderMap[sourceRow]];
	let targetMapRow = null;
	if (targetRow === sourceRow) {
		targetMapRow = sourceMapRow;
	} else {
		targetMapRow = [...renderMap[targetRow]];
	}

	const sourceMapRowLength = sourceMapRow.length;
	const targetMapRowLength = targetMapRow.length;

	if (
		sourceColumn < 0 ||
		sourceColumn >= sourceMapRowLength ||
		targetColumn < 0 ||
		targetColumn >= targetMapRowLength
	) {
		return null;
	}

	const sourceMapEntry = sourceMapRow[sourceColumn];
	const targetMapEntry = targetMapRow[targetColumn];

	sourceMapRow.splice(sourceColumn, 1, {
		...targetMapEntry,
		scale: sourceMapEntry.scale,
	});
	targetMapRow.splice(targetColumn, 1, {
		...sourceMapEntry,
		scale: targetMapEntry.scale,
	});

	const newMap = [...renderMap];
	newMap.splice(sourceRow, 1, sourceMapRow);
	newMap.splice(targetRow, 1, targetMapRow);

	return newMap;
};

const addEntry = ({
	id,
	position,
	renderMap,
}: {
	id: UUID;
	position: 'start' | 'end';
	renderMap: BlockRenderMap;
}): Option<BlockRenderMap> => {
	const newCell: IRenderMapEntry = {
		type: 'block',
		id,
		scale: 1,
	};
	const freeSpaceParams: IFreeGridParams =
		position === 'start'
			? {
					mode: 'down',
					startRow: 0,
					startColumn: 0,
					renderMap,
			  }
			: {
					mode: 'up',
					startRow: renderMap.length - 1,
					startColumn: renderMap[renderMap.length - 1].length - 1,
					renderMap,
			  };

	const freeSpace = findFreeGridSpace(freeSpaceParams);
	if (freeSpace) {
		const { row: freeRow, column: freeColumn } = freeSpace;
		const row = renderMap[freeRow];
		const emptyCell = row[freeColumn];
		const newRow = [...row];

		newCell.scale = emptyCell.scale;
		newRow.splice(freeColumn, 1, newCell);
		const newRenderMap = [...renderMap];
		newRenderMap.splice(freeRow, 1, newRow);
		return newRenderMap;
	}
	const newMap = addRow({ id, position: 'end', renderMap });
	return newMap;
};

const removeEntry = ({
	id,
	renderMap,
}: {
	id: UUID;
	renderMap: BlockRenderMap;
}): Option<BlockRenderMap> => {
	const blockIndex = findGridPositionById({ id, renderMap });
	if (!blockIndex) {
		return null;
	}
	const { row, column } = blockIndex;
	const newRow = [...renderMap[row]];
	newRow.splice(column, 1);

	const newMap = [...renderMap];
	if (newRow.length > 0) {
		newMap.splice(row, 1, newRow);
	} else {
		newMap.splice(row, 1);
	}

	return trimMap(newMap);
};

const insertEmptyRow = ({
	rowIndex,
	renderMap,
}: {
	rowIndex: number;
	renderMap: BlockRenderMap;
}): Option<BlockRenderMap> => {
	if (rowIndex < 0 || rowIndex > renderMap.length) {
		return null;
	}
	const newMap = [...renderMap];
	newMap.splice(rowIndex, 0, []);
	return newMap;
};

export {
	addRow,
	addEntry,
	removeEntry,
	slideEntry,
	moveEntry,
	scaleEntry,
	swapEntries,
	balance,
	moveEntryToEmpty,
	insertEmptyRow,
	splitRow,
	mergeRow,
};
