import {VElement, fragmentToVElement, interpolate, domToVElement, createComponent} from "./VElement"

export abstract class Component {
		
		abstract render(): VElement;
}



export class TemplateComponent {
		template: HTMLTemplateElement;
		component: Element;
		props: [];
		instance: string;
		state:{}
		constructor(template:HTMLTemplateElement, component: Element, props:[] = []){
				
				this.template = template;
				this.component = component;
				this.props = props;
				
				const dataStr = template.getAttribute("rapid-data");
				if (dataStr) {
						this.instance = "blabla";
						const str = `new ${dataStr}()`;
						window[this.instance] = eval(str);
				}

				this.state = JSON.parse(template.getAttribute("state"));
				
		}
		
    render(): VElement {
				let element = new VElement('div',{},[]);

        // Convert component attributes to a plain object
        const attrs: Record<string, any> = {};
        Array.from(this.component.attributes).forEach(attr => {
            attrs[attr.name] = interpolate(attr.value,this.props,this.instance);
        });

				// parse all the innerHtml in the component definition
				Array.from(this.component.children).forEach((child) => {
						// if it is a component
						let comp:TemplateComponent|false = createComponent(child);
						if(comp){
								comp.instance = this.instance;
								element.children.push(comp.render());
						}
						else{
								const element:VElement = domToVElement(child);
								element.children.push(element);
						}
				});
				// set the props children
				attrs['children'] = (element.render() as Element).innerHTML;

        // Assuming fragmentToVElement exists
				// parsing elements inside the template
        const children = fragmentToVElement(this.template.content, attrs,this.instance);
				
        const vel = new VElement('div', attrs, children,this.data);
        return vel;
    }
		
}

