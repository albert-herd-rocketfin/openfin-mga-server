/******/ var __webpack_modules__ = ({

/***/ "./client/src/modules/integrations/pages/integration.ts":
/*!**************************************************************!*\
  !*** ./client/src/modules/integrations/pages/integration.ts ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PagesProvider": () => (/* binding */ PagesProvider)
/* harmony export */ });
/**
 * Implement the integration provider for pages.
 */
class PagesProvider {
    /**
     * Initialize the module.
     * @param definition The definition of the module from configuration include custom options.
     * @param loggerCreator For logging entries.
     * @param helpers Helper methods for the module to interact with the application core.
     * @returns Nothing.
     */
    async initialize(definition, loggerCreator, helpers) {
        this._settings = definition.data;
        this._integrationHelpers = helpers;
        this._logger = loggerCreator("PagesProvider");
    }
    /**
     * Get a list of the static help entries.
     * @returns The list of help entries.
     */
    async getHelpSearchEntries() {
        return [];
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
        const platform = this._integrationHelpers.getPlatform();
        const pages = await platform.Storage.getPages();
        const colorScheme = await this._integrationHelpers.getCurrentColorSchemeMode();
        const iconFolder = await this._integrationHelpers.getCurrentIconFolder();
        const queryLower = query.toLowerCase();
        let pageResults = [];
        if (Array.isArray(pages)) {
            const shareEnabled = await this._integrationHelpers.condition("sharing");
            pageResults = pages
                .filter((pg) => query.length === 0 ||
                (query.length >= options.queryMinLength && pg.title.toLowerCase().includes(queryLower)))
                .map((pg) => this.getPageTemplate(pg.pageId, pg.title, shareEnabled, iconFolder, colorScheme));
        }
        return {
            results: pageResults
        };
    }
    /**
     * An entry has been selected.
     * @param result The dispatched result.
     * @param lastResponse The last response.
     * @returns True if the item was handled.
     */
    async itemSelection(result, lastResponse) {
        let handled = false;
        if (result.action.trigger === "user-action") {
            const data = result.data;
            if (data?.pageId) {
                handled = true;
                if (result.action.name === PagesProvider._ACTION_LAUNCH_PAGE) {
                    const platform = this._integrationHelpers.getPlatform();
                    const pageToLaunch = await platform.Storage.getPage(data.pageId);
                    await this._integrationHelpers.launchPage(pageToLaunch);
                }
                else if (result.action.name === PagesProvider._ACTION_DELETE_PAGE) {
                    const platform = this._integrationHelpers.getPlatform();
                    await platform.Storage.deletePage(data.pageId);
                    lastResponse.revoke(result.key);
                }
                else if (result.action.name === PagesProvider._ACTION_SHARE_PAGE) {
                    await this._integrationHelpers.share({ pageId: data.pageId });
                }
                else {
                    handled = false;
                    this._logger.warn(`Unrecognized action for page selection: ${data.pageId}`);
                }
            }
        }
        return handled;
    }
    getPageTemplate(id, title, shareEnabled, iconFolder, colorScheme) {
        let actions = [];
        if (shareEnabled) {
            actions.push({
                name: PagesProvider._ACTION_SHARE_PAGE,
                hotkey: "CmdOrCtrl+Shift+S"
            });
        }
        actions = actions.concat([
            {
                name: PagesProvider._ACTION_DELETE_PAGE,
                hotkey: "CmdOrCtrl+Shift+D"
            },
            {
                name: PagesProvider._ACTION_LAUNCH_PAGE,
                hotkey: "Enter"
            }
        ]);
        const layout = this.getOtherPageTemplate(shareEnabled);
        return {
            key: id,
            title,
            label: "Page",
            icon: this._settings.images.page.replace("{scheme}", colorScheme),
            actions,
            data: {
                providerId: PagesProvider._PROVIDER_ID,
                pageTitle: title,
                pageId: id,
                tags: ["page"]
            },
            template: "Custom",
            templateContent: {
                layout,
                data: {
                    title,
                    instructions: "Use the buttons below to interact with your saved Page:",
                    openText: "Launch",
                    deleteText: "Delete",
                    shareText: "Share"
                }
            }
        };
    }
    getOtherPageTemplate(enableShare) {
        const actionButtons = [
            {
                type: "Button",
                style: {
                    display: "flex",
                    flexDirection: "column",
                    width: "80px"
                },
                action: PagesProvider._ACTION_LAUNCH_PAGE,
                children: [
                    {
                        type: "Text",
                        dataKey: "openText",
                        optional: false
                    }
                ]
            },
            {
                type: "Button",
                buttonStyle: "primary",
                style: {
                    display: "flex",
                    flexDirection: "column",
                    width: "80px",
                    marginLeft: "10px",
                    marginRight: "10px"
                },
                action: PagesProvider._ACTION_DELETE_PAGE,
                children: [
                    {
                        type: "Text",
                        dataKey: "deleteText",
                        optional: false
                    }
                ]
            }
        ];
        if (enableShare) {
            actionButtons.push({
                type: "Button",
                buttonStyle: "primary",
                style: {
                    display: "flex",
                    flexDirection: "column",
                    width: "80px"
                },
                action: PagesProvider._ACTION_SHARE_PAGE,
                children: [
                    {
                        type: "Text",
                        dataKey: "shareText",
                        optional: false
                    }
                ]
            });
        }
        return {
            type: "Container",
            style: {
                paddingTop: "10px",
                display: "flex",
                flexDirection: "column"
            },
            children: [
                {
                    type: "Text",
                    dataKey: "title",
                    style: {
                        fontWeight: "bold",
                        fontSize: "16px",
                        textAlign: "center"
                    }
                },
                {
                    type: "Text",
                    dataKey: "description",
                    optional: true,
                    style: {
                        paddingLeft: "10px",
                        paddingRight: "10px"
                    }
                },
                {
                    type: "Text",
                    dataKey: "instructions",
                    style: {
                        fontWeight: "bold",
                        paddingTop: "10px",
                        paddingBottom: "10px",
                        paddingLeft: "10px",
                        paddingRight: "10px"
                    }
                },
                {
                    type: "Container",
                    style: {
                        display: "flex",
                        flexFlow: "row wrap",
                        justifyContent: "center",
                        paddingTop: "10px",
                        paddingBottom: "10px"
                    },
                    children: actionButtons
                }
            ]
        };
    }
}
/**
 * Provider id.
 * @internal
 */
PagesProvider._PROVIDER_ID = "pages";
/**
 * The key to use for launching a page.
 * @internal
 */
PagesProvider._ACTION_LAUNCH_PAGE = "Launch Page";
/**
 * The key to use for deleting a page.
 * @internal
 */
PagesProvider._ACTION_DELETE_PAGE = "Delete Page";
/**
 * The key to use for sharing a page.
 * @internal
 */
PagesProvider._ACTION_SHARE_PAGE = "Share Page";


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
/*!********************************************************!*\
  !*** ./client/src/modules/integrations/pages/index.ts ***!
  \********************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "entryPoints": () => (/* binding */ entryPoints)
/* harmony export */ });
/* harmony import */ var _integration__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./integration */ "./client/src/modules/integrations/pages/integration.ts");

const entryPoints = {
    integrations: new _integration__WEBPACK_IMPORTED_MODULE_0__.PagesProvider()
};

})();

var __webpack_exports__entryPoints = __webpack_exports__.entryPoints;
export { __webpack_exports__entryPoints as entryPoints };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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d0M7VUFDakY7VUFDQTtVQUNBOzs7OztVQ1BBOzs7OztVQ0FBO1VBQ0E7VUFDQTtVQUNBLHVEQUF1RCxpQkFBaUI7VUFDeEU7VUFDQSxnREFBZ0QsYUFBYTtVQUM3RDs7Ozs7Ozs7Ozs7Ozs7O0FDTjhDO0FBRXZDLE1BQU0sV0FBVyxHQUFvQztJQUMzRCxZQUFZLEVBQUUsSUFBSSx1REFBYSxFQUFFO0NBQ2pDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9vcGVuZmluLXdvcmtzcGFjZS0tY3VzdG9taXplLXdvcmtzcGFjZS8uL2NsaWVudC9zcmMvbW9kdWxlcy9pbnRlZ3JhdGlvbnMvcGFnZXMvaW50ZWdyYXRpb24udHMiLCJ3ZWJwYWNrOi8vb3BlbmZpbi13b3Jrc3BhY2UtLWN1c3RvbWl6ZS13b3Jrc3BhY2Uvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vb3BlbmZpbi13b3Jrc3BhY2UtLWN1c3RvbWl6ZS13b3Jrc3BhY2Uvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL29wZW5maW4td29ya3NwYWNlLS1jdXN0b21pemUtd29ya3NwYWNlL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vb3BlbmZpbi13b3Jrc3BhY2UtLWN1c3RvbWl6ZS13b3Jrc3BhY2Uvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9vcGVuZmluLXdvcmtzcGFjZS0tY3VzdG9taXplLXdvcmtzcGFjZS8uL2NsaWVudC9zcmMvbW9kdWxlcy9pbnRlZ3JhdGlvbnMvcGFnZXMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUge1xyXG5cdEJ1dHRvblN0eWxlLFxyXG5cdENMSUZpbHRlcixcclxuXHRDTElUZW1wbGF0ZSxcclxuXHRIb21lRGlzcGF0Y2hlZFNlYXJjaFJlc3VsdCxcclxuXHRIb21lU2VhcmNoTGlzdGVuZXJSZXNwb25zZSxcclxuXHRIb21lU2VhcmNoUmVzcG9uc2UsXHJcblx0SG9tZVNlYXJjaFJlc3VsdCxcclxuXHRQYWdlLFxyXG5cdFRlbXBsYXRlRnJhZ21lbnRcclxufSBmcm9tIFwiQG9wZW5maW4vd29ya3NwYWNlXCI7XHJcbmltcG9ydCB0eXBlIHsgSW50ZWdyYXRpb25IZWxwZXJzLCBJbnRlZ3JhdGlvbk1vZHVsZSB9IGZyb20gXCJjdXN0b21pemUtd29ya3NwYWNlL3NoYXBlcy9pbnRlZ3JhdGlvbnMtc2hhcGVzXCI7XHJcbmltcG9ydCB0eXBlIHsgTG9nZ2VyLCBMb2dnZXJDcmVhdG9yIH0gZnJvbSBcImN1c3RvbWl6ZS13b3Jrc3BhY2Uvc2hhcGVzL2xvZ2dlci1zaGFwZXNcIjtcclxuaW1wb3J0IHR5cGUgeyBNb2R1bGVEZWZpbml0aW9uIH0gZnJvbSBcImN1c3RvbWl6ZS13b3Jrc3BhY2Uvc2hhcGVzL21vZHVsZS1zaGFwZXNcIjtcclxuaW1wb3J0IHR5cGUgeyBDb2xvclNjaGVtZU1vZGUgfSBmcm9tIFwiY3VzdG9taXplLXdvcmtzcGFjZS9zaGFwZXMvdGhlbWUtc2hhcGVzXCI7XHJcbmltcG9ydCB0eXBlIHsgUGFnZXNTZXR0aW5ncyB9IGZyb20gXCIuL3NoYXBlc1wiO1xyXG5cclxuLyoqXHJcbiAqIEltcGxlbWVudCB0aGUgaW50ZWdyYXRpb24gcHJvdmlkZXIgZm9yIHBhZ2VzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFBhZ2VzUHJvdmlkZXIgaW1wbGVtZW50cyBJbnRlZ3JhdGlvbk1vZHVsZTxQYWdlc1NldHRpbmdzPiB7XHJcblx0LyoqXHJcblx0ICogUHJvdmlkZXIgaWQuXHJcblx0ICogQGludGVybmFsXHJcblx0ICovXHJcblx0cHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgX1BST1ZJREVSX0lEID0gXCJwYWdlc1wiO1xyXG5cclxuXHQvKipcclxuXHQgKiBUaGUga2V5IHRvIHVzZSBmb3IgbGF1bmNoaW5nIGEgcGFnZS5cclxuXHQgKiBAaW50ZXJuYWxcclxuXHQgKi9cclxuXHRwcml2YXRlIHN0YXRpYyByZWFkb25seSBfQUNUSU9OX0xBVU5DSF9QQUdFID0gXCJMYXVuY2ggUGFnZVwiO1xyXG5cclxuXHQvKipcclxuXHQgKiBUaGUga2V5IHRvIHVzZSBmb3IgZGVsZXRpbmcgYSBwYWdlLlxyXG5cdCAqIEBpbnRlcm5hbFxyXG5cdCAqL1xyXG5cdHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IF9BQ1RJT05fREVMRVRFX1BBR0UgPSBcIkRlbGV0ZSBQYWdlXCI7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBrZXkgdG8gdXNlIGZvciBzaGFyaW5nIGEgcGFnZS5cclxuXHQgKiBAaW50ZXJuYWxcclxuXHQgKi9cclxuXHRwcml2YXRlIHN0YXRpYyByZWFkb25seSBfQUNUSU9OX1NIQVJFX1BBR0UgPSBcIlNoYXJlIFBhZ2VcIjtcclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHNldHRpbmdzIGZyb20gY29uZmlnLlxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3NldHRpbmdzOiBQYWdlc1NldHRpbmdzO1xyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgc2V0dGluZ3MgZm9yIHRoZSBpbnRlZ3JhdGlvbi5cclxuXHQgKiBAaW50ZXJuYWxcclxuXHQgKi9cclxuXHRwcml2YXRlIF9sb2dnZXI6IExvZ2dlcjtcclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGludGVncmF0aW9uIGhlbHBlcnMuXHJcblx0ICogQGludGVybmFsXHJcblx0ICovXHJcblx0cHJpdmF0ZSBfaW50ZWdyYXRpb25IZWxwZXJzOiBJbnRlZ3JhdGlvbkhlbHBlcnMgfCB1bmRlZmluZWQ7XHJcblxyXG5cdC8qKlxyXG5cdCAqIEluaXRpYWxpemUgdGhlIG1vZHVsZS5cclxuXHQgKiBAcGFyYW0gZGVmaW5pdGlvbiBUaGUgZGVmaW5pdGlvbiBvZiB0aGUgbW9kdWxlIGZyb20gY29uZmlndXJhdGlvbiBpbmNsdWRlIGN1c3RvbSBvcHRpb25zLlxyXG5cdCAqIEBwYXJhbSBsb2dnZXJDcmVhdG9yIEZvciBsb2dnaW5nIGVudHJpZXMuXHJcblx0ICogQHBhcmFtIGhlbHBlcnMgSGVscGVyIG1ldGhvZHMgZm9yIHRoZSBtb2R1bGUgdG8gaW50ZXJhY3Qgd2l0aCB0aGUgYXBwbGljYXRpb24gY29yZS5cclxuXHQgKiBAcmV0dXJucyBOb3RoaW5nLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhc3luYyBpbml0aWFsaXplKFxyXG5cdFx0ZGVmaW5pdGlvbjogTW9kdWxlRGVmaW5pdGlvbjxQYWdlc1NldHRpbmdzPixcclxuXHRcdGxvZ2dlckNyZWF0b3I6IExvZ2dlckNyZWF0b3IsXHJcblx0XHRoZWxwZXJzOiBJbnRlZ3JhdGlvbkhlbHBlcnNcclxuXHQpOiBQcm9taXNlPHZvaWQ+IHtcclxuXHRcdHRoaXMuX3NldHRpbmdzID0gZGVmaW5pdGlvbi5kYXRhO1xyXG5cdFx0dGhpcy5faW50ZWdyYXRpb25IZWxwZXJzID0gaGVscGVycztcclxuXHRcdHRoaXMuX2xvZ2dlciA9IGxvZ2dlckNyZWF0b3IoXCJQYWdlc1Byb3ZpZGVyXCIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogR2V0IGEgbGlzdCBvZiB0aGUgc3RhdGljIGhlbHAgZW50cmllcy5cclxuXHQgKiBAcmV0dXJucyBUaGUgbGlzdCBvZiBoZWxwIGVudHJpZXMuXHJcblx0ICovXHJcblx0cHVibGljIGFzeW5jIGdldEhlbHBTZWFyY2hFbnRyaWVzKCk6IFByb21pc2U8SG9tZVNlYXJjaFJlc3VsdFtdPiB7XHJcblx0XHRyZXR1cm4gW107XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBHZXQgYSBsaXN0IG9mIHNlYXJjaCByZXN1bHRzIGJhc2VkIG9uIHRoZSBxdWVyeSBhbmQgZmlsdGVycy5cclxuXHQgKiBAcGFyYW0gcXVlcnkgVGhlIHF1ZXJ5IHRvIHNlYXJjaCBmb3IuXHJcblx0ICogQHBhcmFtIGZpbHRlcnMgVGhlIGZpbHRlcnMgdG8gYXBwbHkuXHJcblx0ICogQHBhcmFtIGxhc3RSZXNwb25zZSBUaGUgbGFzdCBzZWFyY2ggcmVzcG9uc2UgdXNlZCBmb3IgdXBkYXRpbmcgZXhpc3RpbmcgcmVzdWx0cy5cclxuXHQgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciB0aGUgc2VhcmNoIHF1ZXJ5LlxyXG5cdCAqIEByZXR1cm5zIFRoZSBsaXN0IG9mIHJlc3VsdHMgYW5kIG5ldyBmaWx0ZXJzLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhc3luYyBnZXRTZWFyY2hSZXN1bHRzKFxyXG5cdFx0cXVlcnk6IHN0cmluZyxcclxuXHRcdGZpbHRlcnM6IENMSUZpbHRlcltdLFxyXG5cdFx0bGFzdFJlc3BvbnNlOiBIb21lU2VhcmNoTGlzdGVuZXJSZXNwb25zZSxcclxuXHRcdG9wdGlvbnM6IHtcclxuXHRcdFx0cXVlcnlNaW5MZW5ndGg6IG51bWJlcjtcclxuXHRcdFx0cXVlcnlBZ2FpbnN0OiBzdHJpbmdbXTtcclxuXHRcdH1cclxuXHQpOiBQcm9taXNlPEhvbWVTZWFyY2hSZXNwb25zZT4ge1xyXG5cdFx0Y29uc3QgcGxhdGZvcm0gPSB0aGlzLl9pbnRlZ3JhdGlvbkhlbHBlcnMuZ2V0UGxhdGZvcm0oKTtcclxuXHRcdGNvbnN0IHBhZ2VzID0gYXdhaXQgcGxhdGZvcm0uU3RvcmFnZS5nZXRQYWdlcygpO1xyXG5cdFx0Y29uc3QgY29sb3JTY2hlbWUgPSBhd2FpdCB0aGlzLl9pbnRlZ3JhdGlvbkhlbHBlcnMuZ2V0Q3VycmVudENvbG9yU2NoZW1lTW9kZSgpO1xyXG5cdFx0Y29uc3QgaWNvbkZvbGRlcjogc3RyaW5nID0gYXdhaXQgdGhpcy5faW50ZWdyYXRpb25IZWxwZXJzLmdldEN1cnJlbnRJY29uRm9sZGVyKCk7XHJcblx0XHRjb25zdCBxdWVyeUxvd2VyID0gcXVlcnkudG9Mb3dlckNhc2UoKTtcclxuXHJcblx0XHRsZXQgcGFnZVJlc3VsdHM6IEhvbWVTZWFyY2hSZXN1bHRbXSA9IFtdO1xyXG5cclxuXHRcdGlmIChBcnJheS5pc0FycmF5KHBhZ2VzKSkge1xyXG5cdFx0XHRjb25zdCBzaGFyZUVuYWJsZWQ6IGJvb2xlYW4gPSBhd2FpdCB0aGlzLl9pbnRlZ3JhdGlvbkhlbHBlcnMuY29uZGl0aW9uKFwic2hhcmluZ1wiKTtcclxuXHJcblx0XHRcdHBhZ2VSZXN1bHRzID0gcGFnZXNcclxuXHRcdFx0XHQuZmlsdGVyKFxyXG5cdFx0XHRcdFx0KHBnKSA9PlxyXG5cdFx0XHRcdFx0XHRxdWVyeS5sZW5ndGggPT09IDAgfHxcclxuXHRcdFx0XHRcdFx0KHF1ZXJ5Lmxlbmd0aCA+PSBvcHRpb25zLnF1ZXJ5TWluTGVuZ3RoICYmIHBnLnRpdGxlLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMocXVlcnlMb3dlcikpXHJcblx0XHRcdFx0KVxyXG5cdFx0XHRcdC5tYXAoKHBnOiBQYWdlKSA9PiB0aGlzLmdldFBhZ2VUZW1wbGF0ZShwZy5wYWdlSWQsIHBnLnRpdGxlLCBzaGFyZUVuYWJsZWQsIGljb25Gb2xkZXIsIGNvbG9yU2NoZW1lKSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdWx0czogcGFnZVJlc3VsdHNcclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBbiBlbnRyeSBoYXMgYmVlbiBzZWxlY3RlZC5cclxuXHQgKiBAcGFyYW0gcmVzdWx0IFRoZSBkaXNwYXRjaGVkIHJlc3VsdC5cclxuXHQgKiBAcGFyYW0gbGFzdFJlc3BvbnNlIFRoZSBsYXN0IHJlc3BvbnNlLlxyXG5cdCAqIEByZXR1cm5zIFRydWUgaWYgdGhlIGl0ZW0gd2FzIGhhbmRsZWQuXHJcblx0ICovXHJcblx0cHVibGljIGFzeW5jIGl0ZW1TZWxlY3Rpb24oXHJcblx0XHRyZXN1bHQ6IEhvbWVEaXNwYXRjaGVkU2VhcmNoUmVzdWx0LFxyXG5cdFx0bGFzdFJlc3BvbnNlOiBIb21lU2VhcmNoTGlzdGVuZXJSZXNwb25zZVxyXG5cdCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG5cdFx0bGV0IGhhbmRsZWQgPSBmYWxzZTtcclxuXHRcdGlmIChyZXN1bHQuYWN0aW9uLnRyaWdnZXIgPT09IFwidXNlci1hY3Rpb25cIikge1xyXG5cdFx0XHRjb25zdCBkYXRhOiB7XHJcblx0XHRcdFx0cGFnZUlkPzogc3RyaW5nO1xyXG5cdFx0XHR9ID0gcmVzdWx0LmRhdGE7XHJcblxyXG5cdFx0XHRpZiAoZGF0YT8ucGFnZUlkKSB7XHJcblx0XHRcdFx0aGFuZGxlZCA9IHRydWU7XHJcblxyXG5cdFx0XHRcdGlmIChyZXN1bHQuYWN0aW9uLm5hbWUgPT09IFBhZ2VzUHJvdmlkZXIuX0FDVElPTl9MQVVOQ0hfUEFHRSkge1xyXG5cdFx0XHRcdFx0Y29uc3QgcGxhdGZvcm0gPSB0aGlzLl9pbnRlZ3JhdGlvbkhlbHBlcnMuZ2V0UGxhdGZvcm0oKTtcclxuXHRcdFx0XHRcdGNvbnN0IHBhZ2VUb0xhdW5jaCA9IGF3YWl0IHBsYXRmb3JtLlN0b3JhZ2UuZ2V0UGFnZShkYXRhLnBhZ2VJZCk7XHJcblx0XHRcdFx0XHRhd2FpdCB0aGlzLl9pbnRlZ3JhdGlvbkhlbHBlcnMubGF1bmNoUGFnZShwYWdlVG9MYXVuY2gpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZiAocmVzdWx0LmFjdGlvbi5uYW1lID09PSBQYWdlc1Byb3ZpZGVyLl9BQ1RJT05fREVMRVRFX1BBR0UpIHtcclxuXHRcdFx0XHRcdGNvbnN0IHBsYXRmb3JtID0gdGhpcy5faW50ZWdyYXRpb25IZWxwZXJzLmdldFBsYXRmb3JtKCk7XHJcblx0XHRcdFx0XHRhd2FpdCBwbGF0Zm9ybS5TdG9yYWdlLmRlbGV0ZVBhZ2UoZGF0YS5wYWdlSWQpO1xyXG5cdFx0XHRcdFx0bGFzdFJlc3BvbnNlLnJldm9rZShyZXN1bHQua2V5KTtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKHJlc3VsdC5hY3Rpb24ubmFtZSA9PT0gUGFnZXNQcm92aWRlci5fQUNUSU9OX1NIQVJFX1BBR0UpIHtcclxuXHRcdFx0XHRcdGF3YWl0IHRoaXMuX2ludGVncmF0aW9uSGVscGVycy5zaGFyZSh7IHBhZ2VJZDogZGF0YS5wYWdlSWQgfSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGhhbmRsZWQgPSBmYWxzZTtcclxuXHRcdFx0XHRcdHRoaXMuX2xvZ2dlci53YXJuKGBVbnJlY29nbml6ZWQgYWN0aW9uIGZvciBwYWdlIHNlbGVjdGlvbjogJHtkYXRhLnBhZ2VJZH1gKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gaGFuZGxlZDtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgZ2V0UGFnZVRlbXBsYXRlKFxyXG5cdFx0aWQ6IHN0cmluZyxcclxuXHRcdHRpdGxlOiBzdHJpbmcsXHJcblx0XHRzaGFyZUVuYWJsZWQ6IGJvb2xlYW4sXHJcblx0XHRpY29uRm9sZGVyOiBzdHJpbmcsXHJcblx0XHRjb2xvclNjaGVtZTogQ29sb3JTY2hlbWVNb2RlXHJcblx0KTogSG9tZVNlYXJjaFJlc3VsdCB7XHJcblx0XHRsZXQgYWN0aW9ucyA9IFtdO1xyXG5cclxuXHRcdGlmIChzaGFyZUVuYWJsZWQpIHtcclxuXHRcdFx0YWN0aW9ucy5wdXNoKHtcclxuXHRcdFx0XHRuYW1lOiBQYWdlc1Byb3ZpZGVyLl9BQ1RJT05fU0hBUkVfUEFHRSxcclxuXHRcdFx0XHRob3RrZXk6IFwiQ21kT3JDdHJsK1NoaWZ0K1NcIlxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdGFjdGlvbnMgPSBhY3Rpb25zLmNvbmNhdChbXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiBQYWdlc1Byb3ZpZGVyLl9BQ1RJT05fREVMRVRFX1BBR0UsXHJcblx0XHRcdFx0aG90a2V5OiBcIkNtZE9yQ3RybCtTaGlmdCtEXCJcclxuXHRcdFx0fSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6IFBhZ2VzUHJvdmlkZXIuX0FDVElPTl9MQVVOQ0hfUEFHRSxcclxuXHRcdFx0XHRob3RrZXk6IFwiRW50ZXJcIlxyXG5cdFx0XHR9XHJcblx0XHRdKTtcclxuXHRcdGNvbnN0IGxheW91dCA9IHRoaXMuZ2V0T3RoZXJQYWdlVGVtcGxhdGUoc2hhcmVFbmFibGVkKTtcclxuXHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRrZXk6IGlkLFxyXG5cdFx0XHR0aXRsZSxcclxuXHRcdFx0bGFiZWw6IFwiUGFnZVwiLFxyXG5cdFx0XHRpY29uOiB0aGlzLl9zZXR0aW5ncy5pbWFnZXMucGFnZS5yZXBsYWNlKFwie3NjaGVtZX1cIiwgY29sb3JTY2hlbWUgYXMgc3RyaW5nKSxcclxuXHRcdFx0YWN0aW9ucyxcclxuXHRcdFx0ZGF0YToge1xyXG5cdFx0XHRcdHByb3ZpZGVySWQ6IFBhZ2VzUHJvdmlkZXIuX1BST1ZJREVSX0lELFxyXG5cdFx0XHRcdHBhZ2VUaXRsZTogdGl0bGUsXHJcblx0XHRcdFx0cGFnZUlkOiBpZCxcclxuXHRcdFx0XHR0YWdzOiBbXCJwYWdlXCJdXHJcblx0XHRcdH0sXHJcblx0XHRcdHRlbXBsYXRlOiBcIkN1c3RvbVwiIGFzIENMSVRlbXBsYXRlLkN1c3RvbSxcclxuXHRcdFx0dGVtcGxhdGVDb250ZW50OiB7XHJcblx0XHRcdFx0bGF5b3V0LFxyXG5cdFx0XHRcdGRhdGE6IHtcclxuXHRcdFx0XHRcdHRpdGxlLFxyXG5cdFx0XHRcdFx0aW5zdHJ1Y3Rpb25zOiBcIlVzZSB0aGUgYnV0dG9ucyBiZWxvdyB0byBpbnRlcmFjdCB3aXRoIHlvdXIgc2F2ZWQgUGFnZTpcIixcclxuXHRcdFx0XHRcdG9wZW5UZXh0OiBcIkxhdW5jaFwiLFxyXG5cdFx0XHRcdFx0ZGVsZXRlVGV4dDogXCJEZWxldGVcIixcclxuXHRcdFx0XHRcdHNoYXJlVGV4dDogXCJTaGFyZVwiXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBnZXRPdGhlclBhZ2VUZW1wbGF0ZShlbmFibGVTaGFyZTogYm9vbGVhbik6IFRlbXBsYXRlRnJhZ21lbnQge1xyXG5cdFx0Y29uc3QgYWN0aW9uQnV0dG9uczogVGVtcGxhdGVGcmFnbWVudFtdID0gW1xyXG5cdFx0XHR7XHJcblx0XHRcdFx0dHlwZTogXCJCdXR0b25cIixcclxuXHRcdFx0XHRzdHlsZToge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogXCJmbGV4XCIsXHJcblx0XHRcdFx0XHRmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxyXG5cdFx0XHRcdFx0d2lkdGg6IFwiODBweFwiXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRhY3Rpb246IFBhZ2VzUHJvdmlkZXIuX0FDVElPTl9MQVVOQ0hfUEFHRSxcclxuXHRcdFx0XHRjaGlsZHJlbjogW1xyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHR0eXBlOiBcIlRleHRcIixcclxuXHRcdFx0XHRcdFx0ZGF0YUtleTogXCJvcGVuVGV4dFwiLFxyXG5cdFx0XHRcdFx0XHRvcHRpb25hbDogZmFsc2VcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRdXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHR0eXBlOiBcIkJ1dHRvblwiLFxyXG5cdFx0XHRcdGJ1dHRvblN0eWxlOiBcInByaW1hcnlcIiBhcyBCdXR0b25TdHlsZS5QcmltYXJ5LFxyXG5cdFx0XHRcdHN0eWxlOiB7XHJcblx0XHRcdFx0XHRkaXNwbGF5OiBcImZsZXhcIixcclxuXHRcdFx0XHRcdGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXHJcblx0XHRcdFx0XHR3aWR0aDogXCI4MHB4XCIsXHJcblx0XHRcdFx0XHRtYXJnaW5MZWZ0OiBcIjEwcHhcIixcclxuXHRcdFx0XHRcdG1hcmdpblJpZ2h0OiBcIjEwcHhcIlxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0YWN0aW9uOiBQYWdlc1Byb3ZpZGVyLl9BQ1RJT05fREVMRVRFX1BBR0UsXHJcblx0XHRcdFx0Y2hpbGRyZW46IFtcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0dHlwZTogXCJUZXh0XCIsXHJcblx0XHRcdFx0XHRcdGRhdGFLZXk6IFwiZGVsZXRlVGV4dFwiLFxyXG5cdFx0XHRcdFx0XHRvcHRpb25hbDogZmFsc2VcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRdXHJcblx0XHRcdH1cclxuXHRcdF07XHJcblxyXG5cdFx0aWYgKGVuYWJsZVNoYXJlKSB7XHJcblx0XHRcdGFjdGlvbkJ1dHRvbnMucHVzaCh7XHJcblx0XHRcdFx0dHlwZTogXCJCdXR0b25cIixcclxuXHRcdFx0XHRidXR0b25TdHlsZTogXCJwcmltYXJ5XCIgYXMgQnV0dG9uU3R5bGUuUHJpbWFyeSxcclxuXHRcdFx0XHRzdHlsZToge1xyXG5cdFx0XHRcdFx0ZGlzcGxheTogXCJmbGV4XCIsXHJcblx0XHRcdFx0XHRmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxyXG5cdFx0XHRcdFx0d2lkdGg6IFwiODBweFwiXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRhY3Rpb246IFBhZ2VzUHJvdmlkZXIuX0FDVElPTl9TSEFSRV9QQUdFLFxyXG5cdFx0XHRcdGNoaWxkcmVuOiBbXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdHR5cGU6IFwiVGV4dFwiLFxyXG5cdFx0XHRcdFx0XHRkYXRhS2V5OiBcInNoYXJlVGV4dFwiLFxyXG5cdFx0XHRcdFx0XHRvcHRpb25hbDogZmFsc2VcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRdXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0dHlwZTogXCJDb250YWluZXJcIixcclxuXHRcdFx0c3R5bGU6IHtcclxuXHRcdFx0XHRwYWRkaW5nVG9wOiBcIjEwcHhcIixcclxuXHRcdFx0XHRkaXNwbGF5OiBcImZsZXhcIixcclxuXHRcdFx0XHRmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiXHJcblx0XHRcdH0sXHJcblx0XHRcdGNoaWxkcmVuOiBbXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0dHlwZTogXCJUZXh0XCIsXHJcblx0XHRcdFx0XHRkYXRhS2V5OiBcInRpdGxlXCIsXHJcblx0XHRcdFx0XHRzdHlsZToge1xyXG5cdFx0XHRcdFx0XHRmb250V2VpZ2h0OiBcImJvbGRcIixcclxuXHRcdFx0XHRcdFx0Zm9udFNpemU6IFwiMTZweFwiLFxyXG5cdFx0XHRcdFx0XHR0ZXh0QWxpZ246IFwiY2VudGVyXCJcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHR5cGU6IFwiVGV4dFwiLFxyXG5cdFx0XHRcdFx0ZGF0YUtleTogXCJkZXNjcmlwdGlvblwiLFxyXG5cdFx0XHRcdFx0b3B0aW9uYWw6IHRydWUsXHJcblx0XHRcdFx0XHRzdHlsZToge1xyXG5cdFx0XHRcdFx0XHRwYWRkaW5nTGVmdDogXCIxMHB4XCIsXHJcblx0XHRcdFx0XHRcdHBhZGRpbmdSaWdodDogXCIxMHB4XCJcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHR5cGU6IFwiVGV4dFwiLFxyXG5cdFx0XHRcdFx0ZGF0YUtleTogXCJpbnN0cnVjdGlvbnNcIixcclxuXHRcdFx0XHRcdHN0eWxlOiB7XHJcblx0XHRcdFx0XHRcdGZvbnRXZWlnaHQ6IFwiYm9sZFwiLFxyXG5cdFx0XHRcdFx0XHRwYWRkaW5nVG9wOiBcIjEwcHhcIixcclxuXHRcdFx0XHRcdFx0cGFkZGluZ0JvdHRvbTogXCIxMHB4XCIsXHJcblx0XHRcdFx0XHRcdHBhZGRpbmdMZWZ0OiBcIjEwcHhcIixcclxuXHRcdFx0XHRcdFx0cGFkZGluZ1JpZ2h0OiBcIjEwcHhcIlxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0dHlwZTogXCJDb250YWluZXJcIixcclxuXHRcdFx0XHRcdHN0eWxlOiB7XHJcblx0XHRcdFx0XHRcdGRpc3BsYXk6IFwiZmxleFwiLFxyXG5cdFx0XHRcdFx0XHRmbGV4RmxvdzogXCJyb3cgd3JhcFwiLFxyXG5cdFx0XHRcdFx0XHRqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcclxuXHRcdFx0XHRcdFx0cGFkZGluZ1RvcDogXCIxMHB4XCIsXHJcblx0XHRcdFx0XHRcdHBhZGRpbmdCb3R0b206IFwiMTBweFwiXHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0Y2hpbGRyZW46IGFjdGlvbkJ1dHRvbnNcclxuXHRcdFx0XHR9XHJcblx0XHRcdF1cclxuXHRcdH07XHJcblx0fVxyXG59XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgUGFnZXNQcm92aWRlciB9IGZyb20gXCIuL2ludGVncmF0aW9uXCI7XHJcblxyXG5leHBvcnQgY29uc3QgZW50cnlQb2ludHM6IHsgW2lkOiBzdHJpbmddOiBQYWdlc1Byb3ZpZGVyIH0gPSB7XHJcblx0aW50ZWdyYXRpb25zOiBuZXcgUGFnZXNQcm92aWRlcigpXHJcbn07XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==