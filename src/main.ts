import {Component, TemplateComponent} from "./Component"
import {VElement} from "./VElement"
import {useState} from "./useState"
import {diff} from "./rerender"

let components: [Component] = [];

const templates = document.querySelectorAll('template[rapid-name]');
templates.forEach((t: HTMLTemplateElement) => {
		const rapidName: string = t.getAttribute('rapid-name') || '';
		const docComps = document.getElementsByTagName(rapidName)
		    
    // Convert HTMLCollection to Array to use forEach
    Array.from(docComps).forEach((el: Element) => {
				const tc = new TemplateComponent(t, el);
				components.push(tc);
    });
		
});


let oldVNode: VElement | null = null;

window.render = (vnode: VElement) => {
	const root = document.getElementById('root');
	oldVNode = oldVNode ? diff(oldVNode, vnode, root) : vnode;
  if (!oldVNode.dom) root.appendChild(vnode.render());
}

// TODO FIX A REAL UPDATE
window.update = () => {
		render(new VElement('div', { id: 'app' }, components.map(component=>component.render()))); 
}

update()
