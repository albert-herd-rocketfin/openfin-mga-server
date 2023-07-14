/******/ var __webpack_modules__ = ({

/***/ "./client/src/modules/endpoints/fdc3-app/endpoint.ts":
/*!***********************************************************!*\
  !*** ./client/src/modules/endpoints/fdc3-app/endpoint.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "initialize": () => (/* binding */ initialize),
/* harmony export */   "requestResponse": () => (/* binding */ requestResponse)
/* harmony export */ });
/* harmony import */ var _fdc3_1_2_helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./fdc3-1-2-helper */ "./client/src/modules/endpoints/fdc3-app/fdc3-1-2-helper.ts");
/* harmony import */ var _fdc3_2_0_helper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./fdc3-2-0-helper */ "./client/src/modules/endpoints/fdc3-app/fdc3-2-0-helper.ts");


let logger;
async function initialize(definition, createLogger, helpers) {
    logger = createLogger("FDC3 App Mapper");
    logger.info("Was passed the following options", definition.data);
}
async function requestResponse(endpointDefinition, request) {
    const results = [];
    if (endpointDefinition.type !== "module") {
        logger.warn(`We only expect endpoints of type module. Unable to action request/response for: ${endpointDefinition.id}`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return results;
    }
    const fdc3Version = endpointDefinition?.options?.fdc3Version ?? "1.2";
    let applications;
    if (Array.isArray(request)) {
        applications = request;
    }
    else {
        applications = request.applications;
    }
    for (let i = 0; i < applications.length; i++) {
        let platformApp;
        if (fdc3Version === "1.2") {
            const passedApp = applications[i];
            platformApp = {
                appId: passedApp.appId,
                title: passedApp.title || passedApp.name,
                manifestType: passedApp.manifestType,
                manifest: _fdc3_1_2_helper__WEBPACK_IMPORTED_MODULE_0__.getManifest(passedApp),
                description: passedApp.description,
                intents: passedApp.intents,
                tags: _fdc3_1_2_helper__WEBPACK_IMPORTED_MODULE_0__.getTags(passedApp),
                version: passedApp.version,
                publisher: passedApp.publisher,
                contactEmail: passedApp.contactEmail,
                supportEmail: passedApp.supportEmail,
                icons: _fdc3_1_2_helper__WEBPACK_IMPORTED_MODULE_0__.getIcons(passedApp.icons),
                images: _fdc3_1_2_helper__WEBPACK_IMPORTED_MODULE_0__.getImages(passedApp.images),
                private: _fdc3_1_2_helper__WEBPACK_IMPORTED_MODULE_0__.getPrivate(passedApp)
            };
        }
        else if (fdc3Version === "2.0") {
            const passedApp = applications[i];
            platformApp = {
                appId: passedApp.appId,
                title: passedApp.title || passedApp.name,
                manifestType: _fdc3_2_0_helper__WEBPACK_IMPORTED_MODULE_1__.getManifestType(passedApp),
                manifest: _fdc3_2_0_helper__WEBPACK_IMPORTED_MODULE_1__.getManifest(passedApp),
                description: passedApp.description,
                intents: _fdc3_2_0_helper__WEBPACK_IMPORTED_MODULE_1__.getIntents(passedApp),
                tags: passedApp.categories,
                version: passedApp.version,
                publisher: passedApp.publisher,
                contactEmail: passedApp.contactEmail,
                supportEmail: passedApp.supportEmail,
                icons: passedApp.icons,
                images: passedApp.screenshots,
                private: _fdc3_2_0_helper__WEBPACK_IMPORTED_MODULE_1__.getPrivate(passedApp)
            };
        }
        if (!Array.isArray(platformApp.icons)) {
            platformApp.icons = [];
        }
        if (platformApp.icons.length === 0 && endpointDefinition.options?.fallbackIcon !== undefined) {
            platformApp.icons.push({ src: endpointDefinition.options.fallbackIcon });
        }
        results.push(platformApp);
    }
    if (applications.length > 0 && results.length === 0) {
        logger.warn(`Unsupported FDC3 version passed: ${fdc3Version}. Unable to map apps.`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return results;
}


/***/ }),

/***/ "./client/src/modules/endpoints/fdc3-app/fdc3-1-2-helper.ts":
/*!******************************************************************!*\
  !*** ./client/src/modules/endpoints/fdc3-app/fdc3-1-2-helper.ts ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getIcons": () => (/* binding */ getIcons),
/* harmony export */   "getImages": () => (/* binding */ getImages),
/* harmony export */   "getManifest": () => (/* binding */ getManifest),
/* harmony export */   "getPrivate": () => (/* binding */ getPrivate),
/* harmony export */   "getTags": () => (/* binding */ getTags)
/* harmony export */ });
function getIcons(icons) {
    const appIcons = [];
    if (!Array.isArray(icons)) {
        return appIcons;
    }
    for (const appIcon of icons) {
        appIcons.push({ src: appIcon.icon });
    }
    return appIcons;
}
function getImages(images) {
    const appImages = [];
    if (!Array.isArray(images)) {
        return appImages;
    }
    for (const appImage of images) {
        appImages.push({ src: appImage.url });
    }
    return appImages;
}
function getManifest(app) {
    if (typeof app.manifest === "string" && app.manifest.startsWith("{")) {
        return JSON.parse(app.manifest);
    }
    return app.manifest;
}
function getTags(app) {
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const tags = app["tags"] ?? [];
    if (tags.length === 0) {
        tags.push(app.manifestType);
    }
    return tags;
}
function getPrivate(app) {
    if (app?.customConfig?.private !== undefined) {
        switch (app?.customConfig?.private) {
            case "False":
            case "false":
            case false:
                return false;
            default:
                // if someone has defined private then the likely hood was to override the default of false.
                return true;
        }
    }
}


/***/ }),

/***/ "./client/src/modules/endpoints/fdc3-app/fdc3-2-0-helper.ts":
/*!******************************************************************!*\
  !*** ./client/src/modules/endpoints/fdc3-app/fdc3-2-0-helper.ts ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getIntents": () => (/* binding */ getIntents),
/* harmony export */   "getManifest": () => (/* binding */ getManifest),
/* harmony export */   "getManifestType": () => (/* binding */ getManifestType),
/* harmony export */   "getPrivate": () => (/* binding */ getPrivate)
/* harmony export */ });
function getManifestType(app) {
    let manifestType;
    switch (app.type) {
        case "web": {
            manifestType = "inline-view";
            break;
        }
        case "native": {
            manifestType = "inline-external";
            break;
        }
        case "onlineNative": {
            manifestType = "desktop-browser";
            break;
        }
        case "other": {
            manifestType = app.hostManifests?.OpenFin?.type;
            break;
        }
        default: {
            manifestType = app.type;
        }
    }
    return manifestType;
}
function getManifest(app) {
    let manifest;
    switch (app.type) {
        case "web": {
            if (app?.details !== undefined) {
                // return fdc3InteropApi 1.2 as the platform currently supports that.
                manifest = {
                    url: (app?.details).url,
                    fdc3InteropApi: "1.2"
                };
            }
            break;
        }
        case "native": {
            if (app?.details !== undefined) {
                // our native api supports path and arguments.
                manifest = app.details;
            }
            break;
        }
        case "onlineNative": {
            if (app?.details !== undefined) {
                manifest = (app?.details).url;
            }
            break;
        }
        case "other": {
            manifest = app.hostManifests?.OpenFin?.details;
            break;
        }
        default: {
            manifest = app.details;
        }
    }
    return manifest;
}
function getIntents(app) {
    const intents = [];
    if (app?.interop?.intents?.listensFor === undefined) {
        return intents;
    }
    const intentIds = Object.keys(app.interop.intents.listensFor);
    for (let i = 0; i < intentIds.length; i++) {
        const intentName = intentIds[i];
        intents.push({
            name: intentName,
            displayName: app.interop.intents.listensFor[intentName].displayName,
            contexts: app.interop.intents.listensFor[intentName].contexts
        });
    }
    return intents;
}
function getPrivate(app) {
    let privateApp;
    if (app?.hostManifests?.OpenFin?.config?.private !== undefined) {
        privateApp = app?.hostManifests?.OpenFin?.config?.private;
    }
    else if (app?.customConfig?.private !== undefined) {
        privateApp = app?.customConfig?.private;
    }
    if (privateApp !== undefined) {
        switch (privateApp) {
            case "False":
            case "false":
            case false:
                return false;
            default:
                // if someone has defined private then the likely hood was to override the default of false.
                return true;
        }
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
/*!********************************************************!*\
  !*** ./client/src/modules/endpoints/fdc3-app/index.ts ***!
  \********************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "entryPoints": () => (/* binding */ entryPoints)
/* harmony export */ });
/* harmony import */ var _endpoint__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./endpoint */ "./client/src/modules/endpoints/fdc3-app/endpoint.ts");

const entryPoints = {
    endpoint: _endpoint__WEBPACK_IMPORTED_MODULE_0__
};

})();

var __webpack_exports__entryPoints = __webpack_exports__.entryPoints;
export { __webpack_exports__entryPoints as entryPoints };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0FBeUMsd0NBQXdDO1VBQ2pGO1VBQ0E7VUFDQTs7Ozs7VUNQQTs7Ozs7VUNBQTtVQUNBO1VBQ0E7VUFDQSx1REFBdUQsaUJBQWlCO1VBQ3hFO1VBQ0EsZ0RBQWdELGFBQWE7VUFDN0Q7Ozs7Ozs7Ozs7Ozs7OztBQ0xxRDtBQUU5QyxNQUFNLFdBQVcsR0FBcUQ7SUFDNUUsUUFBUSxFQUFFLHNDQUFzQjtDQUNoQyxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vb3BlbmZpbi13b3Jrc3BhY2UtLWN1c3RvbWl6ZS13b3Jrc3BhY2UvLi9jbGllbnQvc3JjL21vZHVsZXMvZW5kcG9pbnRzL2ZkYzMtYXBwL2VuZHBvaW50LnRzIiwid2VicGFjazovL29wZW5maW4td29ya3NwYWNlLS1jdXN0b21pemUtd29ya3NwYWNlLy4vY2xpZW50L3NyYy9tb2R1bGVzL2VuZHBvaW50cy9mZGMzLWFwcC9mZGMzLTEtMi1oZWxwZXIudHMiLCJ3ZWJwYWNrOi8vb3BlbmZpbi13b3Jrc3BhY2UtLWN1c3RvbWl6ZS13b3Jrc3BhY2UvLi9jbGllbnQvc3JjL21vZHVsZXMvZW5kcG9pbnRzL2ZkYzMtYXBwL2ZkYzMtMi0wLWhlbHBlci50cyIsIndlYnBhY2s6Ly9vcGVuZmluLXdvcmtzcGFjZS0tY3VzdG9taXplLXdvcmtzcGFjZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9vcGVuZmluLXdvcmtzcGFjZS0tY3VzdG9taXplLXdvcmtzcGFjZS93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vb3BlbmZpbi13b3Jrc3BhY2UtLWN1c3RvbWl6ZS13b3Jrc3BhY2Uvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9vcGVuZmluLXdvcmtzcGFjZS0tY3VzdG9taXplLXdvcmtzcGFjZS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL29wZW5maW4td29ya3NwYWNlLS1jdXN0b21pemUtd29ya3NwYWNlLy4vY2xpZW50L3NyYy9tb2R1bGVzL2VuZHBvaW50cy9mZGMzLWFwcC9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFBsYXRmb3JtQXBwIH0gZnJvbSBcImN1c3RvbWl6ZS13b3Jrc3BhY2Uvc2hhcGVzL2FwcC1zaGFwZXNcIjtcclxuaW1wb3J0IHR5cGUgeyBFbmRwb2ludERlZmluaXRpb24gfSBmcm9tIFwiY3VzdG9taXplLXdvcmtzcGFjZS9zaGFwZXMvZW5kcG9pbnQtc2hhcGVzXCI7XHJcbmltcG9ydCB0eXBlIHsgTG9nZ2VyLCBMb2dnZXJDcmVhdG9yIH0gZnJvbSBcImN1c3RvbWl6ZS13b3Jrc3BhY2Uvc2hhcGVzL2xvZ2dlci1zaGFwZXNcIjtcclxuaW1wb3J0IHR5cGUgeyBNb2R1bGVEZWZpbml0aW9uLCBNb2R1bGVIZWxwZXJzIH0gZnJvbSBcImN1c3RvbWl6ZS13b3Jrc3BhY2Uvc2hhcGVzL21vZHVsZS1zaGFwZXNcIjtcclxuaW1wb3J0ICogYXMgZmRjM09uZVBvaW50VHdvSGVscGVyIGZyb20gXCIuL2ZkYzMtMS0yLWhlbHBlclwiO1xyXG5pbXBvcnQgdHlwZSB7IEFwcERlZmluaXRpb24gYXMgQXBwRGVmaW5pdGlvbk9uZVBvaW50VHdvIH0gZnJvbSBcIi4vZmRjMy0xLTItc2hhcGVzXCI7XHJcbmltcG9ydCAqIGFzIGZkYzNUd29Qb2ludFplcm9IZWxwZXIgZnJvbSBcIi4vZmRjMy0yLTAtaGVscGVyXCI7XHJcbmltcG9ydCB0eXBlIHsgQXBwRGVmaW5pdGlvbiBhcyBBcHBEZWZpbml0aW9uVHdvUG9pbnRaZXJvIH0gZnJvbSBcIi4vZmRjMy0yLTAtc2hhcGVzXCI7XHJcblxyXG5sZXQgbG9nZ2VyOiBMb2dnZXI7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZShcclxuXHRkZWZpbml0aW9uOiBNb2R1bGVEZWZpbml0aW9uLFxyXG5cdGNyZWF0ZUxvZ2dlcjogTG9nZ2VyQ3JlYXRvcixcclxuXHRoZWxwZXJzOiBNb2R1bGVIZWxwZXJzXHJcbikge1xyXG5cdGxvZ2dlciA9IGNyZWF0ZUxvZ2dlcihcIkZEQzMgQXBwIE1hcHBlclwiKTtcclxuXHRsb2dnZXIuaW5mbyhcIldhcyBwYXNzZWQgdGhlIGZvbGxvd2luZyBvcHRpb25zXCIsIGRlZmluaXRpb24uZGF0YSk7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZXF1ZXN0UmVzcG9uc2UoXHJcblx0ZW5kcG9pbnREZWZpbml0aW9uOiBFbmRwb2ludERlZmluaXRpb248e1xyXG5cdFx0ZmRjM1ZlcnNpb246IHN0cmluZztcclxuXHRcdGZhbGxiYWNrSWNvbjogc3RyaW5nO1xyXG5cdH0+LFxyXG5cdHJlcXVlc3Q/OiB1bmtub3duW10gfCB7IGFwcGxpY2F0aW9uczogdW5rbm93bltdIH1cclxuKTogUHJvbWlzZTxQbGF0Zm9ybUFwcFtdPiB7XHJcblx0Y29uc3QgcmVzdWx0czogUGxhdGZvcm1BcHBbXSA9IFtdO1xyXG5cclxuXHRpZiAoZW5kcG9pbnREZWZpbml0aW9uLnR5cGUgIT09IFwibW9kdWxlXCIpIHtcclxuXHRcdGxvZ2dlci53YXJuKFxyXG5cdFx0XHRgV2Ugb25seSBleHBlY3QgZW5kcG9pbnRzIG9mIHR5cGUgbW9kdWxlLiBVbmFibGUgdG8gYWN0aW9uIHJlcXVlc3QvcmVzcG9uc2UgZm9yOiAke2VuZHBvaW50RGVmaW5pdGlvbi5pZH1gXHJcblx0XHQpO1xyXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnNhZmUtcmV0dXJuXHJcblx0XHRyZXR1cm4gcmVzdWx0cztcclxuXHR9XHJcblx0Y29uc3QgZmRjM1ZlcnNpb24gPSBlbmRwb2ludERlZmluaXRpb24/Lm9wdGlvbnM/LmZkYzNWZXJzaW9uID8/IFwiMS4yXCI7XHJcblx0bGV0IGFwcGxpY2F0aW9ucztcclxuXHJcblx0aWYgKEFycmF5LmlzQXJyYXkocmVxdWVzdCkpIHtcclxuXHRcdGFwcGxpY2F0aW9ucyA9IHJlcXVlc3Q7XHJcblx0fSBlbHNlIHtcclxuXHRcdGFwcGxpY2F0aW9ucyA9IHJlcXVlc3QuYXBwbGljYXRpb25zO1xyXG5cdH1cclxuXHRmb3IgKGxldCBpID0gMDsgaSA8IGFwcGxpY2F0aW9ucy5sZW5ndGg7IGkrKykge1xyXG5cdFx0bGV0IHBsYXRmb3JtQXBwOiBQbGF0Zm9ybUFwcDtcclxuXHRcdGlmIChmZGMzVmVyc2lvbiA9PT0gXCIxLjJcIikge1xyXG5cdFx0XHRjb25zdCBwYXNzZWRBcHA6IEFwcERlZmluaXRpb25PbmVQb2ludFR3byA9IGFwcGxpY2F0aW9uc1tpXSBhcyBBcHBEZWZpbml0aW9uT25lUG9pbnRUd287XHJcblx0XHRcdHBsYXRmb3JtQXBwID0ge1xyXG5cdFx0XHRcdGFwcElkOiBwYXNzZWRBcHAuYXBwSWQsXHJcblx0XHRcdFx0dGl0bGU6IHBhc3NlZEFwcC50aXRsZSB8fCBwYXNzZWRBcHAubmFtZSxcclxuXHRcdFx0XHRtYW5pZmVzdFR5cGU6IHBhc3NlZEFwcC5tYW5pZmVzdFR5cGUsXHJcblx0XHRcdFx0bWFuaWZlc3Q6IGZkYzNPbmVQb2ludFR3b0hlbHBlci5nZXRNYW5pZmVzdChwYXNzZWRBcHApIGFzIHN0cmluZyxcclxuXHRcdFx0XHRkZXNjcmlwdGlvbjogcGFzc2VkQXBwLmRlc2NyaXB0aW9uLFxyXG5cdFx0XHRcdGludGVudHM6IHBhc3NlZEFwcC5pbnRlbnRzLFxyXG5cdFx0XHRcdHRhZ3M6IGZkYzNPbmVQb2ludFR3b0hlbHBlci5nZXRUYWdzKHBhc3NlZEFwcCksXHJcblx0XHRcdFx0dmVyc2lvbjogcGFzc2VkQXBwLnZlcnNpb24sXHJcblx0XHRcdFx0cHVibGlzaGVyOiBwYXNzZWRBcHAucHVibGlzaGVyLFxyXG5cdFx0XHRcdGNvbnRhY3RFbWFpbDogcGFzc2VkQXBwLmNvbnRhY3RFbWFpbCxcclxuXHRcdFx0XHRzdXBwb3J0RW1haWw6IHBhc3NlZEFwcC5zdXBwb3J0RW1haWwsXHJcblx0XHRcdFx0aWNvbnM6IGZkYzNPbmVQb2ludFR3b0hlbHBlci5nZXRJY29ucyhwYXNzZWRBcHAuaWNvbnMpLFxyXG5cdFx0XHRcdGltYWdlczogZmRjM09uZVBvaW50VHdvSGVscGVyLmdldEltYWdlcyhwYXNzZWRBcHAuaW1hZ2VzKSxcclxuXHRcdFx0XHRwcml2YXRlOiBmZGMzT25lUG9pbnRUd29IZWxwZXIuZ2V0UHJpdmF0ZShwYXNzZWRBcHApXHJcblx0XHRcdH07XHJcblx0XHR9IGVsc2UgaWYgKGZkYzNWZXJzaW9uID09PSBcIjIuMFwiKSB7XHJcblx0XHRcdGNvbnN0IHBhc3NlZEFwcDogQXBwRGVmaW5pdGlvblR3b1BvaW50WmVybyA9IGFwcGxpY2F0aW9uc1tpXSBhcyBBcHBEZWZpbml0aW9uVHdvUG9pbnRaZXJvO1xyXG5cdFx0XHRwbGF0Zm9ybUFwcCA9IHtcclxuXHRcdFx0XHRhcHBJZDogcGFzc2VkQXBwLmFwcElkLFxyXG5cdFx0XHRcdHRpdGxlOiBwYXNzZWRBcHAudGl0bGUgfHwgcGFzc2VkQXBwLm5hbWUsXHJcblx0XHRcdFx0bWFuaWZlc3RUeXBlOiBmZGMzVHdvUG9pbnRaZXJvSGVscGVyLmdldE1hbmlmZXN0VHlwZShwYXNzZWRBcHApLFxyXG5cdFx0XHRcdG1hbmlmZXN0OiBmZGMzVHdvUG9pbnRaZXJvSGVscGVyLmdldE1hbmlmZXN0KHBhc3NlZEFwcCkgYXMgc3RyaW5nLFxyXG5cdFx0XHRcdGRlc2NyaXB0aW9uOiBwYXNzZWRBcHAuZGVzY3JpcHRpb24sXHJcblx0XHRcdFx0aW50ZW50czogZmRjM1R3b1BvaW50WmVyb0hlbHBlci5nZXRJbnRlbnRzKHBhc3NlZEFwcCksXHJcblx0XHRcdFx0dGFnczogcGFzc2VkQXBwLmNhdGVnb3JpZXMsXHJcblx0XHRcdFx0dmVyc2lvbjogcGFzc2VkQXBwLnZlcnNpb24sXHJcblx0XHRcdFx0cHVibGlzaGVyOiBwYXNzZWRBcHAucHVibGlzaGVyLFxyXG5cdFx0XHRcdGNvbnRhY3RFbWFpbDogcGFzc2VkQXBwLmNvbnRhY3RFbWFpbCxcclxuXHRcdFx0XHRzdXBwb3J0RW1haWw6IHBhc3NlZEFwcC5zdXBwb3J0RW1haWwsXHJcblx0XHRcdFx0aWNvbnM6IHBhc3NlZEFwcC5pY29ucyxcclxuXHRcdFx0XHRpbWFnZXM6IHBhc3NlZEFwcC5zY3JlZW5zaG90cyxcclxuXHRcdFx0XHRwcml2YXRlOiBmZGMzVHdvUG9pbnRaZXJvSGVscGVyLmdldFByaXZhdGUocGFzc2VkQXBwKVxyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KHBsYXRmb3JtQXBwLmljb25zKSkge1xyXG5cdFx0XHRwbGF0Zm9ybUFwcC5pY29ucyA9IFtdO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHBsYXRmb3JtQXBwLmljb25zLmxlbmd0aCA9PT0gMCAmJiBlbmRwb2ludERlZmluaXRpb24ub3B0aW9ucz8uZmFsbGJhY2tJY29uICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0cGxhdGZvcm1BcHAuaWNvbnMucHVzaCh7IHNyYzogZW5kcG9pbnREZWZpbml0aW9uLm9wdGlvbnMuZmFsbGJhY2tJY29uIH0pO1xyXG5cdFx0fVxyXG5cdFx0cmVzdWx0cy5wdXNoKHBsYXRmb3JtQXBwKTtcclxuXHR9XHJcblx0aWYgKGFwcGxpY2F0aW9ucy5sZW5ndGggPiAwICYmIHJlc3VsdHMubGVuZ3RoID09PSAwKSB7XHJcblx0XHRsb2dnZXIud2FybihgVW5zdXBwb3J0ZWQgRkRDMyB2ZXJzaW9uIHBhc3NlZDogJHtmZGMzVmVyc2lvbn0uIFVuYWJsZSB0byBtYXAgYXBwcy5gKTtcclxuXHR9XHJcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnNhZmUtcmV0dXJuXHJcblx0cmV0dXJuIHJlc3VsdHM7XHJcbn1cclxuIiwiaW1wb3J0IHR5cGUgeyBJbWFnZSB9IGZyb20gXCJAb3BlbmZpbi93b3Jrc3BhY2VcIjtcclxuaW1wb3J0IHR5cGUgeyBBcHBEZWZpbml0aW9uLCBBcHBJY29uLCBBcHBJbWFnZSB9IGZyb20gXCIuL2ZkYzMtMS0yLXNoYXBlc1wiO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEljb25zKGljb25zOiBBcHBJY29uW10pOiBJbWFnZVtdIHtcclxuXHRjb25zdCBhcHBJY29uczogSW1hZ2VbXSA9IFtdO1xyXG5cdGlmICghQXJyYXkuaXNBcnJheShpY29ucykpIHtcclxuXHRcdHJldHVybiBhcHBJY29ucztcclxuXHR9XHJcblx0Zm9yIChjb25zdCBhcHBJY29uIG9mIGljb25zKSB7XHJcblx0XHRhcHBJY29ucy5wdXNoKHsgc3JjOiBhcHBJY29uLmljb24gfSk7XHJcblx0fVxyXG5cdHJldHVybiBhcHBJY29ucztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEltYWdlcyhpbWFnZXM6IEFwcEltYWdlW10pOiBJbWFnZVtdIHtcclxuXHRjb25zdCBhcHBJbWFnZXM6IEltYWdlW10gPSBbXTtcclxuXHRpZiAoIUFycmF5LmlzQXJyYXkoaW1hZ2VzKSkge1xyXG5cdFx0cmV0dXJuIGFwcEltYWdlcztcclxuXHR9XHJcblx0Zm9yIChjb25zdCBhcHBJbWFnZSBvZiBpbWFnZXMpIHtcclxuXHRcdGFwcEltYWdlcy5wdXNoKHsgc3JjOiBhcHBJbWFnZS51cmwgfSk7XHJcblx0fVxyXG5cdHJldHVybiBhcHBJbWFnZXM7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRNYW5pZmVzdChhcHA6IEFwcERlZmluaXRpb24pOiB1bmtub3duIHtcclxuXHRpZiAodHlwZW9mIGFwcC5tYW5pZmVzdCA9PT0gXCJzdHJpbmdcIiAmJiBhcHAubWFuaWZlc3Quc3RhcnRzV2l0aChcIntcIikpIHtcclxuXHRcdHJldHVybiBKU09OLnBhcnNlKGFwcC5tYW5pZmVzdCk7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gYXBwLm1hbmlmZXN0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGFncyhhcHA6IEFwcERlZmluaXRpb24pOiBzdHJpbmdbXSB7XHJcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9kb3Qtbm90YXRpb25cclxuXHRjb25zdCB0YWdzOiBzdHJpbmdbXSA9IGFwcFtcInRhZ3NcIl0gPz8gW107XHJcblx0aWYgKHRhZ3MubGVuZ3RoID09PSAwKSB7XHJcblx0XHR0YWdzLnB1c2goYXBwLm1hbmlmZXN0VHlwZSk7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gdGFncztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFByaXZhdGUoYXBwOiBBcHBEZWZpbml0aW9uKTogYm9vbGVhbiB7XHJcblx0aWYgKGFwcD8uY3VzdG9tQ29uZmlnPy5wcml2YXRlICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdHN3aXRjaCAoYXBwPy5jdXN0b21Db25maWc/LnByaXZhdGUpIHtcclxuXHRcdFx0Y2FzZSBcIkZhbHNlXCI6XHJcblx0XHRcdGNhc2UgXCJmYWxzZVwiOlxyXG5cdFx0XHRjYXNlIGZhbHNlOlxyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvLyBpZiBzb21lb25lIGhhcyBkZWZpbmVkIHByaXZhdGUgdGhlbiB0aGUgbGlrZWx5IGhvb2Qgd2FzIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0IG9mIGZhbHNlLlxyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG4iLCJpbXBvcnQgdHlwZSB7IEFwcEludGVudCB9IGZyb20gXCJAb3BlbmZpbi93b3Jrc3BhY2VcIjtcclxuaW1wb3J0IHR5cGUge1xyXG5cdEFwcERlZmluaXRpb24sXHJcblx0V2ViQXBwRGV0YWlscyxcclxuXHROYXRpdmVBcHBEZXRhaWxzLFxyXG5cdE9ubGluZU5hdGl2ZUFwcERldGFpbHNcclxufSBmcm9tIFwiLi9mZGMzLTItMC1zaGFwZXNcIjtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRNYW5pZmVzdFR5cGUoYXBwOiBBcHBEZWZpbml0aW9uKTogc3RyaW5nIHtcclxuXHRsZXQgbWFuaWZlc3RUeXBlOiBzdHJpbmc7XHJcblxyXG5cdHN3aXRjaCAoYXBwLnR5cGUpIHtcclxuXHRcdGNhc2UgXCJ3ZWJcIjoge1xyXG5cdFx0XHRtYW5pZmVzdFR5cGUgPSBcImlubGluZS12aWV3XCI7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cdFx0Y2FzZSBcIm5hdGl2ZVwiOiB7XHJcblx0XHRcdG1hbmlmZXN0VHlwZSA9IFwiaW5saW5lLWV4dGVybmFsXCI7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cdFx0Y2FzZSBcIm9ubGluZU5hdGl2ZVwiOiB7XHJcblx0XHRcdG1hbmlmZXN0VHlwZSA9IFwiZGVza3RvcC1icm93c2VyXCI7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cdFx0Y2FzZSBcIm90aGVyXCI6IHtcclxuXHRcdFx0bWFuaWZlc3RUeXBlID0gYXBwLmhvc3RNYW5pZmVzdHM/Lk9wZW5GaW4/LnR5cGU7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cdFx0ZGVmYXVsdDoge1xyXG5cdFx0XHRtYW5pZmVzdFR5cGUgPSBhcHAudHlwZTtcclxuXHRcdH1cclxuXHR9XHJcblx0cmV0dXJuIG1hbmlmZXN0VHlwZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldE1hbmlmZXN0KGFwcDogQXBwRGVmaW5pdGlvbik6IHVua25vd24ge1xyXG5cdGxldCBtYW5pZmVzdDogc3RyaW5nIHwgdW5rbm93bjtcclxuXHJcblx0c3dpdGNoIChhcHAudHlwZSkge1xyXG5cdFx0Y2FzZSBcIndlYlwiOiB7XHJcblx0XHRcdGlmIChhcHA/LmRldGFpbHMgIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdC8vIHJldHVybiBmZGMzSW50ZXJvcEFwaSAxLjIgYXMgdGhlIHBsYXRmb3JtIGN1cnJlbnRseSBzdXBwb3J0cyB0aGF0LlxyXG5cdFx0XHRcdG1hbmlmZXN0ID0ge1xyXG5cdFx0XHRcdFx0dXJsOiAoYXBwPy5kZXRhaWxzIGFzIFdlYkFwcERldGFpbHMpLnVybCxcclxuXHRcdFx0XHRcdGZkYzNJbnRlcm9wQXBpOiBcIjEuMlwiXHJcblx0XHRcdFx0fTtcclxuXHRcdFx0fVxyXG5cdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHRcdGNhc2UgXCJuYXRpdmVcIjoge1xyXG5cdFx0XHRpZiAoYXBwPy5kZXRhaWxzICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHQvLyBvdXIgbmF0aXZlIGFwaSBzdXBwb3J0cyBwYXRoIGFuZCBhcmd1bWVudHMuXHJcblx0XHRcdFx0bWFuaWZlc3QgPSBhcHAuZGV0YWlscyBhcyBOYXRpdmVBcHBEZXRhaWxzO1xyXG5cdFx0XHR9XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cdFx0Y2FzZSBcIm9ubGluZU5hdGl2ZVwiOiB7XHJcblx0XHRcdGlmIChhcHA/LmRldGFpbHMgIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdG1hbmlmZXN0ID0gKGFwcD8uZGV0YWlscyBhcyBPbmxpbmVOYXRpdmVBcHBEZXRhaWxzKS51cmw7XHJcblx0XHRcdH1cclxuXHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblx0XHRjYXNlIFwib3RoZXJcIjoge1xyXG5cdFx0XHRtYW5pZmVzdCA9IGFwcC5ob3N0TWFuaWZlc3RzPy5PcGVuRmluPy5kZXRhaWxzO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHRcdGRlZmF1bHQ6IHtcclxuXHRcdFx0bWFuaWZlc3QgPSBhcHAuZGV0YWlscztcclxuXHRcdH1cclxuXHR9XHJcblx0cmV0dXJuIG1hbmlmZXN0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW50ZW50cyhhcHA6IEFwcERlZmluaXRpb24pOiBBcHBJbnRlbnRbXSB7XHJcblx0Y29uc3QgaW50ZW50czogQXBwSW50ZW50W10gPSBbXTtcclxuXHJcblx0aWYgKGFwcD8uaW50ZXJvcD8uaW50ZW50cz8ubGlzdGVuc0ZvciA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRyZXR1cm4gaW50ZW50cztcclxuXHR9XHJcblxyXG5cdGNvbnN0IGludGVudElkcyA9IE9iamVjdC5rZXlzKGFwcC5pbnRlcm9wLmludGVudHMubGlzdGVuc0Zvcik7XHJcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBpbnRlbnRJZHMubGVuZ3RoOyBpKyspIHtcclxuXHRcdGNvbnN0IGludGVudE5hbWUgPSBpbnRlbnRJZHNbaV07XHJcblx0XHRpbnRlbnRzLnB1c2goe1xyXG5cdFx0XHRuYW1lOiBpbnRlbnROYW1lLFxyXG5cdFx0XHRkaXNwbGF5TmFtZTogYXBwLmludGVyb3AuaW50ZW50cy5saXN0ZW5zRm9yW2ludGVudE5hbWVdLmRpc3BsYXlOYW1lLFxyXG5cdFx0XHRjb250ZXh0czogYXBwLmludGVyb3AuaW50ZW50cy5saXN0ZW5zRm9yW2ludGVudE5hbWVdLmNvbnRleHRzXHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHJldHVybiBpbnRlbnRzO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJpdmF0ZShhcHA6IEFwcERlZmluaXRpb24pOiBib29sZWFuIHtcclxuXHRsZXQgcHJpdmF0ZUFwcDogdW5rbm93bjtcclxuXHJcblx0aWYgKGFwcD8uaG9zdE1hbmlmZXN0cz8uT3BlbkZpbj8uY29uZmlnPy5wcml2YXRlICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdHByaXZhdGVBcHAgPSBhcHA/Lmhvc3RNYW5pZmVzdHM/Lk9wZW5GaW4/LmNvbmZpZz8ucHJpdmF0ZTtcclxuXHR9IGVsc2UgaWYgKGFwcD8uY3VzdG9tQ29uZmlnPy5wcml2YXRlICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdHByaXZhdGVBcHAgPSBhcHA/LmN1c3RvbUNvbmZpZz8ucHJpdmF0ZTtcclxuXHR9XHJcblxyXG5cdGlmIChwcml2YXRlQXBwICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdHN3aXRjaCAocHJpdmF0ZUFwcCkge1xyXG5cdFx0XHRjYXNlIFwiRmFsc2VcIjpcclxuXHRcdFx0Y2FzZSBcImZhbHNlXCI6XHJcblx0XHRcdGNhc2UgZmFsc2U6XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdC8vIGlmIHNvbWVvbmUgaGFzIGRlZmluZWQgcHJpdmF0ZSB0aGVuIHRoZSBsaWtlbHkgaG9vZCB3YXMgdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHQgb2YgZmFsc2UuXHJcblx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHR5cGUgeyBNb2R1bGVJbXBsZW1lbnRhdGlvbiwgTW9kdWxlVHlwZXMgfSBmcm9tIFwiY3VzdG9taXplLXdvcmtzcGFjZS9zaGFwZXMvbW9kdWxlLXNoYXBlc1wiO1xyXG5pbXBvcnQgKiBhcyBlbmRwb2ludEltcGxlbWVudGF0aW9uIGZyb20gXCIuL2VuZHBvaW50XCI7XHJcblxyXG5leHBvcnQgY29uc3QgZW50cnlQb2ludHM6IHsgW3R5cGUgaW4gTW9kdWxlVHlwZXNdPzogTW9kdWxlSW1wbGVtZW50YXRpb24gfSA9IHtcclxuXHRlbmRwb2ludDogZW5kcG9pbnRJbXBsZW1lbnRhdGlvblxyXG59O1xyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=