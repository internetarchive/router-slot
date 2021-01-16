import { AnchorHandler, RouterSlot } from "../lib";
import { ensureHistoryEvents } from "../lib/util/history";
import { path } from "../lib/util/url";
import { addBaseTag, clearHistory } from "./test-helpers";

const testPath = `/about`;

describe("AnchorHandler", () => {
	const {expect} = chai;
	let $anchor!: HTMLAnchorElement;
	let $slot = new RouterSlot();
	let $anchorHandler = new AnchorHandler($slot);
	let $windowPushstateCallbackHandler: () => void;

	const addTestRoute = () => {
		$slot.add([
			{
				path: testPath,
				component: () => document.createElement("div")
			}
		])
	}

	before(() => {
		ensureHistoryEvents();
		addBaseTag();
		document.body.appendChild($slot);
		$anchorHandler.setup();
	});
	beforeEach(() => {
		document.body.innerHTML = `
			<a id="anchor" href="${testPath}">Anchor</a>
		`;
		$anchor = document.body.querySelector<HTMLAnchorElement>("#anchor")!;
	});
	afterEach(() => {
		$slot.clear();
		window.removeEventListener('pushstate', $windowPushstateCallbackHandler);
	});
	after(() => {
		clearHistory();
		$anchorHandler.teardown();
	});

	it("[AnchorHandler] should change anchors to use history API", done => {
		addTestRoute();

		$windowPushstateCallbackHandler = () => {
			expect(path({end: false})).to.equal(testPath);
			done();
		};

		window.addEventListener("pushstate", $windowPushstateCallbackHandler);

		$anchor.click();
	});

	it("[AnchorHandler] should not change anchors with target _blank", done => {
		addTestRoute();

		$windowPushstateCallbackHandler = () => {
			expect(true).to.equal(false);
		}

		window.addEventListener("pushstate", $windowPushstateCallbackHandler);

		$anchor.target = "_blank";
		$anchor.click();
		done();
	});

	it("[AnchorHandler] should not change anchors with [data-router-slot]='disabled'", done => {
		addTestRoute();

		$windowPushstateCallbackHandler = () => {
			expect(true).to.equal(false);
		}

		window.addEventListener("pushstate", $windowPushstateCallbackHandler);

		$anchor.setAttribute("data-router-slot", "disabled");
		$anchor.click();
		done();
	});

	it("[AnchorHandler] should not change anchors that are not supported by the router", done => {
		// there are no routes added to the $slot in this test
		// so the router will not attempt to handle it

		$windowPushstateCallbackHandler = () => {
			expect(true).to.equal(false);
		}

		window.addEventListener("pushstate", $windowPushstateCallbackHandler);

		$anchor.click();
		done();
	});

	it("[AnchorHandler] should change anchors if there is a catch-all route", done => {
		$slot.add([
			{
				path: '**',
				component: () => document.createElement("div")
			}
		]);

		$windowPushstateCallbackHandler = () => {
			expect(path({ end: false })).to.equal(testPath);
			done();
		}
		window.addEventListener("pushstate", $windowPushstateCallbackHandler);

		$anchor.click();
	});
});
