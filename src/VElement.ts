import { TemplateComponent } from "./Component";

export const componentRegistry: Record<string, HTMLTemplateElement> = {};

const templates = document.querySelectorAll('template[rapid-name]');

templates.forEach(t => {
  const name = t.getAttribute('rapid-name');
  if (name) {
    componentRegistry[name] = t;
  }
});

export class VElement {
	type: string;
	props: { [key: string]: any };
	children: Array<VElement | string>;
	dom?: HTMLElement | Text; // optional reference to real DOM node
	
		
	constructor(
		type: string,
		props: { [key: string]: any } = {},
		children: Array<VElement | string> = []
	) {
		this.type = type;
		this.props = props;
		this.children = children;
	}

	// render the VElement to a real DOM node
	render(): Node {
		if (typeof this === 'string') return document.createTextNode(this as any); // for text nodes

		const el = document.createElement(this.type);

		// replace props
		for (const [key, value] of Object.entries(this.props)) {
			if (key.startsWith('on') && typeof value === 'function') {
				el.addEventListener(key.substring(2).toLowerCase(), value);
			} else {
				el.setAttribute(key, value);
			}
		}
		this.children.forEach(child => {

			const childNode = child instanceof VElement ? child.render() : document.createTextNode(child);
			el.appendChild(childNode);
		});

		this.dom = el; // keep reference
		return el;
	}
}



export function interpolate(templateString: string, props: Record<string, any>): string {
	return templateString.replace(/\{\{(.+?)\}\}/g, (_, expr) => {
		try {
			// Evaluate the expression in the context of props
				// Using new Function to safely access props
				console.log(expr,eval(expr))
			return new Function('props', `return ${expr.trim()}`)(props);
		} catch (e) {
			console.warn(`Failed to evaluate expression: ${expr}`, e);
			return '';
		}
	});
}

export function domToVElement(node: Node): VElement | string {
	if (node.nodeType === Node.TEXT_NODE) {
		return node.textContent || '';
	}

	if (node.nodeType === Node.ELEMENT_NODE) {
		const el = node as HTMLElement;
		const props: { [key: string]: any } = {};

		// Convert attributes to props
		Array.from(el.attributes).forEach(attr => {
			props[attr.name] = attr.value;
		});

		// Convert children recursively
		const children = Array.from(el.childNodes).map(domToVElement);

		return new VElement(el.tagName.toLowerCase(), props, children);
	}

	// Ignore comments or other nodes
	return '';
}


export function fragmentToVElement(fragment: DocumentFragment, props: Record<string, any>): VElement[] {
		const vels: VElement[] = [];

		Array.from(fragment.children).forEach(el => {
				// it is a component
				const html = interpolate(el.outerHTML, props);
				// Create a temporary container to parse the string
				const temp = document.createElement('div');
				temp.innerHTML = html;
				
				// Convert parsed element(s) to VElement
				Array.from(temp.children).forEach(newEl => {
						let tc = createComponent(newEl)
						if(tc !== false){
								vels.push(tc.render());
								return;
						}
						const vel = domToVElement(newEl as HTMLElement) as VElement;
						vels.push(vel);
				});
	});

	return vels;
}

export function createComponent(el:Element) : TemplateComponent|false {
	let tagname = el.tagName.toLocaleLowerCase();
	if (Object.keys(componentRegistry).includes(tagname)) {
			let tc: TemplateComponent = new TemplateComponent(componentRegistry[tagname], el);
			return tc;
	}
		return false;
}
