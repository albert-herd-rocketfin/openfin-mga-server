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

/***/ "./client/src/modules/auth/example/auth.ts":
/*!*************************************************!*\
  !*** ./client/src/modules/auth/example/auth.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getUserInfo": () => (/* binding */ getUserInfo),
/* harmony export */   "initialize": () => (/* binding */ initialize),
/* harmony export */   "isAuthenticationRequired": () => (/* binding */ isAuthenticationRequired),
/* harmony export */   "login": () => (/* binding */ login),
/* harmony export */   "logout": () => (/* binding */ logout),
/* harmony export */   "subscribe": () => (/* binding */ subscribe),
/* harmony export */   "unsubscribe": () => (/* binding */ unsubscribe)
/* harmony export */ });
/* harmony import */ var _framework_uuid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../framework/uuid */ "./client/src/framework/uuid.ts");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util */ "./client/src/modules/auth/example/util.ts");


let authenticated;
let authOptions;
let currentUser;
let sessionExpiryCheckId;
let logger;
const subscribeIdMap = {};
const loggedInSubscribers = new Map();
const beforeLoggedOutSubscribers = new Map();
const loggedOutSubscribers = new Map();
const sessionExpiredSubscribers = new Map();
const EXAMPLE_AUTH_AUTHENTICATED_KEY = `${fin.me.identity.uuid}-EXAMPLE_AUTH_IS_AUTHENTICATED`;
async function openLoginWindow(url) {
    const enrichedCustomData = { currentUserKey: _util__WEBPACK_IMPORTED_MODULE_1__.EXAMPLE_AUTH_CURRENT_USER_KEY, ...authOptions?.customData };
    return fin.Window.create({
        name: "example-auth-log-in",
        alwaysOnTop: true,
        maximizable: false,
        minimizable: false,
        autoShow: false,
        defaultCentered: true,
        defaultHeight: authOptions.loginHeight ?? 325,
        defaultWidth: authOptions.loginWidth ?? 400,
        includeInSnapshots: false,
        resizable: false,
        showTaskbarIcon: false,
        saveWindowState: false,
        url,
        customData: enrichedCustomData
    });
}
async function openLogoutWindow(url) {
    return fin.Window.create({
        name: "example-auth-log-out",
        maximizable: false,
        minimizable: false,
        autoShow: false,
        defaultCentered: true,
        defaultHeight: authOptions.loginHeight ?? 325,
        defaultWidth: authOptions.loginWidth ?? 400,
        includeInSnapshots: false,
        resizable: false,
        showTaskbarIcon: false,
        saveWindowState: false,
        url
    });
}
async function checkAuth(url) {
    const windowToCheck = await fin.Window.create({
        name: "example-auth-check-window",
        alwaysOnTop: true,
        maximizable: false,
        minimizable: false,
        autoShow: false,
        defaultHeight: authOptions.loginHeight ?? 325,
        defaultWidth: authOptions.loginWidth ?? 400,
        includeInSnapshots: false,
        resizable: false,
        showTaskbarIcon: false,
        saveWindowState: false,
        url
    });
    let isAuthenticated = false;
    try {
        const info = await windowToCheck.getInfo();
        if (info.url === authOptions.authenticatedUrl) {
            isAuthenticated = true;
        }
    }
    catch (error) {
        logger.error("Error encountered while checking session", error);
    }
    finally {
        if (windowToCheck !== undefined) {
            await windowToCheck.close(true);
        }
    }
    return isAuthenticated;
}
async function getAuthenticationFromUser() {
    return new Promise((resolve, reject) => {
        openLoginWindow(authOptions.loginUrl)
            .then(async (win) => {
            const authMatch = new RegExp(authOptions.authenticatedUrl, "i");
            try {
                if (win !== undefined) {
                    const info = await win.getInfo();
                    if (authMatch.test(info.url)) {
                        await win.close(true);
                        return resolve(true);
                    }
                    await win.show(true);
                }
            }
            catch (error) {
                logger.error(`Error while checking if login window automatically redirected. Error ${error.message}`);
                if (win !== undefined) {
                    await win.show(true);
                }
            }
            let statusCheck;
            await win.addListener("closed", async () => {
                if (win) {
                    window.clearInterval(statusCheck);
                    statusCheck = undefined;
                    logger.info("Auth Window cancelled by user");
                    win = undefined;
                    return resolve(false);
                }
            });
            statusCheck = window.setInterval(async () => {
                if (win !== undefined) {
                    const info = await win.getInfo();
                    if (authMatch.test(info.url)) {
                        window.clearInterval(statusCheck);
                        await win.removeAllListeners();
                        await win.close(true);
                        return resolve(true);
                    }
                }
                else {
                    return resolve(false);
                }
            }, authOptions.checkLoginStatusInSeconds ?? 1 * 1000);
            return true;
        })
            .catch((error) => {
            logger.error("Error while trying to authenticate the user", error);
        });
    });
}
function checkForSessionExpiry(force = false) {
    if (authOptions?.checkSessionValidityInSeconds !== undefined &&
        authOptions?.checkSessionValidityInSeconds > -1 &&
        sessionExpiryCheckId === undefined) {
        sessionExpiryCheckId = setTimeout(async () => {
            sessionExpiryCheckId = undefined;
            const stillAuthenticated = await checkAuth(authOptions.loginUrl);
            if (stillAuthenticated) {
                logger.info("Session Still Active");
                checkForSessionExpiry();
            }
            else {
                logger.info("Session not valid. Killing session and notifying registered callback that authentication is required. This check is configured in the data for this example auth module. Set checkSessionValidityInSeconds to -1 in the authProvider module definition if you wish to disable this check");
                authenticated = false;
                localStorage.removeItem(EXAMPLE_AUTH_AUTHENTICATED_KEY);
                (0,_util__WEBPACK_IMPORTED_MODULE_1__.clearCurrentUser)();
                await notifySubscribers("session-expired", sessionExpiredSubscribers);
            }
        }, authOptions.checkSessionValidityInSeconds * 1000);
    }
}
async function notifySubscribers(eventType, subscribers) {
    const subscriberIds = Array.from(subscribers.keys());
    subscriberIds.reverse();
    for (let i = 0; i < subscriberIds.length; i++) {
        const subscriberId = subscriberIds[i];
        logger.info(`Notifying subscriber with subscription Id: ${subscriberId} of event type: ${eventType}`);
        await subscribers.get(subscriberId)();
    }
}
async function handleLogout(resolve) {
    if (authenticated === undefined || !authenticated) {
        logger.error("You have requested to log out but are not logged in");
        resolve(false);
        return;
    }
    logger.info("Log out requested");
    await notifySubscribers("before-logged-out", beforeLoggedOutSubscribers);
    authenticated = false;
    localStorage.removeItem(EXAMPLE_AUTH_AUTHENTICATED_KEY);
    (0,_util__WEBPACK_IMPORTED_MODULE_1__.clearCurrentUser)();
    if (authOptions.logoutUrl !== undefined &&
        authOptions.logoutUrl !== null &&
        authOptions.logoutUrl.trim().length > 0) {
        try {
            const win = await openLogoutWindow(authOptions.logoutUrl);
            setTimeout(async () => {
                await win.close();
                await notifySubscribers("logged-out", loggedOutSubscribers);
                resolve(true);
            }, 2000);
        }
        catch (error) {
            logger.error(`Error while launching logout window. ${error}`);
            return resolve(false);
        }
    }
    else {
        await notifySubscribers("logged-out", loggedOutSubscribers);
        resolve(true);
    }
}
async function initialize(definition, createLogger, helpers) {
    logger = createLogger("AuthExample");
    if (authOptions === undefined) {
        logger.info(`Setting options: ${JSON.stringify(definition.data, null, 4)}`);
        authOptions = definition.data;
        authenticated = Boolean(localStorage.getItem(EXAMPLE_AUTH_AUTHENTICATED_KEY));
        if (authenticated) {
            currentUser = (0,_util__WEBPACK_IMPORTED_MODULE_1__.getCurrentUser)();
            checkForSessionExpiry();
        }
    }
    else {
        logger.warn("Options have already been set as init has already been called");
    }
}
function subscribe(to, callback) {
    const key = (0,_framework_uuid__WEBPACK_IMPORTED_MODULE_0__.randomUUID)();
    let matchFound = false;
    switch (to) {
        case "logged-in": {
            matchFound = true;
            loggedInSubscribers.set(key, callback);
            break;
        }
        case "before-logged-out": {
            matchFound = true;
            beforeLoggedOutSubscribers.set(key, callback);
            break;
        }
        case "logged-out": {
            matchFound = true;
            loggedOutSubscribers.set(key, callback);
            break;
        }
        case "session-expired": {
            matchFound = true;
            sessionExpiredSubscribers.set(key, callback);
            break;
        }
    }
    if (matchFound) {
        subscribeIdMap[key] = to;
        logger.info(`Subscription to ${to} events registered. Subscription Id: ${key}`);
        return key;
    }
    return null;
}
function unsubscribe(from) {
    let matchFound = false;
    const eventType = subscribeIdMap[from];
    if (eventType === undefined) {
        logger.warn(`You have tried to unsubscribe with a key ${from} that is invalid`);
        return false;
    }
    switch (eventType) {
        case "logged-in": {
            matchFound = true;
            loggedInSubscribers.delete(from);
            break;
        }
        case "before-logged-out": {
            matchFound = true;
            beforeLoggedOutSubscribers.delete(from);
            break;
        }
        case "logged-out": {
            matchFound = true;
            loggedOutSubscribers.delete(from);
            break;
        }
        case "session-expired": {
            matchFound = true;
            sessionExpiredSubscribers.delete(from);
            break;
        }
    }
    delete subscribeIdMap[from];
    if (matchFound) {
        logger.info(`Subscription to ${eventType} events with subscription Id: ${from} has been cleared`);
        return true;
    }
    logger.warn(`Subscription to ${eventType} events with subscription Id: ${from} could not be cleared as we do not have a register of that event type.`);
    return false;
}
async function login() {
    logger.info("login requested");
    if (authenticated) {
        logger.info("User already authenticated");
        return authenticated;
    }
    if (authOptions.autoLogin) {
        logger.info("autoLogin enabled in auth provide module settings. Fake logged in");
        authenticated = true;
    }
    else {
        authenticated = await getAuthenticationFromUser();
    }
    if (authenticated) {
        localStorage.setItem(EXAMPLE_AUTH_AUTHENTICATED_KEY, authenticated.toString());
        checkForSessionExpiry();
        await notifySubscribers("logged-in", loggedInSubscribers);
    }
    else {
        (0,_util__WEBPACK_IMPORTED_MODULE_1__.clearCurrentUser)();
    }
    return authenticated;
}
async function logout() {
    return new Promise((resolve, reject) => {
        handleLogout(resolve)
            .then(async () => {
            logger.info("Log out called");
            return true;
        })
            .catch(async (error) => {
            logger.error(`Error while trying to log out ${error}`);
        });
    });
}
async function isAuthenticationRequired() {
    if (authenticated === undefined) {
        authenticated = false;
    }
    return !authenticated;
}
async function getUserInfo() {
    if (authenticated === undefined || !authenticated) {
        logger.warn("Unable to retrieve user info unless the user is authenticated");
        return null;
    }
    logger.info("This example returns a user if it was provided to the example login");
    return currentUser;
}


/***/ }),

/***/ "./client/src/modules/auth/example/endpoint.ts":
/*!*****************************************************!*\
  !*** ./client/src/modules/auth/example/endpoint.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "initialize": () => (/* binding */ initialize),
/* harmony export */   "requestResponse": () => (/* binding */ requestResponse)
/* harmony export */ });
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util */ "./client/src/modules/auth/example/util.ts");

let logger;
let roleMapping;
let definitionData;
function getRequestOptions(url, options, request) {
    if (options.method === "GET") {
        if (request !== undefined) {
            const keys = Object.keys(request);
            if (keys.length > 0) {
                const length = keys.length;
                for (let i = 0; i < length; i++) {
                    url = url.replace(`[${keys[i]}]`, encodeURIComponent(request[keys[i]]));
                }
            }
        }
    }
    else if (options.method === "POST" && request !== undefined) {
        options.body = JSON.stringify(request);
    }
    return { url, options };
}
function applyCurrentUserToApps(apps = []) {
    const currentUser = (0,_util__WEBPACK_IMPORTED_MODULE_0__.getCurrentUser)();
    if (currentUser === null ||
        roleMapping === undefined ||
        roleMapping[currentUser.role] === undefined ||
        roleMapping[currentUser.role].excludeAppsWithTag === undefined) {
        return apps;
    }
    const excludeTag = roleMapping[currentUser.role].excludeAppsWithTag;
    const filteredApps = [];
    for (let i = 0; i < apps.length; i++) {
        if (Array.isArray(apps[i].tags)) {
            let include = true;
            for (let t = 0; t < apps[i].tags.length; t++) {
                const tag = apps[i].tags[t];
                if (excludeTag.includes(tag)) {
                    include = false;
                    break;
                }
            }
            if (include) {
                filteredApps.push(apps[i]);
            }
        }
        else {
            filteredApps.push(apps[i]);
        }
    }
    return filteredApps;
}
function applyCurrentUserToSettings(settings) {
    const currentUser = (0,_util__WEBPACK_IMPORTED_MODULE_0__.getCurrentUser)();
    if (currentUser === null || roleMapping === undefined || roleMapping[currentUser.role] === undefined) {
        return settings;
    }
    if (Array.isArray(settings?.endpointProvider?.modules)) {
        settings.endpointProvider.modules.push({
            data: definitionData,
            enabled: definitionData.enabled,
            id: definitionData.id,
            description: definitionData.description,
            icon: definitionData.icon,
            info: definitionData.info,
            title: definitionData.title,
            url: definitionData.url
        });
        if (Array.isArray(settings?.endpointProvider?.endpoints) &&
            Array.isArray(settings?.appProvider?.endpointIds)) {
            const appEndpoints = settings?.appProvider?.endpointIds;
            for (let i = 0; i < appEndpoints.length; i++) {
                if (typeof appEndpoints[i] === "string") {
                    const endpointToUpdate = settings.endpointProvider.endpoints.find((endpointEntry) => endpointEntry.id === appEndpoints[i] && endpointEntry.type === "fetch");
                    if (endpointToUpdate !== undefined) {
                        endpointToUpdate.type = "module";
                        // this if condition check is here to make typescript happy with the endpoint so that typeId can be set
                        if (endpointToUpdate.type === "module") {
                            endpointToUpdate.typeId = definitionData.id;
                        }
                    }
                }
            }
        }
    }
    if (Array.isArray(settings?.themeProvider?.themes) &&
        settings.themeProvider.themes.length > 0 &&
        roleMapping[currentUser.role].preferredScheme !== undefined) {
        settings.themeProvider.themes[0].default =
            roleMapping[currentUser.role].preferredScheme === "dark" ? "dark" : "light";
        const storedSchemePreference = `${fin.me.identity.uuid}-SelectedColorScheme`;
        logger.warn("This is a demo module where we are clearing the locally stored scheme preference in order to show different scheme's light/dark based on user selection. This means that it will always be set to what is in the role mapping initially and not what it is set to locally on restart.");
        localStorage.removeItem(storedSchemePreference);
    }
    const excludeMenuActionIds = roleMapping[currentUser.role].excludeMenuAction;
    if (Array.isArray(excludeMenuActionIds)) {
        if (Array.isArray(settings?.browserProvider?.globalMenu) &&
            settings.browserProvider.globalMenu.length > 0) {
            for (let i = 0; i < settings.browserProvider.globalMenu.length; i++) {
                const globalMenuActionId = settings.browserProvider.globalMenu[i]?.data?.action?.id;
                if (excludeMenuActionIds.includes(globalMenuActionId)) {
                    settings.browserProvider.globalMenu[i].include = false;
                }
            }
        }
        if (Array.isArray(settings?.browserProvider?.pageMenu) && settings.browserProvider.pageMenu.length > 0) {
            for (let i = 0; i < settings.browserProvider.pageMenu.length; i++) {
                const pageMenuActionId = settings.browserProvider.pageMenu[i]?.data?.action?.id;
                if (excludeMenuActionIds.includes(pageMenuActionId)) {
                    settings.browserProvider.pageMenu[i].include = false;
                }
            }
        }
        if (Array.isArray(settings?.browserProvider?.viewMenu) && settings.browserProvider.viewMenu.length > 0) {
            for (let i = 0; i < settings.browserProvider.viewMenu.length; i++) {
                const viewMenuActionId = settings.browserProvider.viewMenu[i]?.data?.action?.id;
                if (excludeMenuActionIds.includes(viewMenuActionId)) {
                    settings.browserProvider.viewMenu[i].include = false;
                }
            }
        }
    }
    return settings;
}
async function initialize(definition, createLogger, helpers) {
    logger = createLogger("ExampleAuthEndpoint");
    logger.info("Was passed the following options", definition.data);
    roleMapping = definition?.data?.roleMapping;
    definitionData = definition;
}
async function requestResponse(endpointDefinition, request) {
    if (endpointDefinition.type !== "module") {
        logger.warn(`We only expect endpoints of type module. Unable to action request/response for: ${endpointDefinition.id}`);
        return null;
    }
    if (logger !== undefined) {
        logger.info("This auth endpoint module is an example that that simulates requesting a http endpoint and manipulating it based on the current example user as if it was the server doing the manipulation. DO NOT USE THIS MODULE IN PRODUCTION.");
    }
    const { url, ...options } = endpointDefinition.options;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const req = getRequestOptions(url, options, request);
    if (req.options.method !== "GET" && req.options.method !== "POST") {
        logger.warn(`${endpointDefinition.id} specifies a type: ${endpointDefinition.type} with a method ${req.options.method} that is not supported.`);
        return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const response = await fetch(req.url, req.options);
    if (response.ok) {
        const json = await response.json();
        if (Array.isArray(json)) {
            // returned apps
            return applyCurrentUserToApps(json);
        }
        // settings
        return applyCurrentUserToSettings(json);
    }
    return null;
}


/***/ }),

/***/ "./client/src/modules/auth/example/util.ts":
/*!*************************************************!*\
  !*** ./client/src/modules/auth/example/util.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EXAMPLE_AUTH_CURRENT_USER_KEY": () => (/* binding */ EXAMPLE_AUTH_CURRENT_USER_KEY),
/* harmony export */   "clearCurrentUser": () => (/* binding */ clearCurrentUser),
/* harmony export */   "getCurrentUser": () => (/* binding */ getCurrentUser),
/* harmony export */   "setCurrentUser": () => (/* binding */ setCurrentUser)
/* harmony export */ });
const EXAMPLE_AUTH_CURRENT_USER_KEY = `${fin.me.identity.uuid}-EXAMPLE_AUTH_CURRENT_USER`;
function getCurrentUser() {
    const storedUser = localStorage.getItem(EXAMPLE_AUTH_CURRENT_USER_KEY);
    if (storedUser === null) {
        return null;
    }
    return JSON.parse(storedUser);
}
function setCurrentUser(user) {
    localStorage.setItem(EXAMPLE_AUTH_CURRENT_USER_KEY, JSON.stringify(user));
}
function clearCurrentUser() {
    localStorage.removeItem(EXAMPLE_AUTH_CURRENT_USER_KEY);
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
/*!**************************************************!*\
  !*** ./client/src/modules/auth/example/index.ts ***!
  \**************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "entryPoints": () => (/* binding */ entryPoints)
/* harmony export */ });
/* harmony import */ var _auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./auth */ "./client/src/modules/auth/example/auth.ts");
/* harmony import */ var _endpoint__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./endpoint */ "./client/src/modules/auth/example/endpoint.ts");


const entryPoints = {
    auth: _auth__WEBPACK_IMPORTED_MODULE_0__,
    endpoint: _endpoint__WEBPACK_IMPORTED_MODULE_1__
};

})();

var __webpack_exports__entryPoints = __webpack_exports__.entryPoints;
export { __webpack_exports__entryPoints as entryPoints };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFPLElBQUksQ0FBQztLQUNaO0lBQ0QsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBZ0IsQ0FBQztBQUM5QyxDQUFDO0FBRU0sU0FBUyxjQUFjLENBQUMsSUFBaUI7SUFDL0MsWUFBWSxDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDM0UsQ0FBQztBQUVNLFNBQVMsZ0JBQWdCO0lBQy9CLFlBQVksQ0FBQyxVQUFVLENBQUMsNkJBQTZCLENBQUMsQ0FBQztBQUN4RCxDQUFDOzs7Ozs7O1NDbEJEO1NBQ0E7O1NBRUE7U0FDQTtTQUNBO1NBQ0E7U0FDQTtTQUNBO1NBQ0E7U0FDQTtTQUNBO1NBQ0E7U0FDQTtTQUNBO1NBQ0E7O1NBRUE7U0FDQTs7U0FFQTtTQUNBO1NBQ0E7Ozs7O1VDdEJBO1VBQ0E7VUFDQTtVQUNBO1VBQ0EseUNBQXlDLHdDQUF3QztVQUNqRjtVQUNBO1VBQ0E7Ozs7O1VDUEE7Ozs7O1VDQUE7VUFDQTtVQUNBO1VBQ0EsdURBQXVELGlCQUFpQjtVQUN4RTtVQUNBLGdEQUFnRCxhQUFhO1VBQzdEOzs7Ozs7Ozs7Ozs7Ozs7O0FDTDZDO0FBQ1E7QUFFOUMsTUFBTSxXQUFXLEdBQXFEO0lBQzVFLElBQUksRUFBRSxrQ0FBa0I7SUFDeEIsUUFBUSxFQUFFLHNDQUFzQjtDQUNoQyxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vb3BlbmZpbi13b3Jrc3BhY2UtLWN1c3RvbWl6ZS13b3Jrc3BhY2UvLi9jbGllbnQvc3JjL2ZyYW1ld29yay91dWlkLnRzIiwid2VicGFjazovL29wZW5maW4td29ya3NwYWNlLS1jdXN0b21pemUtd29ya3NwYWNlLy4vY2xpZW50L3NyYy9tb2R1bGVzL2F1dGgvZXhhbXBsZS9hdXRoLnRzIiwid2VicGFjazovL29wZW5maW4td29ya3NwYWNlLS1jdXN0b21pemUtd29ya3NwYWNlLy4vY2xpZW50L3NyYy9tb2R1bGVzL2F1dGgvZXhhbXBsZS9lbmRwb2ludC50cyIsIndlYnBhY2s6Ly9vcGVuZmluLXdvcmtzcGFjZS0tY3VzdG9taXplLXdvcmtzcGFjZS8uL2NsaWVudC9zcmMvbW9kdWxlcy9hdXRoL2V4YW1wbGUvdXRpbC50cyIsIndlYnBhY2s6Ly9vcGVuZmluLXdvcmtzcGFjZS0tY3VzdG9taXplLXdvcmtzcGFjZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9vcGVuZmluLXdvcmtzcGFjZS0tY3VzdG9taXplLXdvcmtzcGFjZS93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vb3BlbmZpbi13b3Jrc3BhY2UtLWN1c3RvbWl6ZS13b3Jrc3BhY2Uvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9vcGVuZmluLXdvcmtzcGFjZS0tY3VzdG9taXplLXdvcmtzcGFjZS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL29wZW5maW4td29ya3NwYWNlLS1jdXN0b21pemUtd29ya3NwYWNlLy4vY2xpZW50L3NyYy9tb2R1bGVzL2F1dGgvZXhhbXBsZS9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gcmFuZG9tVVVJRCgpOiBzdHJpbmcge1xyXG5cdGlmIChcInJhbmRvbVVVSURcIiBpbiB3aW5kb3cuY3J5cHRvKSB7XHJcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcmVzdHJpY3RlZC1zeW50YXhcclxuXHRcdHJldHVybiB3aW5kb3cuY3J5cHRvLnJhbmRvbVVVSUQoKTtcclxuXHR9XHJcblx0Ly8gUG9seWZpbGwgdGhlIHdpbmRvdy5jcnlwdG8ucmFuZG9tVVVJRCBpZiB3ZSBhcmUgcnVubmluZyBpbiBhIG5vbiBzZWN1cmUgY29udGV4dCB0aGF0IGRvZXNuJ3QgaGF2ZSBpdFxyXG5cdC8vIHdlIGFyZSBzdGlsbCB1c2luZyB3aW5kb3cuY3J5cHRvLmdldFJhbmRvbVZhbHVlcyB3aGljaCBpcyBhbHdheXMgYXZhaWxhYmxlXHJcblx0Ly8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIxMTc1MjMvMjgwMDIxOFxyXG5cdGNvbnN0IGdldFJhbmRvbUhleCA9IChjKSA9PlxyXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWJpdHdpc2UsIG5vLW1peGVkLW9wZXJhdG9yc1xyXG5cdFx0KGMgXiAod2luZG93LmNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoMSkpWzBdICYgKDE1ID4+IChjIC8gNCkpKSkudG9TdHJpbmcoMTYpO1xyXG5cdHJldHVybiBcIjEwMDAwMDAwLTEwMDAtNDAwMC04MDAwLTEwMDAwMDAwMDAwMFwiLnJlcGxhY2UoL1swMThdL2csIGdldFJhbmRvbUhleCk7XHJcbn1cclxuIiwiaW1wb3J0IHR5cGUgeyBMb2dnZXIsIExvZ2dlckNyZWF0b3IgfSBmcm9tIFwiY3VzdG9taXplLXdvcmtzcGFjZS9zaGFwZXMvbG9nZ2VyLXNoYXBlc1wiO1xyXG5pbXBvcnQgdHlwZSB7IE1vZHVsZURlZmluaXRpb24sIE1vZHVsZUhlbHBlcnMgfSBmcm9tIFwiY3VzdG9taXplLXdvcmtzcGFjZS9zaGFwZXMvbW9kdWxlLXNoYXBlc1wiO1xyXG5pbXBvcnQgeyByYW5kb21VVUlEIH0gZnJvbSBcIi4uLy4uLy4uL2ZyYW1ld29yay91dWlkXCI7XHJcbmltcG9ydCB0eXBlIHsgRXhhbXBsZU9wdGlvbnMsIEV4YW1wbGVVc2VyIH0gZnJvbSBcIi4vc2hhcGVzXCI7XHJcbmltcG9ydCB7IGNsZWFyQ3VycmVudFVzZXIsIEVYQU1QTEVfQVVUSF9DVVJSRU5UX1VTRVJfS0VZLCBnZXRDdXJyZW50VXNlciB9IGZyb20gXCIuL3V0aWxcIjtcclxuXHJcbmxldCBhdXRoZW50aWNhdGVkOiBib29sZWFuO1xyXG5sZXQgYXV0aE9wdGlvbnM6IEV4YW1wbGVPcHRpb25zO1xyXG5sZXQgY3VycmVudFVzZXI6IEV4YW1wbGVVc2VyO1xyXG5sZXQgc2Vzc2lvbkV4cGlyeUNoZWNrSWQ7XHJcbmxldCBsb2dnZXI6IExvZ2dlcjtcclxuXHJcbmNvbnN0IHN1YnNjcmliZUlkTWFwOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0ge307XHJcbmNvbnN0IGxvZ2dlZEluU3Vic2NyaWJlcnM6IE1hcDxzdHJpbmcsICgpID0+IFByb21pc2U8dm9pZD4+ID0gbmV3IE1hcCgpO1xyXG5jb25zdCBiZWZvcmVMb2dnZWRPdXRTdWJzY3JpYmVyczogTWFwPHN0cmluZywgKCkgPT4gUHJvbWlzZTx2b2lkPj4gPSBuZXcgTWFwKCk7XHJcbmNvbnN0IGxvZ2dlZE91dFN1YnNjcmliZXJzOiBNYXA8c3RyaW5nLCAoKSA9PiBQcm9taXNlPHZvaWQ+PiA9IG5ldyBNYXAoKTtcclxuY29uc3Qgc2Vzc2lvbkV4cGlyZWRTdWJzY3JpYmVyczogTWFwPHN0cmluZywgKCkgPT4gUHJvbWlzZTx2b2lkPj4gPSBuZXcgTWFwKCk7XHJcblxyXG5jb25zdCBFWEFNUExFX0FVVEhfQVVUSEVOVElDQVRFRF9LRVkgPSBgJHtmaW4ubWUuaWRlbnRpdHkudXVpZH0tRVhBTVBMRV9BVVRIX0lTX0FVVEhFTlRJQ0FURURgO1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gb3BlbkxvZ2luV2luZG93KHVybDogc3RyaW5nKTogUHJvbWlzZTxPcGVuRmluLldpbmRvdz4ge1xyXG5cdGNvbnN0IGVucmljaGVkQ3VzdG9tRGF0YSA9IHsgY3VycmVudFVzZXJLZXk6IEVYQU1QTEVfQVVUSF9DVVJSRU5UX1VTRVJfS0VZLCAuLi5hdXRoT3B0aW9ucz8uY3VzdG9tRGF0YSB9O1xyXG5cdHJldHVybiBmaW4uV2luZG93LmNyZWF0ZSh7XHJcblx0XHRuYW1lOiBcImV4YW1wbGUtYXV0aC1sb2ctaW5cIixcclxuXHRcdGFsd2F5c09uVG9wOiB0cnVlLFxyXG5cdFx0bWF4aW1pemFibGU6IGZhbHNlLFxyXG5cdFx0bWluaW1pemFibGU6IGZhbHNlLFxyXG5cdFx0YXV0b1Nob3c6IGZhbHNlLFxyXG5cdFx0ZGVmYXVsdENlbnRlcmVkOiB0cnVlLFxyXG5cdFx0ZGVmYXVsdEhlaWdodDogYXV0aE9wdGlvbnMubG9naW5IZWlnaHQgPz8gMzI1LFxyXG5cdFx0ZGVmYXVsdFdpZHRoOiBhdXRoT3B0aW9ucy5sb2dpbldpZHRoID8/IDQwMCxcclxuXHRcdGluY2x1ZGVJblNuYXBzaG90czogZmFsc2UsXHJcblx0XHRyZXNpemFibGU6IGZhbHNlLFxyXG5cdFx0c2hvd1Rhc2tiYXJJY29uOiBmYWxzZSxcclxuXHRcdHNhdmVXaW5kb3dTdGF0ZTogZmFsc2UsXHJcblx0XHR1cmwsXHJcblx0XHRjdXN0b21EYXRhOiBlbnJpY2hlZEN1c3RvbURhdGFcclxuXHR9KTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gb3BlbkxvZ291dFdpbmRvdyh1cmw6IHN0cmluZyk6IFByb21pc2U8T3BlbkZpbi5XaW5kb3c+IHtcclxuXHRyZXR1cm4gZmluLldpbmRvdy5jcmVhdGUoe1xyXG5cdFx0bmFtZTogXCJleGFtcGxlLWF1dGgtbG9nLW91dFwiLFxyXG5cdFx0bWF4aW1pemFibGU6IGZhbHNlLFxyXG5cdFx0bWluaW1pemFibGU6IGZhbHNlLFxyXG5cdFx0YXV0b1Nob3c6IGZhbHNlLFxyXG5cdFx0ZGVmYXVsdENlbnRlcmVkOiB0cnVlLFxyXG5cdFx0ZGVmYXVsdEhlaWdodDogYXV0aE9wdGlvbnMubG9naW5IZWlnaHQgPz8gMzI1LFxyXG5cdFx0ZGVmYXVsdFdpZHRoOiBhdXRoT3B0aW9ucy5sb2dpbldpZHRoID8/IDQwMCxcclxuXHRcdGluY2x1ZGVJblNuYXBzaG90czogZmFsc2UsXHJcblx0XHRyZXNpemFibGU6IGZhbHNlLFxyXG5cdFx0c2hvd1Rhc2tiYXJJY29uOiBmYWxzZSxcclxuXHRcdHNhdmVXaW5kb3dTdGF0ZTogZmFsc2UsXHJcblx0XHR1cmxcclxuXHR9KTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gY2hlY2tBdXRoKHVybDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XHJcblx0Y29uc3Qgd2luZG93VG9DaGVjayA9IGF3YWl0IGZpbi5XaW5kb3cuY3JlYXRlKHtcclxuXHRcdG5hbWU6IFwiZXhhbXBsZS1hdXRoLWNoZWNrLXdpbmRvd1wiLFxyXG5cdFx0YWx3YXlzT25Ub3A6IHRydWUsXHJcblx0XHRtYXhpbWl6YWJsZTogZmFsc2UsXHJcblx0XHRtaW5pbWl6YWJsZTogZmFsc2UsXHJcblx0XHRhdXRvU2hvdzogZmFsc2UsXHJcblx0XHRkZWZhdWx0SGVpZ2h0OiBhdXRoT3B0aW9ucy5sb2dpbkhlaWdodCA/PyAzMjUsXHJcblx0XHRkZWZhdWx0V2lkdGg6IGF1dGhPcHRpb25zLmxvZ2luV2lkdGggPz8gNDAwLFxyXG5cdFx0aW5jbHVkZUluU25hcHNob3RzOiBmYWxzZSxcclxuXHRcdHJlc2l6YWJsZTogZmFsc2UsXHJcblx0XHRzaG93VGFza2Jhckljb246IGZhbHNlLFxyXG5cdFx0c2F2ZVdpbmRvd1N0YXRlOiBmYWxzZSxcclxuXHRcdHVybFxyXG5cdH0pO1xyXG5cdGxldCBpc0F1dGhlbnRpY2F0ZWQgPSBmYWxzZTtcclxuXHR0cnkge1xyXG5cdFx0Y29uc3QgaW5mbyA9IGF3YWl0IHdpbmRvd1RvQ2hlY2suZ2V0SW5mbygpO1xyXG5cdFx0aWYgKGluZm8udXJsID09PSBhdXRoT3B0aW9ucy5hdXRoZW50aWNhdGVkVXJsKSB7XHJcblx0XHRcdGlzQXV0aGVudGljYXRlZCA9IHRydWU7XHJcblx0XHR9XHJcblx0fSBjYXRjaCAoZXJyb3IpIHtcclxuXHRcdGxvZ2dlci5lcnJvcihcIkVycm9yIGVuY291bnRlcmVkIHdoaWxlIGNoZWNraW5nIHNlc3Npb25cIiwgZXJyb3IpO1xyXG5cdH0gZmluYWxseSB7XHJcblx0XHRpZiAod2luZG93VG9DaGVjayAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdGF3YWl0IHdpbmRvd1RvQ2hlY2suY2xvc2UodHJ1ZSk7XHJcblx0XHR9XHJcblx0fVxyXG5cdHJldHVybiBpc0F1dGhlbnRpY2F0ZWQ7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGdldEF1dGhlbnRpY2F0aW9uRnJvbVVzZXIoKTogUHJvbWlzZTxib29sZWFuPiB7XHJcblx0cmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuXHRcdG9wZW5Mb2dpbldpbmRvdyhhdXRoT3B0aW9ucy5sb2dpblVybClcclxuXHRcdFx0LnRoZW4oYXN5bmMgKHdpbikgPT4ge1xyXG5cdFx0XHRcdGNvbnN0IGF1dGhNYXRjaCA9IG5ldyBSZWdFeHAoYXV0aE9wdGlvbnMuYXV0aGVudGljYXRlZFVybCwgXCJpXCIpO1xyXG5cclxuXHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0aWYgKHdpbiAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0XHRcdGNvbnN0IGluZm8gPSBhd2FpdCB3aW4uZ2V0SW5mbygpO1xyXG5cdFx0XHRcdFx0XHRpZiAoYXV0aE1hdGNoLnRlc3QoaW5mby51cmwpKSB7XHJcblx0XHRcdFx0XHRcdFx0YXdhaXQgd2luLmNsb3NlKHRydWUpO1xyXG5cdFx0XHRcdFx0XHRcdHJldHVybiByZXNvbHZlKHRydWUpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGF3YWl0IHdpbi5zaG93KHRydWUpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XHJcblx0XHRcdFx0XHRsb2dnZXIuZXJyb3IoXHJcblx0XHRcdFx0XHRcdGBFcnJvciB3aGlsZSBjaGVja2luZyBpZiBsb2dpbiB3aW5kb3cgYXV0b21hdGljYWxseSByZWRpcmVjdGVkLiBFcnJvciAke2Vycm9yLm1lc3NhZ2V9YFxyXG5cdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdGlmICh3aW4gIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdFx0XHRhd2FpdCB3aW4uc2hvdyh0cnVlKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGxldCBzdGF0dXNDaGVjazogbnVtYmVyO1xyXG5cclxuXHRcdFx0XHRhd2FpdCB3aW4uYWRkTGlzdGVuZXIoXCJjbG9zZWRcIiwgYXN5bmMgKCkgPT4ge1xyXG5cdFx0XHRcdFx0aWYgKHdpbikge1xyXG5cdFx0XHRcdFx0XHR3aW5kb3cuY2xlYXJJbnRlcnZhbChzdGF0dXNDaGVjayk7XHJcblx0XHRcdFx0XHRcdHN0YXR1c0NoZWNrID0gdW5kZWZpbmVkO1xyXG5cdFx0XHRcdFx0XHRsb2dnZXIuaW5mbyhcIkF1dGggV2luZG93IGNhbmNlbGxlZCBieSB1c2VyXCIpO1xyXG5cdFx0XHRcdFx0XHR3aW4gPSB1bmRlZmluZWQ7XHJcblx0XHRcdFx0XHRcdHJldHVybiByZXNvbHZlKGZhbHNlKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRzdGF0dXNDaGVjayA9IHdpbmRvdy5zZXRJbnRlcnZhbChhc3luYyAoKSA9PiB7XHJcblx0XHRcdFx0XHRpZiAod2luICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRcdFx0Y29uc3QgaW5mbyA9IGF3YWl0IHdpbi5nZXRJbmZvKCk7XHJcblx0XHRcdFx0XHRcdGlmIChhdXRoTWF0Y2gudGVzdChpbmZvLnVybCkpIHtcclxuXHRcdFx0XHRcdFx0XHR3aW5kb3cuY2xlYXJJbnRlcnZhbChzdGF0dXNDaGVjayk7XHJcblx0XHRcdFx0XHRcdFx0YXdhaXQgd2luLnJlbW92ZUFsbExpc3RlbmVycygpO1xyXG5cdFx0XHRcdFx0XHRcdGF3YWl0IHdpbi5jbG9zZSh0cnVlKTtcclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gcmVzb2x2ZSh0cnVlKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIHJlc29sdmUoZmFsc2UpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0sIGF1dGhPcHRpb25zLmNoZWNrTG9naW5TdGF0dXNJblNlY29uZHMgPz8gMSAqIDEwMDApO1xyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuY2F0Y2goKGVycm9yKSA9PiB7XHJcblx0XHRcdFx0bG9nZ2VyLmVycm9yKFwiRXJyb3Igd2hpbGUgdHJ5aW5nIHRvIGF1dGhlbnRpY2F0ZSB0aGUgdXNlclwiLCBlcnJvcik7XHJcblx0XHRcdH0pO1xyXG5cdH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjaGVja0ZvclNlc3Npb25FeHBpcnkoZm9yY2UgPSBmYWxzZSkge1xyXG5cdGlmIChcclxuXHRcdGF1dGhPcHRpb25zPy5jaGVja1Nlc3Npb25WYWxpZGl0eUluU2Vjb25kcyAhPT0gdW5kZWZpbmVkICYmXHJcblx0XHRhdXRoT3B0aW9ucz8uY2hlY2tTZXNzaW9uVmFsaWRpdHlJblNlY29uZHMgPiAtMSAmJlxyXG5cdFx0c2Vzc2lvbkV4cGlyeUNoZWNrSWQgPT09IHVuZGVmaW5lZFxyXG5cdCkge1xyXG5cdFx0c2Vzc2lvbkV4cGlyeUNoZWNrSWQgPSBzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcclxuXHRcdFx0c2Vzc2lvbkV4cGlyeUNoZWNrSWQgPSB1bmRlZmluZWQ7XHJcblx0XHRcdGNvbnN0IHN0aWxsQXV0aGVudGljYXRlZCA9IGF3YWl0IGNoZWNrQXV0aChhdXRoT3B0aW9ucy5sb2dpblVybCk7XHJcblx0XHRcdGlmIChzdGlsbEF1dGhlbnRpY2F0ZWQpIHtcclxuXHRcdFx0XHRsb2dnZXIuaW5mbyhcIlNlc3Npb24gU3RpbGwgQWN0aXZlXCIpO1xyXG5cdFx0XHRcdGNoZWNrRm9yU2Vzc2lvbkV4cGlyeSgpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGxvZ2dlci5pbmZvKFxyXG5cdFx0XHRcdFx0XCJTZXNzaW9uIG5vdCB2YWxpZC4gS2lsbGluZyBzZXNzaW9uIGFuZCBub3RpZnlpbmcgcmVnaXN0ZXJlZCBjYWxsYmFjayB0aGF0IGF1dGhlbnRpY2F0aW9uIGlzIHJlcXVpcmVkLiBUaGlzIGNoZWNrIGlzIGNvbmZpZ3VyZWQgaW4gdGhlIGRhdGEgZm9yIHRoaXMgZXhhbXBsZSBhdXRoIG1vZHVsZS4gU2V0IGNoZWNrU2Vzc2lvblZhbGlkaXR5SW5TZWNvbmRzIHRvIC0xIGluIHRoZSBhdXRoUHJvdmlkZXIgbW9kdWxlIGRlZmluaXRpb24gaWYgeW91IHdpc2ggdG8gZGlzYWJsZSB0aGlzIGNoZWNrXCJcclxuXHRcdFx0XHQpO1xyXG5cdFx0XHRcdGF1dGhlbnRpY2F0ZWQgPSBmYWxzZTtcclxuXHRcdFx0XHRsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShFWEFNUExFX0FVVEhfQVVUSEVOVElDQVRFRF9LRVkpO1xyXG5cdFx0XHRcdGNsZWFyQ3VycmVudFVzZXIoKTtcclxuXHRcdFx0XHRhd2FpdCBub3RpZnlTdWJzY3JpYmVycyhcInNlc3Npb24tZXhwaXJlZFwiLCBzZXNzaW9uRXhwaXJlZFN1YnNjcmliZXJzKTtcclxuXHRcdFx0fVxyXG5cdFx0fSwgYXV0aE9wdGlvbnMuY2hlY2tTZXNzaW9uVmFsaWRpdHlJblNlY29uZHMgKiAxMDAwKTtcclxuXHR9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIG5vdGlmeVN1YnNjcmliZXJzKGV2ZW50VHlwZTogc3RyaW5nLCBzdWJzY3JpYmVyczogTWFwPHN0cmluZywgKCkgPT4gUHJvbWlzZTx2b2lkPj4pIHtcclxuXHRjb25zdCBzdWJzY3JpYmVySWRzID0gQXJyYXkuZnJvbShzdWJzY3JpYmVycy5rZXlzKCkpO1xyXG5cdHN1YnNjcmliZXJJZHMucmV2ZXJzZSgpO1xyXG5cclxuXHRmb3IgKGxldCBpID0gMDsgaSA8IHN1YnNjcmliZXJJZHMubGVuZ3RoOyBpKyspIHtcclxuXHRcdGNvbnN0IHN1YnNjcmliZXJJZCA9IHN1YnNjcmliZXJJZHNbaV07XHJcblx0XHRsb2dnZXIuaW5mbyhgTm90aWZ5aW5nIHN1YnNjcmliZXIgd2l0aCBzdWJzY3JpcHRpb24gSWQ6ICR7c3Vic2NyaWJlcklkfSBvZiBldmVudCB0eXBlOiAke2V2ZW50VHlwZX1gKTtcclxuXHRcdGF3YWl0IHN1YnNjcmliZXJzLmdldChzdWJzY3JpYmVySWQpKCk7XHJcblx0fVxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVMb2dvdXQocmVzb2x2ZTogKHN1Y2Nlc3M6IGJvb2xlYW4pID0+IHZvaWQpOiBQcm9taXNlPHZvaWQ+IHtcclxuXHRpZiAoYXV0aGVudGljYXRlZCA9PT0gdW5kZWZpbmVkIHx8ICFhdXRoZW50aWNhdGVkKSB7XHJcblx0XHRsb2dnZXIuZXJyb3IoXCJZb3UgaGF2ZSByZXF1ZXN0ZWQgdG8gbG9nIG91dCBidXQgYXJlIG5vdCBsb2dnZWQgaW5cIik7XHJcblx0XHRyZXNvbHZlKGZhbHNlKTtcclxuXHRcdHJldHVybjtcclxuXHR9XHJcblx0bG9nZ2VyLmluZm8oXCJMb2cgb3V0IHJlcXVlc3RlZFwiKTtcclxuXHRhd2FpdCBub3RpZnlTdWJzY3JpYmVycyhcImJlZm9yZS1sb2dnZWQtb3V0XCIsIGJlZm9yZUxvZ2dlZE91dFN1YnNjcmliZXJzKTtcclxuXHRhdXRoZW50aWNhdGVkID0gZmFsc2U7XHJcblx0bG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oRVhBTVBMRV9BVVRIX0FVVEhFTlRJQ0FURURfS0VZKTtcclxuXHRjbGVhckN1cnJlbnRVc2VyKCk7XHJcblx0aWYgKFxyXG5cdFx0YXV0aE9wdGlvbnMubG9nb3V0VXJsICE9PSB1bmRlZmluZWQgJiZcclxuXHRcdGF1dGhPcHRpb25zLmxvZ291dFVybCAhPT0gbnVsbCAmJlxyXG5cdFx0YXV0aE9wdGlvbnMubG9nb3V0VXJsLnRyaW0oKS5sZW5ndGggPiAwXHJcblx0KSB7XHJcblx0XHR0cnkge1xyXG5cdFx0XHRjb25zdCB3aW4gPSBhd2FpdCBvcGVuTG9nb3V0V2luZG93KGF1dGhPcHRpb25zLmxvZ291dFVybCk7XHJcblx0XHRcdHNldFRpbWVvdXQoYXN5bmMgKCkgPT4ge1xyXG5cdFx0XHRcdGF3YWl0IHdpbi5jbG9zZSgpO1xyXG5cdFx0XHRcdGF3YWl0IG5vdGlmeVN1YnNjcmliZXJzKFwibG9nZ2VkLW91dFwiLCBsb2dnZWRPdXRTdWJzY3JpYmVycyk7XHJcblx0XHRcdFx0cmVzb2x2ZSh0cnVlKTtcclxuXHRcdFx0fSwgMjAwMCk7XHJcblx0XHR9IGNhdGNoIChlcnJvcikge1xyXG5cdFx0XHRsb2dnZXIuZXJyb3IoYEVycm9yIHdoaWxlIGxhdW5jaGluZyBsb2dvdXQgd2luZG93LiAke2Vycm9yfWApO1xyXG5cdFx0XHRyZXR1cm4gcmVzb2x2ZShmYWxzZSk7XHJcblx0XHR9XHJcblx0fSBlbHNlIHtcclxuXHRcdGF3YWl0IG5vdGlmeVN1YnNjcmliZXJzKFwibG9nZ2VkLW91dFwiLCBsb2dnZWRPdXRTdWJzY3JpYmVycyk7XHJcblx0XHRyZXNvbHZlKHRydWUpO1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGluaXRpYWxpemUoXHJcblx0ZGVmaW5pdGlvbjogTW9kdWxlRGVmaW5pdGlvbjxFeGFtcGxlT3B0aW9ucz4sXHJcblx0Y3JlYXRlTG9nZ2VyOiBMb2dnZXJDcmVhdG9yLFxyXG5cdGhlbHBlcnM6IE1vZHVsZUhlbHBlcnNcclxuKSB7XHJcblx0bG9nZ2VyID0gY3JlYXRlTG9nZ2VyKFwiQXV0aEV4YW1wbGVcIik7XHJcblx0aWYgKGF1dGhPcHRpb25zID09PSB1bmRlZmluZWQpIHtcclxuXHRcdGxvZ2dlci5pbmZvKGBTZXR0aW5nIG9wdGlvbnM6ICR7SlNPTi5zdHJpbmdpZnkoZGVmaW5pdGlvbi5kYXRhLCBudWxsLCA0KX1gKTtcclxuXHRcdGF1dGhPcHRpb25zID0gZGVmaW5pdGlvbi5kYXRhO1xyXG5cdFx0YXV0aGVudGljYXRlZCA9IEJvb2xlYW4obG9jYWxTdG9yYWdlLmdldEl0ZW0oRVhBTVBMRV9BVVRIX0FVVEhFTlRJQ0FURURfS0VZKSk7XHJcblx0XHRpZiAoYXV0aGVudGljYXRlZCkge1xyXG5cdFx0XHRjdXJyZW50VXNlciA9IGdldEN1cnJlbnRVc2VyKCk7XHJcblx0XHRcdGNoZWNrRm9yU2Vzc2lvbkV4cGlyeSgpO1xyXG5cdFx0fVxyXG5cdH0gZWxzZSB7XHJcblx0XHRsb2dnZXIud2FybihcIk9wdGlvbnMgaGF2ZSBhbHJlYWR5IGJlZW4gc2V0IGFzIGluaXQgaGFzIGFscmVhZHkgYmVlbiBjYWxsZWRcIik7XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc3Vic2NyaWJlKFxyXG5cdHRvOiBcImxvZ2dlZC1pblwiIHwgXCJiZWZvcmUtbG9nZ2VkLW91dFwiIHwgXCJsb2dnZWQtb3V0XCIgfCBcInNlc3Npb24tZXhwaXJlZFwiLFxyXG5cdGNhbGxiYWNrOiAoKSA9PiBQcm9taXNlPHZvaWQ+XHJcbik6IHN0cmluZyB7XHJcblx0Y29uc3Qga2V5ID0gcmFuZG9tVVVJRCgpO1xyXG5cdGxldCBtYXRjaEZvdW5kID0gZmFsc2U7XHJcblx0c3dpdGNoICh0bykge1xyXG5cdFx0Y2FzZSBcImxvZ2dlZC1pblwiOiB7XHJcblx0XHRcdG1hdGNoRm91bmQgPSB0cnVlO1xyXG5cdFx0XHRsb2dnZWRJblN1YnNjcmliZXJzLnNldChrZXksIGNhbGxiYWNrKTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblx0XHRjYXNlIFwiYmVmb3JlLWxvZ2dlZC1vdXRcIjoge1xyXG5cdFx0XHRtYXRjaEZvdW5kID0gdHJ1ZTtcclxuXHRcdFx0YmVmb3JlTG9nZ2VkT3V0U3Vic2NyaWJlcnMuc2V0KGtleSwgY2FsbGJhY2spO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHRcdGNhc2UgXCJsb2dnZWQtb3V0XCI6IHtcclxuXHRcdFx0bWF0Y2hGb3VuZCA9IHRydWU7XHJcblx0XHRcdGxvZ2dlZE91dFN1YnNjcmliZXJzLnNldChrZXksIGNhbGxiYWNrKTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblx0XHRjYXNlIFwic2Vzc2lvbi1leHBpcmVkXCI6IHtcclxuXHRcdFx0bWF0Y2hGb3VuZCA9IHRydWU7XHJcblx0XHRcdHNlc3Npb25FeHBpcmVkU3Vic2NyaWJlcnMuc2V0KGtleSwgY2FsbGJhY2spO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGlmIChtYXRjaEZvdW5kKSB7XHJcblx0XHRzdWJzY3JpYmVJZE1hcFtrZXldID0gdG87XHJcblx0XHRsb2dnZXIuaW5mbyhgU3Vic2NyaXB0aW9uIHRvICR7dG99IGV2ZW50cyByZWdpc3RlcmVkLiBTdWJzY3JpcHRpb24gSWQ6ICR7a2V5fWApO1xyXG5cdFx0cmV0dXJuIGtleTtcclxuXHR9XHJcblx0cmV0dXJuIG51bGw7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB1bnN1YnNjcmliZShmcm9tOiBzdHJpbmcpOiBib29sZWFuIHtcclxuXHRsZXQgbWF0Y2hGb3VuZCA9IGZhbHNlO1xyXG5cdGNvbnN0IGV2ZW50VHlwZSA9IHN1YnNjcmliZUlkTWFwW2Zyb21dO1xyXG5cdGlmIChldmVudFR5cGUgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0bG9nZ2VyLndhcm4oYFlvdSBoYXZlIHRyaWVkIHRvIHVuc3Vic2NyaWJlIHdpdGggYSBrZXkgJHtmcm9tfSB0aGF0IGlzIGludmFsaWRgKTtcclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblxyXG5cdHN3aXRjaCAoZXZlbnRUeXBlKSB7XHJcblx0XHRjYXNlIFwibG9nZ2VkLWluXCI6IHtcclxuXHRcdFx0bWF0Y2hGb3VuZCA9IHRydWU7XHJcblx0XHRcdGxvZ2dlZEluU3Vic2NyaWJlcnMuZGVsZXRlKGZyb20pO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHRcdGNhc2UgXCJiZWZvcmUtbG9nZ2VkLW91dFwiOiB7XHJcblx0XHRcdG1hdGNoRm91bmQgPSB0cnVlO1xyXG5cdFx0XHRiZWZvcmVMb2dnZWRPdXRTdWJzY3JpYmVycy5kZWxldGUoZnJvbSk7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cdFx0Y2FzZSBcImxvZ2dlZC1vdXRcIjoge1xyXG5cdFx0XHRtYXRjaEZvdW5kID0gdHJ1ZTtcclxuXHRcdFx0bG9nZ2VkT3V0U3Vic2NyaWJlcnMuZGVsZXRlKGZyb20pO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHRcdGNhc2UgXCJzZXNzaW9uLWV4cGlyZWRcIjoge1xyXG5cdFx0XHRtYXRjaEZvdW5kID0gdHJ1ZTtcclxuXHRcdFx0c2Vzc2lvbkV4cGlyZWRTdWJzY3JpYmVycy5kZWxldGUoZnJvbSk7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZGVsZXRlIHN1YnNjcmliZUlkTWFwW2Zyb21dO1xyXG5cdGlmIChtYXRjaEZvdW5kKSB7XHJcblx0XHRsb2dnZXIuaW5mbyhgU3Vic2NyaXB0aW9uIHRvICR7ZXZlbnRUeXBlfSBldmVudHMgd2l0aCBzdWJzY3JpcHRpb24gSWQ6ICR7ZnJvbX0gaGFzIGJlZW4gY2xlYXJlZGApO1xyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cclxuXHRsb2dnZXIud2FybihcclxuXHRcdGBTdWJzY3JpcHRpb24gdG8gJHtldmVudFR5cGV9IGV2ZW50cyB3aXRoIHN1YnNjcmlwdGlvbiBJZDogJHtmcm9tfSBjb3VsZCBub3QgYmUgY2xlYXJlZCBhcyB3ZSBkbyBub3QgaGF2ZSBhIHJlZ2lzdGVyIG9mIHRoYXQgZXZlbnQgdHlwZS5gXHJcblx0KTtcclxuXHRyZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2dpbigpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuXHRsb2dnZXIuaW5mbyhcImxvZ2luIHJlcXVlc3RlZFwiKTtcclxuXHRpZiAoYXV0aGVudGljYXRlZCkge1xyXG5cdFx0bG9nZ2VyLmluZm8oXCJVc2VyIGFscmVhZHkgYXV0aGVudGljYXRlZFwiKTtcclxuXHRcdHJldHVybiBhdXRoZW50aWNhdGVkO1xyXG5cdH1cclxuXHRpZiAoYXV0aE9wdGlvbnMuYXV0b0xvZ2luKSB7XHJcblx0XHRsb2dnZXIuaW5mbyhcImF1dG9Mb2dpbiBlbmFibGVkIGluIGF1dGggcHJvdmlkZSBtb2R1bGUgc2V0dGluZ3MuIEZha2UgbG9nZ2VkIGluXCIpO1xyXG5cdFx0YXV0aGVudGljYXRlZCA9IHRydWU7XHJcblx0fSBlbHNlIHtcclxuXHRcdGF1dGhlbnRpY2F0ZWQgPSBhd2FpdCBnZXRBdXRoZW50aWNhdGlvbkZyb21Vc2VyKCk7XHJcblx0fVxyXG5cclxuXHRpZiAoYXV0aGVudGljYXRlZCkge1xyXG5cdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oRVhBTVBMRV9BVVRIX0FVVEhFTlRJQ0FURURfS0VZLCBhdXRoZW50aWNhdGVkLnRvU3RyaW5nKCkpO1xyXG5cdFx0Y2hlY2tGb3JTZXNzaW9uRXhwaXJ5KCk7XHJcblx0XHRhd2FpdCBub3RpZnlTdWJzY3JpYmVycyhcImxvZ2dlZC1pblwiLCBsb2dnZWRJblN1YnNjcmliZXJzKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0Y2xlYXJDdXJyZW50VXNlcigpO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIGF1dGhlbnRpY2F0ZWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2dvdXQoKTogUHJvbWlzZTxib29sZWFuPiB7XHJcblx0cmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuXHRcdGhhbmRsZUxvZ291dChyZXNvbHZlKVxyXG5cdFx0XHQudGhlbihhc3luYyAoKSA9PiB7XHJcblx0XHRcdFx0bG9nZ2VyLmluZm8oXCJMb2cgb3V0IGNhbGxlZFwiKTtcclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fSlcclxuXHRcdFx0LmNhdGNoKGFzeW5jIChlcnJvcikgPT4ge1xyXG5cdFx0XHRcdGxvZ2dlci5lcnJvcihgRXJyb3Igd2hpbGUgdHJ5aW5nIHRvIGxvZyBvdXQgJHtlcnJvcn1gKTtcclxuXHRcdFx0fSk7XHJcblx0fSk7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpc0F1dGhlbnRpY2F0aW9uUmVxdWlyZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XHJcblx0aWYgKGF1dGhlbnRpY2F0ZWQgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0YXV0aGVudGljYXRlZCA9IGZhbHNlO1xyXG5cdH1cclxuXHRyZXR1cm4gIWF1dGhlbnRpY2F0ZWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRVc2VySW5mbygpOiBQcm9taXNlPHVua25vd24+IHtcclxuXHRpZiAoYXV0aGVudGljYXRlZCA9PT0gdW5kZWZpbmVkIHx8ICFhdXRoZW50aWNhdGVkKSB7XHJcblx0XHRsb2dnZXIud2FybihcIlVuYWJsZSB0byByZXRyaWV2ZSB1c2VyIGluZm8gdW5sZXNzIHRoZSB1c2VyIGlzIGF1dGhlbnRpY2F0ZWRcIik7XHJcblx0XHRyZXR1cm4gbnVsbDtcclxuXHR9XHJcblx0bG9nZ2VyLmluZm8oXCJUaGlzIGV4YW1wbGUgcmV0dXJucyBhIHVzZXIgaWYgaXQgd2FzIHByb3ZpZGVkIHRvIHRoZSBleGFtcGxlIGxvZ2luXCIpO1xyXG5cclxuXHRyZXR1cm4gY3VycmVudFVzZXI7XHJcbn1cclxuIiwiaW1wb3J0IHR5cGUgeyBDdXN0b21TZXR0aW5ncywgUGxhdGZvcm1BcHAgfSBmcm9tIFwiY3VzdG9taXplLXdvcmtzcGFjZS9zaGFwZXNcIjtcclxuaW1wb3J0IHR5cGUgeyBFbmRwb2ludERlZmluaXRpb24sIEZldGNoT3B0aW9ucyB9IGZyb20gXCJjdXN0b21pemUtd29ya3NwYWNlL3NoYXBlcy9lbmRwb2ludC1zaGFwZXNcIjtcclxuaW1wb3J0IHR5cGUgeyBMb2dnZXIsIExvZ2dlckNyZWF0b3IgfSBmcm9tIFwiY3VzdG9taXplLXdvcmtzcGFjZS9zaGFwZXMvbG9nZ2VyLXNoYXBlc1wiO1xyXG5pbXBvcnQgdHlwZSB7IE1vZHVsZURlZmluaXRpb24gfSBmcm9tIFwiY3VzdG9taXplLXdvcmtzcGFjZS9zaGFwZXMvbW9kdWxlLXNoYXBlc1wiO1xyXG5pbXBvcnQgdHlwZSB7IEV4YW1wbGVFbmRwb2ludE9wdGlvbnMsIEV4YW1wbGVVc2VyUm9sZU1hcHBpbmcgfSBmcm9tIFwiLi9zaGFwZXNcIjtcclxuaW1wb3J0IHsgZ2V0Q3VycmVudFVzZXIgfSBmcm9tIFwiLi91dGlsXCI7XHJcblxyXG5sZXQgbG9nZ2VyOiBMb2dnZXI7XHJcbmxldCByb2xlTWFwcGluZzogeyBba2V5OiBzdHJpbmddOiBFeGFtcGxlVXNlclJvbGVNYXBwaW5nIH07XHJcbmxldCBkZWZpbml0aW9uRGF0YTogTW9kdWxlRGVmaW5pdGlvbjxFeGFtcGxlRW5kcG9pbnRPcHRpb25zPjtcclxuXHJcbmZ1bmN0aW9uIGdldFJlcXVlc3RPcHRpb25zKFxyXG5cdHVybDogc3RyaW5nLFxyXG5cdG9wdGlvbnM6IEZldGNoT3B0aW9ucyxcclxuXHRyZXF1ZXN0OiB1bmtub3duXHJcbik6IHsgdXJsOiBzdHJpbmc7IG9wdGlvbnM6IEZldGNoT3B0aW9ucyB9IHtcclxuXHRpZiAob3B0aW9ucy5tZXRob2QgPT09IFwiR0VUXCIpIHtcclxuXHRcdGlmIChyZXF1ZXN0ICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0Y29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHJlcXVlc3QpO1xyXG5cdFx0XHRpZiAoa2V5cy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0Y29uc3QgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XHJcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0dXJsID0gdXJsLnJlcGxhY2UoYFske2tleXNbaV19XWAsIGVuY29kZVVSSUNvbXBvbmVudChyZXF1ZXN0W2tleXNbaV1dIGFzIHN0cmluZykpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0gZWxzZSBpZiAob3B0aW9ucy5tZXRob2QgPT09IFwiUE9TVFwiICYmIHJlcXVlc3QgIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0b3B0aW9ucy5ib2R5ID0gSlNPTi5zdHJpbmdpZnkocmVxdWVzdCk7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4geyB1cmwsIG9wdGlvbnMgfTtcclxufVxyXG5cclxuZnVuY3Rpb24gYXBwbHlDdXJyZW50VXNlclRvQXBwcyhhcHBzOiBQbGF0Zm9ybUFwcFtdID0gW10pOiBQbGF0Zm9ybUFwcFtdIHtcclxuXHRjb25zdCBjdXJyZW50VXNlciA9IGdldEN1cnJlbnRVc2VyKCk7XHJcblx0aWYgKFxyXG5cdFx0Y3VycmVudFVzZXIgPT09IG51bGwgfHxcclxuXHRcdHJvbGVNYXBwaW5nID09PSB1bmRlZmluZWQgfHxcclxuXHRcdHJvbGVNYXBwaW5nW2N1cnJlbnRVc2VyLnJvbGVdID09PSB1bmRlZmluZWQgfHxcclxuXHRcdHJvbGVNYXBwaW5nW2N1cnJlbnRVc2VyLnJvbGVdLmV4Y2x1ZGVBcHBzV2l0aFRhZyA9PT0gdW5kZWZpbmVkXHJcblx0KSB7XHJcblx0XHRyZXR1cm4gYXBwcztcclxuXHR9XHJcblx0Y29uc3QgZXhjbHVkZVRhZyA9IHJvbGVNYXBwaW5nW2N1cnJlbnRVc2VyLnJvbGVdLmV4Y2x1ZGVBcHBzV2l0aFRhZztcclxuXHRjb25zdCBmaWx0ZXJlZEFwcHM6IFBsYXRmb3JtQXBwW10gPSBbXTtcclxuXHRmb3IgKGxldCBpID0gMDsgaSA8IGFwcHMubGVuZ3RoOyBpKyspIHtcclxuXHRcdGlmIChBcnJheS5pc0FycmF5KGFwcHNbaV0udGFncykpIHtcclxuXHRcdFx0bGV0IGluY2x1ZGUgPSB0cnVlO1xyXG5cdFx0XHRmb3IgKGxldCB0ID0gMDsgdCA8IGFwcHNbaV0udGFncy5sZW5ndGg7IHQrKykge1xyXG5cdFx0XHRcdGNvbnN0IHRhZzogc3RyaW5nID0gYXBwc1tpXS50YWdzW3RdO1xyXG5cdFx0XHRcdGlmIChleGNsdWRlVGFnLmluY2x1ZGVzKHRhZykpIHtcclxuXHRcdFx0XHRcdGluY2x1ZGUgPSBmYWxzZTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAoaW5jbHVkZSkge1xyXG5cdFx0XHRcdGZpbHRlcmVkQXBwcy5wdXNoKGFwcHNbaV0pO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRmaWx0ZXJlZEFwcHMucHVzaChhcHBzW2ldKTtcclxuXHRcdH1cclxuXHR9XHJcblx0cmV0dXJuIGZpbHRlcmVkQXBwcztcclxufVxyXG5cclxuZnVuY3Rpb24gYXBwbHlDdXJyZW50VXNlclRvU2V0dGluZ3Moc2V0dGluZ3M6IEN1c3RvbVNldHRpbmdzKTogQ3VzdG9tU2V0dGluZ3Mge1xyXG5cdGNvbnN0IGN1cnJlbnRVc2VyID0gZ2V0Q3VycmVudFVzZXIoKTtcclxuXHRpZiAoY3VycmVudFVzZXIgPT09IG51bGwgfHwgcm9sZU1hcHBpbmcgPT09IHVuZGVmaW5lZCB8fCByb2xlTWFwcGluZ1tjdXJyZW50VXNlci5yb2xlXSA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRyZXR1cm4gc2V0dGluZ3M7XHJcblx0fVxyXG5cclxuXHRpZiAoQXJyYXkuaXNBcnJheShzZXR0aW5ncz8uZW5kcG9pbnRQcm92aWRlcj8ubW9kdWxlcykpIHtcclxuXHRcdHNldHRpbmdzLmVuZHBvaW50UHJvdmlkZXIubW9kdWxlcy5wdXNoKHtcclxuXHRcdFx0ZGF0YTogZGVmaW5pdGlvbkRhdGEsXHJcblx0XHRcdGVuYWJsZWQ6IGRlZmluaXRpb25EYXRhLmVuYWJsZWQsXHJcblx0XHRcdGlkOiBkZWZpbml0aW9uRGF0YS5pZCxcclxuXHRcdFx0ZGVzY3JpcHRpb246IGRlZmluaXRpb25EYXRhLmRlc2NyaXB0aW9uLFxyXG5cdFx0XHRpY29uOiBkZWZpbml0aW9uRGF0YS5pY29uLFxyXG5cdFx0XHRpbmZvOiBkZWZpbml0aW9uRGF0YS5pbmZvLFxyXG5cdFx0XHR0aXRsZTogZGVmaW5pdGlvbkRhdGEudGl0bGUsXHJcblx0XHRcdHVybDogZGVmaW5pdGlvbkRhdGEudXJsXHJcblx0XHR9KTtcclxuXHRcdGlmIChcclxuXHRcdFx0QXJyYXkuaXNBcnJheShzZXR0aW5ncz8uZW5kcG9pbnRQcm92aWRlcj8uZW5kcG9pbnRzKSAmJlxyXG5cdFx0XHRBcnJheS5pc0FycmF5KHNldHRpbmdzPy5hcHBQcm92aWRlcj8uZW5kcG9pbnRJZHMpXHJcblx0XHQpIHtcclxuXHRcdFx0Y29uc3QgYXBwRW5kcG9pbnRzID0gc2V0dGluZ3M/LmFwcFByb3ZpZGVyPy5lbmRwb2ludElkcztcclxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhcHBFbmRwb2ludHMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRpZiAodHlwZW9mIGFwcEVuZHBvaW50c1tpXSA9PT0gXCJzdHJpbmdcIikge1xyXG5cdFx0XHRcdFx0Y29uc3QgZW5kcG9pbnRUb1VwZGF0ZSA9IHNldHRpbmdzLmVuZHBvaW50UHJvdmlkZXIuZW5kcG9pbnRzLmZpbmQoXHJcblx0XHRcdFx0XHRcdChlbmRwb2ludEVudHJ5KSA9PiBlbmRwb2ludEVudHJ5LmlkID09PSBhcHBFbmRwb2ludHNbaV0gJiYgZW5kcG9pbnRFbnRyeS50eXBlID09PSBcImZldGNoXCJcclxuXHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHRpZiAoZW5kcG9pbnRUb1VwZGF0ZSAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0XHRcdGVuZHBvaW50VG9VcGRhdGUudHlwZSA9IFwibW9kdWxlXCI7XHJcblx0XHRcdFx0XHRcdC8vIHRoaXMgaWYgY29uZGl0aW9uIGNoZWNrIGlzIGhlcmUgdG8gbWFrZSB0eXBlc2NyaXB0IGhhcHB5IHdpdGggdGhlIGVuZHBvaW50IHNvIHRoYXQgdHlwZUlkIGNhbiBiZSBzZXRcclxuXHRcdFx0XHRcdFx0aWYgKGVuZHBvaW50VG9VcGRhdGUudHlwZSA9PT0gXCJtb2R1bGVcIikge1xyXG5cdFx0XHRcdFx0XHRcdGVuZHBvaW50VG9VcGRhdGUudHlwZUlkID0gZGVmaW5pdGlvbkRhdGEuaWQ7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGlmIChcclxuXHRcdEFycmF5LmlzQXJyYXkoc2V0dGluZ3M/LnRoZW1lUHJvdmlkZXI/LnRoZW1lcykgJiZcclxuXHRcdHNldHRpbmdzLnRoZW1lUHJvdmlkZXIudGhlbWVzLmxlbmd0aCA+IDAgJiZcclxuXHRcdHJvbGVNYXBwaW5nW2N1cnJlbnRVc2VyLnJvbGVdLnByZWZlcnJlZFNjaGVtZSAhPT0gdW5kZWZpbmVkXHJcblx0KSB7XHJcblx0XHRzZXR0aW5ncy50aGVtZVByb3ZpZGVyLnRoZW1lc1swXS5kZWZhdWx0ID1cclxuXHRcdFx0cm9sZU1hcHBpbmdbY3VycmVudFVzZXIucm9sZV0ucHJlZmVycmVkU2NoZW1lID09PSBcImRhcmtcIiA/IFwiZGFya1wiIDogXCJsaWdodFwiO1xyXG5cdFx0Y29uc3Qgc3RvcmVkU2NoZW1lUHJlZmVyZW5jZSA9IGAke2Zpbi5tZS5pZGVudGl0eS51dWlkfS1TZWxlY3RlZENvbG9yU2NoZW1lYDtcclxuXHRcdGxvZ2dlci53YXJuKFxyXG5cdFx0XHRcIlRoaXMgaXMgYSBkZW1vIG1vZHVsZSB3aGVyZSB3ZSBhcmUgY2xlYXJpbmcgdGhlIGxvY2FsbHkgc3RvcmVkIHNjaGVtZSBwcmVmZXJlbmNlIGluIG9yZGVyIHRvIHNob3cgZGlmZmVyZW50IHNjaGVtZSdzIGxpZ2h0L2RhcmsgYmFzZWQgb24gdXNlciBzZWxlY3Rpb24uIFRoaXMgbWVhbnMgdGhhdCBpdCB3aWxsIGFsd2F5cyBiZSBzZXQgdG8gd2hhdCBpcyBpbiB0aGUgcm9sZSBtYXBwaW5nIGluaXRpYWxseSBhbmQgbm90IHdoYXQgaXQgaXMgc2V0IHRvIGxvY2FsbHkgb24gcmVzdGFydC5cIlxyXG5cdFx0KTtcclxuXHRcdGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKHN0b3JlZFNjaGVtZVByZWZlcmVuY2UpO1xyXG5cdH1cclxuXHJcblx0Y29uc3QgZXhjbHVkZU1lbnVBY3Rpb25JZHMgPSByb2xlTWFwcGluZ1tjdXJyZW50VXNlci5yb2xlXS5leGNsdWRlTWVudUFjdGlvbjtcclxuXHJcblx0aWYgKEFycmF5LmlzQXJyYXkoZXhjbHVkZU1lbnVBY3Rpb25JZHMpKSB7XHJcblx0XHRpZiAoXHJcblx0XHRcdEFycmF5LmlzQXJyYXkoc2V0dGluZ3M/LmJyb3dzZXJQcm92aWRlcj8uZ2xvYmFsTWVudSkgJiZcclxuXHRcdFx0c2V0dGluZ3MuYnJvd3NlclByb3ZpZGVyLmdsb2JhbE1lbnUubGVuZ3RoID4gMFxyXG5cdFx0KSB7XHJcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgc2V0dGluZ3MuYnJvd3NlclByb3ZpZGVyLmdsb2JhbE1lbnUubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRjb25zdCBnbG9iYWxNZW51QWN0aW9uSWQ6IHN0cmluZyA9IHNldHRpbmdzLmJyb3dzZXJQcm92aWRlci5nbG9iYWxNZW51W2ldPy5kYXRhPy5hY3Rpb24/LmlkO1xyXG5cdFx0XHRcdGlmIChleGNsdWRlTWVudUFjdGlvbklkcy5pbmNsdWRlcyhnbG9iYWxNZW51QWN0aW9uSWQpKSB7XHJcblx0XHRcdFx0XHRzZXR0aW5ncy5icm93c2VyUHJvdmlkZXIuZ2xvYmFsTWVudVtpXS5pbmNsdWRlID0gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoc2V0dGluZ3M/LmJyb3dzZXJQcm92aWRlcj8ucGFnZU1lbnUpICYmIHNldHRpbmdzLmJyb3dzZXJQcm92aWRlci5wYWdlTWVudS5sZW5ndGggPiAwKSB7XHJcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgc2V0dGluZ3MuYnJvd3NlclByb3ZpZGVyLnBhZ2VNZW51Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0Y29uc3QgcGFnZU1lbnVBY3Rpb25JZDogc3RyaW5nID0gc2V0dGluZ3MuYnJvd3NlclByb3ZpZGVyLnBhZ2VNZW51W2ldPy5kYXRhPy5hY3Rpb24/LmlkO1xyXG5cdFx0XHRcdGlmIChleGNsdWRlTWVudUFjdGlvbklkcy5pbmNsdWRlcyhwYWdlTWVudUFjdGlvbklkKSkge1xyXG5cdFx0XHRcdFx0c2V0dGluZ3MuYnJvd3NlclByb3ZpZGVyLnBhZ2VNZW51W2ldLmluY2x1ZGUgPSBmYWxzZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRpZiAoQXJyYXkuaXNBcnJheShzZXR0aW5ncz8uYnJvd3NlclByb3ZpZGVyPy52aWV3TWVudSkgJiYgc2V0dGluZ3MuYnJvd3NlclByb3ZpZGVyLnZpZXdNZW51Lmxlbmd0aCA+IDApIHtcclxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzZXR0aW5ncy5icm93c2VyUHJvdmlkZXIudmlld01lbnUubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRjb25zdCB2aWV3TWVudUFjdGlvbklkOiBzdHJpbmcgPSBzZXR0aW5ncy5icm93c2VyUHJvdmlkZXIudmlld01lbnVbaV0/LmRhdGE/LmFjdGlvbj8uaWQ7XHJcblx0XHRcdFx0aWYgKGV4Y2x1ZGVNZW51QWN0aW9uSWRzLmluY2x1ZGVzKHZpZXdNZW51QWN0aW9uSWQpKSB7XHJcblx0XHRcdFx0XHRzZXR0aW5ncy5icm93c2VyUHJvdmlkZXIudmlld01lbnVbaV0uaW5jbHVkZSA9IGZhbHNlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cmV0dXJuIHNldHRpbmdzO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZShcclxuXHRkZWZpbml0aW9uOiBNb2R1bGVEZWZpbml0aW9uPEV4YW1wbGVFbmRwb2ludE9wdGlvbnM+LFxyXG5cdGNyZWF0ZUxvZ2dlcjogTG9nZ2VyQ3JlYXRvcixcclxuXHRoZWxwZXJzPzogbmV2ZXJcclxuKSB7XHJcblx0bG9nZ2VyID0gY3JlYXRlTG9nZ2VyKFwiRXhhbXBsZUF1dGhFbmRwb2ludFwiKTtcclxuXHRsb2dnZXIuaW5mbyhcIldhcyBwYXNzZWQgdGhlIGZvbGxvd2luZyBvcHRpb25zXCIsIGRlZmluaXRpb24uZGF0YSk7XHJcblx0cm9sZU1hcHBpbmcgPSBkZWZpbml0aW9uPy5kYXRhPy5yb2xlTWFwcGluZztcclxuXHRkZWZpbml0aW9uRGF0YSA9IGRlZmluaXRpb247XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZXF1ZXN0UmVzcG9uc2UoXHJcblx0ZW5kcG9pbnREZWZpbml0aW9uOiBFbmRwb2ludERlZmluaXRpb248RmV0Y2hPcHRpb25zPixcclxuXHRyZXF1ZXN0PzogdW5rbm93blxyXG4pOiBQcm9taXNlPHVua25vd24+IHtcclxuXHRpZiAoZW5kcG9pbnREZWZpbml0aW9uLnR5cGUgIT09IFwibW9kdWxlXCIpIHtcclxuXHRcdGxvZ2dlci53YXJuKFxyXG5cdFx0XHRgV2Ugb25seSBleHBlY3QgZW5kcG9pbnRzIG9mIHR5cGUgbW9kdWxlLiBVbmFibGUgdG8gYWN0aW9uIHJlcXVlc3QvcmVzcG9uc2UgZm9yOiAke2VuZHBvaW50RGVmaW5pdGlvbi5pZH1gXHJcblx0XHQpO1xyXG5cdFx0cmV0dXJuIG51bGw7XHJcblx0fVxyXG5cdGlmIChsb2dnZXIgIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0bG9nZ2VyLmluZm8oXHJcblx0XHRcdFwiVGhpcyBhdXRoIGVuZHBvaW50IG1vZHVsZSBpcyBhbiBleGFtcGxlIHRoYXQgdGhhdCBzaW11bGF0ZXMgcmVxdWVzdGluZyBhIGh0dHAgZW5kcG9pbnQgYW5kIG1hbmlwdWxhdGluZyBpdCBiYXNlZCBvbiB0aGUgY3VycmVudCBleGFtcGxlIHVzZXIgYXMgaWYgaXQgd2FzIHRoZSBzZXJ2ZXIgZG9pbmcgdGhlIG1hbmlwdWxhdGlvbi4gRE8gTk9UIFVTRSBUSElTIE1PRFVMRSBJTiBQUk9EVUNUSU9OLlwiXHJcblx0XHQpO1xyXG5cdH1cclxuXHJcblx0Y29uc3QgeyB1cmwsIC4uLm9wdGlvbnMgfSA9IGVuZHBvaW50RGVmaW5pdGlvbi5vcHRpb25zO1xyXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLWFyZ3VtZW50XHJcblx0Y29uc3QgcmVxID0gZ2V0UmVxdWVzdE9wdGlvbnModXJsLCBvcHRpb25zLCByZXF1ZXN0KTtcclxuXHRpZiAocmVxLm9wdGlvbnMubWV0aG9kICE9PSBcIkdFVFwiICYmIHJlcS5vcHRpb25zLm1ldGhvZCAhPT0gXCJQT1NUXCIpIHtcclxuXHRcdGxvZ2dlci53YXJuKFxyXG5cdFx0XHRgJHtlbmRwb2ludERlZmluaXRpb24uaWR9IHNwZWNpZmllcyBhIHR5cGU6ICR7ZW5kcG9pbnREZWZpbml0aW9uLnR5cGV9IHdpdGggYSBtZXRob2QgJHtyZXEub3B0aW9ucy5tZXRob2R9IHRoYXQgaXMgbm90IHN1cHBvcnRlZC5gXHJcblx0XHQpO1xyXG5cdFx0cmV0dXJuIG51bGw7XHJcblx0fVxyXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLWFyZ3VtZW50XHJcblx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChyZXEudXJsLCByZXEub3B0aW9ucyk7XHJcblxyXG5cdGlmIChyZXNwb25zZS5vaykge1xyXG5cdFx0Y29uc3QganNvbiA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcclxuXHRcdGlmIChBcnJheS5pc0FycmF5KGpzb24pKSB7XHJcblx0XHRcdC8vIHJldHVybmVkIGFwcHNcclxuXHRcdFx0cmV0dXJuIGFwcGx5Q3VycmVudFVzZXJUb0FwcHMoanNvbikgYXMgdW5rbm93bjtcclxuXHRcdH1cclxuXHRcdC8vIHNldHRpbmdzXHJcblx0XHRyZXR1cm4gYXBwbHlDdXJyZW50VXNlclRvU2V0dGluZ3MoanNvbikgYXMgdW5rbm93bjtcclxuXHR9XHJcblx0cmV0dXJuIG51bGw7XHJcbn1cclxuIiwiaW1wb3J0IHR5cGUgeyBFeGFtcGxlVXNlciB9IGZyb20gXCIuL3NoYXBlc1wiO1xyXG5cclxuZXhwb3J0IGNvbnN0IEVYQU1QTEVfQVVUSF9DVVJSRU5UX1VTRVJfS0VZID0gYCR7ZmluLm1lLmlkZW50aXR5LnV1aWR9LUVYQU1QTEVfQVVUSF9DVVJSRU5UX1VTRVJgO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEN1cnJlbnRVc2VyKCk6IEV4YW1wbGVVc2VyIHwgbnVsbCB7XHJcblx0Y29uc3Qgc3RvcmVkVXNlciA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKEVYQU1QTEVfQVVUSF9DVVJSRU5UX1VTRVJfS0VZKTtcclxuXHRpZiAoc3RvcmVkVXNlciA9PT0gbnVsbCkge1xyXG5cdFx0cmV0dXJuIG51bGw7XHJcblx0fVxyXG5cdHJldHVybiBKU09OLnBhcnNlKHN0b3JlZFVzZXIpIGFzIEV4YW1wbGVVc2VyO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0Q3VycmVudFVzZXIodXNlcjogRXhhbXBsZVVzZXIpOiB2b2lkIHtcclxuXHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbShFWEFNUExFX0FVVEhfQ1VSUkVOVF9VU0VSX0tFWSwgSlNPTi5zdHJpbmdpZnkodXNlcikpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJDdXJyZW50VXNlcigpIHtcclxuXHRsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShFWEFNUExFX0FVVEhfQ1VSUkVOVF9VU0VSX0tFWSk7XHJcbn1cclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgdHlwZSB7IE1vZHVsZUltcGxlbWVudGF0aW9uLCBNb2R1bGVUeXBlcyB9IGZyb20gXCJjdXN0b21pemUtd29ya3NwYWNlL3NoYXBlcy9tb2R1bGUtc2hhcGVzXCI7XHJcbmltcG9ydCAqIGFzIGF1dGhJbXBsZW1lbnRhdGlvbiBmcm9tIFwiLi9hdXRoXCI7XHJcbmltcG9ydCAqIGFzIGVuZHBvaW50SW1wbGVtZW50YXRpb24gZnJvbSBcIi4vZW5kcG9pbnRcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBlbnRyeVBvaW50czogeyBbdHlwZSBpbiBNb2R1bGVUeXBlc10/OiBNb2R1bGVJbXBsZW1lbnRhdGlvbiB9ID0ge1xyXG5cdGF1dGg6IGF1dGhJbXBsZW1lbnRhdGlvbixcclxuXHRlbmRwb2ludDogZW5kcG9pbnRJbXBsZW1lbnRhdGlvblxyXG59O1xyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=