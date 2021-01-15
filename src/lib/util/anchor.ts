import { IRouterSlot } from "../model";

/**
 * The AnchorHandler allows the RouterSlot to observe all anchor clicks
 * and either handle the click or let the browser handle it.
 */
export class AnchorHandler {
	routerSlot?: IRouterSlot;

	constructor(routerSlot?: IRouterSlot) {
		this.routerSlot = routerSlot;
	}

	handleEvent(e: MouseEvent) {
		// Find the target by using the composed path to get the element through the shadow boundaries.
		const $anchor = ("composedPath" in e as any) ? e.composedPath().find($elem => $elem instanceof HTMLAnchorElement) : e.target;

		// Abort if the event is not about the anchor tag
		if ($anchor == null || !($anchor instanceof HTMLAnchorElement)) {
			return;
		}

		// Only handle the anchor tag if the follow holds true:
		// - 1. The HREF is relative to the origin of the current location.
		const hrefIsRelative = $anchor.href.startsWith(location.origin);

		// - 2. The target is targeting the current frame.
		const differentFrameTargetted = $anchor.target !== "" && $anchor.target !== "_self";

		// - 3. The anchor doesn't have the attribute [data-router-slot]="disabled"
		const isDisabled = $anchor.dataset["routerSlot"] === "disabled";

		// - 4. The router can handle the route
		const routeMatched = this.routerSlot?.getRouteMatch($anchor.pathname);

		if (!hrefIsRelative || differentFrameTargetted || isDisabled || !routeMatched) {
			return;
		}

		// Holding down the metaKey (Command on Mac, Control on Windows)
		// is used to open a link in a new tab so let the browser handle it
		if (e.metaKey) {
			return;
		}

		// Remove the origin from the start of the HREF to get the path
		const path = `${$anchor.pathname}${$anchor.search}`;

		// Prevent the default behavior
		e.preventDefault();

		// Change the history!
		history.pushState(null, "", path);
	}
}
