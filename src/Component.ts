import {VElement, fragmentToVElement, interpolate, domToVElement, createComponent} from "./VElement"

function randomVarName(length = 8) {
  const firstChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$_";
  const otherChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$_";
  
  let result = firstChars[Math.floor(Math.random() * firstChars.length)];
  
  for (let i = 1; i < length; i++) {
    const idx = Math.floor(Math.random() * otherChars.length);
    result += otherChars[idx];
  }
  
  return result;
}

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
						this.instance = randomVarName();
						const str = `new ${dataStr}()`;
						window[this.instance] = eval(str);
				}
				this.state = JSON.parse(template.getAttribute("state"));
				
		}
		
    render(): VElement {

				const props = {}
				for (const attr of this.component.attributes) {
						if(attr.name.startsWith(":")){
								props[attr.name.replace(":","")] = attr.value.replace(/this/g,this.instance)
						}
						else{
								props[attr.name] = attr.value;
						}
				}
				
				const children = fragmentToVElement(this.template.content,props,this.instance);
        const vel = new VElement('div', [], children);
        return vel;
    }
		
}

