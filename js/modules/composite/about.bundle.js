/******/ var __webpack_modules__ = ({

/***/ "./client/src/modules/composite/about/actions.ts":
/*!*******************************************************!*\
  !*** ./client/src/modules/composite/about/actions.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AboutActions": () => (/* binding */ AboutActions)
/* harmony export */ });
/**
 * Implement the actions.
 */
class AboutActions {
    constructor(sharedState) {
        this._sharedState = sharedState;
    }
    /**
     * Initialize the module.
     * @param definition The definition of the module from configuration include custom options.
     * @param createLogger For logging entries.
     * @param helpers Helper methods for the module to interact with the application core.
     * @returns Nothing.
     */
    async initialize(definition, createLogger, helpers) {
        this._logger = createLogger("AboutAction");
        this._helpers = helpers;
        this._definition = definition;
        this._sharedState.aboutWindow = await this.getAboutWindow();
    }
    /**
     * Get the actions from the module.
     */
    async get(platform) {
        const actionMap = {};
        actionMap["show-about"] = async (payload) => {
            if (payload.callerType === this._helpers.callerTypes.GlobalContextMenu &&
                this._sharedState?.aboutWindow !== undefined) {
                const aboutWindow = fin.Window.wrapSync({
                    uuid: fin.me.identity.uuid,
                    name: this._sharedState.aboutWindow.name
                });
                let windowExists = false;
                try {
                    await aboutWindow.getInfo();
                    windowExists = true;
                }
                catch {
                    this._logger.info("Cannot see existing about window. Will create an about window.");
                }
                if (windowExists) {
                    await aboutWindow.setAsForeground();
                }
                else {
                    try {
                        await fin.Window.create(this._sharedState.aboutWindow);
                    }
                    catch (error) {
                        this._logger.error("Error launching show about action window.", error);
                    }
                }
            }
        };
        return actionMap;
    }
    /** Gets about window options enriched with VersionInfo */
    async getAboutWindow() {
        if (this._definition?.data?.windowOptions === undefined) {
            this._logger.info("No about window configuration provided.");
            return undefined;
        }
        const validatedWindowOptions = {
            ...this._definition.data.windowOptions
        };
        if (validatedWindowOptions.url === undefined) {
            this._logger.error("An about version window configuration was set but a url was not provided. A window cannot be launched.");
            return undefined;
        }
        if (validatedWindowOptions.name === undefined) {
            validatedWindowOptions.name = `${fin.me.identity.uuid}-versioning-about`;
        }
        if (validatedWindowOptions?.customData?.versionInfo !== undefined) {
            this._logger.info("Enriching customData versionInfo provided by about version window configuration.");
            validatedWindowOptions.customData.versionInfo = {
                ...validatedWindowOptions.customData.versionInfo,
                ...(await this._helpers.getVersionInfo())
            };
        }
        else {
            this._logger.info("Setting customData versionInfo for about version window configuration.");
            if (validatedWindowOptions.customData === undefined) {
                validatedWindowOptions.customData = {};
            }
            validatedWindowOptions.customData.versionInfo = await this._helpers.getVersionInfo();
        }
        this._logger.info("Returning about version window configuration.");
        return validatedWindowOptions;
    }
}


/***/ }),

/***/ "./client/src/modules/composite/about/conditions.ts":
/*!**********************************************************!*\
  !*** ./client/src/modules/composite/about/conditions.ts ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AboutConditions": () => (/* binding */ AboutConditions)
/* harmony export */ });
/**
 * Implement the conditions.
 */
class AboutConditions {
    constructor(sharedState) {
        this._sharedState = sharedState;
    }
    /**
     * Initialize the module.
     * @param definition The definition of the module from configuration include custom options.
     * @param createLogger For logging entries.
     * @returns Nothing.
     */
    async initialize(definition, createLogger) {
        this._logger = createLogger("AboutCondition");
        this._definition = definition;
        this._logger.info("Condition Initialized");
    }
    /**
     * Get the conditions from the module.
     */
    async get() {
        const conditionMap = {};
        conditionMap["has-about"] = async () => this._sharedState.aboutWindow !== undefined;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return conditionMap;
    }
}


/***/ }),

/***/ "./client/src/modules/composite/about/integration.ts":
/*!***********************************************************!*\
  !*** ./client/src/modules/composite/about/integration.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AboutProvider": () => (/* binding */ AboutProvider)
/* harmony export */ });
/**
 * Implement the integration provider for about info.
 */
class AboutProvider {
    /**
     * Initialize the module.
     * @param definition The definition of the module from configuration include custom options.
     * @param loggerCreator For logging entries.
     * @param helpers Helper methods for the module to interact with the application core.
     * @returns Nothing.
     */
    async initialize(definition, loggerCreator, helpers) {
        this._integrationHelpers = helpers;
        this._definition = definition;
        this._versionTypeMap = definition?.data?.versionTypeMap ?? {};
        this._excludeVersionType = definition?.data?.excludeVersionType ?? [];
        this._logger = loggerCreator("AboutProvider");
    }
    /**
     * Get a list of the static help entries.
     * @returns The list of help entries.
     */
    async getHelpSearchEntries() {
        return [
            {
                key: `${AboutProvider._PROVIDER_ID}-help`,
                title: AboutProvider._ABOUT_COMMAND,
                label: "Help",
                icon: this._definition?.icon,
                actions: [],
                data: {
                    providerId: AboutProvider._PROVIDER_ID,
                    populateQuery: AboutProvider._ABOUT_COMMAND
                },
                template: "Custom",
                templateContent: await this._integrationHelpers.templateHelpers.createHelp(AboutProvider._ABOUT_COMMAND, ["The about command lists the version information related to this platform."], [AboutProvider._ABOUT_COMMAND])
            }
        ];
    }
    /**
     * Get a list of search results based on the query and filters.
     * @param query The query to search for.
     * @param filters The filters to apply.
     * @param lastResponse The last search response used for updating existing results.
     * @param options Options for the search query.
     * @returns The list of results and new filters.
     */
    async getSearchResults(query, filters, lastResponse, options) {
        if (query.length < 2 || !AboutProvider._ABOUT_COMMAND.startsWith(query)) {
            return {
                results: []
            };
        }
        const palette = await this._integrationHelpers.getCurrentPalette();
        const versionInfo = await this._integrationHelpers.getVersionInfo();
        const actions = [];
        const data = {};
        const tableData = [];
        tableData.push(["Version Type", "Version"]);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const keys = Object.keys(versionInfo);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (!this._excludeVersionType.includes(key)) {
                const label = this._versionTypeMap[key] ?? keys[i];
                tableData.push([label, (versionInfo[keys[i]] ?? "unknown")]);
            }
        }
        data.title = this._definition?.data?.title ?? "Versions";
        const children = [];
        const titleFragment = (await this._integrationHelpers.templateHelpers.createTitle("title", undefined, undefined, {
            marginBottom: "10px",
            borderBottom: `1px solid ${palette.background6}`
        }));
        children.push(titleFragment);
        if (this._definition?.data?.description !== undefined) {
            data.description = this._definition.data.description;
            const descriptionFragment = (await this._integrationHelpers.templateHelpers.createText("description", undefined, {
                marginBottom: "10px"
            }));
            children.push(descriptionFragment);
        }
        const tableFragment = (await this._integrationHelpers.templateHelpers.createTable(tableData, [], 0, data));
        children.push(tableFragment);
        const result = {
            key: "about-info",
            title: AboutProvider._ABOUT_COMMAND,
            label: "Version",
            icon: this._definition?.icon,
            actions,
            data: {
                providerId: AboutProvider._PROVIDER_ID
            },
            template: "Custom",
            templateContent: {
                layout: await this._integrationHelpers.templateHelpers.createContainer("column", children, {
                    padding: "10px"
                }),
                data
            }
        };
        return {
            results: [result]
        };
    }
    /**
     * An entry has been selected.
     * @param result The dispatched result.
     * @param lastResponse The last response.
     * @returns True if the item was handled.
     */
    async itemSelection(result, lastResponse) {
        return true;
    }
}
/**
 * Provider id.
 * @internal
 */
AboutProvider._PROVIDER_ID = "about";
/**
 * The command to display the about information.
 * @internal
 */
AboutProvider._ABOUT_COMMAND = "/about";


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
/*!*****************************************************!*\
  !*** ./client/src/modules/composite/about/index.ts ***!
  \*****************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "entryPoints": () => (/* binding */ entryPoints)
/* harmony export */ });
/* harmony import */ var _actions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./actions */ "./client/src/modules/composite/about/actions.ts");
/* harmony import */ var _conditions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./conditions */ "./client/src/modules/composite/about/conditions.ts");
/* harmony import */ var _integration__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./integration */ "./client/src/modules/composite/about/integration.ts");



const sharedState = {};
const entryPoints = {
    integrations: new _integration__WEBPACK_IMPORTED_MODULE_2__.AboutProvider(),
    conditions: new _conditions__WEBPACK_IMPORTED_MODULE_1__.AboutConditions(sharedState),
    actions: new _actions__WEBPACK_IMPORTED_MODULE_0__.AboutActions(sharedState)
};

})();

var __webpack_exports__entryPoints = __webpack_exports__.entryPoints;
export { __webpack_exports__entryPoints as entryPoints };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBOzs7OztVQ3RCQTtVQUNBO1VBQ0E7VUFDQTtVQUNBLHlDQUF5Qyx3Q0FBd0M7VUFDakY7VUFDQTtVQUNBOzs7OztVQ1BBOzs7OztVQ0FBO1VBQ0E7VUFDQTtVQUNBLHVEQUF1RCxpQkFBaUI7VUFDeEU7VUFDQSxnREFBZ0QsYUFBYTtVQUM3RDs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNMeUM7QUFDTTtBQUNEO0FBRzlDLE1BQU0sV0FBVyxHQUFnQixFQUFFLENBQUM7QUFDN0IsTUFBTSxXQUFXLEdBQXFEO0lBQzVFLFlBQVksRUFBRSxJQUFJLHVEQUFhLEVBQUU7SUFDakMsVUFBVSxFQUFFLElBQUksd0RBQWUsQ0FBQyxXQUFXLENBQUM7SUFDNUMsT0FBTyxFQUFFLElBQUksa0RBQVksQ0FBQyxXQUFXLENBQUM7Q0FDdEMsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL29wZW5maW4td29ya3NwYWNlLS1jdXN0b21pemUtd29ya3NwYWNlLy4vY2xpZW50L3NyYy9tb2R1bGVzL2NvbXBvc2l0ZS9hYm91dC9hY3Rpb25zLnRzIiwid2VicGFjazovL29wZW5maW4td29ya3NwYWNlLS1jdXN0b21pemUtd29ya3NwYWNlLy4vY2xpZW50L3NyYy9tb2R1bGVzL2NvbXBvc2l0ZS9hYm91dC9jb25kaXRpb25zLnRzIiwid2VicGFjazovL29wZW5maW4td29ya3NwYWNlLS1jdXN0b21pemUtd29ya3NwYWNlLy4vY2xpZW50L3NyYy9tb2R1bGVzL2NvbXBvc2l0ZS9hYm91dC9pbnRlZ3JhdGlvbi50cyIsIndlYnBhY2s6Ly9vcGVuZmluLXdvcmtzcGFjZS0tY3VzdG9taXplLXdvcmtzcGFjZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9vcGVuZmluLXdvcmtzcGFjZS0tY3VzdG9taXplLXdvcmtzcGFjZS93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vb3BlbmZpbi13b3Jrc3BhY2UtLWN1c3RvbWl6ZS13b3Jrc3BhY2Uvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9vcGVuZmluLXdvcmtzcGFjZS0tY3VzdG9taXplLXdvcmtzcGFjZS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL29wZW5maW4td29ya3NwYWNlLS1jdXN0b21pemUtd29ya3NwYWNlLy4vY2xpZW50L3NyYy9tb2R1bGVzL2NvbXBvc2l0ZS9hYm91dC9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7XHJcblx0Q3VzdG9tQWN0aW9uUGF5bG9hZCxcclxuXHRDdXN0b21BY3Rpb25zTWFwLFxyXG5cdFdvcmtzcGFjZVBsYXRmb3JtTW9kdWxlXHJcbn0gZnJvbSBcIkBvcGVuZmluL3dvcmtzcGFjZS1wbGF0Zm9ybVwiO1xyXG5pbXBvcnQgdHlwZSB7IEFjdGlvbkhlbHBlcnMsIEFjdGlvbnMgfSBmcm9tIFwiY3VzdG9taXplLXdvcmtzcGFjZS9zaGFwZXMvYWN0aW9ucy1zaGFwZXNcIjtcclxuaW1wb3J0IHR5cGUgeyBMb2dnZXIsIExvZ2dlckNyZWF0b3IgfSBmcm9tIFwiY3VzdG9taXplLXdvcmtzcGFjZS9zaGFwZXMvbG9nZ2VyLXNoYXBlc1wiO1xyXG5pbXBvcnQgdHlwZSB7IE1vZHVsZURlZmluaXRpb24gfSBmcm9tIFwiY3VzdG9taXplLXdvcmtzcGFjZS9zaGFwZXMvbW9kdWxlLXNoYXBlc1wiO1xyXG5pbXBvcnQgdHlwZSB7IEFib3V0QWN0aW9uU2V0dGluZ3MsIFNoYXJlZFN0YXRlIH0gZnJvbSBcIi4vc2hhcGVzXCI7XHJcbi8qKlxyXG4gKiBJbXBsZW1lbnQgdGhlIGFjdGlvbnMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQWJvdXRBY3Rpb25zIGltcGxlbWVudHMgQWN0aW9ucyB7XHJcblx0LyoqXHJcblx0ICogVGhlIGhlbHBlciBtZXRob2RzIHRvIHVzZS5cclxuXHQgKi9cclxuXHRwcml2YXRlIF9oZWxwZXJzOiBBY3Rpb25IZWxwZXJzO1xyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgaGVscGVyIG1ldGhvZHMgdG8gdXNlLlxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2xvZ2dlcjogTG9nZ2VyO1xyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgc2V0dGluZ3MgZm9yIHRoZSBhY3Rpb24uXHJcblx0ICogQGludGVybmFsXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfZGVmaW5pdGlvbjogTW9kdWxlRGVmaW5pdGlvbjxBYm91dEFjdGlvblNldHRpbmdzPiB8IHVuZGVmaW5lZDtcclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHNoYXJlZCBzdGF0ZSBwYXNzZWQgdG8gdGhlc2UgaW1wbGVtZW50YXRpb25zLlxyXG5cdCAqL1xyXG5cdHByaXZhdGUgcmVhZG9ubHkgX3NoYXJlZFN0YXRlOiBTaGFyZWRTdGF0ZTtcclxuXHJcblx0Y29uc3RydWN0b3Ioc2hhcmVkU3RhdGU6IFNoYXJlZFN0YXRlKSB7XHJcblx0XHR0aGlzLl9zaGFyZWRTdGF0ZSA9IHNoYXJlZFN0YXRlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSW5pdGlhbGl6ZSB0aGUgbW9kdWxlLlxyXG5cdCAqIEBwYXJhbSBkZWZpbml0aW9uIFRoZSBkZWZpbml0aW9uIG9mIHRoZSBtb2R1bGUgZnJvbSBjb25maWd1cmF0aW9uIGluY2x1ZGUgY3VzdG9tIG9wdGlvbnMuXHJcblx0ICogQHBhcmFtIGNyZWF0ZUxvZ2dlciBGb3IgbG9nZ2luZyBlbnRyaWVzLlxyXG5cdCAqIEBwYXJhbSBoZWxwZXJzIEhlbHBlciBtZXRob2RzIGZvciB0aGUgbW9kdWxlIHRvIGludGVyYWN0IHdpdGggdGhlIGFwcGxpY2F0aW9uIGNvcmUuXHJcblx0ICogQHJldHVybnMgTm90aGluZy5cclxuXHQgKi9cclxuXHRwdWJsaWMgYXN5bmMgaW5pdGlhbGl6ZShcclxuXHRcdGRlZmluaXRpb246IE1vZHVsZURlZmluaXRpb248QWJvdXRBY3Rpb25TZXR0aW5ncz4sXHJcblx0XHRjcmVhdGVMb2dnZXI6IExvZ2dlckNyZWF0b3IsXHJcblx0XHRoZWxwZXJzOiBBY3Rpb25IZWxwZXJzXHJcblx0KTogUHJvbWlzZTx2b2lkPiB7XHJcblx0XHR0aGlzLl9sb2dnZXIgPSBjcmVhdGVMb2dnZXIoXCJBYm91dEFjdGlvblwiKTtcclxuXHRcdHRoaXMuX2hlbHBlcnMgPSBoZWxwZXJzO1xyXG5cdFx0dGhpcy5fZGVmaW5pdGlvbiA9IGRlZmluaXRpb247XHJcblx0XHR0aGlzLl9zaGFyZWRTdGF0ZS5hYm91dFdpbmRvdyA9IGF3YWl0IHRoaXMuZ2V0QWJvdXRXaW5kb3coKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCB0aGUgYWN0aW9ucyBmcm9tIHRoZSBtb2R1bGUuXHJcblx0ICovXHJcblx0cHVibGljIGFzeW5jIGdldChwbGF0Zm9ybTogV29ya3NwYWNlUGxhdGZvcm1Nb2R1bGUpOiBQcm9taXNlPEN1c3RvbUFjdGlvbnNNYXA+IHtcclxuXHRcdGNvbnN0IGFjdGlvbk1hcDogQ3VzdG9tQWN0aW9uc01hcCA9IHt9O1xyXG5cclxuXHRcdGFjdGlvbk1hcFtcInNob3ctYWJvdXRcIl0gPSBhc3luYyAocGF5bG9hZDogQ3VzdG9tQWN0aW9uUGF5bG9hZCkgPT4ge1xyXG5cdFx0XHRpZiAoXHJcblx0XHRcdFx0cGF5bG9hZC5jYWxsZXJUeXBlID09PSB0aGlzLl9oZWxwZXJzLmNhbGxlclR5cGVzLkdsb2JhbENvbnRleHRNZW51ICYmXHJcblx0XHRcdFx0dGhpcy5fc2hhcmVkU3RhdGU/LmFib3V0V2luZG93ICE9PSB1bmRlZmluZWRcclxuXHRcdFx0KSB7XHJcblx0XHRcdFx0Y29uc3QgYWJvdXRXaW5kb3cgPSBmaW4uV2luZG93LndyYXBTeW5jKHtcclxuXHRcdFx0XHRcdHV1aWQ6IGZpbi5tZS5pZGVudGl0eS51dWlkLFxyXG5cdFx0XHRcdFx0bmFtZTogdGhpcy5fc2hhcmVkU3RhdGUuYWJvdXRXaW5kb3cubmFtZVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdGxldCB3aW5kb3dFeGlzdHMgPSBmYWxzZTtcclxuXHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0YXdhaXQgYWJvdXRXaW5kb3cuZ2V0SW5mbygpO1xyXG5cdFx0XHRcdFx0d2luZG93RXhpc3RzID0gdHJ1ZTtcclxuXHRcdFx0XHR9IGNhdGNoIHtcclxuXHRcdFx0XHRcdHRoaXMuX2xvZ2dlci5pbmZvKFwiQ2Fubm90IHNlZSBleGlzdGluZyBhYm91dCB3aW5kb3cuIFdpbGwgY3JlYXRlIGFuIGFib3V0IHdpbmRvdy5cIik7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZiAod2luZG93RXhpc3RzKSB7XHJcblx0XHRcdFx0XHRhd2FpdCBhYm91dFdpbmRvdy5zZXRBc0ZvcmVncm91bmQoKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdFx0YXdhaXQgZmluLldpbmRvdy5jcmVhdGUodGhpcy5fc2hhcmVkU3RhdGUuYWJvdXRXaW5kb3cpO1xyXG5cdFx0XHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5fbG9nZ2VyLmVycm9yKFwiRXJyb3IgbGF1bmNoaW5nIHNob3cgYWJvdXQgYWN0aW9uIHdpbmRvdy5cIiwgZXJyb3IpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHJcblx0XHRyZXR1cm4gYWN0aW9uTWFwO1xyXG5cdH1cclxuXHJcblx0LyoqIEdldHMgYWJvdXQgd2luZG93IG9wdGlvbnMgZW5yaWNoZWQgd2l0aCBWZXJzaW9uSW5mbyAqL1xyXG5cdHByaXZhdGUgYXN5bmMgZ2V0QWJvdXRXaW5kb3coKTogUHJvbWlzZTxPcGVuRmluLldpbmRvd09wdGlvbnM+IHtcclxuXHRcdGlmICh0aGlzLl9kZWZpbml0aW9uPy5kYXRhPy53aW5kb3dPcHRpb25zID09PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0dGhpcy5fbG9nZ2VyLmluZm8oXCJObyBhYm91dCB3aW5kb3cgY29uZmlndXJhdGlvbiBwcm92aWRlZC5cIik7XHJcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XHJcblx0XHR9XHJcblxyXG5cdFx0Y29uc3QgdmFsaWRhdGVkV2luZG93T3B0aW9uczogT3BlbkZpbi5XaW5kb3dPcHRpb25zID0ge1xyXG5cdFx0XHQuLi50aGlzLl9kZWZpbml0aW9uLmRhdGEud2luZG93T3B0aW9uc1xyXG5cdFx0fTtcclxuXHJcblx0XHRpZiAodmFsaWRhdGVkV2luZG93T3B0aW9ucy51cmwgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHR0aGlzLl9sb2dnZXIuZXJyb3IoXHJcblx0XHRcdFx0XCJBbiBhYm91dCB2ZXJzaW9uIHdpbmRvdyBjb25maWd1cmF0aW9uIHdhcyBzZXQgYnV0IGEgdXJsIHdhcyBub3QgcHJvdmlkZWQuIEEgd2luZG93IGNhbm5vdCBiZSBsYXVuY2hlZC5cIlxyXG5cdFx0XHQpO1xyXG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHZhbGlkYXRlZFdpbmRvd09wdGlvbnMubmFtZSA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdHZhbGlkYXRlZFdpbmRvd09wdGlvbnMubmFtZSA9IGAke2Zpbi5tZS5pZGVudGl0eS51dWlkfS12ZXJzaW9uaW5nLWFib3V0YDtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAodmFsaWRhdGVkV2luZG93T3B0aW9ucz8uY3VzdG9tRGF0YT8udmVyc2lvbkluZm8gIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHR0aGlzLl9sb2dnZXIuaW5mbyhcIkVucmljaGluZyBjdXN0b21EYXRhIHZlcnNpb25JbmZvIHByb3ZpZGVkIGJ5IGFib3V0IHZlcnNpb24gd2luZG93IGNvbmZpZ3VyYXRpb24uXCIpO1xyXG5cdFx0XHR2YWxpZGF0ZWRXaW5kb3dPcHRpb25zLmN1c3RvbURhdGEudmVyc2lvbkluZm8gPSB7XHJcblx0XHRcdFx0Li4udmFsaWRhdGVkV2luZG93T3B0aW9ucy5jdXN0b21EYXRhLnZlcnNpb25JbmZvLFxyXG5cdFx0XHRcdC4uLihhd2FpdCB0aGlzLl9oZWxwZXJzLmdldFZlcnNpb25JbmZvKCkpXHJcblx0XHRcdH07XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLl9sb2dnZXIuaW5mbyhcIlNldHRpbmcgY3VzdG9tRGF0YSB2ZXJzaW9uSW5mbyBmb3IgYWJvdXQgdmVyc2lvbiB3aW5kb3cgY29uZmlndXJhdGlvbi5cIik7XHJcblx0XHRcdGlmICh2YWxpZGF0ZWRXaW5kb3dPcHRpb25zLmN1c3RvbURhdGEgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdHZhbGlkYXRlZFdpbmRvd09wdGlvbnMuY3VzdG9tRGF0YSA9IHt9O1xyXG5cdFx0XHR9XHJcblx0XHRcdHZhbGlkYXRlZFdpbmRvd09wdGlvbnMuY3VzdG9tRGF0YS52ZXJzaW9uSW5mbyA9IGF3YWl0IHRoaXMuX2hlbHBlcnMuZ2V0VmVyc2lvbkluZm8oKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9sb2dnZXIuaW5mbyhcIlJldHVybmluZyBhYm91dCB2ZXJzaW9uIHdpbmRvdyBjb25maWd1cmF0aW9uLlwiKTtcclxuXHRcdHJldHVybiB2YWxpZGF0ZWRXaW5kb3dPcHRpb25zO1xyXG5cdH1cclxufVxyXG4iLCJpbXBvcnQgdHlwZSB7IENvbmRpdGlvbk1hcCwgQ29uZGl0aW9ucyB9IGZyb20gXCJjdXN0b21pemUtd29ya3NwYWNlL3NoYXBlc1wiO1xyXG5pbXBvcnQgdHlwZSB7IExvZ2dlciwgTG9nZ2VyQ3JlYXRvciB9IGZyb20gXCJjdXN0b21pemUtd29ya3NwYWNlL3NoYXBlcy9sb2dnZXItc2hhcGVzXCI7XHJcbmltcG9ydCB0eXBlIHsgTW9kdWxlRGVmaW5pdGlvbiB9IGZyb20gXCJjdXN0b21pemUtd29ya3NwYWNlL3NoYXBlcy9tb2R1bGUtc2hhcGVzXCI7XHJcbmltcG9ydCB0eXBlIHsgU2hhcmVkU3RhdGUgfSBmcm9tIFwiLi9zaGFwZXNcIjtcclxuLyoqXHJcbiAqIEltcGxlbWVudCB0aGUgY29uZGl0aW9ucy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBBYm91dENvbmRpdGlvbnMgaW1wbGVtZW50cyBDb25kaXRpb25zIHtcclxuXHQvKipcclxuXHQgKiBUaGUgaGVscGVyIG1ldGhvZHMgdG8gdXNlLlxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2xvZ2dlcjogTG9nZ2VyO1xyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgc2V0dGluZ3MgZm9yIHRoZSBjb25kaXRpb25zLlxyXG5cdCAqIEBpbnRlcm5hbFxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2RlZmluaXRpb246IE1vZHVsZURlZmluaXRpb248dW5rbm93bj4gfCB1bmRlZmluZWQ7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBzaGFyZWQgc3RhdGUgcGFzc2VkIHRvIHRoZXNlIGltcGxlbWVudGF0aW9ucy5cclxuXHQgKi9cclxuXHRwcml2YXRlIHJlYWRvbmx5IF9zaGFyZWRTdGF0ZTogU2hhcmVkU3RhdGU7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHNoYXJlZFN0YXRlOiBTaGFyZWRTdGF0ZSkge1xyXG5cdFx0dGhpcy5fc2hhcmVkU3RhdGUgPSBzaGFyZWRTdGF0ZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEluaXRpYWxpemUgdGhlIG1vZHVsZS5cclxuXHQgKiBAcGFyYW0gZGVmaW5pdGlvbiBUaGUgZGVmaW5pdGlvbiBvZiB0aGUgbW9kdWxlIGZyb20gY29uZmlndXJhdGlvbiBpbmNsdWRlIGN1c3RvbSBvcHRpb25zLlxyXG5cdCAqIEBwYXJhbSBjcmVhdGVMb2dnZXIgRm9yIGxvZ2dpbmcgZW50cmllcy5cclxuXHQgKiBAcmV0dXJucyBOb3RoaW5nLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhc3luYyBpbml0aWFsaXplKGRlZmluaXRpb246IE1vZHVsZURlZmluaXRpb248dW5rbm93bj4sIGNyZWF0ZUxvZ2dlcjogTG9nZ2VyQ3JlYXRvcik6IFByb21pc2U8dm9pZD4ge1xyXG5cdFx0dGhpcy5fbG9nZ2VyID0gY3JlYXRlTG9nZ2VyKFwiQWJvdXRDb25kaXRpb25cIik7XHJcblx0XHR0aGlzLl9kZWZpbml0aW9uID0gZGVmaW5pdGlvbjtcclxuXHRcdHRoaXMuX2xvZ2dlci5pbmZvKFwiQ29uZGl0aW9uIEluaXRpYWxpemVkXCIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogR2V0IHRoZSBjb25kaXRpb25zIGZyb20gdGhlIG1vZHVsZS5cclxuXHQgKi9cclxuXHRwdWJsaWMgYXN5bmMgZ2V0KCk6IFByb21pc2U8Q29uZGl0aW9uTWFwPiB7XHJcblx0XHRjb25zdCBjb25kaXRpb25NYXA6IENvbmRpdGlvbk1hcCA9IHt9O1xyXG5cclxuXHRcdGNvbmRpdGlvbk1hcFtcImhhcy1hYm91dFwiXSA9IGFzeW5jICgpID0+IHRoaXMuX3NoYXJlZFN0YXRlLmFib3V0V2luZG93ICE9PSB1bmRlZmluZWQ7XHJcblxyXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnNhZmUtcmV0dXJuXHJcblx0XHRyZXR1cm4gY29uZGl0aW9uTWFwO1xyXG5cdH1cclxufVxyXG4iLCJpbXBvcnQgdHlwZSB7XHJcblx0Q0xJRmlsdGVyLFxyXG5cdENMSVRlbXBsYXRlLFxyXG5cdEhvbWVEaXNwYXRjaGVkU2VhcmNoUmVzdWx0LFxyXG5cdEhvbWVTZWFyY2hMaXN0ZW5lclJlc3BvbnNlLFxyXG5cdEhvbWVTZWFyY2hSZXNwb25zZSxcclxuXHRIb21lU2VhcmNoUmVzdWx0LFxyXG5cdFRlbXBsYXRlRnJhZ21lbnRcclxufSBmcm9tIFwiQG9wZW5maW4vd29ya3NwYWNlXCI7XHJcbmltcG9ydCB0eXBlIHsgSW50ZWdyYXRpb25IZWxwZXJzLCBJbnRlZ3JhdGlvbk1vZHVsZSB9IGZyb20gXCJjdXN0b21pemUtd29ya3NwYWNlL3NoYXBlcy9pbnRlZ3JhdGlvbnMtc2hhcGVzXCI7XHJcbmltcG9ydCB0eXBlIHsgTG9nZ2VyLCBMb2dnZXJDcmVhdG9yIH0gZnJvbSBcImN1c3RvbWl6ZS13b3Jrc3BhY2Uvc2hhcGVzL2xvZ2dlci1zaGFwZXNcIjtcclxuaW1wb3J0IHR5cGUgeyBNb2R1bGVEZWZpbml0aW9uIH0gZnJvbSBcImN1c3RvbWl6ZS13b3Jrc3BhY2Uvc2hhcGVzL21vZHVsZS1zaGFwZXNcIjtcclxuaW1wb3J0IHR5cGUgeyBBYm91dFByb3ZpZGVyU2V0dGluZ3MgfSBmcm9tIFwiLi9zaGFwZXNcIjtcclxuXHJcbi8qKlxyXG4gKiBJbXBsZW1lbnQgdGhlIGludGVncmF0aW9uIHByb3ZpZGVyIGZvciBhYm91dCBpbmZvLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEFib3V0UHJvdmlkZXIgaW1wbGVtZW50cyBJbnRlZ3JhdGlvbk1vZHVsZTx1bmtub3duPiB7XHJcblx0LyoqXHJcblx0ICogUHJvdmlkZXIgaWQuXHJcblx0ICogQGludGVybmFsXHJcblx0ICovXHJcblx0cHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgX1BST1ZJREVSX0lEID0gXCJhYm91dFwiO1xyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgY29tbWFuZCB0byBkaXNwbGF5IHRoZSBhYm91dCBpbmZvcm1hdGlvbi5cclxuXHQgKiBAaW50ZXJuYWxcclxuXHQgKi9cclxuXHRwcml2YXRlIHN0YXRpYyByZWFkb25seSBfQUJPVVRfQ09NTUFORCA9IFwiL2Fib3V0XCI7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBzZXR0aW5ncyBmb3IgdGhlIGludGVncmF0aW9uLlxyXG5cdCAqIEBpbnRlcm5hbFxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2xvZ2dlcjogTG9nZ2VyO1xyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgaW50ZWdyYXRpb24gaGVscGVycy5cclxuXHQgKiBAaW50ZXJuYWxcclxuXHQgKi9cclxuXHRwcml2YXRlIF9pbnRlZ3JhdGlvbkhlbHBlcnM6IEludGVncmF0aW9uSGVscGVycyB8IHVuZGVmaW5lZDtcclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHNldHRpbmdzIGZvciB0aGUgaW50ZWdyYXRpb24uXHJcblx0ICogQGludGVybmFsXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfZGVmaW5pdGlvbjogTW9kdWxlRGVmaW5pdGlvbjxBYm91dFByb3ZpZGVyU2V0dGluZ3M+IHwgdW5kZWZpbmVkO1xyXG5cclxuXHQvKipcclxuXHQgKiBQcm92aWRlZCBhbHRlcm5hdGUgbGFiZWxzIGZvciB0aGUgdmVyc2lvbiB0eXBlc1xyXG5cdCAqIEBpbnRlcm5hbFxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3ZlcnNpb25UeXBlTWFwOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xyXG5cclxuXHQvKipcclxuXHQgKiBQcm92aWRlZCBhbHRlcm5hdGUgbGFiZWxzIGZvciB0aGUgdmVyc2lvbiB0eXBlc1xyXG5cdCAqIEBpbnRlcm5hbFxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2V4Y2x1ZGVWZXJzaW9uVHlwZTogc3RyaW5nW107XHJcblxyXG5cdC8qKlxyXG5cdCAqIEluaXRpYWxpemUgdGhlIG1vZHVsZS5cclxuXHQgKiBAcGFyYW0gZGVmaW5pdGlvbiBUaGUgZGVmaW5pdGlvbiBvZiB0aGUgbW9kdWxlIGZyb20gY29uZmlndXJhdGlvbiBpbmNsdWRlIGN1c3RvbSBvcHRpb25zLlxyXG5cdCAqIEBwYXJhbSBsb2dnZXJDcmVhdG9yIEZvciBsb2dnaW5nIGVudHJpZXMuXHJcblx0ICogQHBhcmFtIGhlbHBlcnMgSGVscGVyIG1ldGhvZHMgZm9yIHRoZSBtb2R1bGUgdG8gaW50ZXJhY3Qgd2l0aCB0aGUgYXBwbGljYXRpb24gY29yZS5cclxuXHQgKiBAcmV0dXJucyBOb3RoaW5nLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhc3luYyBpbml0aWFsaXplKFxyXG5cdFx0ZGVmaW5pdGlvbjogTW9kdWxlRGVmaW5pdGlvbjxBYm91dFByb3ZpZGVyU2V0dGluZ3M+LFxyXG5cdFx0bG9nZ2VyQ3JlYXRvcjogTG9nZ2VyQ3JlYXRvcixcclxuXHRcdGhlbHBlcnM6IEludGVncmF0aW9uSGVscGVyc1xyXG5cdCk6IFByb21pc2U8dm9pZD4ge1xyXG5cdFx0dGhpcy5faW50ZWdyYXRpb25IZWxwZXJzID0gaGVscGVycztcclxuXHRcdHRoaXMuX2RlZmluaXRpb24gPSBkZWZpbml0aW9uO1xyXG5cdFx0dGhpcy5fdmVyc2lvblR5cGVNYXAgPSBkZWZpbml0aW9uPy5kYXRhPy52ZXJzaW9uVHlwZU1hcCA/PyB7fTtcclxuXHRcdHRoaXMuX2V4Y2x1ZGVWZXJzaW9uVHlwZSA9IGRlZmluaXRpb24/LmRhdGE/LmV4Y2x1ZGVWZXJzaW9uVHlwZSA/PyBbXTtcclxuXHRcdHRoaXMuX2xvZ2dlciA9IGxvZ2dlckNyZWF0b3IoXCJBYm91dFByb3ZpZGVyXCIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogR2V0IGEgbGlzdCBvZiB0aGUgc3RhdGljIGhlbHAgZW50cmllcy5cclxuXHQgKiBAcmV0dXJucyBUaGUgbGlzdCBvZiBoZWxwIGVudHJpZXMuXHJcblx0ICovXHJcblx0cHVibGljIGFzeW5jIGdldEhlbHBTZWFyY2hFbnRyaWVzKCk6IFByb21pc2U8SG9tZVNlYXJjaFJlc3VsdFtdPiB7XHJcblx0XHRyZXR1cm4gW1xyXG5cdFx0XHR7XHJcblx0XHRcdFx0a2V5OiBgJHtBYm91dFByb3ZpZGVyLl9QUk9WSURFUl9JRH0taGVscGAsXHJcblx0XHRcdFx0dGl0bGU6IEFib3V0UHJvdmlkZXIuX0FCT1VUX0NPTU1BTkQsXHJcblx0XHRcdFx0bGFiZWw6IFwiSGVscFwiLFxyXG5cdFx0XHRcdGljb246IHRoaXMuX2RlZmluaXRpb24/Lmljb24sXHJcblx0XHRcdFx0YWN0aW9uczogW10sXHJcblx0XHRcdFx0ZGF0YToge1xyXG5cdFx0XHRcdFx0cHJvdmlkZXJJZDogQWJvdXRQcm92aWRlci5fUFJPVklERVJfSUQsXHJcblx0XHRcdFx0XHRwb3B1bGF0ZVF1ZXJ5OiBBYm91dFByb3ZpZGVyLl9BQk9VVF9DT01NQU5EXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHR0ZW1wbGF0ZTogXCJDdXN0b21cIiBhcyBDTElUZW1wbGF0ZS5DdXN0b20sXHJcblx0XHRcdFx0dGVtcGxhdGVDb250ZW50OiBhd2FpdCB0aGlzLl9pbnRlZ3JhdGlvbkhlbHBlcnMudGVtcGxhdGVIZWxwZXJzLmNyZWF0ZUhlbHAoXHJcblx0XHRcdFx0XHRBYm91dFByb3ZpZGVyLl9BQk9VVF9DT01NQU5ELFxyXG5cdFx0XHRcdFx0W1wiVGhlIGFib3V0IGNvbW1hbmQgbGlzdHMgdGhlIHZlcnNpb24gaW5mb3JtYXRpb24gcmVsYXRlZCB0byB0aGlzIHBsYXRmb3JtLlwiXSxcclxuXHRcdFx0XHRcdFtBYm91dFByb3ZpZGVyLl9BQk9VVF9DT01NQU5EXVxyXG5cdFx0XHRcdClcclxuXHRcdFx0fVxyXG5cdFx0XTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCBhIGxpc3Qgb2Ygc2VhcmNoIHJlc3VsdHMgYmFzZWQgb24gdGhlIHF1ZXJ5IGFuZCBmaWx0ZXJzLlxyXG5cdCAqIEBwYXJhbSBxdWVyeSBUaGUgcXVlcnkgdG8gc2VhcmNoIGZvci5cclxuXHQgKiBAcGFyYW0gZmlsdGVycyBUaGUgZmlsdGVycyB0byBhcHBseS5cclxuXHQgKiBAcGFyYW0gbGFzdFJlc3BvbnNlIFRoZSBsYXN0IHNlYXJjaCByZXNwb25zZSB1c2VkIGZvciB1cGRhdGluZyBleGlzdGluZyByZXN1bHRzLlxyXG5cdCAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIHRoZSBzZWFyY2ggcXVlcnkuXHJcblx0ICogQHJldHVybnMgVGhlIGxpc3Qgb2YgcmVzdWx0cyBhbmQgbmV3IGZpbHRlcnMuXHJcblx0ICovXHJcblx0cHVibGljIGFzeW5jIGdldFNlYXJjaFJlc3VsdHMoXHJcblx0XHRxdWVyeTogc3RyaW5nLFxyXG5cdFx0ZmlsdGVyczogQ0xJRmlsdGVyW10sXHJcblx0XHRsYXN0UmVzcG9uc2U6IEhvbWVTZWFyY2hMaXN0ZW5lclJlc3BvbnNlLFxyXG5cdFx0b3B0aW9uczoge1xyXG5cdFx0XHRxdWVyeU1pbkxlbmd0aDogbnVtYmVyO1xyXG5cdFx0XHRxdWVyeUFnYWluc3Q6IHN0cmluZ1tdO1xyXG5cdFx0fVxyXG5cdCk6IFByb21pc2U8SG9tZVNlYXJjaFJlc3BvbnNlPiB7XHJcblx0XHRpZiAocXVlcnkubGVuZ3RoIDwgMiB8fCAhQWJvdXRQcm92aWRlci5fQUJPVVRfQ09NTUFORC5zdGFydHNXaXRoKHF1ZXJ5KSkge1xyXG5cdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdHJlc3VsdHM6IFtdXHJcblx0XHRcdH07XHJcblx0XHR9XHJcblx0XHRjb25zdCBwYWxldHRlID0gYXdhaXQgdGhpcy5faW50ZWdyYXRpb25IZWxwZXJzLmdldEN1cnJlbnRQYWxldHRlKCk7XHJcblxyXG5cdFx0Y29uc3QgdmVyc2lvbkluZm8gPSBhd2FpdCB0aGlzLl9pbnRlZ3JhdGlvbkhlbHBlcnMuZ2V0VmVyc2lvbkluZm8oKTtcclxuXHJcblx0XHRjb25zdCBhY3Rpb25zID0gW107XHJcblxyXG5cdFx0Y29uc3QgZGF0YTogeyBbaWQ6IHN0cmluZ106IHN0cmluZyB9ID0ge307XHJcblxyXG5cdFx0Y29uc3QgdGFibGVEYXRhOiBzdHJpbmdbXVtdID0gW107XHJcblx0XHR0YWJsZURhdGEucHVzaChbXCJWZXJzaW9uIFR5cGVcIiwgXCJWZXJzaW9uXCJdKTtcclxuXHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVuc2FmZS1hcmd1bWVudFxyXG5cdFx0Y29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHZlcnNpb25JbmZvKTtcclxuXHJcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0Y29uc3Qga2V5ID0ga2V5c1tpXTtcclxuXHRcdFx0aWYgKCF0aGlzLl9leGNsdWRlVmVyc2lvblR5cGUuaW5jbHVkZXMoa2V5KSkge1xyXG5cdFx0XHRcdGNvbnN0IGxhYmVsID0gdGhpcy5fdmVyc2lvblR5cGVNYXBba2V5XSA/PyBrZXlzW2ldO1xyXG5cdFx0XHRcdHRhYmxlRGF0YS5wdXNoKFtsYWJlbCwgKHZlcnNpb25JbmZvW2tleXNbaV1dID8/IFwidW5rbm93blwiKSBhcyBzdHJpbmddKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGRhdGEudGl0bGUgPSB0aGlzLl9kZWZpbml0aW9uPy5kYXRhPy50aXRsZSA/PyBcIlZlcnNpb25zXCI7XHJcblxyXG5cdFx0Y29uc3QgY2hpbGRyZW46IFRlbXBsYXRlRnJhZ21lbnRbXSA9IFtdO1xyXG5cdFx0Y29uc3QgdGl0bGVGcmFnbWVudCA9IChhd2FpdCB0aGlzLl9pbnRlZ3JhdGlvbkhlbHBlcnMudGVtcGxhdGVIZWxwZXJzLmNyZWF0ZVRpdGxlKFxyXG5cdFx0XHRcInRpdGxlXCIsXHJcblx0XHRcdHVuZGVmaW5lZCxcclxuXHRcdFx0dW5kZWZpbmVkLFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bWFyZ2luQm90dG9tOiBcIjEwcHhcIixcclxuXHRcdFx0XHRib3JkZXJCb3R0b206IGAxcHggc29saWQgJHtwYWxldHRlLmJhY2tncm91bmQ2fWBcclxuXHRcdFx0fVxyXG5cdFx0KSkgYXMgVGVtcGxhdGVGcmFnbWVudDtcclxuXHJcblx0XHRjaGlsZHJlbi5wdXNoKHRpdGxlRnJhZ21lbnQpO1xyXG5cclxuXHRcdGlmICh0aGlzLl9kZWZpbml0aW9uPy5kYXRhPy5kZXNjcmlwdGlvbiAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdGRhdGEuZGVzY3JpcHRpb24gPSB0aGlzLl9kZWZpbml0aW9uLmRhdGEuZGVzY3JpcHRpb247XHJcblx0XHRcdGNvbnN0IGRlc2NyaXB0aW9uRnJhZ21lbnQgPSAoYXdhaXQgdGhpcy5faW50ZWdyYXRpb25IZWxwZXJzLnRlbXBsYXRlSGVscGVycy5jcmVhdGVUZXh0KFxyXG5cdFx0XHRcdFwiZGVzY3JpcHRpb25cIixcclxuXHRcdFx0XHR1bmRlZmluZWQsXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0bWFyZ2luQm90dG9tOiBcIjEwcHhcIlxyXG5cdFx0XHRcdH1cclxuXHRcdFx0KSkgYXMgVGVtcGxhdGVGcmFnbWVudDtcclxuXHRcdFx0Y2hpbGRyZW4ucHVzaChkZXNjcmlwdGlvbkZyYWdtZW50KTtcclxuXHRcdH1cclxuXHJcblx0XHRjb25zdCB0YWJsZUZyYWdtZW50ID0gKGF3YWl0IHRoaXMuX2ludGVncmF0aW9uSGVscGVycy50ZW1wbGF0ZUhlbHBlcnMuY3JlYXRlVGFibGUoXHJcblx0XHRcdHRhYmxlRGF0YSxcclxuXHRcdFx0W10sXHJcblx0XHRcdDAsXHJcblx0XHRcdGRhdGFcclxuXHRcdCkpIGFzIFRlbXBsYXRlRnJhZ21lbnQ7XHJcblxyXG5cdFx0Y2hpbGRyZW4ucHVzaCh0YWJsZUZyYWdtZW50KTtcclxuXHJcblx0XHRjb25zdCByZXN1bHQgPSB7XHJcblx0XHRcdGtleTogXCJhYm91dC1pbmZvXCIsXHJcblx0XHRcdHRpdGxlOiBBYm91dFByb3ZpZGVyLl9BQk9VVF9DT01NQU5ELFxyXG5cdFx0XHRsYWJlbDogXCJWZXJzaW9uXCIsXHJcblx0XHRcdGljb246IHRoaXMuX2RlZmluaXRpb24/Lmljb24sXHJcblx0XHRcdGFjdGlvbnMsXHJcblx0XHRcdGRhdGE6IHtcclxuXHRcdFx0XHRwcm92aWRlcklkOiBBYm91dFByb3ZpZGVyLl9QUk9WSURFUl9JRFxyXG5cdFx0XHR9LFxyXG5cdFx0XHR0ZW1wbGF0ZTogXCJDdXN0b21cIiBhcyBDTElUZW1wbGF0ZS5DdXN0b20sXHJcblx0XHRcdHRlbXBsYXRlQ29udGVudDoge1xyXG5cdFx0XHRcdGxheW91dDogYXdhaXQgdGhpcy5faW50ZWdyYXRpb25IZWxwZXJzLnRlbXBsYXRlSGVscGVycy5jcmVhdGVDb250YWluZXIoXCJjb2x1bW5cIiwgY2hpbGRyZW4sIHtcclxuXHRcdFx0XHRcdHBhZGRpbmc6IFwiMTBweFwiXHJcblx0XHRcdFx0fSksXHJcblx0XHRcdFx0ZGF0YVxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHJlc3VsdHM6IFtyZXN1bHRdXHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQW4gZW50cnkgaGFzIGJlZW4gc2VsZWN0ZWQuXHJcblx0ICogQHBhcmFtIHJlc3VsdCBUaGUgZGlzcGF0Y2hlZCByZXN1bHQuXHJcblx0ICogQHBhcmFtIGxhc3RSZXNwb25zZSBUaGUgbGFzdCByZXNwb25zZS5cclxuXHQgKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBpdGVtIHdhcyBoYW5kbGVkLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhc3luYyBpdGVtU2VsZWN0aW9uKFxyXG5cdFx0cmVzdWx0OiBIb21lRGlzcGF0Y2hlZFNlYXJjaFJlc3VsdCxcclxuXHRcdGxhc3RSZXNwb25zZTogSG9tZVNlYXJjaExpc3RlbmVyUmVzcG9uc2VcclxuXHQpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxufVxyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB0eXBlIHsgTW9kdWxlSW1wbGVtZW50YXRpb24sIE1vZHVsZVR5cGVzIH0gZnJvbSBcImN1c3RvbWl6ZS13b3Jrc3BhY2Uvc2hhcGVzL21vZHVsZS1zaGFwZXNcIjtcclxuaW1wb3J0IHsgQWJvdXRBY3Rpb25zIH0gZnJvbSBcIi4vYWN0aW9uc1wiO1xyXG5pbXBvcnQgeyBBYm91dENvbmRpdGlvbnMgfSBmcm9tIFwiLi9jb25kaXRpb25zXCI7XHJcbmltcG9ydCB7IEFib3V0UHJvdmlkZXIgfSBmcm9tIFwiLi9pbnRlZ3JhdGlvblwiO1xyXG5pbXBvcnQgdHlwZSB7IFNoYXJlZFN0YXRlIH0gZnJvbSBcIi4vc2hhcGVzXCI7XHJcblxyXG5jb25zdCBzaGFyZWRTdGF0ZTogU2hhcmVkU3RhdGUgPSB7fTtcclxuZXhwb3J0IGNvbnN0IGVudHJ5UG9pbnRzOiB7IFt0eXBlIGluIE1vZHVsZVR5cGVzXT86IE1vZHVsZUltcGxlbWVudGF0aW9uIH0gPSB7XHJcblx0aW50ZWdyYXRpb25zOiBuZXcgQWJvdXRQcm92aWRlcigpLFxyXG5cdGNvbmRpdGlvbnM6IG5ldyBBYm91dENvbmRpdGlvbnMoc2hhcmVkU3RhdGUpLFxyXG5cdGFjdGlvbnM6IG5ldyBBYm91dEFjdGlvbnMoc2hhcmVkU3RhdGUpXHJcbn07XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==