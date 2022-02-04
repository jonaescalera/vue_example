function sortStrings(a, b) {
	return a.localeCompare(
		b,
		'en-US',
		{ numeric: true, sensitivity: 'base' }
	);
}

function sortByName(a, b) {
	return sortStrings(a.name || '', b.name || '');
}

function sortByValue(a, b) {
	return sortStrings(a.value || '', b.value || '');
}

function sortByLabel(a, b) {
	return sortStrings(a.label || '', b.label || '');
}

export { 
	sortByName,
	sortByValue,
	sortByLabel,
}