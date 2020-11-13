import { getStaticAreaInstance, removeStaticArea } from "./StaticArea.js";
import RenderScheduler from "./RenderScheduler.js";
import getStylesString from "./theming/getStylesString.js";
import executeTemplate from "./renderer/executeTemplate.js";

/**
 * @class
 * @author SAP SE
 * @private
 * Defines and takes care of ui5-static-are-item items
 */
class StaticAreaItem {
	constructor(ui5Element) {
		this.ui5Element = ui5Element;
		this._rendered = false;
	}

	isRendered() {
		return this._rendered;
	}

	/**
	 * @protected
	 */
	_updateFragment() {
		const renderResult = executeTemplate(this.ui5Element.constructor.staticAreaTemplate, this.ui5Element),
			stylesToAdd = window.ShadyDOM ? false : getStylesString(this.ui5Element.constructor.staticAreaStyles);

		if (!this.staticAreaItemDomRef) {
			const id = this.ui5Element.getAttribute("id");

			// Initial rendering of fragment
			this.staticAreaItemDomRef = document.createElement("ui5-static-area-item");
			this.staticAreaItemDomRef.attachShadow({ mode: "open" });
			this.staticAreaItemDomRef.classList.add(this.ui5Element._id); // used for getting the popover in the tests
			if (id) {
				this.staticAreaItemDomRef.setAttribute("id", `${id}--static-area`);
			}

			getStaticAreaInstance().appendChild(this.staticAreaItemDomRef);
			this._rendered = true;
		}

		this._updateContentDensity(this.ui5Element.isCompact);
		this.ui5Element.constructor.render(renderResult, this.staticAreaItemDomRef.shadowRoot, stylesToAdd, { eventContext: this.ui5Element });
	}

	/**
	 * @protected
	 */
	_removeFragmentFromStaticArea() {
		if (!this.staticAreaItemDomRef) {
			return;
		}

		const staticArea = getStaticAreaInstance();

		staticArea.removeChild(this.staticAreaItemDomRef);

		this.staticAreaItemDomRef = null;

		// remove static area
		if (staticArea.childElementCount < 1) {
			removeStaticArea();
		}
	}

	/**
	 * @protected
	 */
	_updateContentDensity(isCompact) {
		if (!this.staticAreaItemDomRef) {
			return;
		}

		if (isCompact) {
			this.staticAreaItemDomRef.classList.add("sapUiSizeCompact");
			this.staticAreaItemDomRef.classList.add("ui5-content-density-compact");
		} else {
			this.staticAreaItemDomRef.classList.remove("sapUiSizeCompact");
			this.staticAreaItemDomRef.classList.remove("ui5-content-density-compact");
		}
	}

	/**
	 * @protected
	 * Returns reference to the DOM element where the current fragment is added.
	 */
	async getDomRef() {
		if (!this._rendered || !this.staticAreaItemDomRef) {
			this._updateFragment();
		}
		await RenderScheduler.whenDOMUpdated(); // Wait for the content of the ui5-static-area-item to be rendered
		return this.staticAreaItemDomRef && this.staticAreaItemDomRef.shadowRoot;
	}
}

class StaticAreaItemElement extends HTMLElement {
	constructor() {
		super();
	}

	get isUI5Element() {
		return true;
	}
}

if (!customElements.get("ui5-static-area-item")) {
	customElements.define("ui5-static-area-item", StaticAreaItemElement);
}

export default StaticAreaItem;
