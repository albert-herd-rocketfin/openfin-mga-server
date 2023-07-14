/******/ var __webpack_modules__ = ({

/***/ "./client/src/framework/uuid.ts":
/*!**************************************!*\
  !*** ./client/src/framework/uuid.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "randomUUID": () => (/* binding */ randomUUID)
/* harmony export */ });
function randomUUID() {
    if ("randomUUID" in window.crypto) {
        // eslint-disable-next-line no-restricted-syntax
        return window.crypto.randomUUID();
    }
    // Polyfill the window.crypto.randomUUID if we are running in a non secure context that doesn't have it
    // we are still using window.crypto.getRandomValues which is always available
    // https://stackoverflow.com/a/2117523/2800218
    const getRandomHex = (c) => 
    // eslint-disable-next-line no-bitwise, no-mixed-operators
    (c ^ (window.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16);
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, getRandomHex);
}


/***/ }),

/***/ "./client/src/modules/integrations/workspaces/integration.ts":
/*!*******************************************************************!*\
  !*** ./client/src/modules/integrations/workspaces/integration.ts ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "WorkspacesProvider": () => (/* binding */ WorkspacesProvider)
/* harmony export */ });
/* harmony import */ var _framework_uuid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../framework/uuid */ "./client/src/framework/uuid.ts");

/**
 * Implement the integration provider for workspaces.
 */
class WorkspacesProvider {
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
        this._logger = loggerCreator("WorkspacesProvider");
    }
    /**
     * Get a list of the static help entries.
     * @returns The list of help entries.
     */
    async getHelpSearchEntries() {
        const colorScheme = await this._integrationHelpers.getCurrentColorSchemeMode();
        return [
            {
                key: `${WorkspacesProvider._PROVIDER_ID}-help1`,
                title: "Workspaces",
                label: "Help",
                icon: this._settings.images.workspace.replace("{scheme}", colorScheme),
                actions: [],
                data: {
                    providerId: WorkspacesProvider._PROVIDER_ID
                },
                template: "Custom",
                templateContent: await this._integrationHelpers.templateHelpers.createHelp("Workspaces", ["Use the workspaces command to save your current layout."], ["/w title"])
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
        const platform = this._integrationHelpers.getPlatform();
        const workspaces = await platform.Storage.getWorkspaces();
        const colorScheme = await this._integrationHelpers.getCurrentColorSchemeMode();
        const iconFolder = await this._integrationHelpers.getCurrentIconFolder();
        const queryLower = query.toLowerCase();
        if (queryLower.startsWith("/w ")) {
            const title = queryLower.replace("/w ", "");
            const foundMatch = workspaces.find((entry) => entry.title.toLowerCase() === title.toLowerCase());
            if (foundMatch) {
                return {
                    results: [
                        {
                            key: WorkspacesProvider._ACTION_EXISTS_WORKSPACE,
                            title: `Workspace ${foundMatch.title} already exists.`,
                            icon: this._settings.images.workspace.replace("{scheme}", colorScheme),
                            actions: [],
                            data: {
                                providerId: WorkspacesProvider._PROVIDER_ID,
                                tags: ["workspace"],
                                workspaceId: foundMatch.workspaceId
                            },
                            template: null,
                            templateContent: null
                        }
                    ]
                };
            }
            return {
                results: [
                    {
                        key: WorkspacesProvider._ACTION_SAVE_WORKSPACE,
                        title: `Save Current Workspace as ${title}`,
                        icon: this._settings.images.workspace.replace("{scheme}", colorScheme),
                        label: "Suggestion",
                        actions: [{ name: "Save Workspace", hotkey: "Enter" }],
                        data: {
                            providerId: WorkspacesProvider._PROVIDER_ID,
                            tags: ["workspace"],
                            workspaceId: (0,_framework_uuid__WEBPACK_IMPORTED_MODULE_0__.randomUUID)(),
                            workspaceTitle: title
                        },
                        template: null,
                        templateContent: null
                    }
                ]
            };
        }
        let workspaceResults = [];
        if (Array.isArray(workspaces)) {
            const currentWorkspace = await platform.getCurrentWorkspace();
            const currentWorkspaceId = currentWorkspace?.workspaceId;
            const shareEnabled = await this._integrationHelpers.condition("sharing");
            workspaceResults = workspaces
                .filter((pg) => query.length === 0 ||
                (query.length >= options.queryMinLength && pg.title.toLowerCase().includes(queryLower)))
                .map((ws) => this.getWorkspaceTemplate(ws.workspaceId, ws.title, shareEnabled, currentWorkspaceId === ws.workspaceId, iconFolder, colorScheme));
        }
        return {
            results: workspaceResults
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
            const colorScheme = await this._integrationHelpers.getCurrentColorSchemeMode();
            const iconFolder = await this._integrationHelpers.getCurrentIconFolder();
            const shareEnabled = await this._integrationHelpers.condition("sharing");
            if (data?.workspaceId) {
                handled = true;
                if (result.key === WorkspacesProvider._ACTION_SAVE_WORKSPACE) {
                    lastResponse.revoke(result.key);
                    const platform = this._integrationHelpers.getPlatform();
                    const snapshot = await platform.getSnapshot();
                    const currentWorkspace = await platform.getCurrentWorkspace();
                    const currentMetaData = currentWorkspace?.metadata;
                    const workspace = {
                        workspaceId: data.workspaceId,
                        title: data.workspaceTitle,
                        metadata: currentMetaData,
                        snapshot
                    };
                    await platform.Storage.saveWorkspace(workspace);
                    const savedTemplate = this.getWorkspaceTemplate(data.workspaceId, data.workspaceTitle, shareEnabled, true, iconFolder, colorScheme);
                    lastResponse.respond([savedTemplate]);
                }
                else if (result.key === WorkspacesProvider._ACTION_EXISTS_WORKSPACE) {
                    lastResponse.revoke(result.key);
                }
                else if (result.action.name === WorkspacesProvider._ACTION_LAUNCH_WORKSPACE) {
                    lastResponse.revoke(result.key);
                    const platform = this._integrationHelpers.getPlatform();
                    const workspace = await platform.Storage.getWorkspace(data.workspaceId);
                    await platform.applyWorkspace(workspace);
                    const savedTemplate = this.getWorkspaceTemplate(data.workspaceId, data.workspaceTitle, shareEnabled, true, iconFolder, colorScheme);
                    lastResponse.respond([savedTemplate]);
                }
                else if (result.action.name === WorkspacesProvider._ACTION_DELETE_WORKSPACE) {
                    const platform = this._integrationHelpers.getPlatform();
                    await platform.Storage.deleteWorkspace(data.workspaceId);
                    lastResponse.revoke(result.key);
                }
                else if (result.action.name === WorkspacesProvider._ACTION_SHARE_WORKSPACE) {
                    await this._integrationHelpers.share({ workspaceId: data.workspaceId });
                }
                else {
                    handled = false;
                    this._logger.warn(`Unrecognized action for workspace selection: ${data.workspaceId}`);
                }
            }
        }
        return handled;
    }
    getWorkspaceTemplate(id, title, shareEnabled, isCurrent, iconFolder, colorScheme) {
        let actions = [];
        let layout;
        let data;
        if (isCurrent) {
            layout = this.getCurrentWorkspaceTemplate();
            data = {
                title,
                instructions: "This is the currently active workspace. You can use the Browser menu to update/rename this workspace"
            };
        }
        else {
            if (shareEnabled) {
                actions.push({
                    name: WorkspacesProvider._ACTION_SHARE_WORKSPACE,
                    hotkey: "CmdOrCtrl+Shift+S"
                });
            }
            actions = actions.concat([
                {
                    name: WorkspacesProvider._ACTION_DELETE_WORKSPACE,
                    hotkey: "CmdOrCtrl+Shift+D"
                },
                {
                    name: WorkspacesProvider._ACTION_LAUNCH_WORKSPACE,
                    hotkey: "Enter"
                }
            ]);
            layout = this.getOtherWorkspaceTemplate(shareEnabled);
            data = {
                title,
                instructions: "Use the buttons below to interact with your saved Workspace:",
                openText: "Launch",
                deleteText: "Delete",
                shareText: "Share"
            };
        }
        return {
            key: id,
            title,
            label: "Workspace",
            icon: this._settings.images.workspace.replace("{scheme}", colorScheme),
            actions,
            data: {
                providerId: WorkspacesProvider._PROVIDER_ID,
                workspaceTitle: title,
                workspaceId: id,
                tags: ["workspace"]
            },
            template: "Custom",
            templateContent: {
                layout,
                data
            }
        };
    }
    getOtherWorkspaceTemplate(enableShare) {
        const actionButtons = [
            {
                type: "Button",
                style: {
                    display: "flex",
                    flexDirection: "column",
                    width: "80px"
                },
                action: WorkspacesProvider._ACTION_LAUNCH_WORKSPACE,
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
                action: WorkspacesProvider._ACTION_DELETE_WORKSPACE,
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
                action: WorkspacesProvider._ACTION_SHARE_WORKSPACE,
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
                    dataKey: "instructions",
                    optional: true,
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
    getCurrentWorkspaceTemplate() {
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
                    dataKey: "instructions",
                    optional: true,
                    style: {
                        fontWeight: "bold",
                        paddingTop: "10px",
                        paddingBottom: "10px",
                        paddingLeft: "10px",
                        paddingRight: "10px"
                    }
                }
            ]
        };
    }
}
/**
 * Provider id.
 * @internal
 */
WorkspacesProvider._PROVIDER_ID = "workspaces";
/**
 * The key to use for launching a workspace.
 * @internal
 */
WorkspacesProvider._ACTION_LAUNCH_WORKSPACE = "Launch Workspace";
/**
 * The key to use for deleting a workspace.
 * @internal
 */
WorkspacesProvider._ACTION_DELETE_WORKSPACE = "Delete Workspace";
/**
 * The key to use for sharing a workspace.
 * @internal
 */
WorkspacesProvider._ACTION_SHARE_WORKSPACE = "Share Workspace";
/**
 * The key to use for saving a workspace.
 * @internal
 */
WorkspacesProvider._ACTION_SAVE_WORKSPACE = "Save Workspace";
/**
 * The key to use for a workspace exists.
 * @internal
 */
WorkspacesProvider._ACTION_EXISTS_WORKSPACE = "Workspace Exists";


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
/*!*************************************************************!*\
  !*** ./client/src/modules/integrations/workspaces/index.ts ***!
  \*************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "entryPoints": () => (/* binding */ entryPoints)
/* harmony export */ });
/* harmony import */ var _integration__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./integration */ "./client/src/modules/integrations/workspaces/integration.ts");

const entryPoints = {
    integrations: new _integration__WEBPACK_IMPORTED_MODULE_0__.WorkspacesProvider()
};

})();

var __webpack_exports__entryPoints = __webpack_exports__.entryPoints;
export { __webpack_exports__entryPoints as entryPoints };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlcy5idW5kbGUuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQU8sU0FBUyxVQUFVO0lBQ3pCLElBQUksWUFBWSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUU7UUFDbEMsZ0RBQWdEO1FBQ2hELE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztLQUNsQztJQUNELHVHQUF1RztJQUN2Ryw2RUFBNkU7SUFDN0UsOENBQThDO0lBQzlDLE1BQU0sWUFBWSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUU7SUFDMUIsMERBQTBEO0lBQzFELENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDNUYsT0FBTyxzQ0FBc0MsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQy9FLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7QUNHb0Q7QUFHckQ7O0dBRUc7QUFDSSxNQUFNLGtCQUFrQjtJQXNEOUI7Ozs7OztPQU1HO0lBQ0ksS0FBSyxDQUFDLFVBQVUsQ0FDdEIsVUFBZ0QsRUFDaEQsYUFBNEIsRUFDNUIsT0FBMkI7UUFFM0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxPQUFPLENBQUM7UUFDbkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksS0FBSyxDQUFDLG9CQUFvQjtRQUNoQyxNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1FBRS9FLE9BQU87WUFDTjtnQkFDQyxHQUFHLEVBQUUsR0FBRyxrQkFBa0IsQ0FBQyxZQUFZLFFBQVE7Z0JBQy9DLEtBQUssRUFBRSxZQUFZO2dCQUNuQixLQUFLLEVBQUUsTUFBTTtnQkFDYixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsV0FBcUIsQ0FBQztnQkFDaEYsT0FBTyxFQUFFLEVBQUU7Z0JBQ1gsSUFBSSxFQUFFO29CQUNMLFVBQVUsRUFBRSxrQkFBa0IsQ0FBQyxZQUFZO2lCQUMzQztnQkFDRCxRQUFRLEVBQUUsUUFBOEI7Z0JBQ3hDLGVBQWUsRUFBRSxNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUN6RSxZQUFZLEVBQ1osQ0FBQyx5REFBeUQsQ0FBQyxFQUMzRCxDQUFDLFVBQVUsQ0FBQyxDQUNaO2FBQ0Q7U0FDRCxDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSSxLQUFLLENBQUMsZ0JBQWdCLENBQzVCLEtBQWEsRUFDYixPQUFvQixFQUNwQixZQUF3QyxFQUN4QyxPQUdDO1FBRUQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3hELE1BQU0sVUFBVSxHQUFHLE1BQU0sUUFBUSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUMxRCxNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1FBQy9FLE1BQU0sVUFBVSxHQUFXLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFFakYsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRXZDLElBQUksVUFBVSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNqQyxNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztZQUU1QyxNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxLQUFLLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBQ2pHLElBQUksVUFBVSxFQUFFO2dCQUNmLE9BQU87b0JBQ04sT0FBTyxFQUFFO3dCQUNSOzRCQUNDLEdBQUcsRUFBRSxrQkFBa0IsQ0FBQyx3QkFBd0I7NEJBQ2hELEtBQUssRUFBRSxhQUFhLFVBQVUsQ0FBQyxLQUFLLGtCQUFrQjs0QkFDdEQsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLFdBQXFCLENBQUM7NEJBQ2hGLE9BQU8sRUFBRSxFQUFFOzRCQUNYLElBQUksRUFBRTtnQ0FDTCxVQUFVLEVBQUUsa0JBQWtCLENBQUMsWUFBWTtnQ0FDM0MsSUFBSSxFQUFFLENBQUMsV0FBVyxDQUFDO2dDQUNuQixXQUFXLEVBQUUsVUFBVSxDQUFDLFdBQVc7NkJBQ25DOzRCQUNELFFBQVEsRUFBRSxJQUFJOzRCQUNkLGVBQWUsRUFBRSxJQUFJO3lCQUNyQjtxQkFDRDtpQkFDRCxDQUFDO2FBQ0Y7WUFDRCxPQUFPO2dCQUNOLE9BQU8sRUFBRTtvQkFDUjt3QkFDQyxHQUFHLEVBQUUsa0JBQWtCLENBQUMsc0JBQXNCO3dCQUM5QyxLQUFLLEVBQUUsNkJBQTZCLEtBQUssRUFBRTt3QkFDM0MsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLFdBQXFCLENBQUM7d0JBQ2hGLEtBQUssRUFBRSxZQUFZO3dCQUNuQixPQUFPLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLENBQUM7d0JBQ3RELElBQUksRUFBRTs0QkFDTCxVQUFVLEVBQUUsa0JBQWtCLENBQUMsWUFBWTs0QkFDM0MsSUFBSSxFQUFFLENBQUMsV0FBVyxDQUFDOzRCQUNuQixXQUFXLEVBQUUsMkRBQVUsRUFBRTs0QkFDekIsY0FBYyxFQUFFLEtBQUs7eUJBQ3JCO3dCQUNELFFBQVEsRUFBRSxJQUFJO3dCQUNkLGVBQWUsRUFBRSxJQUFJO3FCQUNyQjtpQkFDRDthQUNELENBQUM7U0FDRjtRQUVELElBQUksZ0JBQWdCLEdBQXVCLEVBQUUsQ0FBQztRQUU5QyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDOUIsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQzlELE1BQU0sa0JBQWtCLEdBQUcsZ0JBQWdCLEVBQUUsV0FBVyxDQUFDO1lBQ3pELE1BQU0sWUFBWSxHQUFZLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUVsRixnQkFBZ0IsR0FBRyxVQUFVO2lCQUMzQixNQUFNLENBQ04sQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUNOLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFDbEIsQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxjQUFjLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FDeEY7aUJBQ0EsR0FBRyxDQUFDLENBQUMsRUFBYSxFQUFFLEVBQUUsQ0FDdEIsSUFBSSxDQUFDLG9CQUFvQixDQUN4QixFQUFFLENBQUMsV0FBVyxFQUNkLEVBQUUsQ0FBQyxLQUFLLEVBQ1IsWUFBWSxFQUNaLGtCQUFrQixLQUFLLEVBQUUsQ0FBQyxXQUFXLEVBQ3JDLFVBQVUsRUFDVixXQUFXLENBQ1gsQ0FDRCxDQUFDO1NBQ0g7UUFFRCxPQUFPO1lBQ04sT0FBTyxFQUFFLGdCQUFnQjtTQUN6QixDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksS0FBSyxDQUFDLGFBQWEsQ0FDekIsTUFBa0MsRUFDbEMsWUFBd0M7UUFFeEMsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEtBQUssYUFBYSxFQUFFO1lBQzVDLE1BQU0sSUFBSSxHQUdOLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFFaEIsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsbUJBQW1CLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUMvRSxNQUFNLFVBQVUsR0FBVyxNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQ2pGLE1BQU0sWUFBWSxHQUFZLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUVsRixJQUFJLElBQUksRUFBRSxXQUFXLEVBQUU7Z0JBQ3RCLE9BQU8sR0FBRyxJQUFJLENBQUM7Z0JBRWYsSUFBSSxNQUFNLENBQUMsR0FBRyxLQUFLLGtCQUFrQixDQUFDLHNCQUFzQixFQUFFO29CQUM3RCxZQUFZLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFFaEMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxDQUFDO29CQUN4RCxNQUFNLFFBQVEsR0FBRyxNQUFNLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDOUMsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO29CQUM5RCxNQUFNLGVBQWUsR0FBRyxnQkFBZ0IsRUFBRSxRQUFRLENBQUM7b0JBRW5ELE1BQU0sU0FBUyxHQUFHO3dCQUNqQixXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7d0JBQzdCLEtBQUssRUFBRSxJQUFJLENBQUMsY0FBYzt3QkFDMUIsUUFBUSxFQUFFLGVBQWU7d0JBQ3pCLFFBQVE7cUJBQ1IsQ0FBQztvQkFDRixNQUFNLFFBQVEsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUVoRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQzlDLElBQUksQ0FBQyxXQUFXLEVBQ2hCLElBQUksQ0FBQyxjQUFjLEVBQ25CLFlBQVksRUFDWixJQUFJLEVBQ0osVUFBVSxFQUNWLFdBQVcsQ0FDWCxDQUFDO29CQUVGLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2lCQUN0QztxQkFBTSxJQUFJLE1BQU0sQ0FBQyxHQUFHLEtBQUssa0JBQWtCLENBQUMsd0JBQXdCLEVBQUU7b0JBQ3RFLFlBQVksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUNoQztxQkFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLGtCQUFrQixDQUFDLHdCQUF3QixFQUFFO29CQUM5RSxZQUFZLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDaEMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxDQUFDO29CQUN4RCxNQUFNLFNBQVMsR0FBRyxNQUFNLFFBQVEsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDeEUsTUFBTSxRQUFRLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUV6QyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQzlDLElBQUksQ0FBQyxXQUFXLEVBQ2hCLElBQUksQ0FBQyxjQUFjLEVBQ25CLFlBQVksRUFDWixJQUFJLEVBQ0osVUFBVSxFQUNWLFdBQVcsQ0FDWCxDQUFDO29CQUVGLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2lCQUN0QztxQkFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLGtCQUFrQixDQUFDLHdCQUF3QixFQUFFO29CQUM5RSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQ3hELE1BQU0sUUFBUSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO29CQUN6RCxZQUFZLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDaEM7cUJBQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxrQkFBa0IsQ0FBQyx1QkFBdUIsRUFBRTtvQkFDN0UsTUFBTSxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO2lCQUN4RTtxQkFBTTtvQkFDTixPQUFPLEdBQUcsS0FBSyxDQUFDO29CQUNoQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxnREFBZ0QsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7aUJBQ3RGO2FBQ0Q7U0FDRDtRQUVELE9BQU8sT0FBTyxDQUFDO0lBQ2hCLENBQUM7SUFFTyxvQkFBb0IsQ0FDM0IsRUFBVSxFQUNWLEtBQWEsRUFDYixZQUFxQixFQUNyQixTQUFrQixFQUNsQixVQUFrQixFQUNsQixXQUE0QjtRQUU1QixJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDakIsSUFBSSxNQUFNLENBQUM7UUFDWCxJQUFJLElBQUksQ0FBQztRQUVULElBQUksU0FBUyxFQUFFO1lBQ2QsTUFBTSxHQUFHLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1lBQzVDLElBQUksR0FBRztnQkFDTixLQUFLO2dCQUNMLFlBQVksRUFDWCxzR0FBc0c7YUFDdkcsQ0FBQztTQUNGO2FBQU07WUFDTixJQUFJLFlBQVksRUFBRTtnQkFDakIsT0FBTyxDQUFDLElBQUksQ0FBQztvQkFDWixJQUFJLEVBQUUsa0JBQWtCLENBQUMsdUJBQXVCO29CQUNoRCxNQUFNLEVBQUUsbUJBQW1CO2lCQUMzQixDQUFDLENBQUM7YUFDSDtZQUNELE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO2dCQUN4QjtvQkFDQyxJQUFJLEVBQUUsa0JBQWtCLENBQUMsd0JBQXdCO29CQUNqRCxNQUFNLEVBQUUsbUJBQW1CO2lCQUMzQjtnQkFDRDtvQkFDQyxJQUFJLEVBQUUsa0JBQWtCLENBQUMsd0JBQXdCO29CQUNqRCxNQUFNLEVBQUUsT0FBTztpQkFDZjthQUNELENBQUMsQ0FBQztZQUNILE1BQU0sR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDdEQsSUFBSSxHQUFHO2dCQUNOLEtBQUs7Z0JBQ0wsWUFBWSxFQUFFLDhEQUE4RDtnQkFDNUUsUUFBUSxFQUFFLFFBQVE7Z0JBQ2xCLFVBQVUsRUFBRSxRQUFRO2dCQUNwQixTQUFTLEVBQUUsT0FBTzthQUNsQixDQUFDO1NBQ0Y7UUFFRCxPQUFPO1lBQ04sR0FBRyxFQUFFLEVBQUU7WUFDUCxLQUFLO1lBQ0wsS0FBSyxFQUFFLFdBQVc7WUFDbEIsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLFdBQXFCLENBQUM7WUFDaEYsT0FBTztZQUNQLElBQUksRUFBRTtnQkFDTCxVQUFVLEVBQUUsa0JBQWtCLENBQUMsWUFBWTtnQkFDM0MsY0FBYyxFQUFFLEtBQUs7Z0JBQ3JCLFdBQVcsRUFBRSxFQUFFO2dCQUNmLElBQUksRUFBRSxDQUFDLFdBQVcsQ0FBQzthQUNuQjtZQUNELFFBQVEsRUFBRSxRQUE4QjtZQUN4QyxlQUFlLEVBQUU7Z0JBQ2hCLE1BQU07Z0JBQ04sSUFBSTthQUNKO1NBQ0QsQ0FBQztJQUNILENBQUM7SUFFTyx5QkFBeUIsQ0FBQyxXQUFvQjtRQUNyRCxNQUFNLGFBQWEsR0FBdUI7WUFDekM7Z0JBQ0MsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsS0FBSyxFQUFFO29CQUNOLE9BQU8sRUFBRSxNQUFNO29CQUNmLGFBQWEsRUFBRSxRQUFRO29CQUN2QixLQUFLLEVBQUUsTUFBTTtpQkFDYjtnQkFDRCxNQUFNLEVBQUUsa0JBQWtCLENBQUMsd0JBQXdCO2dCQUNuRCxRQUFRLEVBQUU7b0JBQ1Q7d0JBQ0MsSUFBSSxFQUFFLE1BQU07d0JBQ1osT0FBTyxFQUFFLFVBQVU7d0JBQ25CLFFBQVEsRUFBRSxLQUFLO3FCQUNmO2lCQUNEO2FBQ0Q7WUFDRDtnQkFDQyxJQUFJLEVBQUUsUUFBUTtnQkFDZCxXQUFXLEVBQUUsU0FBZ0M7Z0JBQzdDLEtBQUssRUFBRTtvQkFDTixPQUFPLEVBQUUsTUFBTTtvQkFDZixhQUFhLEVBQUUsUUFBUTtvQkFDdkIsS0FBSyxFQUFFLE1BQU07b0JBQ2IsVUFBVSxFQUFFLE1BQU07b0JBQ2xCLFdBQVcsRUFBRSxNQUFNO2lCQUNuQjtnQkFDRCxNQUFNLEVBQUUsa0JBQWtCLENBQUMsd0JBQXdCO2dCQUNuRCxRQUFRLEVBQUU7b0JBQ1Q7d0JBQ0MsSUFBSSxFQUFFLE1BQU07d0JBQ1osT0FBTyxFQUFFLFlBQVk7d0JBQ3JCLFFBQVEsRUFBRSxLQUFLO3FCQUNmO2lCQUNEO2FBQ0Q7U0FDRCxDQUFDO1FBRUYsSUFBSSxXQUFXLEVBQUU7WUFDaEIsYUFBYSxDQUFDLElBQUksQ0FBQztnQkFDbEIsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsV0FBVyxFQUFFLFNBQWdDO2dCQUM3QyxLQUFLLEVBQUU7b0JBQ04sT0FBTyxFQUFFLE1BQU07b0JBQ2YsYUFBYSxFQUFFLFFBQVE7b0JBQ3ZCLEtBQUssRUFBRSxNQUFNO2lCQUNiO2dCQUNELE1BQU0sRUFBRSxrQkFBa0IsQ0FBQyx1QkFBdUI7Z0JBQ2xELFFBQVEsRUFBRTtvQkFDVDt3QkFDQyxJQUFJLEVBQUUsTUFBTTt3QkFDWixPQUFPLEVBQUUsV0FBVzt3QkFDcEIsUUFBUSxFQUFFLEtBQUs7cUJBQ2Y7aUJBQ0Q7YUFDRCxDQUFDLENBQUM7U0FDSDtRQUVELE9BQU87WUFDTixJQUFJLEVBQUUsV0FBVztZQUNqQixLQUFLLEVBQUU7Z0JBQ04sVUFBVSxFQUFFLE1BQU07Z0JBQ2xCLE9BQU8sRUFBRSxNQUFNO2dCQUNmLGFBQWEsRUFBRSxRQUFRO2FBQ3ZCO1lBQ0QsUUFBUSxFQUFFO2dCQUNUO29CQUNDLElBQUksRUFBRSxNQUFNO29CQUNaLE9BQU8sRUFBRSxPQUFPO29CQUNoQixLQUFLLEVBQUU7d0JBQ04sVUFBVSxFQUFFLE1BQU07d0JBQ2xCLFFBQVEsRUFBRSxNQUFNO3dCQUNoQixTQUFTLEVBQUUsUUFBUTtxQkFDbkI7aUJBQ0Q7Z0JBQ0Q7b0JBQ0MsSUFBSSxFQUFFLE1BQU07b0JBQ1osT0FBTyxFQUFFLGNBQWM7b0JBQ3ZCLFFBQVEsRUFBRSxJQUFJO29CQUNkLEtBQUssRUFBRTt3QkFDTixVQUFVLEVBQUUsTUFBTTt3QkFDbEIsVUFBVSxFQUFFLE1BQU07d0JBQ2xCLGFBQWEsRUFBRSxNQUFNO3dCQUNyQixXQUFXLEVBQUUsTUFBTTt3QkFDbkIsWUFBWSxFQUFFLE1BQU07cUJBQ3BCO2lCQUNEO2dCQUNEO29CQUNDLElBQUksRUFBRSxXQUFXO29CQUNqQixLQUFLLEVBQUU7d0JBQ04sT0FBTyxFQUFFLE1BQU07d0JBQ2YsUUFBUSxFQUFFLFVBQVU7d0JBQ3BCLGNBQWMsRUFBRSxRQUFRO3dCQUN4QixVQUFVLEVBQUUsTUFBTTt3QkFDbEIsYUFBYSxFQUFFLE1BQU07cUJBQ3JCO29CQUNELFFBQVEsRUFBRSxhQUFhO2lCQUN2QjthQUNEO1NBQ0QsQ0FBQztJQUNILENBQUM7SUFFTywyQkFBMkI7UUFDbEMsT0FBTztZQUNOLElBQUksRUFBRSxXQUFXO1lBQ2pCLEtBQUssRUFBRTtnQkFDTixVQUFVLEVBQUUsTUFBTTtnQkFDbEIsT0FBTyxFQUFFLE1BQU07Z0JBQ2YsYUFBYSxFQUFFLFFBQVE7YUFDdkI7WUFDRCxRQUFRLEVBQUU7Z0JBQ1Q7b0JBQ0MsSUFBSSxFQUFFLE1BQU07b0JBQ1osT0FBTyxFQUFFLE9BQU87b0JBQ2hCLEtBQUssRUFBRTt3QkFDTixVQUFVLEVBQUUsTUFBTTt3QkFDbEIsUUFBUSxFQUFFLE1BQU07d0JBQ2hCLFNBQVMsRUFBRSxRQUFRO3FCQUNuQjtpQkFDRDtnQkFDRDtvQkFDQyxJQUFJLEVBQUUsTUFBTTtvQkFDWixPQUFPLEVBQUUsY0FBYztvQkFDdkIsUUFBUSxFQUFFLElBQUk7b0JBQ2QsS0FBSyxFQUFFO3dCQUNOLFVBQVUsRUFBRSxNQUFNO3dCQUNsQixVQUFVLEVBQUUsTUFBTTt3QkFDbEIsYUFBYSxFQUFFLE1BQU07d0JBQ3JCLFdBQVcsRUFBRSxNQUFNO3dCQUNuQixZQUFZLEVBQUUsTUFBTTtxQkFDcEI7aUJBQ0Q7YUFDRDtTQUNELENBQUM7SUFDSCxDQUFDOztBQWhlRDs7O0dBR0c7QUFDcUIsK0JBQVksR0FBRyxZQUFZLENBQUM7QUFFcEQ7OztHQUdHO0FBQ3FCLDJDQUF3QixHQUFHLGtCQUFrQixDQUFDO0FBRXRFOzs7R0FHRztBQUNxQiwyQ0FBd0IsR0FBRyxrQkFBa0IsQ0FBQztBQUV0RTs7O0dBR0c7QUFDcUIsMENBQXVCLEdBQUcsaUJBQWlCLENBQUM7QUFFcEU7OztHQUdHO0FBQ3FCLHlDQUFzQixHQUFHLGdCQUFnQixDQUFDO0FBRWxFOzs7R0FHRztBQUNxQiwyQ0FBd0IsR0FBRyxrQkFBa0IsQ0FBQzs7Ozs7OztTQ3hEdkU7U0FDQTs7U0FFQTtTQUNBO1NBQ0E7U0FDQTtTQUNBO1NBQ0E7U0FDQTtTQUNBO1NBQ0E7U0FDQTtTQUNBO1NBQ0E7U0FDQTs7U0FFQTtTQUNBOztTQUVBO1NBQ0E7U0FDQTs7Ozs7VUN0QkE7VUFDQTtVQUNBO1VBQ0E7VUFDQSx5Q0FBeUMsd0NBQXdDO1VBQ2pGO1VBQ0E7VUFDQTs7Ozs7VUNQQTs7Ozs7VUNBQTtVQUNBO1VBQ0E7VUFDQSx1REFBdUQsaUJBQWlCO1VBQ3hFO1VBQ0EsZ0RBQWdELGFBQWE7VUFDN0Q7Ozs7Ozs7Ozs7Ozs7OztBQ05tRDtBQUU1QyxNQUFNLFdBQVcsR0FBeUM7SUFDaEUsWUFBWSxFQUFFLElBQUksNERBQWtCLEVBQUU7Q0FDdEMsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL29wZW5maW4td29ya3NwYWNlLS1jdXN0b21pemUtd29ya3NwYWNlLy4vY2xpZW50L3NyYy9mcmFtZXdvcmsvdXVpZC50cyIsIndlYnBhY2s6Ly9vcGVuZmluLXdvcmtzcGFjZS0tY3VzdG9taXplLXdvcmtzcGFjZS8uL2NsaWVudC9zcmMvbW9kdWxlcy9pbnRlZ3JhdGlvbnMvd29ya3NwYWNlcy9pbnRlZ3JhdGlvbi50cyIsIndlYnBhY2s6Ly9vcGVuZmluLXdvcmtzcGFjZS0tY3VzdG9taXplLXdvcmtzcGFjZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9vcGVuZmluLXdvcmtzcGFjZS0tY3VzdG9taXplLXdvcmtzcGFjZS93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vb3BlbmZpbi13b3Jrc3BhY2UtLWN1c3RvbWl6ZS13b3Jrc3BhY2Uvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9vcGVuZmluLXdvcmtzcGFjZS0tY3VzdG9taXplLXdvcmtzcGFjZS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL29wZW5maW4td29ya3NwYWNlLS1jdXN0b21pemUtd29ya3NwYWNlLy4vY2xpZW50L3NyYy9tb2R1bGVzL2ludGVncmF0aW9ucy93b3Jrc3BhY2VzL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiByYW5kb21VVUlEKCk6IHN0cmluZyB7XHJcblx0aWYgKFwicmFuZG9tVVVJRFwiIGluIHdpbmRvdy5jcnlwdG8pIHtcclxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1yZXN0cmljdGVkLXN5bnRheFxyXG5cdFx0cmV0dXJuIHdpbmRvdy5jcnlwdG8ucmFuZG9tVVVJRCgpO1xyXG5cdH1cclxuXHQvLyBQb2x5ZmlsbCB0aGUgd2luZG93LmNyeXB0by5yYW5kb21VVUlEIGlmIHdlIGFyZSBydW5uaW5nIGluIGEgbm9uIHNlY3VyZSBjb250ZXh0IHRoYXQgZG9lc24ndCBoYXZlIGl0XHJcblx0Ly8gd2UgYXJlIHN0aWxsIHVzaW5nIHdpbmRvdy5jcnlwdG8uZ2V0UmFuZG9tVmFsdWVzIHdoaWNoIGlzIGFsd2F5cyBhdmFpbGFibGVcclxuXHQvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjExNzUyMy8yODAwMjE4XHJcblx0Y29uc3QgZ2V0UmFuZG9tSGV4ID0gKGMpID0+XHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tYml0d2lzZSwgbm8tbWl4ZWQtb3BlcmF0b3JzXHJcblx0XHQoYyBeICh3aW5kb3cuY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheSgxKSlbMF0gJiAoMTUgPj4gKGMgLyA0KSkpKS50b1N0cmluZygxNik7XHJcblx0cmV0dXJuIFwiMTAwMDAwMDAtMTAwMC00MDAwLTgwMDAtMTAwMDAwMDAwMDAwXCIucmVwbGFjZSgvWzAxOF0vZywgZ2V0UmFuZG9tSGV4KTtcclxufVxyXG4iLCJpbXBvcnQgdHlwZSB7XHJcblx0QnV0dG9uU3R5bGUsXHJcblx0Q0xJRmlsdGVyLFxyXG5cdENMSVRlbXBsYXRlLFxyXG5cdEhvbWVEaXNwYXRjaGVkU2VhcmNoUmVzdWx0LFxyXG5cdEhvbWVTZWFyY2hMaXN0ZW5lclJlc3BvbnNlLFxyXG5cdEhvbWVTZWFyY2hSZXNwb25zZSxcclxuXHRIb21lU2VhcmNoUmVzdWx0LFxyXG5cdFRlbXBsYXRlRnJhZ21lbnQsXHJcblx0V29ya3NwYWNlXHJcbn0gZnJvbSBcIkBvcGVuZmluL3dvcmtzcGFjZVwiO1xyXG5pbXBvcnQgdHlwZSB7IEludGVncmF0aW9uSGVscGVycywgSW50ZWdyYXRpb25Nb2R1bGUgfSBmcm9tIFwiY3VzdG9taXplLXdvcmtzcGFjZS9zaGFwZXMvaW50ZWdyYXRpb25zLXNoYXBlc1wiO1xyXG5pbXBvcnQgdHlwZSB7IExvZ2dlciwgTG9nZ2VyQ3JlYXRvciB9IGZyb20gXCJjdXN0b21pemUtd29ya3NwYWNlL3NoYXBlcy9sb2dnZXItc2hhcGVzXCI7XHJcbmltcG9ydCB0eXBlIHsgTW9kdWxlRGVmaW5pdGlvbiB9IGZyb20gXCJjdXN0b21pemUtd29ya3NwYWNlL3NoYXBlcy9tb2R1bGUtc2hhcGVzXCI7XHJcbmltcG9ydCB0eXBlIHsgQ29sb3JTY2hlbWVNb2RlIH0gZnJvbSBcImN1c3RvbWl6ZS13b3Jrc3BhY2Uvc2hhcGVzL3RoZW1lLXNoYXBlc1wiO1xyXG5pbXBvcnQgeyByYW5kb21VVUlEIH0gZnJvbSBcIi4uLy4uLy4uL2ZyYW1ld29yay91dWlkXCI7XHJcbmltcG9ydCB0eXBlIHsgV29ya3NwYWNlc1NldHRpbmdzIH0gZnJvbSBcIi4vc2hhcGVzXCI7XHJcblxyXG4vKipcclxuICogSW1wbGVtZW50IHRoZSBpbnRlZ3JhdGlvbiBwcm92aWRlciBmb3Igd29ya3NwYWNlcy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBXb3Jrc3BhY2VzUHJvdmlkZXIgaW1wbGVtZW50cyBJbnRlZ3JhdGlvbk1vZHVsZTxXb3Jrc3BhY2VzU2V0dGluZ3M+IHtcclxuXHQvKipcclxuXHQgKiBQcm92aWRlciBpZC5cclxuXHQgKiBAaW50ZXJuYWxcclxuXHQgKi9cclxuXHRwcml2YXRlIHN0YXRpYyByZWFkb25seSBfUFJPVklERVJfSUQgPSBcIndvcmtzcGFjZXNcIjtcclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGtleSB0byB1c2UgZm9yIGxhdW5jaGluZyBhIHdvcmtzcGFjZS5cclxuXHQgKiBAaW50ZXJuYWxcclxuXHQgKi9cclxuXHRwcml2YXRlIHN0YXRpYyByZWFkb25seSBfQUNUSU9OX0xBVU5DSF9XT1JLU1BBQ0UgPSBcIkxhdW5jaCBXb3Jrc3BhY2VcIjtcclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGtleSB0byB1c2UgZm9yIGRlbGV0aW5nIGEgd29ya3NwYWNlLlxyXG5cdCAqIEBpbnRlcm5hbFxyXG5cdCAqL1xyXG5cdHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IF9BQ1RJT05fREVMRVRFX1dPUktTUEFDRSA9IFwiRGVsZXRlIFdvcmtzcGFjZVwiO1xyXG5cclxuXHQvKipcclxuXHQgKiBUaGUga2V5IHRvIHVzZSBmb3Igc2hhcmluZyBhIHdvcmtzcGFjZS5cclxuXHQgKiBAaW50ZXJuYWxcclxuXHQgKi9cclxuXHRwcml2YXRlIHN0YXRpYyByZWFkb25seSBfQUNUSU9OX1NIQVJFX1dPUktTUEFDRSA9IFwiU2hhcmUgV29ya3NwYWNlXCI7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBrZXkgdG8gdXNlIGZvciBzYXZpbmcgYSB3b3Jrc3BhY2UuXHJcblx0ICogQGludGVybmFsXHJcblx0ICovXHJcblx0cHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgX0FDVElPTl9TQVZFX1dPUktTUEFDRSA9IFwiU2F2ZSBXb3Jrc3BhY2VcIjtcclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGtleSB0byB1c2UgZm9yIGEgd29ya3NwYWNlIGV4aXN0cy5cclxuXHQgKiBAaW50ZXJuYWxcclxuXHQgKi9cclxuXHRwcml2YXRlIHN0YXRpYyByZWFkb25seSBfQUNUSU9OX0VYSVNUU19XT1JLU1BBQ0UgPSBcIldvcmtzcGFjZSBFeGlzdHNcIjtcclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHNldHRpbmdzIGZyb20gY29uZmlnLlxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX3NldHRpbmdzOiBXb3Jrc3BhY2VzU2V0dGluZ3M7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBzZXR0aW5ncyBmb3IgdGhlIGludGVncmF0aW9uLlxyXG5cdCAqIEBpbnRlcm5hbFxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2xvZ2dlcjogTG9nZ2VyO1xyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgaW50ZWdyYXRpb24gaGVscGVycy5cclxuXHQgKiBAaW50ZXJuYWxcclxuXHQgKi9cclxuXHRwcml2YXRlIF9pbnRlZ3JhdGlvbkhlbHBlcnM6IEludGVncmF0aW9uSGVscGVycyB8IHVuZGVmaW5lZDtcclxuXHJcblx0LyoqXHJcblx0ICogSW5pdGlhbGl6ZSB0aGUgbW9kdWxlLlxyXG5cdCAqIEBwYXJhbSBkZWZpbml0aW9uIFRoZSBkZWZpbml0aW9uIG9mIHRoZSBtb2R1bGUgZnJvbSBjb25maWd1cmF0aW9uIGluY2x1ZGUgY3VzdG9tIG9wdGlvbnMuXHJcblx0ICogQHBhcmFtIGxvZ2dlckNyZWF0b3IgRm9yIGxvZ2dpbmcgZW50cmllcy5cclxuXHQgKiBAcGFyYW0gaGVscGVycyBIZWxwZXIgbWV0aG9kcyBmb3IgdGhlIG1vZHVsZSB0byBpbnRlcmFjdCB3aXRoIHRoZSBhcHBsaWNhdGlvbiBjb3JlLlxyXG5cdCAqIEByZXR1cm5zIE5vdGhpbmcuXHJcblx0ICovXHJcblx0cHVibGljIGFzeW5jIGluaXRpYWxpemUoXHJcblx0XHRkZWZpbml0aW9uOiBNb2R1bGVEZWZpbml0aW9uPFdvcmtzcGFjZXNTZXR0aW5ncz4sXHJcblx0XHRsb2dnZXJDcmVhdG9yOiBMb2dnZXJDcmVhdG9yLFxyXG5cdFx0aGVscGVyczogSW50ZWdyYXRpb25IZWxwZXJzXHJcblx0KTogUHJvbWlzZTx2b2lkPiB7XHJcblx0XHR0aGlzLl9zZXR0aW5ncyA9IGRlZmluaXRpb24uZGF0YTtcclxuXHRcdHRoaXMuX2ludGVncmF0aW9uSGVscGVycyA9IGhlbHBlcnM7XHJcblx0XHR0aGlzLl9sb2dnZXIgPSBsb2dnZXJDcmVhdG9yKFwiV29ya3NwYWNlc1Byb3ZpZGVyXCIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogR2V0IGEgbGlzdCBvZiB0aGUgc3RhdGljIGhlbHAgZW50cmllcy5cclxuXHQgKiBAcmV0dXJucyBUaGUgbGlzdCBvZiBoZWxwIGVudHJpZXMuXHJcblx0ICovXHJcblx0cHVibGljIGFzeW5jIGdldEhlbHBTZWFyY2hFbnRyaWVzKCk6IFByb21pc2U8SG9tZVNlYXJjaFJlc3VsdFtdPiB7XHJcblx0XHRjb25zdCBjb2xvclNjaGVtZSA9IGF3YWl0IHRoaXMuX2ludGVncmF0aW9uSGVscGVycy5nZXRDdXJyZW50Q29sb3JTY2hlbWVNb2RlKCk7XHJcblxyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGtleTogYCR7V29ya3NwYWNlc1Byb3ZpZGVyLl9QUk9WSURFUl9JRH0taGVscDFgLFxyXG5cdFx0XHRcdHRpdGxlOiBcIldvcmtzcGFjZXNcIixcclxuXHRcdFx0XHRsYWJlbDogXCJIZWxwXCIsXHJcblx0XHRcdFx0aWNvbjogdGhpcy5fc2V0dGluZ3MuaW1hZ2VzLndvcmtzcGFjZS5yZXBsYWNlKFwie3NjaGVtZX1cIiwgY29sb3JTY2hlbWUgYXMgc3RyaW5nKSxcclxuXHRcdFx0XHRhY3Rpb25zOiBbXSxcclxuXHRcdFx0XHRkYXRhOiB7XHJcblx0XHRcdFx0XHRwcm92aWRlcklkOiBXb3Jrc3BhY2VzUHJvdmlkZXIuX1BST1ZJREVSX0lEXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHR0ZW1wbGF0ZTogXCJDdXN0b21cIiBhcyBDTElUZW1wbGF0ZS5DdXN0b20sXHJcblx0XHRcdFx0dGVtcGxhdGVDb250ZW50OiBhd2FpdCB0aGlzLl9pbnRlZ3JhdGlvbkhlbHBlcnMudGVtcGxhdGVIZWxwZXJzLmNyZWF0ZUhlbHAoXHJcblx0XHRcdFx0XHRcIldvcmtzcGFjZXNcIixcclxuXHRcdFx0XHRcdFtcIlVzZSB0aGUgd29ya3NwYWNlcyBjb21tYW5kIHRvIHNhdmUgeW91ciBjdXJyZW50IGxheW91dC5cIl0sXHJcblx0XHRcdFx0XHRbXCIvdyB0aXRsZVwiXVxyXG5cdFx0XHRcdClcclxuXHRcdFx0fVxyXG5cdFx0XTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCBhIGxpc3Qgb2Ygc2VhcmNoIHJlc3VsdHMgYmFzZWQgb24gdGhlIHF1ZXJ5IGFuZCBmaWx0ZXJzLlxyXG5cdCAqIEBwYXJhbSBxdWVyeSBUaGUgcXVlcnkgdG8gc2VhcmNoIGZvci5cclxuXHQgKiBAcGFyYW0gZmlsdGVycyBUaGUgZmlsdGVycyB0byBhcHBseS5cclxuXHQgKiBAcGFyYW0gbGFzdFJlc3BvbnNlIFRoZSBsYXN0IHNlYXJjaCByZXNwb25zZSB1c2VkIGZvciB1cGRhdGluZyBleGlzdGluZyByZXN1bHRzLlxyXG5cdCAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIHRoZSBzZWFyY2ggcXVlcnkuXHJcblx0ICogQHJldHVybnMgVGhlIGxpc3Qgb2YgcmVzdWx0cyBhbmQgbmV3IGZpbHRlcnMuXHJcblx0ICovXHJcblx0cHVibGljIGFzeW5jIGdldFNlYXJjaFJlc3VsdHMoXHJcblx0XHRxdWVyeTogc3RyaW5nLFxyXG5cdFx0ZmlsdGVyczogQ0xJRmlsdGVyW10sXHJcblx0XHRsYXN0UmVzcG9uc2U6IEhvbWVTZWFyY2hMaXN0ZW5lclJlc3BvbnNlLFxyXG5cdFx0b3B0aW9uczoge1xyXG5cdFx0XHRxdWVyeU1pbkxlbmd0aDogbnVtYmVyO1xyXG5cdFx0XHRxdWVyeUFnYWluc3Q6IHN0cmluZ1tdO1xyXG5cdFx0fVxyXG5cdCk6IFByb21pc2U8SG9tZVNlYXJjaFJlc3BvbnNlPiB7XHJcblx0XHRjb25zdCBwbGF0Zm9ybSA9IHRoaXMuX2ludGVncmF0aW9uSGVscGVycy5nZXRQbGF0Zm9ybSgpO1xyXG5cdFx0Y29uc3Qgd29ya3NwYWNlcyA9IGF3YWl0IHBsYXRmb3JtLlN0b3JhZ2UuZ2V0V29ya3NwYWNlcygpO1xyXG5cdFx0Y29uc3QgY29sb3JTY2hlbWUgPSBhd2FpdCB0aGlzLl9pbnRlZ3JhdGlvbkhlbHBlcnMuZ2V0Q3VycmVudENvbG9yU2NoZW1lTW9kZSgpO1xyXG5cdFx0Y29uc3QgaWNvbkZvbGRlcjogc3RyaW5nID0gYXdhaXQgdGhpcy5faW50ZWdyYXRpb25IZWxwZXJzLmdldEN1cnJlbnRJY29uRm9sZGVyKCk7XHJcblxyXG5cdFx0Y29uc3QgcXVlcnlMb3dlciA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCk7XHJcblxyXG5cdFx0aWYgKHF1ZXJ5TG93ZXIuc3RhcnRzV2l0aChcIi93IFwiKSkge1xyXG5cdFx0XHRjb25zdCB0aXRsZSA9IHF1ZXJ5TG93ZXIucmVwbGFjZShcIi93IFwiLCBcIlwiKTtcclxuXHJcblx0XHRcdGNvbnN0IGZvdW5kTWF0Y2ggPSB3b3Jrc3BhY2VzLmZpbmQoKGVudHJ5KSA9PiBlbnRyeS50aXRsZS50b0xvd2VyQ2FzZSgpID09PSB0aXRsZS50b0xvd2VyQ2FzZSgpKTtcclxuXHRcdFx0aWYgKGZvdW5kTWF0Y2gpIHtcclxuXHRcdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdFx0cmVzdWx0czogW1xyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0a2V5OiBXb3Jrc3BhY2VzUHJvdmlkZXIuX0FDVElPTl9FWElTVFNfV09SS1NQQUNFLFxyXG5cdFx0XHRcdFx0XHRcdHRpdGxlOiBgV29ya3NwYWNlICR7Zm91bmRNYXRjaC50aXRsZX0gYWxyZWFkeSBleGlzdHMuYCxcclxuXHRcdFx0XHRcdFx0XHRpY29uOiB0aGlzLl9zZXR0aW5ncy5pbWFnZXMud29ya3NwYWNlLnJlcGxhY2UoXCJ7c2NoZW1lfVwiLCBjb2xvclNjaGVtZSBhcyBzdHJpbmcpLFxyXG5cdFx0XHRcdFx0XHRcdGFjdGlvbnM6IFtdLFxyXG5cdFx0XHRcdFx0XHRcdGRhdGE6IHtcclxuXHRcdFx0XHRcdFx0XHRcdHByb3ZpZGVySWQ6IFdvcmtzcGFjZXNQcm92aWRlci5fUFJPVklERVJfSUQsXHJcblx0XHRcdFx0XHRcdFx0XHR0YWdzOiBbXCJ3b3Jrc3BhY2VcIl0sXHJcblx0XHRcdFx0XHRcdFx0XHR3b3Jrc3BhY2VJZDogZm91bmRNYXRjaC53b3Jrc3BhY2VJZFxyXG5cdFx0XHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRcdFx0dGVtcGxhdGU6IG51bGwsXHJcblx0XHRcdFx0XHRcdFx0dGVtcGxhdGVDb250ZW50OiBudWxsXHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdF1cclxuXHRcdFx0XHR9O1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0cmVzdWx0czogW1xyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRrZXk6IFdvcmtzcGFjZXNQcm92aWRlci5fQUNUSU9OX1NBVkVfV09SS1NQQUNFLFxyXG5cdFx0XHRcdFx0XHR0aXRsZTogYFNhdmUgQ3VycmVudCBXb3Jrc3BhY2UgYXMgJHt0aXRsZX1gLFxyXG5cdFx0XHRcdFx0XHRpY29uOiB0aGlzLl9zZXR0aW5ncy5pbWFnZXMud29ya3NwYWNlLnJlcGxhY2UoXCJ7c2NoZW1lfVwiLCBjb2xvclNjaGVtZSBhcyBzdHJpbmcpLFxyXG5cdFx0XHRcdFx0XHRsYWJlbDogXCJTdWdnZXN0aW9uXCIsXHJcblx0XHRcdFx0XHRcdGFjdGlvbnM6IFt7IG5hbWU6IFwiU2F2ZSBXb3Jrc3BhY2VcIiwgaG90a2V5OiBcIkVudGVyXCIgfV0sXHJcblx0XHRcdFx0XHRcdGRhdGE6IHtcclxuXHRcdFx0XHRcdFx0XHRwcm92aWRlcklkOiBXb3Jrc3BhY2VzUHJvdmlkZXIuX1BST1ZJREVSX0lELFxyXG5cdFx0XHRcdFx0XHRcdHRhZ3M6IFtcIndvcmtzcGFjZVwiXSxcclxuXHRcdFx0XHRcdFx0XHR3b3Jrc3BhY2VJZDogcmFuZG9tVVVJRCgpLFxyXG5cdFx0XHRcdFx0XHRcdHdvcmtzcGFjZVRpdGxlOiB0aXRsZVxyXG5cdFx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0XHR0ZW1wbGF0ZTogbnVsbCxcclxuXHRcdFx0XHRcdFx0dGVtcGxhdGVDb250ZW50OiBudWxsXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XVxyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cclxuXHRcdGxldCB3b3Jrc3BhY2VSZXN1bHRzOiBIb21lU2VhcmNoUmVzdWx0W10gPSBbXTtcclxuXHJcblx0XHRpZiAoQXJyYXkuaXNBcnJheSh3b3Jrc3BhY2VzKSkge1xyXG5cdFx0XHRjb25zdCBjdXJyZW50V29ya3NwYWNlID0gYXdhaXQgcGxhdGZvcm0uZ2V0Q3VycmVudFdvcmtzcGFjZSgpO1xyXG5cdFx0XHRjb25zdCBjdXJyZW50V29ya3NwYWNlSWQgPSBjdXJyZW50V29ya3NwYWNlPy53b3Jrc3BhY2VJZDtcclxuXHRcdFx0Y29uc3Qgc2hhcmVFbmFibGVkOiBib29sZWFuID0gYXdhaXQgdGhpcy5faW50ZWdyYXRpb25IZWxwZXJzLmNvbmRpdGlvbihcInNoYXJpbmdcIik7XHJcblxyXG5cdFx0XHR3b3Jrc3BhY2VSZXN1bHRzID0gd29ya3NwYWNlc1xyXG5cdFx0XHRcdC5maWx0ZXIoXHJcblx0XHRcdFx0XHQocGcpID0+XHJcblx0XHRcdFx0XHRcdHF1ZXJ5Lmxlbmd0aCA9PT0gMCB8fFxyXG5cdFx0XHRcdFx0XHQocXVlcnkubGVuZ3RoID49IG9wdGlvbnMucXVlcnlNaW5MZW5ndGggJiYgcGcudGl0bGUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxdWVyeUxvd2VyKSlcclxuXHRcdFx0XHQpXHJcblx0XHRcdFx0Lm1hcCgod3M6IFdvcmtzcGFjZSkgPT5cclxuXHRcdFx0XHRcdHRoaXMuZ2V0V29ya3NwYWNlVGVtcGxhdGUoXHJcblx0XHRcdFx0XHRcdHdzLndvcmtzcGFjZUlkLFxyXG5cdFx0XHRcdFx0XHR3cy50aXRsZSxcclxuXHRcdFx0XHRcdFx0c2hhcmVFbmFibGVkLFxyXG5cdFx0XHRcdFx0XHRjdXJyZW50V29ya3NwYWNlSWQgPT09IHdzLndvcmtzcGFjZUlkLFxyXG5cdFx0XHRcdFx0XHRpY29uRm9sZGVyLFxyXG5cdFx0XHRcdFx0XHRjb2xvclNjaGVtZVxyXG5cdFx0XHRcdFx0KVxyXG5cdFx0XHRcdCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0cmVzdWx0czogd29ya3NwYWNlUmVzdWx0c1xyXG5cdFx0fTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFuIGVudHJ5IGhhcyBiZWVuIHNlbGVjdGVkLlxyXG5cdCAqIEBwYXJhbSByZXN1bHQgVGhlIGRpc3BhdGNoZWQgcmVzdWx0LlxyXG5cdCAqIEBwYXJhbSBsYXN0UmVzcG9uc2UgVGhlIGxhc3QgcmVzcG9uc2UuXHJcblx0ICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgaXRlbSB3YXMgaGFuZGxlZC5cclxuXHQgKi9cclxuXHRwdWJsaWMgYXN5bmMgaXRlbVNlbGVjdGlvbihcclxuXHRcdHJlc3VsdDogSG9tZURpc3BhdGNoZWRTZWFyY2hSZXN1bHQsXHJcblx0XHRsYXN0UmVzcG9uc2U6IEhvbWVTZWFyY2hMaXN0ZW5lclJlc3BvbnNlXHJcblx0KTogUHJvbWlzZTxib29sZWFuPiB7XHJcblx0XHRsZXQgaGFuZGxlZCA9IGZhbHNlO1xyXG5cdFx0aWYgKHJlc3VsdC5hY3Rpb24udHJpZ2dlciA9PT0gXCJ1c2VyLWFjdGlvblwiKSB7XHJcblx0XHRcdGNvbnN0IGRhdGE6IHtcclxuXHRcdFx0XHR3b3Jrc3BhY2VJZD86IHN0cmluZztcclxuXHRcdFx0XHR3b3Jrc3BhY2VUaXRsZT86IHN0cmluZztcclxuXHRcdFx0fSA9IHJlc3VsdC5kYXRhO1xyXG5cclxuXHRcdFx0Y29uc3QgY29sb3JTY2hlbWUgPSBhd2FpdCB0aGlzLl9pbnRlZ3JhdGlvbkhlbHBlcnMuZ2V0Q3VycmVudENvbG9yU2NoZW1lTW9kZSgpO1xyXG5cdFx0XHRjb25zdCBpY29uRm9sZGVyOiBzdHJpbmcgPSBhd2FpdCB0aGlzLl9pbnRlZ3JhdGlvbkhlbHBlcnMuZ2V0Q3VycmVudEljb25Gb2xkZXIoKTtcclxuXHRcdFx0Y29uc3Qgc2hhcmVFbmFibGVkOiBib29sZWFuID0gYXdhaXQgdGhpcy5faW50ZWdyYXRpb25IZWxwZXJzLmNvbmRpdGlvbihcInNoYXJpbmdcIik7XHJcblxyXG5cdFx0XHRpZiAoZGF0YT8ud29ya3NwYWNlSWQpIHtcclxuXHRcdFx0XHRoYW5kbGVkID0gdHJ1ZTtcclxuXHJcblx0XHRcdFx0aWYgKHJlc3VsdC5rZXkgPT09IFdvcmtzcGFjZXNQcm92aWRlci5fQUNUSU9OX1NBVkVfV09SS1NQQUNFKSB7XHJcblx0XHRcdFx0XHRsYXN0UmVzcG9uc2UucmV2b2tlKHJlc3VsdC5rZXkpO1xyXG5cclxuXHRcdFx0XHRcdGNvbnN0IHBsYXRmb3JtID0gdGhpcy5faW50ZWdyYXRpb25IZWxwZXJzLmdldFBsYXRmb3JtKCk7XHJcblx0XHRcdFx0XHRjb25zdCBzbmFwc2hvdCA9IGF3YWl0IHBsYXRmb3JtLmdldFNuYXBzaG90KCk7XHJcblx0XHRcdFx0XHRjb25zdCBjdXJyZW50V29ya3NwYWNlID0gYXdhaXQgcGxhdGZvcm0uZ2V0Q3VycmVudFdvcmtzcGFjZSgpO1xyXG5cdFx0XHRcdFx0Y29uc3QgY3VycmVudE1ldGFEYXRhID0gY3VycmVudFdvcmtzcGFjZT8ubWV0YWRhdGE7XHJcblxyXG5cdFx0XHRcdFx0Y29uc3Qgd29ya3NwYWNlID0ge1xyXG5cdFx0XHRcdFx0XHR3b3Jrc3BhY2VJZDogZGF0YS53b3Jrc3BhY2VJZCxcclxuXHRcdFx0XHRcdFx0dGl0bGU6IGRhdGEud29ya3NwYWNlVGl0bGUsXHJcblx0XHRcdFx0XHRcdG1ldGFkYXRhOiBjdXJyZW50TWV0YURhdGEsXHJcblx0XHRcdFx0XHRcdHNuYXBzaG90XHJcblx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdFx0YXdhaXQgcGxhdGZvcm0uU3RvcmFnZS5zYXZlV29ya3NwYWNlKHdvcmtzcGFjZSk7XHJcblxyXG5cdFx0XHRcdFx0Y29uc3Qgc2F2ZWRUZW1wbGF0ZSA9IHRoaXMuZ2V0V29ya3NwYWNlVGVtcGxhdGUoXHJcblx0XHRcdFx0XHRcdGRhdGEud29ya3NwYWNlSWQsXHJcblx0XHRcdFx0XHRcdGRhdGEud29ya3NwYWNlVGl0bGUsXHJcblx0XHRcdFx0XHRcdHNoYXJlRW5hYmxlZCxcclxuXHRcdFx0XHRcdFx0dHJ1ZSxcclxuXHRcdFx0XHRcdFx0aWNvbkZvbGRlcixcclxuXHRcdFx0XHRcdFx0Y29sb3JTY2hlbWVcclxuXHRcdFx0XHRcdCk7XHJcblxyXG5cdFx0XHRcdFx0bGFzdFJlc3BvbnNlLnJlc3BvbmQoW3NhdmVkVGVtcGxhdGVdKTtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKHJlc3VsdC5rZXkgPT09IFdvcmtzcGFjZXNQcm92aWRlci5fQUNUSU9OX0VYSVNUU19XT1JLU1BBQ0UpIHtcclxuXHRcdFx0XHRcdGxhc3RSZXNwb25zZS5yZXZva2UocmVzdWx0LmtleSk7XHJcblx0XHRcdFx0fSBlbHNlIGlmIChyZXN1bHQuYWN0aW9uLm5hbWUgPT09IFdvcmtzcGFjZXNQcm92aWRlci5fQUNUSU9OX0xBVU5DSF9XT1JLU1BBQ0UpIHtcclxuXHRcdFx0XHRcdGxhc3RSZXNwb25zZS5yZXZva2UocmVzdWx0LmtleSk7XHJcblx0XHRcdFx0XHRjb25zdCBwbGF0Zm9ybSA9IHRoaXMuX2ludGVncmF0aW9uSGVscGVycy5nZXRQbGF0Zm9ybSgpO1xyXG5cdFx0XHRcdFx0Y29uc3Qgd29ya3NwYWNlID0gYXdhaXQgcGxhdGZvcm0uU3RvcmFnZS5nZXRXb3Jrc3BhY2UoZGF0YS53b3Jrc3BhY2VJZCk7XHJcblx0XHRcdFx0XHRhd2FpdCBwbGF0Zm9ybS5hcHBseVdvcmtzcGFjZSh3b3Jrc3BhY2UpO1xyXG5cclxuXHRcdFx0XHRcdGNvbnN0IHNhdmVkVGVtcGxhdGUgPSB0aGlzLmdldFdvcmtzcGFjZVRlbXBsYXRlKFxyXG5cdFx0XHRcdFx0XHRkYXRhLndvcmtzcGFjZUlkLFxyXG5cdFx0XHRcdFx0XHRkYXRhLndvcmtzcGFjZVRpdGxlLFxyXG5cdFx0XHRcdFx0XHRzaGFyZUVuYWJsZWQsXHJcblx0XHRcdFx0XHRcdHRydWUsXHJcblx0XHRcdFx0XHRcdGljb25Gb2xkZXIsXHJcblx0XHRcdFx0XHRcdGNvbG9yU2NoZW1lXHJcblx0XHRcdFx0XHQpO1xyXG5cclxuXHRcdFx0XHRcdGxhc3RSZXNwb25zZS5yZXNwb25kKFtzYXZlZFRlbXBsYXRlXSk7XHJcblx0XHRcdFx0fSBlbHNlIGlmIChyZXN1bHQuYWN0aW9uLm5hbWUgPT09IFdvcmtzcGFjZXNQcm92aWRlci5fQUNUSU9OX0RFTEVURV9XT1JLU1BBQ0UpIHtcclxuXHRcdFx0XHRcdGNvbnN0IHBsYXRmb3JtID0gdGhpcy5faW50ZWdyYXRpb25IZWxwZXJzLmdldFBsYXRmb3JtKCk7XHJcblx0XHRcdFx0XHRhd2FpdCBwbGF0Zm9ybS5TdG9yYWdlLmRlbGV0ZVdvcmtzcGFjZShkYXRhLndvcmtzcGFjZUlkKTtcclxuXHRcdFx0XHRcdGxhc3RSZXNwb25zZS5yZXZva2UocmVzdWx0LmtleSk7XHJcblx0XHRcdFx0fSBlbHNlIGlmIChyZXN1bHQuYWN0aW9uLm5hbWUgPT09IFdvcmtzcGFjZXNQcm92aWRlci5fQUNUSU9OX1NIQVJFX1dPUktTUEFDRSkge1xyXG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5faW50ZWdyYXRpb25IZWxwZXJzLnNoYXJlKHsgd29ya3NwYWNlSWQ6IGRhdGEud29ya3NwYWNlSWQgfSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGhhbmRsZWQgPSBmYWxzZTtcclxuXHRcdFx0XHRcdHRoaXMuX2xvZ2dlci53YXJuKGBVbnJlY29nbml6ZWQgYWN0aW9uIGZvciB3b3Jrc3BhY2Ugc2VsZWN0aW9uOiAke2RhdGEud29ya3NwYWNlSWR9YCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGhhbmRsZWQ7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIGdldFdvcmtzcGFjZVRlbXBsYXRlKFxyXG5cdFx0aWQ6IHN0cmluZyxcclxuXHRcdHRpdGxlOiBzdHJpbmcsXHJcblx0XHRzaGFyZUVuYWJsZWQ6IGJvb2xlYW4sXHJcblx0XHRpc0N1cnJlbnQ6IGJvb2xlYW4sXHJcblx0XHRpY29uRm9sZGVyOiBzdHJpbmcsXHJcblx0XHRjb2xvclNjaGVtZTogQ29sb3JTY2hlbWVNb2RlXHJcblx0KTogSG9tZVNlYXJjaFJlc3VsdCB7XHJcblx0XHRsZXQgYWN0aW9ucyA9IFtdO1xyXG5cdFx0bGV0IGxheW91dDtcclxuXHRcdGxldCBkYXRhO1xyXG5cclxuXHRcdGlmIChpc0N1cnJlbnQpIHtcclxuXHRcdFx0bGF5b3V0ID0gdGhpcy5nZXRDdXJyZW50V29ya3NwYWNlVGVtcGxhdGUoKTtcclxuXHRcdFx0ZGF0YSA9IHtcclxuXHRcdFx0XHR0aXRsZSxcclxuXHRcdFx0XHRpbnN0cnVjdGlvbnM6XHJcblx0XHRcdFx0XHRcIlRoaXMgaXMgdGhlIGN1cnJlbnRseSBhY3RpdmUgd29ya3NwYWNlLiBZb3UgY2FuIHVzZSB0aGUgQnJvd3NlciBtZW51IHRvIHVwZGF0ZS9yZW5hbWUgdGhpcyB3b3Jrc3BhY2VcIlxyXG5cdFx0XHR9O1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aWYgKHNoYXJlRW5hYmxlZCkge1xyXG5cdFx0XHRcdGFjdGlvbnMucHVzaCh7XHJcblx0XHRcdFx0XHRuYW1lOiBXb3Jrc3BhY2VzUHJvdmlkZXIuX0FDVElPTl9TSEFSRV9XT1JLU1BBQ0UsXHJcblx0XHRcdFx0XHRob3RrZXk6IFwiQ21kT3JDdHJsK1NoaWZ0K1NcIlxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblx0XHRcdGFjdGlvbnMgPSBhY3Rpb25zLmNvbmNhdChbXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0bmFtZTogV29ya3NwYWNlc1Byb3ZpZGVyLl9BQ1RJT05fREVMRVRFX1dPUktTUEFDRSxcclxuXHRcdFx0XHRcdGhvdGtleTogXCJDbWRPckN0cmwrU2hpZnQrRFwiXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRuYW1lOiBXb3Jrc3BhY2VzUHJvdmlkZXIuX0FDVElPTl9MQVVOQ0hfV09SS1NQQUNFLFxyXG5cdFx0XHRcdFx0aG90a2V5OiBcIkVudGVyXCJcclxuXHRcdFx0XHR9XHJcblx0XHRcdF0pO1xyXG5cdFx0XHRsYXlvdXQgPSB0aGlzLmdldE90aGVyV29ya3NwYWNlVGVtcGxhdGUoc2hhcmVFbmFibGVkKTtcclxuXHRcdFx0ZGF0YSA9IHtcclxuXHRcdFx0XHR0aXRsZSxcclxuXHRcdFx0XHRpbnN0cnVjdGlvbnM6IFwiVXNlIHRoZSBidXR0b25zIGJlbG93IHRvIGludGVyYWN0IHdpdGggeW91ciBzYXZlZCBXb3Jrc3BhY2U6XCIsXHJcblx0XHRcdFx0b3BlblRleHQ6IFwiTGF1bmNoXCIsXHJcblx0XHRcdFx0ZGVsZXRlVGV4dDogXCJEZWxldGVcIixcclxuXHRcdFx0XHRzaGFyZVRleHQ6IFwiU2hhcmVcIlxyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGtleTogaWQsXHJcblx0XHRcdHRpdGxlLFxyXG5cdFx0XHRsYWJlbDogXCJXb3Jrc3BhY2VcIixcclxuXHRcdFx0aWNvbjogdGhpcy5fc2V0dGluZ3MuaW1hZ2VzLndvcmtzcGFjZS5yZXBsYWNlKFwie3NjaGVtZX1cIiwgY29sb3JTY2hlbWUgYXMgc3RyaW5nKSxcclxuXHRcdFx0YWN0aW9ucyxcclxuXHRcdFx0ZGF0YToge1xyXG5cdFx0XHRcdHByb3ZpZGVySWQ6IFdvcmtzcGFjZXNQcm92aWRlci5fUFJPVklERVJfSUQsXHJcblx0XHRcdFx0d29ya3NwYWNlVGl0bGU6IHRpdGxlLFxyXG5cdFx0XHRcdHdvcmtzcGFjZUlkOiBpZCxcclxuXHRcdFx0XHR0YWdzOiBbXCJ3b3Jrc3BhY2VcIl1cclxuXHRcdFx0fSxcclxuXHRcdFx0dGVtcGxhdGU6IFwiQ3VzdG9tXCIgYXMgQ0xJVGVtcGxhdGUuQ3VzdG9tLFxyXG5cdFx0XHR0ZW1wbGF0ZUNvbnRlbnQ6IHtcclxuXHRcdFx0XHRsYXlvdXQsXHJcblx0XHRcdFx0ZGF0YVxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBnZXRPdGhlcldvcmtzcGFjZVRlbXBsYXRlKGVuYWJsZVNoYXJlOiBib29sZWFuKTogVGVtcGxhdGVGcmFnbWVudCB7XHJcblx0XHRjb25zdCBhY3Rpb25CdXR0b25zOiBUZW1wbGF0ZUZyYWdtZW50W10gPSBbXHJcblx0XHRcdHtcclxuXHRcdFx0XHR0eXBlOiBcIkJ1dHRvblwiLFxyXG5cdFx0XHRcdHN0eWxlOiB7XHJcblx0XHRcdFx0XHRkaXNwbGF5OiBcImZsZXhcIixcclxuXHRcdFx0XHRcdGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXHJcblx0XHRcdFx0XHR3aWR0aDogXCI4MHB4XCJcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdGFjdGlvbjogV29ya3NwYWNlc1Byb3ZpZGVyLl9BQ1RJT05fTEFVTkNIX1dPUktTUEFDRSxcclxuXHRcdFx0XHRjaGlsZHJlbjogW1xyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHR0eXBlOiBcIlRleHRcIixcclxuXHRcdFx0XHRcdFx0ZGF0YUtleTogXCJvcGVuVGV4dFwiLFxyXG5cdFx0XHRcdFx0XHRvcHRpb25hbDogZmFsc2VcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRdXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHR0eXBlOiBcIkJ1dHRvblwiLFxyXG5cdFx0XHRcdGJ1dHRvblN0eWxlOiBcInByaW1hcnlcIiBhcyBCdXR0b25TdHlsZS5QcmltYXJ5LFxyXG5cdFx0XHRcdHN0eWxlOiB7XHJcblx0XHRcdFx0XHRkaXNwbGF5OiBcImZsZXhcIixcclxuXHRcdFx0XHRcdGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXHJcblx0XHRcdFx0XHR3aWR0aDogXCI4MHB4XCIsXHJcblx0XHRcdFx0XHRtYXJnaW5MZWZ0OiBcIjEwcHhcIixcclxuXHRcdFx0XHRcdG1hcmdpblJpZ2h0OiBcIjEwcHhcIlxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0YWN0aW9uOiBXb3Jrc3BhY2VzUHJvdmlkZXIuX0FDVElPTl9ERUxFVEVfV09SS1NQQUNFLFxyXG5cdFx0XHRcdGNoaWxkcmVuOiBbXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdHR5cGU6IFwiVGV4dFwiLFxyXG5cdFx0XHRcdFx0XHRkYXRhS2V5OiBcImRlbGV0ZVRleHRcIixcclxuXHRcdFx0XHRcdFx0b3B0aW9uYWw6IGZhbHNlXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XVxyXG5cdFx0XHR9XHJcblx0XHRdO1xyXG5cclxuXHRcdGlmIChlbmFibGVTaGFyZSkge1xyXG5cdFx0XHRhY3Rpb25CdXR0b25zLnB1c2goe1xyXG5cdFx0XHRcdHR5cGU6IFwiQnV0dG9uXCIsXHJcblx0XHRcdFx0YnV0dG9uU3R5bGU6IFwicHJpbWFyeVwiIGFzIEJ1dHRvblN0eWxlLlByaW1hcnksXHJcblx0XHRcdFx0c3R5bGU6IHtcclxuXHRcdFx0XHRcdGRpc3BsYXk6IFwiZmxleFwiLFxyXG5cdFx0XHRcdFx0ZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcclxuXHRcdFx0XHRcdHdpZHRoOiBcIjgwcHhcIlxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0YWN0aW9uOiBXb3Jrc3BhY2VzUHJvdmlkZXIuX0FDVElPTl9TSEFSRV9XT1JLU1BBQ0UsXHJcblx0XHRcdFx0Y2hpbGRyZW46IFtcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0dHlwZTogXCJUZXh0XCIsXHJcblx0XHRcdFx0XHRcdGRhdGFLZXk6IFwic2hhcmVUZXh0XCIsXHJcblx0XHRcdFx0XHRcdG9wdGlvbmFsOiBmYWxzZVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdF1cclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0dHlwZTogXCJDb250YWluZXJcIixcclxuXHRcdFx0c3R5bGU6IHtcclxuXHRcdFx0XHRwYWRkaW5nVG9wOiBcIjEwcHhcIixcclxuXHRcdFx0XHRkaXNwbGF5OiBcImZsZXhcIixcclxuXHRcdFx0XHRmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiXHJcblx0XHRcdH0sXHJcblx0XHRcdGNoaWxkcmVuOiBbXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0dHlwZTogXCJUZXh0XCIsXHJcblx0XHRcdFx0XHRkYXRhS2V5OiBcInRpdGxlXCIsXHJcblx0XHRcdFx0XHRzdHlsZToge1xyXG5cdFx0XHRcdFx0XHRmb250V2VpZ2h0OiBcImJvbGRcIixcclxuXHRcdFx0XHRcdFx0Zm9udFNpemU6IFwiMTZweFwiLFxyXG5cdFx0XHRcdFx0XHR0ZXh0QWxpZ246IFwiY2VudGVyXCJcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHR5cGU6IFwiVGV4dFwiLFxyXG5cdFx0XHRcdFx0ZGF0YUtleTogXCJpbnN0cnVjdGlvbnNcIixcclxuXHRcdFx0XHRcdG9wdGlvbmFsOiB0cnVlLFxyXG5cdFx0XHRcdFx0c3R5bGU6IHtcclxuXHRcdFx0XHRcdFx0Zm9udFdlaWdodDogXCJib2xkXCIsXHJcblx0XHRcdFx0XHRcdHBhZGRpbmdUb3A6IFwiMTBweFwiLFxyXG5cdFx0XHRcdFx0XHRwYWRkaW5nQm90dG9tOiBcIjEwcHhcIixcclxuXHRcdFx0XHRcdFx0cGFkZGluZ0xlZnQ6IFwiMTBweFwiLFxyXG5cdFx0XHRcdFx0XHRwYWRkaW5nUmlnaHQ6IFwiMTBweFwiXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHR0eXBlOiBcIkNvbnRhaW5lclwiLFxyXG5cdFx0XHRcdFx0c3R5bGU6IHtcclxuXHRcdFx0XHRcdFx0ZGlzcGxheTogXCJmbGV4XCIsXHJcblx0XHRcdFx0XHRcdGZsZXhGbG93OiBcInJvdyB3cmFwXCIsXHJcblx0XHRcdFx0XHRcdGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxyXG5cdFx0XHRcdFx0XHRwYWRkaW5nVG9wOiBcIjEwcHhcIixcclxuXHRcdFx0XHRcdFx0cGFkZGluZ0JvdHRvbTogXCIxMHB4XCJcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRjaGlsZHJlbjogYWN0aW9uQnV0dG9uc1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XVxyXG5cdFx0fTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgZ2V0Q3VycmVudFdvcmtzcGFjZVRlbXBsYXRlKCk6IFRlbXBsYXRlRnJhZ21lbnQge1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0dHlwZTogXCJDb250YWluZXJcIixcclxuXHRcdFx0c3R5bGU6IHtcclxuXHRcdFx0XHRwYWRkaW5nVG9wOiBcIjEwcHhcIixcclxuXHRcdFx0XHRkaXNwbGF5OiBcImZsZXhcIixcclxuXHRcdFx0XHRmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiXHJcblx0XHRcdH0sXHJcblx0XHRcdGNoaWxkcmVuOiBbXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0dHlwZTogXCJUZXh0XCIsXHJcblx0XHRcdFx0XHRkYXRhS2V5OiBcInRpdGxlXCIsXHJcblx0XHRcdFx0XHRzdHlsZToge1xyXG5cdFx0XHRcdFx0XHRmb250V2VpZ2h0OiBcImJvbGRcIixcclxuXHRcdFx0XHRcdFx0Zm9udFNpemU6IFwiMTZweFwiLFxyXG5cdFx0XHRcdFx0XHR0ZXh0QWxpZ246IFwiY2VudGVyXCJcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHR5cGU6IFwiVGV4dFwiLFxyXG5cdFx0XHRcdFx0ZGF0YUtleTogXCJpbnN0cnVjdGlvbnNcIixcclxuXHRcdFx0XHRcdG9wdGlvbmFsOiB0cnVlLFxyXG5cdFx0XHRcdFx0c3R5bGU6IHtcclxuXHRcdFx0XHRcdFx0Zm9udFdlaWdodDogXCJib2xkXCIsXHJcblx0XHRcdFx0XHRcdHBhZGRpbmdUb3A6IFwiMTBweFwiLFxyXG5cdFx0XHRcdFx0XHRwYWRkaW5nQm90dG9tOiBcIjEwcHhcIixcclxuXHRcdFx0XHRcdFx0cGFkZGluZ0xlZnQ6IFwiMTBweFwiLFxyXG5cdFx0XHRcdFx0XHRwYWRkaW5nUmlnaHQ6IFwiMTBweFwiXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRdXHJcblx0XHR9O1xyXG5cdH1cclxufVxyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IFdvcmtzcGFjZXNQcm92aWRlciB9IGZyb20gXCIuL2ludGVncmF0aW9uXCI7XHJcblxyXG5leHBvcnQgY29uc3QgZW50cnlQb2ludHM6IHsgW2lkOiBzdHJpbmddOiBXb3Jrc3BhY2VzUHJvdmlkZXIgfSA9IHtcclxuXHRpbnRlZ3JhdGlvbnM6IG5ldyBXb3Jrc3BhY2VzUHJvdmlkZXIoKVxyXG59O1xyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=