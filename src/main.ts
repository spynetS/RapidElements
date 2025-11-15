import {Component, TemplateComponent} from "./Component"
import {VElement} from "./VElement"
import {useState} from "./useState"
import {diff} from "./rerender"


// TODO fix instances
// if we renrender a component and a component is inside it
// it gets an new instance but it should be the same

window.VElement = VElement;


let oldVNode: VElement | null = null;
let components: [Components] = [];


window.getComponents = () => {
		let components: [Component] = [];
		const templates = document.querySelectorAll('template[rapid-name]');
		templates.forEach((t: HTMLTemplateElement) => {
				const rapidName: string = t.getAttribute('rapid-name') || '';
				const tagElements = Array.from(document.getElementsByTagName(rapidName));
				const attrElements = Array.from(document.querySelectorAll(`[rapid-comp="${rapidName}"]`));
				
				// Combine them into a single array (no duplicates)
				const docComps = [...new Set([...tagElements, ...attrElements])];
				
				// Convert HTMLCollection to Array to use forEach
				Array.from(docComps).forEach((el: Element) => {
						const tc = new TemplateComponent(t, el);
						components.push(tc);
				});
		});
		return components;
}


components = window.getComponents();

window.render = (vnode: VElement) => {
		const root = document.getElementById('root');
		oldVNode = oldVNode ? diff(oldVNode, vnode, root) : vnode;

		if (!oldVNode.dom){
				let render = vnode;
				root.appendChild(render.render());
		}
}

window.update = () => {
		window.render(new VElement('div', { id: 'app' },components.map(component=>component.render()))); 
}


//update()
