/******/ var __webpack_modules__ = ({

/***/ "./client/src/modules/composite/developer/actions.ts":
/*!***********************************************************!*\
  !*** ./client/src/modules/composite/developer/actions.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DeveloperActions": () => (/* binding */ DeveloperActions)
/* harmony export */ });
/**
 * Implement the actions.
 */
class DeveloperActions {
    /**
     * Initialize the module.
     * @param definition The definition of the module from configuration include custom options.
     * @param createLogger For logging entries.
     * @param helpers Helper methods for the module to interact with the application core.
     * @returns Nothing.
     */
    async initialize(definition, createLogger, helpers) {
        this._logger = createLogger("DeveloperActions");
        this._helpers = helpers;
    }
    /**
     * Get the actions from the module.
     */
    async get(platform) {
        const actionMap = {};
        actionMap["developer-inspect"] = async (payload) => {
            if (payload.callerType === this._helpers.callerTypes.ViewTabContextMenu) {
                for (let i = 0; i < payload.selectedViews.length; i++) {
                    const identity = payload.selectedViews[i];
                    const view = fin.View.wrapSync(identity);
                    await view.showDeveloperTools();
                }
            }
            else if (payload.callerType === this._helpers.callerTypes.PageTabContextMenu) {
                const pageWindowIdentity = payload.windowIdentity;
                const pageWindow = fin.Window.wrapSync(pageWindowIdentity);
                await pageWindow.showDeveloperTools();
            }
            else if (payload.callerType === this._helpers.callerTypes.GlobalContextMenu) {
                const target = payload?.customData?.target === "platform" ? "platform" : "window";
                const targetIdentity = target === "window"
                    ? payload.windowIdentity
                    : { uuid: payload.windowIdentity.uuid, name: payload.windowIdentity.uuid };
                const targetWindow = fin.Window.wrapSync(targetIdentity);
                await targetWindow.showDeveloperTools();
            }
        };
        actionMap["raise-create-app-definition-intent"] = async (payload) => {
            if (payload.callerType === this._helpers.callerTypes.ViewTabContextMenu) {
                const brokerClient = fin.Interop.connectSync(fin.me.identity.uuid, {});
                for (let i = 0; i < payload.selectedViews.length; i++) {
                    const viewIdentity = payload.selectedViews[i];
                    const intentName = "CreateAppDefinition";
                    try {
                        const view = fin.View.wrapSync(viewIdentity);
                        const options = await view.getOptions();
                        const info = await view.getInfo();
                        const name = options.name;
                        const fdc3InteropApi = options.fdc3InteropApi !== undefined &&
                            options.fdc3InteropApi !== null &&
                            options.fdc3InteropApi.length > 0
                            ? options.fdc3InteropApi
                            : "1.2";
                        const preloads = Array.isArray(options.preloadScripts) && options.preloadScripts.length > 0
                            ? options.preloadScripts
                            : undefined;
                        const manifest = {
                            url: info.url,
                            fdc3InteropApi,
                            interop: options.interop,
                            customData: options.customData,
                            preloadScripts: preloads
                        };
                        const icons = [];
                        const favicons = info.favicons || [];
                        for (let f = 0; f < favicons.length; f++) {
                            icons.push({ src: favicons[f] });
                        }
                        const app = {
                            appId: name,
                            name,
                            title: info.title,
                            description: info.title,
                            manifestType: this._helpers.manifestTypes.inlineView.id,
                            manifest,
                            tags: [this._helpers.manifestTypes.view.id],
                            icons,
                            images: [],
                            publisher: "",
                            contactEmail: "",
                            supportEmail: "",
                            intents: []
                        };
                        const intent = {
                            name: intentName,
                            context: {
                                type: "openfin.app",
                                app
                            }
                        };
                        await brokerClient.fireIntent(intent);
                    }
                    catch (error) {
                        this._logger.error(`Error while trying to raise intent ${intentName} for view ${viewIdentity.name}`, error);
                    }
                }
            }
        };
        return actionMap;
    }
}


/***/ }),

/***/ "./client/src/modules/composite/developer/analytics.ts":
/*!*************************************************************!*\
  !*** ./client/src/modules/composite/developer/analytics.ts ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DevAnalyticsModule": () => (/* binding */ DevAnalyticsModule)
/* harmony export */ });
/**
 * Implement the analytics module using the interop channels as the means of publishing the events.
 */
class DevAnalyticsModule {
    constructor() {
        this._cachedAnalyticEvents = [];
    }
    /**
     * Initialize the module.
     * @param definition The definition of the module from configuration include custom options.
     * @param loggerCreator For logging entries.
     * @param helpers Helper methods for the module to interact with the application core.
     * @returns Nothing.
     */
    async initialize(definition, loggerCreator, helpers) {
        this._logger = loggerCreator("DeveloperAnalyticsModule");
        this._logger.info("Initialized");
        this._logger.info("Session Id: ", helpers.sessionId);
        this._helpers = helpers;
        this._contextType = definition.data?.contextType ?? "fin.dev.platform.analytics";
        const channelName = definition.data?.sessionContextGroupName ?? "dev/platform/analytics";
        this._logger.info(`Using channel name: ${channelName} and contextType: ${this._contextType}. These can be customized by passing data settings: sessionContextGroupName and contextType in the module settings.`);
        if (helpers.getInteropClient !== undefined && helpers.subscribeLifecycleEvent !== undefined) {
            this._logger.info("Subscribing to the after bootstrap event.");
            const lifeCycleAfterBootstrapSubscriptionId = this._helpers.subscribeLifecycleEvent("after-bootstrap", async (_platform) => {
                this._logger.info("After bootstrap lifecycle event received. Getting interop client.");
                this._interopClient = await helpers.getInteropClient();
                this._channel = await this._interopClient.joinSessionContextGroup(channelName);
                if (this._helpers.unsubscribeLifecycleEvent !== undefined) {
                    this._helpers.unsubscribeLifecycleEvent(lifeCycleAfterBootstrapSubscriptionId, "after-bootstrap");
                }
            });
        }
        else {
            this._logger.warn("This analytics module requires a session context group name, a context type, the ability to create an interop client and the ability to listen for lifecycle events. Unfortunately this criteria has not been met.");
        }
    }
    /**
     * Handle Analytics. This example module simple console logs the events. You could batch the events and pass settings (number to batch etc, destination to send events) via the module definition.
     * @param events one of more analytic events.
     */
    async handleAnalytics(events) {
        if (!Array.isArray(events)) {
            this._logger.warn("We were not passed an array of analytical events.");
            return;
        }
        if (this._channel !== undefined) {
            let platformAnalyticEvents = [];
            if (this._cachedAnalyticEvents.length > 0) {
                this._logger.info(`Adding ${this._cachedAnalyticEvents.length} analytic events.`);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                platformAnalyticEvents.push(...this._cachedAnalyticEvents);
                this._cachedAnalyticEvents = [];
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            platformAnalyticEvents.push(...events);
            const eventCount = platformAnalyticEvents.length;
            platformAnalyticEvents = platformAnalyticEvents.filter((entry) => !(entry.type.toLowerCase() === "interop" && entry.source.toLowerCase() !== "browser"));
            const filteredCount = platformAnalyticEvents.length;
            if (eventCount !== filteredCount) {
                this._logger.info(`Filtered out ${eventCount - filteredCount} events as they were of type interop and not from the browser and we send events out over interop`);
            }
            const context = {
                type: this._contextType,
                name: "Analytic Events",
                events: platformAnalyticEvents
            };
            await this._channel.setContext(context);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            this._cachedAnalyticEvents.push(...events);
        }
    }
    /**
     * Close down the module. If this module had any cached events it needed to process it could try and flush them here.
     */
    async closedown() {
        this._logger.info("closing down");
    }
}


/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*********************************************************!*\
  !*** ./client/src/modules/composite/developer/index.ts ***!
  \*********************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "entryPoints": () => (/* binding */ entryPoints)
/* harmony export */ });
/* harmony import */ var _actions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./actions */ "./client/src/modules/composite/developer/actions.ts");
/* harmony import */ var _analytics__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./analytics */ "./client/src/modules/composite/developer/analytics.ts");


const entryPoints = {
    actions: new _actions__WEBPACK_IMPORTED_MODULE_0__.DeveloperActions(),
    analytics: new _analytics__WEBPACK_IMPORTED_MODULE_1__.DevAnalyticsModule()
};

})();

var __webpack_exports__entryPoints = __webpack_exports__.entryPoints;
export { __webpack_exports__entryPoints as entryPoints };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO1VBQ0E7VUFDQSx1REFBdUQsaUJBQWlCO1VBQ3hFO1VBQ0EsZ0RBQWdELGFBQWE7VUFDN0Q7Ozs7Ozs7Ozs7Ozs7Ozs7QUNMNkM7QUFDSTtBQUUxQyxNQUFNLFdBQVcsR0FBcUQ7SUFDNUUsT0FBTyxFQUFFLElBQUksc0RBQWdCLEVBQUU7SUFDL0IsU0FBUyxFQUFFLElBQUksMERBQWtCLEVBQUU7Q0FDbkMsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL29wZW5maW4td29ya3NwYWNlLS1jdXN0b21pemUtd29ya3NwYWNlLy4vY2xpZW50L3NyYy9tb2R1bGVzL2NvbXBvc2l0ZS9kZXZlbG9wZXIvYWN0aW9ucy50cyIsIndlYnBhY2s6Ly9vcGVuZmluLXdvcmtzcGFjZS0tY3VzdG9taXplLXdvcmtzcGFjZS8uL2NsaWVudC9zcmMvbW9kdWxlcy9jb21wb3NpdGUvZGV2ZWxvcGVyL2FuYWx5dGljcy50cyIsIndlYnBhY2s6Ly9vcGVuZmluLXdvcmtzcGFjZS0tY3VzdG9taXplLXdvcmtzcGFjZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9vcGVuZmluLXdvcmtzcGFjZS0tY3VzdG9taXplLXdvcmtzcGFjZS93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vb3BlbmZpbi13b3Jrc3BhY2UtLWN1c3RvbWl6ZS13b3Jrc3BhY2Uvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9vcGVuZmluLXdvcmtzcGFjZS0tY3VzdG9taXplLXdvcmtzcGFjZS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL29wZW5maW4td29ya3NwYWNlLS1jdXN0b21pemUtd29ya3NwYWNlLy4vY2xpZW50L3NyYy9tb2R1bGVzL2NvbXBvc2l0ZS9kZXZlbG9wZXIvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUge1xyXG5cdEN1c3RvbUFjdGlvblBheWxvYWQsXHJcblx0Q3VzdG9tQWN0aW9uc01hcCxcclxuXHRXb3Jrc3BhY2VQbGF0Zm9ybU1vZHVsZVxyXG59IGZyb20gXCJAb3BlbmZpbi93b3Jrc3BhY2UtcGxhdGZvcm1cIjtcclxuaW1wb3J0IHR5cGUgeyBBY3Rpb25IZWxwZXJzLCBBY3Rpb25zIH0gZnJvbSBcImN1c3RvbWl6ZS13b3Jrc3BhY2Uvc2hhcGVzL2FjdGlvbnMtc2hhcGVzXCI7XHJcbmltcG9ydCB0eXBlIHsgTG9nZ2VyLCBMb2dnZXJDcmVhdG9yIH0gZnJvbSBcImN1c3RvbWl6ZS13b3Jrc3BhY2Uvc2hhcGVzL2xvZ2dlci1zaGFwZXNcIjtcclxuaW1wb3J0IHR5cGUgeyBNb2R1bGVEZWZpbml0aW9uIH0gZnJvbSBcImN1c3RvbWl6ZS13b3Jrc3BhY2Uvc2hhcGVzL21vZHVsZS1zaGFwZXNcIjtcclxuXHJcbi8qKlxyXG4gKiBJbXBsZW1lbnQgdGhlIGFjdGlvbnMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRGV2ZWxvcGVyQWN0aW9ucyBpbXBsZW1lbnRzIEFjdGlvbnMge1xyXG5cdC8qKlxyXG5cdCAqIFRoZSBoZWxwZXIgbWV0aG9kcyB0byB1c2UuXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfaGVscGVyczogQWN0aW9uSGVscGVycztcclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGhlbHBlciBtZXRob2RzIHRvIHVzZS5cclxuXHQgKi9cclxuXHRwcml2YXRlIF9sb2dnZXI6IExvZ2dlcjtcclxuXHJcblx0LyoqXHJcblx0ICogSW5pdGlhbGl6ZSB0aGUgbW9kdWxlLlxyXG5cdCAqIEBwYXJhbSBkZWZpbml0aW9uIFRoZSBkZWZpbml0aW9uIG9mIHRoZSBtb2R1bGUgZnJvbSBjb25maWd1cmF0aW9uIGluY2x1ZGUgY3VzdG9tIG9wdGlvbnMuXHJcblx0ICogQHBhcmFtIGNyZWF0ZUxvZ2dlciBGb3IgbG9nZ2luZyBlbnRyaWVzLlxyXG5cdCAqIEBwYXJhbSBoZWxwZXJzIEhlbHBlciBtZXRob2RzIGZvciB0aGUgbW9kdWxlIHRvIGludGVyYWN0IHdpdGggdGhlIGFwcGxpY2F0aW9uIGNvcmUuXHJcblx0ICogQHJldHVybnMgTm90aGluZy5cclxuXHQgKi9cclxuXHRwdWJsaWMgYXN5bmMgaW5pdGlhbGl6ZShcclxuXHRcdGRlZmluaXRpb246IE1vZHVsZURlZmluaXRpb24sXHJcblx0XHRjcmVhdGVMb2dnZXI6IExvZ2dlckNyZWF0b3IsXHJcblx0XHRoZWxwZXJzOiBBY3Rpb25IZWxwZXJzXHJcblx0KTogUHJvbWlzZTx2b2lkPiB7XHJcblx0XHR0aGlzLl9sb2dnZXIgPSBjcmVhdGVMb2dnZXIoXCJEZXZlbG9wZXJBY3Rpb25zXCIpO1xyXG5cdFx0dGhpcy5faGVscGVycyA9IGhlbHBlcnM7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBHZXQgdGhlIGFjdGlvbnMgZnJvbSB0aGUgbW9kdWxlLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhc3luYyBnZXQocGxhdGZvcm06IFdvcmtzcGFjZVBsYXRmb3JtTW9kdWxlKTogUHJvbWlzZTxDdXN0b21BY3Rpb25zTWFwPiB7XHJcblx0XHRjb25zdCBhY3Rpb25NYXA6IEN1c3RvbUFjdGlvbnNNYXAgPSB7fTtcclxuXHJcblx0XHRhY3Rpb25NYXBbXCJkZXZlbG9wZXItaW5zcGVjdFwiXSA9IGFzeW5jIChwYXlsb2FkOiBDdXN0b21BY3Rpb25QYXlsb2FkKSA9PiB7XHJcblx0XHRcdGlmIChwYXlsb2FkLmNhbGxlclR5cGUgPT09IHRoaXMuX2hlbHBlcnMuY2FsbGVyVHlwZXMuVmlld1RhYkNvbnRleHRNZW51KSB7XHJcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBwYXlsb2FkLnNlbGVjdGVkVmlld3MubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdGNvbnN0IGlkZW50aXR5OiBPcGVuRmluLklkZW50aXR5ID0gcGF5bG9hZC5zZWxlY3RlZFZpZXdzW2ldO1xyXG5cdFx0XHRcdFx0Y29uc3QgdmlldyA9IGZpbi5WaWV3LndyYXBTeW5jKGlkZW50aXR5KTtcclxuXHRcdFx0XHRcdGF3YWl0IHZpZXcuc2hvd0RldmVsb3BlclRvb2xzKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2UgaWYgKHBheWxvYWQuY2FsbGVyVHlwZSA9PT0gdGhpcy5faGVscGVycy5jYWxsZXJUeXBlcy5QYWdlVGFiQ29udGV4dE1lbnUpIHtcclxuXHRcdFx0XHRjb25zdCBwYWdlV2luZG93SWRlbnRpdHk6IE9wZW5GaW4uSWRlbnRpdHkgPSBwYXlsb2FkLndpbmRvd0lkZW50aXR5O1xyXG5cdFx0XHRcdGNvbnN0IHBhZ2VXaW5kb3cgPSBmaW4uV2luZG93LndyYXBTeW5jKHBhZ2VXaW5kb3dJZGVudGl0eSk7XHJcblx0XHRcdFx0YXdhaXQgcGFnZVdpbmRvdy5zaG93RGV2ZWxvcGVyVG9vbHMoKTtcclxuXHRcdFx0fSBlbHNlIGlmIChwYXlsb2FkLmNhbGxlclR5cGUgPT09IHRoaXMuX2hlbHBlcnMuY2FsbGVyVHlwZXMuR2xvYmFsQ29udGV4dE1lbnUpIHtcclxuXHRcdFx0XHRjb25zdCB0YXJnZXQgPSBwYXlsb2FkPy5jdXN0b21EYXRhPy50YXJnZXQgPT09IFwicGxhdGZvcm1cIiA/IFwicGxhdGZvcm1cIiA6IFwid2luZG93XCI7XHJcblx0XHRcdFx0Y29uc3QgdGFyZ2V0SWRlbnRpdHk6IE9wZW5GaW4uSWRlbnRpdHkgPVxyXG5cdFx0XHRcdFx0dGFyZ2V0ID09PSBcIndpbmRvd1wiXHJcblx0XHRcdFx0XHRcdD8gcGF5bG9hZC53aW5kb3dJZGVudGl0eVxyXG5cdFx0XHRcdFx0XHQ6IHsgdXVpZDogcGF5bG9hZC53aW5kb3dJZGVudGl0eS51dWlkLCBuYW1lOiBwYXlsb2FkLndpbmRvd0lkZW50aXR5LnV1aWQgfTtcclxuXHRcdFx0XHRjb25zdCB0YXJnZXRXaW5kb3cgPSBmaW4uV2luZG93LndyYXBTeW5jKHRhcmdldElkZW50aXR5KTtcclxuXHRcdFx0XHRhd2FpdCB0YXJnZXRXaW5kb3cuc2hvd0RldmVsb3BlclRvb2xzKCk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblxyXG5cdFx0YWN0aW9uTWFwW1wicmFpc2UtY3JlYXRlLWFwcC1kZWZpbml0aW9uLWludGVudFwiXSA9IGFzeW5jIChwYXlsb2FkOiBDdXN0b21BY3Rpb25QYXlsb2FkKSA9PiB7XHJcblx0XHRcdGlmIChwYXlsb2FkLmNhbGxlclR5cGUgPT09IHRoaXMuX2hlbHBlcnMuY2FsbGVyVHlwZXMuVmlld1RhYkNvbnRleHRNZW51KSB7XHJcblx0XHRcdFx0Y29uc3QgYnJva2VyQ2xpZW50ID0gZmluLkludGVyb3AuY29ubmVjdFN5bmMoZmluLm1lLmlkZW50aXR5LnV1aWQsIHt9KTtcclxuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHBheWxvYWQuc2VsZWN0ZWRWaWV3cy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0Y29uc3Qgdmlld0lkZW50aXR5ID0gcGF5bG9hZC5zZWxlY3RlZFZpZXdzW2ldO1xyXG5cdFx0XHRcdFx0Y29uc3QgaW50ZW50TmFtZSA9IFwiQ3JlYXRlQXBwRGVmaW5pdGlvblwiO1xyXG5cdFx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdFx0Y29uc3QgdmlldyA9IGZpbi5WaWV3LndyYXBTeW5jKHZpZXdJZGVudGl0eSBhcyBPcGVuRmluLklkZW50aXR5KTtcclxuXHRcdFx0XHRcdFx0Y29uc3Qgb3B0aW9ucyA9IGF3YWl0IHZpZXcuZ2V0T3B0aW9ucygpO1xyXG5cdFx0XHRcdFx0XHRjb25zdCBpbmZvID0gYXdhaXQgdmlldy5nZXRJbmZvKCk7XHJcblx0XHRcdFx0XHRcdGNvbnN0IG5hbWUgPSBvcHRpb25zLm5hbWU7XHJcblx0XHRcdFx0XHRcdGNvbnN0IGZkYzNJbnRlcm9wQXBpID1cclxuXHRcdFx0XHRcdFx0XHRvcHRpb25zLmZkYzNJbnRlcm9wQXBpICE9PSB1bmRlZmluZWQgJiZcclxuXHRcdFx0XHRcdFx0XHRvcHRpb25zLmZkYzNJbnRlcm9wQXBpICE9PSBudWxsICYmXHJcblx0XHRcdFx0XHRcdFx0b3B0aW9ucy5mZGMzSW50ZXJvcEFwaS5sZW5ndGggPiAwXHJcblx0XHRcdFx0XHRcdFx0XHQ/IG9wdGlvbnMuZmRjM0ludGVyb3BBcGlcclxuXHRcdFx0XHRcdFx0XHRcdDogXCIxLjJcIjtcclxuXHRcdFx0XHRcdFx0Y29uc3QgcHJlbG9hZHMgPVxyXG5cdFx0XHRcdFx0XHRcdEFycmF5LmlzQXJyYXkob3B0aW9ucy5wcmVsb2FkU2NyaXB0cykgJiYgb3B0aW9ucy5wcmVsb2FkU2NyaXB0cy5sZW5ndGggPiAwXHJcblx0XHRcdFx0XHRcdFx0XHQ/IG9wdGlvbnMucHJlbG9hZFNjcmlwdHNcclxuXHRcdFx0XHRcdFx0XHRcdDogdW5kZWZpbmVkO1xyXG5cdFx0XHRcdFx0XHRjb25zdCBtYW5pZmVzdCA9IHtcclxuXHRcdFx0XHRcdFx0XHR1cmw6IGluZm8udXJsLFxyXG5cdFx0XHRcdFx0XHRcdGZkYzNJbnRlcm9wQXBpLFxyXG5cdFx0XHRcdFx0XHRcdGludGVyb3A6IG9wdGlvbnMuaW50ZXJvcCxcclxuXHRcdFx0XHRcdFx0XHRjdXN0b21EYXRhOiBvcHRpb25zLmN1c3RvbURhdGEsXHJcblx0XHRcdFx0XHRcdFx0cHJlbG9hZFNjcmlwdHM6IHByZWxvYWRzXHJcblx0XHRcdFx0XHRcdH07XHJcblx0XHRcdFx0XHRcdGNvbnN0IGljb25zID0gW107XHJcblx0XHRcdFx0XHRcdGNvbnN0IGZhdmljb25zID0gaW5mby5mYXZpY29ucyB8fCBbXTtcclxuXHRcdFx0XHRcdFx0Zm9yIChsZXQgZiA9IDA7IGYgPCBmYXZpY29ucy5sZW5ndGg7IGYrKykge1xyXG5cdFx0XHRcdFx0XHRcdGljb25zLnB1c2goeyBzcmM6IGZhdmljb25zW2ZdIH0pO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGNvbnN0IGFwcCA9IHtcclxuXHRcdFx0XHRcdFx0XHRhcHBJZDogbmFtZSxcclxuXHRcdFx0XHRcdFx0XHRuYW1lLFxyXG5cdFx0XHRcdFx0XHRcdHRpdGxlOiBpbmZvLnRpdGxlLFxyXG5cdFx0XHRcdFx0XHRcdGRlc2NyaXB0aW9uOiBpbmZvLnRpdGxlLFxyXG5cdFx0XHRcdFx0XHRcdG1hbmlmZXN0VHlwZTogdGhpcy5faGVscGVycy5tYW5pZmVzdFR5cGVzLmlubGluZVZpZXcuaWQsXHJcblx0XHRcdFx0XHRcdFx0bWFuaWZlc3QsXHJcblx0XHRcdFx0XHRcdFx0dGFnczogW3RoaXMuX2hlbHBlcnMubWFuaWZlc3RUeXBlcy52aWV3LmlkXSxcclxuXHRcdFx0XHRcdFx0XHRpY29ucyxcclxuXHRcdFx0XHRcdFx0XHRpbWFnZXM6IFtdLFxyXG5cdFx0XHRcdFx0XHRcdHB1Ymxpc2hlcjogXCJcIixcclxuXHRcdFx0XHRcdFx0XHRjb250YWN0RW1haWw6IFwiXCIsXHJcblx0XHRcdFx0XHRcdFx0c3VwcG9ydEVtYWlsOiBcIlwiLFxyXG5cdFx0XHRcdFx0XHRcdGludGVudHM6IFtdXHJcblx0XHRcdFx0XHRcdH07XHJcblx0XHRcdFx0XHRcdGNvbnN0IGludGVudCA9IHtcclxuXHRcdFx0XHRcdFx0XHRuYW1lOiBpbnRlbnROYW1lLFxyXG5cdFx0XHRcdFx0XHRcdGNvbnRleHQ6IHtcclxuXHRcdFx0XHRcdFx0XHRcdHR5cGU6IFwib3BlbmZpbi5hcHBcIixcclxuXHRcdFx0XHRcdFx0XHRcdGFwcFxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fTtcclxuXHRcdFx0XHRcdFx0YXdhaXQgYnJva2VyQ2xpZW50LmZpcmVJbnRlbnQoaW50ZW50KTtcclxuXHRcdFx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XHJcblx0XHRcdFx0XHRcdHRoaXMuX2xvZ2dlci5lcnJvcihcclxuXHRcdFx0XHRcdFx0XHRgRXJyb3Igd2hpbGUgdHJ5aW5nIHRvIHJhaXNlIGludGVudCAke2ludGVudE5hbWV9IGZvciB2aWV3ICR7dmlld0lkZW50aXR5Lm5hbWV9YCxcclxuXHRcdFx0XHRcdFx0XHRlcnJvclxyXG5cdFx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHJcblx0XHRyZXR1cm4gYWN0aW9uTWFwO1xyXG5cdH1cclxufVxyXG4iLCJpbXBvcnQgdHlwZSB7IEludGVyb3BDbGllbnQgfSBmcm9tIFwiQG9wZW5maW4vY29yZS9zcmMvYXBpL2ludGVyb3BcIjtcclxuaW1wb3J0IHR5cGUgeyBMb2dnZXIsIExvZ2dlckNyZWF0b3IgfSBmcm9tIFwiY3VzdG9taXplLXdvcmtzcGFjZS9zaGFwZXNcIjtcclxuaW1wb3J0IHR5cGUgeyBBbmFseXRpY3NNb2R1bGUsIFBsYXRmb3JtQW5hbHl0aWNzRXZlbnQgfSBmcm9tIFwiY3VzdG9taXplLXdvcmtzcGFjZS9zaGFwZXMvYW5hbHl0aWNzLXNoYXBlc1wiO1xyXG5pbXBvcnQgdHlwZSB7IE1vZHVsZURlZmluaXRpb24sIE1vZHVsZUhlbHBlcnMgfSBmcm9tIFwiY3VzdG9taXplLXdvcmtzcGFjZS9zaGFwZXMvbW9kdWxlLXNoYXBlc1wiO1xyXG5pbXBvcnQgdHlwZSB7IERldkFuYWx5dGljc09wdGlvbnMgfSBmcm9tIFwiLi9zaGFwZXNcIjtcclxuXHJcbi8qKlxyXG4gKiBJbXBsZW1lbnQgdGhlIGFuYWx5dGljcyBtb2R1bGUgdXNpbmcgdGhlIGludGVyb3AgY2hhbm5lbHMgYXMgdGhlIG1lYW5zIG9mIHB1Ymxpc2hpbmcgdGhlIGV2ZW50cy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBEZXZBbmFseXRpY3NNb2R1bGUgaW1wbGVtZW50cyBBbmFseXRpY3NNb2R1bGU8RGV2QW5hbHl0aWNzT3B0aW9ucz4ge1xyXG5cdHByaXZhdGUgX2xvZ2dlcjogTG9nZ2VyO1xyXG5cclxuXHRwcml2YXRlIF9pbnRlcm9wQ2xpZW50OiBJbnRlcm9wQ2xpZW50O1xyXG5cclxuXHRwcml2YXRlIF9jaGFubmVsOiBPcGVuRmluLlNlc3Npb25Db250ZXh0R3JvdXA7XHJcblxyXG5cdHByaXZhdGUgX2NvbnRleHRUeXBlOiBzdHJpbmc7XHJcblxyXG5cdHByaXZhdGUgX2NhY2hlZEFuYWx5dGljRXZlbnRzOiBQbGF0Zm9ybUFuYWx5dGljc0V2ZW50W10gPSBbXTtcclxuXHJcblx0cHJpdmF0ZSBfaGVscGVyczogTW9kdWxlSGVscGVycztcclxuXHJcblx0LyoqXHJcblx0ICogSW5pdGlhbGl6ZSB0aGUgbW9kdWxlLlxyXG5cdCAqIEBwYXJhbSBkZWZpbml0aW9uIFRoZSBkZWZpbml0aW9uIG9mIHRoZSBtb2R1bGUgZnJvbSBjb25maWd1cmF0aW9uIGluY2x1ZGUgY3VzdG9tIG9wdGlvbnMuXHJcblx0ICogQHBhcmFtIGxvZ2dlckNyZWF0b3IgRm9yIGxvZ2dpbmcgZW50cmllcy5cclxuXHQgKiBAcGFyYW0gaGVscGVycyBIZWxwZXIgbWV0aG9kcyBmb3IgdGhlIG1vZHVsZSB0byBpbnRlcmFjdCB3aXRoIHRoZSBhcHBsaWNhdGlvbiBjb3JlLlxyXG5cdCAqIEByZXR1cm5zIE5vdGhpbmcuXHJcblx0ICovXHJcblx0cHVibGljIGFzeW5jIGluaXRpYWxpemUoXHJcblx0XHRkZWZpbml0aW9uOiBNb2R1bGVEZWZpbml0aW9uPERldkFuYWx5dGljc09wdGlvbnM+LFxyXG5cdFx0bG9nZ2VyQ3JlYXRvcjogTG9nZ2VyQ3JlYXRvcixcclxuXHRcdGhlbHBlcnM6IE1vZHVsZUhlbHBlcnNcclxuXHQpOiBQcm9taXNlPHZvaWQ+IHtcclxuXHRcdHRoaXMuX2xvZ2dlciA9IGxvZ2dlckNyZWF0b3IoXCJEZXZlbG9wZXJBbmFseXRpY3NNb2R1bGVcIik7XHJcblx0XHR0aGlzLl9sb2dnZXIuaW5mbyhcIkluaXRpYWxpemVkXCIpO1xyXG5cdFx0dGhpcy5fbG9nZ2VyLmluZm8oXCJTZXNzaW9uIElkOiBcIiwgaGVscGVycy5zZXNzaW9uSWQpO1xyXG5cdFx0dGhpcy5faGVscGVycyA9IGhlbHBlcnM7XHJcblx0XHR0aGlzLl9jb250ZXh0VHlwZSA9IGRlZmluaXRpb24uZGF0YT8uY29udGV4dFR5cGUgPz8gXCJmaW4uZGV2LnBsYXRmb3JtLmFuYWx5dGljc1wiO1xyXG5cdFx0Y29uc3QgY2hhbm5lbE5hbWU6IHN0cmluZyA9IGRlZmluaXRpb24uZGF0YT8uc2Vzc2lvbkNvbnRleHRHcm91cE5hbWUgPz8gXCJkZXYvcGxhdGZvcm0vYW5hbHl0aWNzXCI7XHJcblx0XHR0aGlzLl9sb2dnZXIuaW5mbyhcclxuXHRcdFx0YFVzaW5nIGNoYW5uZWwgbmFtZTogJHtjaGFubmVsTmFtZX0gYW5kIGNvbnRleHRUeXBlOiAke3RoaXMuX2NvbnRleHRUeXBlfS4gVGhlc2UgY2FuIGJlIGN1c3RvbWl6ZWQgYnkgcGFzc2luZyBkYXRhIHNldHRpbmdzOiBzZXNzaW9uQ29udGV4dEdyb3VwTmFtZSBhbmQgY29udGV4dFR5cGUgaW4gdGhlIG1vZHVsZSBzZXR0aW5ncy5gXHJcblx0XHQpO1xyXG5cdFx0aWYgKGhlbHBlcnMuZ2V0SW50ZXJvcENsaWVudCAhPT0gdW5kZWZpbmVkICYmIGhlbHBlcnMuc3Vic2NyaWJlTGlmZWN5Y2xlRXZlbnQgIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHR0aGlzLl9sb2dnZXIuaW5mbyhcIlN1YnNjcmliaW5nIHRvIHRoZSBhZnRlciBib290c3RyYXAgZXZlbnQuXCIpO1xyXG5cdFx0XHRjb25zdCBsaWZlQ3ljbGVBZnRlckJvb3RzdHJhcFN1YnNjcmlwdGlvbklkID0gdGhpcy5faGVscGVycy5zdWJzY3JpYmVMaWZlY3ljbGVFdmVudChcclxuXHRcdFx0XHRcImFmdGVyLWJvb3RzdHJhcFwiLFxyXG5cdFx0XHRcdGFzeW5jIChfcGxhdGZvcm0pID0+IHtcclxuXHRcdFx0XHRcdHRoaXMuX2xvZ2dlci5pbmZvKFwiQWZ0ZXIgYm9vdHN0cmFwIGxpZmVjeWNsZSBldmVudCByZWNlaXZlZC4gR2V0dGluZyBpbnRlcm9wIGNsaWVudC5cIik7XHJcblx0XHRcdFx0XHR0aGlzLl9pbnRlcm9wQ2xpZW50ID0gYXdhaXQgaGVscGVycy5nZXRJbnRlcm9wQ2xpZW50KCk7XHJcblx0XHRcdFx0XHR0aGlzLl9jaGFubmVsID0gYXdhaXQgdGhpcy5faW50ZXJvcENsaWVudC5qb2luU2Vzc2lvbkNvbnRleHRHcm91cChjaGFubmVsTmFtZSk7XHJcblx0XHRcdFx0XHRpZiAodGhpcy5faGVscGVycy51bnN1YnNjcmliZUxpZmVjeWNsZUV2ZW50ICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5faGVscGVycy51bnN1YnNjcmliZUxpZmVjeWNsZUV2ZW50KGxpZmVDeWNsZUFmdGVyQm9vdHN0cmFwU3Vic2NyaXB0aW9uSWQsIFwiYWZ0ZXItYm9vdHN0cmFwXCIpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMuX2xvZ2dlci53YXJuKFxyXG5cdFx0XHRcdFwiVGhpcyBhbmFseXRpY3MgbW9kdWxlIHJlcXVpcmVzIGEgc2Vzc2lvbiBjb250ZXh0IGdyb3VwIG5hbWUsIGEgY29udGV4dCB0eXBlLCB0aGUgYWJpbGl0eSB0byBjcmVhdGUgYW4gaW50ZXJvcCBjbGllbnQgYW5kIHRoZSBhYmlsaXR5IHRvIGxpc3RlbiBmb3IgbGlmZWN5Y2xlIGV2ZW50cy4gVW5mb3J0dW5hdGVseSB0aGlzIGNyaXRlcmlhIGhhcyBub3QgYmVlbiBtZXQuXCJcclxuXHRcdFx0KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEhhbmRsZSBBbmFseXRpY3MuIFRoaXMgZXhhbXBsZSBtb2R1bGUgc2ltcGxlIGNvbnNvbGUgbG9ncyB0aGUgZXZlbnRzLiBZb3UgY291bGQgYmF0Y2ggdGhlIGV2ZW50cyBhbmQgcGFzcyBzZXR0aW5ncyAobnVtYmVyIHRvIGJhdGNoIGV0YywgZGVzdGluYXRpb24gdG8gc2VuZCBldmVudHMpIHZpYSB0aGUgbW9kdWxlIGRlZmluaXRpb24uXHJcblx0ICogQHBhcmFtIGV2ZW50cyBvbmUgb2YgbW9yZSBhbmFseXRpYyBldmVudHMuXHJcblx0ICovXHJcblx0cHVibGljIGFzeW5jIGhhbmRsZUFuYWx5dGljcyhldmVudHM6IFBsYXRmb3JtQW5hbHl0aWNzRXZlbnRbXSk6IFByb21pc2U8dm9pZD4ge1xyXG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KGV2ZW50cykpIHtcclxuXHRcdFx0dGhpcy5fbG9nZ2VyLndhcm4oXCJXZSB3ZXJlIG5vdCBwYXNzZWQgYW4gYXJyYXkgb2YgYW5hbHl0aWNhbCBldmVudHMuXCIpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5fY2hhbm5lbCAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdGxldCBwbGF0Zm9ybUFuYWx5dGljRXZlbnRzOiBQbGF0Zm9ybUFuYWx5dGljc0V2ZW50W10gPSBbXTtcclxuXHRcdFx0aWYgKHRoaXMuX2NhY2hlZEFuYWx5dGljRXZlbnRzLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0XHR0aGlzLl9sb2dnZXIuaW5mbyhgQWRkaW5nICR7dGhpcy5fY2FjaGVkQW5hbHl0aWNFdmVudHMubGVuZ3RofSBhbmFseXRpYyBldmVudHMuYCk7XHJcblx0XHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnNhZmUtYXJndW1lbnRcclxuXHRcdFx0XHRwbGF0Zm9ybUFuYWx5dGljRXZlbnRzLnB1c2goLi4udGhpcy5fY2FjaGVkQW5hbHl0aWNFdmVudHMpO1xyXG5cdFx0XHRcdHRoaXMuX2NhY2hlZEFuYWx5dGljRXZlbnRzID0gW107XHJcblx0XHRcdH1cclxuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnNhZmUtYXJndW1lbnRcclxuXHRcdFx0cGxhdGZvcm1BbmFseXRpY0V2ZW50cy5wdXNoKC4uLmV2ZW50cyk7XHJcblx0XHRcdGNvbnN0IGV2ZW50Q291bnQgPSBwbGF0Zm9ybUFuYWx5dGljRXZlbnRzLmxlbmd0aDtcclxuXHRcdFx0cGxhdGZvcm1BbmFseXRpY0V2ZW50cyA9IHBsYXRmb3JtQW5hbHl0aWNFdmVudHMuZmlsdGVyKFxyXG5cdFx0XHRcdChlbnRyeSkgPT4gIShlbnRyeS50eXBlLnRvTG93ZXJDYXNlKCkgPT09IFwiaW50ZXJvcFwiICYmIGVudHJ5LnNvdXJjZS50b0xvd2VyQ2FzZSgpICE9PSBcImJyb3dzZXJcIilcclxuXHRcdFx0KTtcclxuXHRcdFx0Y29uc3QgZmlsdGVyZWRDb3VudCA9IHBsYXRmb3JtQW5hbHl0aWNFdmVudHMubGVuZ3RoO1xyXG5cclxuXHRcdFx0aWYgKGV2ZW50Q291bnQgIT09IGZpbHRlcmVkQ291bnQpIHtcclxuXHRcdFx0XHR0aGlzLl9sb2dnZXIuaW5mbyhcclxuXHRcdFx0XHRcdGBGaWx0ZXJlZCBvdXQgJHtcclxuXHRcdFx0XHRcdFx0ZXZlbnRDb3VudCAtIGZpbHRlcmVkQ291bnRcclxuXHRcdFx0XHRcdH0gZXZlbnRzIGFzIHRoZXkgd2VyZSBvZiB0eXBlIGludGVyb3AgYW5kIG5vdCBmcm9tIHRoZSBicm93c2VyIGFuZCB3ZSBzZW5kIGV2ZW50cyBvdXQgb3ZlciBpbnRlcm9wYFxyXG5cdFx0XHRcdCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGNvbnN0IGNvbnRleHQgPSB7XHJcblx0XHRcdFx0dHlwZTogdGhpcy5fY29udGV4dFR5cGUsXHJcblx0XHRcdFx0bmFtZTogXCJBbmFseXRpYyBFdmVudHNcIixcclxuXHRcdFx0XHRldmVudHM6IHBsYXRmb3JtQW5hbHl0aWNFdmVudHNcclxuXHRcdFx0fTtcclxuXHRcdFx0YXdhaXQgdGhpcy5fY2hhbm5lbC5zZXRDb250ZXh0KGNvbnRleHQpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnNhZmUtYXJndW1lbnRcclxuXHRcdFx0dGhpcy5fY2FjaGVkQW5hbHl0aWNFdmVudHMucHVzaCguLi5ldmVudHMpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2xvc2UgZG93biB0aGUgbW9kdWxlLiBJZiB0aGlzIG1vZHVsZSBoYWQgYW55IGNhY2hlZCBldmVudHMgaXQgbmVlZGVkIHRvIHByb2Nlc3MgaXQgY291bGQgdHJ5IGFuZCBmbHVzaCB0aGVtIGhlcmUuXHJcblx0ICovXHJcblx0cHVibGljIGFzeW5jIGNsb3NlZG93bj8oKTogUHJvbWlzZTx2b2lkPiB7XHJcblx0XHR0aGlzLl9sb2dnZXIuaW5mbyhcImNsb3NpbmcgZG93blwiKTtcclxuXHR9XHJcbn1cclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgdHlwZSB7IE1vZHVsZUltcGxlbWVudGF0aW9uLCBNb2R1bGVUeXBlcyB9IGZyb20gXCJjdXN0b21pemUtd29ya3NwYWNlL3NoYXBlcy9tb2R1bGUtc2hhcGVzXCI7XHJcbmltcG9ydCB7IERldmVsb3BlckFjdGlvbnMgfSBmcm9tIFwiLi9hY3Rpb25zXCI7XHJcbmltcG9ydCB7IERldkFuYWx5dGljc01vZHVsZSB9IGZyb20gXCIuL2FuYWx5dGljc1wiO1xyXG5cclxuZXhwb3J0IGNvbnN0IGVudHJ5UG9pbnRzOiB7IFt0eXBlIGluIE1vZHVsZVR5cGVzXT86IE1vZHVsZUltcGxlbWVudGF0aW9uIH0gPSB7XHJcblx0YWN0aW9uczogbmV3IERldmVsb3BlckFjdGlvbnMoKSxcclxuXHRhbmFseXRpY3M6IG5ldyBEZXZBbmFseXRpY3NNb2R1bGUoKVxyXG59O1xyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=