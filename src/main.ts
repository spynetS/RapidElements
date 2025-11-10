import {Component, TemplateComponent} from "./Component"
import {VElement} from "./VElement"



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

// TODO FIX A REAL UPDATE
function update(){
		const vdom = new VElement('div', { id: 'app' }, components.map(component => component.render()));
		const root = document.getElementById('root');
		if (root) {
				root.innerHTML = "";
				root.appendChild(vdom.render());
		}
}

const vdom = new VElement('div', { id: 'app' }, components.map(component=>component.render()));

const root = document.getElementById('root');
if (root) root.appendChild(vdom.render());
