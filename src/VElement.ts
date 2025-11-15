
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
		dom?: HTMLElement | Text;
		instance: string;
		
		constructor(
				type: string,
				props: { [key: string]: any } = {},
				children: Array<VElement | string> = [],
				instance:string
		) {
				this.type = type;
				this.props = props;
				this.children = children;
				this.instance = instance;
		}

		render(): Node {
				if (typeof this === 'string') return document.createTextNode(this as any);

				const el = document.createElement(this.type);
				// Apply props
				for (const [key, value] of Object.entries(this.props)) {
						el.setAttribute(key,value);
						//				el.setAttribute(key, interpolate(value,this.props,this.instance));
						if (key.startsWith("on") && typeof value === "function") {
								// Attach event listener
								const eventName = key.slice(2).toLowerCase(); // "onClick" → "click"
								el.addEventListener(eventName, value);
						} else if(key === "className"){
								el.setAttribute('class', value);
						} else {
								el.setAttribute(key, value);
						}
				}
				
				// Render children recursively
				this.children.forEach(child => {
						const childNode = child instanceof VElement ? child.render() : document.createTextNode(child);
						el.appendChild(childNode);
				});
				
				this.dom = el;
				return el;
		}

		removeChild(child: VElement | string) {
				if (child instanceof VElement && child.dom && this.dom) {
						this.dom.removeChild(child.dom);
						this.children = this.children.filter(c => c !== child);
				} else if (typeof child === "string" && this.dom) {
						// Find matching text node
						const textNode = Array.from(this.dom.childNodes).find(n => n.nodeType === 3 && n.nodeValue === child);
						if (textNode) {
								this.dom.removeChild(textNode);
								this.children = this.children.filter(c => c !== child);
						}
				}
		}

		
}

export function interpolate(templateString: string, props: Record<string, any>, instance=""): string {
		return templateString.replace(/\{\{(.+?)\}\}/g, (_, expr) => {
				try {
						// Evaluate the expression in the context of props
						// Using new Function to safely access props
						expr = expr.replace("this.",instance+".")
						return new Function('props', `return ${expr.trim()}`)(props);
				} catch (e) {
						console.warn(`Failed to evaluate expression: ${expr}`, e);
						return '';
				}
		});
}


function getProps(attributes:NamedNodeMap, instance:string) : object {
		let props = {}
		Array.from(attributes).forEach(attr => {
				if (attr.name.startsWith(":")) {
						props[attr.name.replace(":", "")] = attr.value.replace(/this/g, instance)
				} else {
						props[attr.name] = attr.value;
				}
		});
		return props;
}

export function domToVElement(node: Node, instance = "this"): VElement | string {
		if (node.nodeType === Node.TEXT_NODE) {
				return node.textContent || '';
		}
		
		if (node.nodeType === Node.ELEMENT_NODE) {
				const el = node as HTMLElement;
				const props: { [key: string]: any } = getProps(el.attributes,instance);
				
				// Convert attributes to props
				
				// Convert children recursively
				const children = [];
				Array.from(el.childNodes).forEach(child => {
						// Only process if it's an element node
						if (child.nodeType === Node.ELEMENT_NODE) {
								const element = child as HTMLElement;

								// Set attributes
								Object.keys(props).forEach(key => {
										element.setAttribute(key, props[key]);
								});

								// Try to create component
								const tc = createComponent(element);
								if (tc !== false) {
										children.push(tc.render());
										return;
								}

								// Convert to virtual element
								const vel = domToVElement(element, instance) as VElement;
								vel.instance = instance;
								children.push(vel);
						} 
						else if (child.nodeType === Node.TEXT_NODE) {
								children.push(interpolate(child.textContent,props,instance));
						}
				});

				
				return new VElement(el.tagName.toLowerCase(), props, children);
		}
		
		// Ignore comments or other nodes
		return '';
}


export function fragmentToVElement(fragment: DocumentFragment, props: Record<string, any>, instance = ""): VElement[] {
		const vels: VElement[] = [];
		
		Array.from(fragment.children).forEach(el => {
				// it is a component
				const html = interpolate(el.outerHTML, props, instance);
				// Create a temporary container to parse the string
				const temp = document.createElement('div');
				temp.innerHTML = html;

				
				// Convert parsed element(s) to VElement
				Array.from(temp.childNodes).forEach(newEl => {
						if (newEl.nodeType === Node.ELEMENT_NODE) {
								let props: { [key: string]: any } = getProps(newEl.attributes, instance);

								Object.keys(props).forEach(key => {
										newEl.setAttribute(key, props[key])
								})
								let tc = createComponent(newEl)
								if (tc !== false) {
										vels.push(tc.render());
										return;
								}

								const vel = domToVElement(newEl as HTMLElement, instance) as VElement;
								vel.instance = instance;
								vels.push(vel);
						}
				});
		});
		
		return vels;
}

export function isRapidElement(el:Element) : boolean{
		return Object.keys(componentRegistry).includes(el.tagName.toLocaleLowerCase());
}

export function createComponent(el: Element): TemplateComponent | false {
	let tagname = el.tagName.toLocaleLowerCase();

		if (Object.keys(componentRegistry).includes(tagname)) {
				let tc: TemplateComponent = new TemplateComponent(componentRegistry[tagname], el);
				return tc;
		}
		return false;
}

window.VElement = VElement;
