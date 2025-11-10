import {VElement, fragmentToVElement, interpolate, domToVElement, createComponent} from "./VElement"

export abstract class Component {
		
		abstract render(): VElement;
}

export class TemplateComponent {
		template: HTMLTemplateElement;
		component: Element;
		props: []

		constructor(template:HTMLTemplateElement, component: Element, props:[] = []){

				this.template = template;
				this.component = component;
				this.props = props;
		}

    render(): VElement {
        // Convert component attributes to a plain object
        const attrs: Record<string, any> = {};
        Array.from(this.component.attributes).forEach(attr => {
            attrs[attr.name] = interpolate(attr.value,this.props);
        });

				let element = new VElement('div',{},[]);
				Array.from(this.component.children).forEach((child) => {
						let comp = createComponent(child);
						if(comp){
								element.children.push(comp.render());
						}
						else{
								element.children.push(domToVElement(child));
						}
				});

				attrs['children'] = (element.render() as Element).innerHTML;
//				attrs['children'] = interpolate(this.component.innerHTML,attrs);

        // Assuming fragmentToVElement exists
        const children = fragmentToVElement(this.template.content, attrs);
				console.log('children',attrs['children'])
				
        const vel = new VElement('div', attrs, children);
        console.log(vel);
        return vel;
    }

}
 
