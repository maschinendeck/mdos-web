class State {
	constructor(initialValue) {
		this.value = initialValue;
	}

	get get() {
		return this.value;
	}

	set(newValue) {
		this.value = newValue;
	}
}

const useLocalStorage = (identifier, defaultValue = null) => {
	const storedValue = localStorage.getItem(identifier);
	const value       = new State(storedValue && storedValue !== "" ? storedValue : defaultValue);

	const set = newValue => {
		value.set(newValue);
		newValue = value.get ? value.get.toString() : "";
		localStorage.setItem(identifier, newValue);
	};

	return [value.get, set];
}

export default useLocalStorage;