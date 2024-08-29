/**
 * default component class which all component scripts have to extend
 * */
export default class Component {
  constructor() {
    this.self = "asd";
    this.props = {};
    this.className = "Component";
  }

  /**
   * This function will be called when the component is loaded on the page
   * use this as a constructor.
   * */
  onComponentLoad() {}
  /**
   * This function returns the element with the child-id provided.
   * REMEMEBER this function will not work before onComponentLoad is run
   * */
  getChild(name) {
    let res = document.querySelectorAll(
      `[child-id="RAPID${this.self + name}"]`,
    );
    return res[0];
  }
  /**
   * This function retusns instance of the child component if there is one otherwise undefined.
   * REMEMEBER this function will not work before onComponentLoad is run
   * */
  getChildInstance(name) {
    let child = document.querySelectorAll(
      `[child-id="RAPID${this.self + name}"]`,
    )[0];
    if (child === undefined) return undefined;

    return getInstance(child);
  }
  copyAttributes(target, source) {
    Array.from(source.attributes).forEach((attr) => {
      target.setAttribute(attr.name, attr.value);
    });
  }

  rerender() {
    let comp = new Comp();
    comp.html = this.template;
    comp.className = this.className;
    comp.props = this.props;
    comp.instanceName = this.self;
    comp.replaceChildId();
    comp.replaceProps();
    comp.replaceSelf();

    comp.html = replaceJs(comp.html);
    let div = document.querySelectorAll(`[instance="${this.self}"]`)[0];
    console.log(comp.html);
    var doc = new DOMParser().parseFromString(comp.html, "text/html");
    console.log("elements");

    for (let i = 0; i < doc.body.children.length; i++) {
      div.children[i].innerHTML = doc.body.children[i].innerHTML;
      this.copyAttributes(div.children[i], doc.body.children[i]);
    }
  }
}
