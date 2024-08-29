/**
 * default component class which all component scripts have to extend
 * */
export default class Component {
  constructor() {
    this.self = "asd";
    this.props = {};
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
  rerender() {
    let comp = new Comp();
    comp.html = this.template;
    console.log(comp.html);
    comp.className = "counter";
    comp.props = this.props;
    comp.instanceName = this.self;
    comp.replaceChildId();
    comp.replaceProps();
    comp.replaceSelf();
    console.log(comp.html);
    let html = replaceJs(comp.html);
    console.log(html);
    let div = document.querySelectorAll(`[instance="${this.self}"]`)[0];
    console.log(div);
    div.innerHTML = html;
  }
}
