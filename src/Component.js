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
      console.log(attr.name, attr.value);
      target.setAttribute(attr.name, attr.value);
    });
  }

  rerender() {
    // create a component to update the template
    let comp = new Comp();
    comp.html = this.template;
    comp.className = this.className;
    comp.props = this.props;
    comp.instanceName = this.self;
    comp.replaceChildId();
    comp.replaceProps();
    comp.replaceSelf();

    comp.html = replaceJs(comp.html);
    // get the compontent holder
    let div = document.querySelectorAll(`[instance="${this.self}"]`)[0];
    // parse elements from the parsed html
    var doc = new DOMParser().parseFromString(comp.html, "text/html");

    let s = this; // use this as this in function under
    // function for recursivly updateing the elements inside
    function rerender_comp(old, newhtml) {
      for (let i = 0; i < old.length; i++) {
        // update attributes
        s.copyAttributes(old[i], newhtml[i]);

        // We dont replace innerhtml if it is a input because then the focus will disspear
        // TODO: better check if the input contains elements
        console.log("inner", newhtml[i].innerHTML);
        if (!newhtml[i].innerHTML.includes("input")) {
          old[i].innerHTML = newhtml[i].innerHTML;
        }

        // if there is more children run this again
        if (old[i].children.length > 0) {
          rerender_comp(old[i].children, newhtml[i].children);
        }
      }
    }
    rerender_comp(div.children, doc.body.children);
    rapidRefresh();
  }
}
