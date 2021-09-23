String.prototype.ucFirst = function () {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

class Q6 {
	constructor(selector, context = document) {
		if (typeof selector === "object")
			this._elements = [selector];
		else {
			if (selector.trim().charAt(0) === '<')
				this._elements = [Q6.CreateElement(selector.trim())];

			else
				this._elements = context.querySelectorAll(selector);
		}
	}

	_each(callback) {
		for (let element of this._elements)
			callback(element);
	}

	addClass(className) {
		this._each(element => {
			element.classList.add(className);
		});

		return this;
	}

	append(newElement) {
		this._each(element => {
			element.appendChild(newElement._elements[0]);
		});

		return this;
	}

	data(key, value = null) {
		if (value === null)
			return this._elements[0].dataset[key];
		this._each(element => {
			element.dataset[key] = value;
		});

		return this;
	}

	appendTo(selector) {
		new Q6(selector).append(new Q6(this._elements[0]));

		return this;
	}

	attr(key, value = null) {
		if (value === null)
			return this._elements[0].getAttribute(key);
		this._each(element => {
			element.setAttribute(key, value)
		});

		return this;
	}

	click(callback) {
		this.on("click", callback);

		return this;
	}

	css(key, value = null) {
		if (value === null)
			return this._elements.style[Q6.TranslateCSSKey(key)];

		this._each(element => {
			element.style[Q6.TranslateCSSKey(key)] = value;
		});
	}

	each(callback) {
		for (let element of this._elements)
			callback(new Q6(element));

		return this;
	}

	find(selector) {
		return new Q6(selector, this._elements[0]);
	}

	get(index = 0) {
		return this._elements[index];
	}

	hasClass(className) {
		return className in this._elements.classList;
	}

	html(value = null) {
		if (value === null)
			return this._elements[0].innerHTML;
		this._each(element => {
			element.innerHTML = value;
		});

		return this;
	}

	length() {
		return this._elements.length;
	}

	load(url) {
		Q6.Ajax(url, response => {
			this.each(element => {
				element.html(response);
			});
		});

		return this;
	}

	on(eventName, callback) {
		this._each(element => {
			element.addEventListener(eventName, event => {
				callback(this, event);
			});
		});

		return this;
	}

	prepend(newElement) {
		this._each(element => {
			element.parentNode.insertBefore(newElement, element);
		});

		return this;
	}

	removeClass(className) {
		this._each(element => {
			element.classList.remove(className);
		});

		return this;
	}

	ready(callback) {
		return this.on("DOMContentLoaded", callback);
	}

	toggleClass(className) {
		this._each(element => {
			element.classList.toggle(className);
		});

		return this;
	}

	val(value = null) {
		if (value === null)
			return this._elements[0].value;
		this._each(element => {
			element.value = value;
		});

		return this;
	}

	static $(selector) {
		return new Q6(selector);
	}

	static CreateElement(source) {
		let element = document.createElement("template");
		element.innerHTML = source;

		return element.content.firstChild;
	}

	static TranslateCSSKey(key) {
		if (key.indexOf('-') < 0)
			return key;
		key = key.split('-');

		return key[0] + key[1].ucFirst();
	}

	static Ajax(url, callback) {
		const request = new XMLHttpRequest();
		request.addEventListener("load", event => {
			callback(event.currentTarget.response);
		});
		request.open("GET", url);
		request.send();
	}
}

const $ = Q6.$;
$.ajax  = Q6.Ajax;

export {$};
export default Q6;