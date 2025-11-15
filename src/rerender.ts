import {VElement} from "./VElement.ts"

export function diff(oldVNode: VElement | string, newVNode: VElement | string, parentDom: HTMLElement) {
		// --- 1️⃣ Text node cases ---

		if (!(oldVNode instanceof VElement) && !(newVNode instanceof VElement)) {
				if (oldVNode !== newVNode) {
						// Replace text
						const textNode = document.createTextNode(newVNode);
						parentDom.replaceChild(textNode, parentDom.childNodes[0]);
				}
				return newVNode;
		}
		// If types differ, replace the whole node
		if (oldVNode instanceof VElement && newVNode instanceof VElement && oldVNode.type !== newVNode.type) {

				const newEl = newVNode.render();
				parentDom.replaceChild(newEl, oldVNode.dom!);
				return newVNode;
		}

		// --- 2️⃣ If newVNode is a string but oldVNode is VElement ---
		if (typeof newVNode === "string" && oldVNode instanceof VElement) {
				const textNode = document.createTextNode(newVNode);
				parentDom.replaceChild(textNode, oldVNode.dom!);
				return newVNode;
		}

		// --- 3️⃣ If oldVNode is a string but newVNode is VElement ---
		if (typeof oldVNode === "string" && newVNode instanceof VElement) {
				const newEl = newVNode.render();

				parentDom.replaceChild(newEl, parentDom.childNodes[0]);
				return newVNode;
		}

		// --- 4️⃣ Both are VElements with the same type ---
		if (oldVNode instanceof VElement && newVNode instanceof VElement) {
				const el = (newVNode.dom = oldVNode.dom!);

				// Update props
				updateProps(el as HTMLElement, oldVNode.props, newVNode.props);

				// Diff children

				diffChildren(el as HTMLElement, oldVNode.children, newVNode.children);

				return newVNode;
		}
}

// --- Update props helper ---
export function updateProps(el: HTMLElement, oldProps: any, newProps: any) {
		// Remove old props
		for (const key in oldProps) {
				if (!(key in newProps)) {
						if (key.startsWith("on")) {
								el.removeEventListener(key.slice(2).toLowerCase(), oldProps[key]);
						} else {
								el.removeAttribute(key);
						}
				}
		}

		// Add/update new props
		for (const key in newProps) {
				const oldVal = oldProps[key];
				const newVal = newProps[key];

				if (oldVal !== newVal) {
						if (key.startsWith("on") && typeof newVal === "function") {
								if (oldVal) el.removeEventListener(key.slice(2).toLowerCase(), oldVal);
								el.addEventListener(key.slice(2).toLowerCase(), newVal);
						} else {
								el.setAttribute(key, newVal);
						}
				}
		}
}

// --- Diff children helper ---
export function diffChildren(parent: HTMLElement, oldChildren: Array<VElement | string>, newChildren: Array<VElement | string>) {
		const maxLen = Math.max(oldChildren.length, newChildren.length);

		for (let i = 0; i < maxLen; i++) {
				const oldChild = oldChildren[i];
				const newChild = newChildren[i];


				// Child removed
				if (oldChild && !newChild) {
						const childDom = oldChild instanceof VElement ? oldChild.dom! : parent.childNodes[i];
						parent.removeChild(childDom);
						continue;
				}

				// Child added
				if (!oldChild && newChild) {
						const newDom = newChild instanceof VElement ? newChild.render() : document.createTextNode(newChild);

						parent.appendChild(newDom);
						if (newChild instanceof VElement) newChild.dom = newDom;
						continue;
				}
				// Both exist → diff recursively
				diff(oldChild!, newChild!, parent);
		}
}
