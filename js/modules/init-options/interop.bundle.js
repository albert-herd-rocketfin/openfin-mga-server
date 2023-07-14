/******/ var __webpack_modules__ = ({

/***/ "./client/src/modules/init-options/interop/init-options.ts":
/*!*****************************************************************!*\
  !*** ./client/src/modules/init-options/interop/init-options.ts ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "action": () => (/* binding */ action),
/* harmony export */   "initialize": () => (/* binding */ initialize)
/* harmony export */ });
let logger;
async function raiseIntent(payload) {
    const brokerClient = fin.Interop.connectSync(fin.me.identity.uuid, {});
    logger.info(`Received intent to raise. Intent Request ${JSON.stringify(payload, null, 4)}.`);
    await brokerClient.fireIntent(payload);
}
async function shareContext(payload) {
    const brokerClient = fin.Interop.connectSync(fin.me.identity.uuid, {});
    const contextGroups = await brokerClient.getContextGroups();
    const targetContextGroup = contextGroups.find((group) => group.id === payload.contextGroup);
    if (targetContextGroup !== undefined) {
        await brokerClient.joinContextGroup(targetContextGroup.id);
        logger.info(`Received context to send. Context Group ${targetContextGroup.id}. Context: ${JSON.stringify(payload.context, null, 4)}`);
        await brokerClient.setContext(payload.context);
    }
}
async function initialize(definition, createLogger, helpers) {
    logger = createLogger("InitOptionsInteropHandler");
    // the init function could be passed limits (e.g. only support the following intents or contexts. Only publish to the following context groups etc.)
    logger.info("The handler has been loaded");
}
async function action(requestedAction, payload) {
    if (payload === undefined) {
        logger.warn(`Actions passed to the module require a payload to be passed. Requested action: ${requestedAction} can not be fulfilled.`);
        return;
    }
    try {
        switch (requestedAction) {
            case "raise-intent": {
                await raiseIntent(payload);
                break;
            }
            case "share-context": {
                await shareContext(payload);
                break;
            }
        }
    }
    catch (error) {
        logger.error(`Error trying to perform action ${requestedAction}.`, error);
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
/*!**********************************************************!*\
  !*** ./client/src/modules/init-options/interop/index.ts ***!
  \**********************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "entryPoints": () => (/* binding */ entryPoints)
/* harmony export */ });
/* harmony import */ var _init_options__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./init-options */ "./client/src/modules/init-options/interop/init-options.ts");

const entryPoints = {
    initOptions: _init_options__WEBPACK_IMPORTED_MODULE_0__
};

})();

var __webpack_exports__entryPoints = __webpack_exports__.entryPoints;
export { __webpack_exports__entryPoints as entryPoints };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJvcC5idW5kbGUuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWFBLElBQUksTUFBYyxDQUFDO0FBRW5CLEtBQUssVUFBVSxXQUFXLENBQUMsT0FBMkI7SUFDckQsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZFLE1BQU0sQ0FBQyxJQUFJLENBQUMsNENBQTRDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDN0YsTUFBTSxZQUFZLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3hDLENBQUM7QUFFRCxLQUFLLFVBQVUsWUFBWSxDQUFDLE9BQTRCO0lBQ3ZELE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN2RSxNQUFNLGFBQWEsR0FBRyxNQUFNLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQzVELE1BQU0sa0JBQWtCLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDNUYsSUFBSSxrQkFBa0IsS0FBSyxTQUFTLEVBQUU7UUFDckMsTUFBTSxZQUFZLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDM0QsTUFBTSxDQUFDLElBQUksQ0FDViwyQ0FBMkMsa0JBQWtCLENBQUMsRUFBRSxjQUFjLElBQUksQ0FBQyxTQUFTLENBQzNGLE9BQU8sQ0FBQyxPQUFPLEVBQ2YsSUFBSSxFQUNKLENBQUMsQ0FDRCxFQUFFLENBQ0gsQ0FBQztRQUNGLE1BQU0sWUFBWSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDL0M7QUFDRixDQUFDO0FBRU0sS0FBSyxVQUFVLFVBQVUsQ0FDL0IsVUFBNEIsRUFDNUIsWUFBMkIsRUFDM0IsT0FBc0I7SUFFdEIsTUFBTSxHQUFHLFlBQVksQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0lBQ25ELG9KQUFvSjtJQUNwSixNQUFNLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUM7QUFDNUMsQ0FBQztBQUVNLEtBQUssVUFBVSxNQUFNLENBQzNCLGVBQXVCLEVBQ3ZCLE9BQWtEO0lBRWxELElBQUksT0FBTyxLQUFLLFNBQVMsRUFBRTtRQUMxQixNQUFNLENBQUMsSUFBSSxDQUNWLGtGQUFrRixlQUFlLHdCQUF3QixDQUN6SCxDQUFDO1FBQ0YsT0FBTztLQUNQO0lBQ0QsSUFBSTtRQUNILFFBQVEsZUFBZSxFQUFFO1lBQ3hCLEtBQUssY0FBYyxDQUFDLENBQUM7Z0JBQ3BCLE1BQU0sV0FBVyxDQUFDLE9BQTZCLENBQUMsQ0FBQztnQkFDakQsTUFBTTthQUNOO1lBQ0QsS0FBSyxlQUFlLENBQUMsQ0FBQztnQkFDckIsTUFBTSxZQUFZLENBQUMsT0FBOEIsQ0FBQyxDQUFDO2dCQUNuRCxNQUFNO2FBQ047U0FDRDtLQUNEO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZixNQUFNLENBQUMsS0FBSyxDQUFDLGtDQUFrQyxlQUFlLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztLQUMxRTtBQUNGLENBQUM7Ozs7Ozs7U0N4RUQ7U0FDQTs7U0FFQTtTQUNBO1NBQ0E7U0FDQTtTQUNBO1NBQ0E7U0FDQTtTQUNBO1NBQ0E7U0FDQTtTQUNBO1NBQ0E7U0FDQTs7U0FFQTtTQUNBOztTQUVBO1NBQ0E7U0FDQTs7Ozs7VUN0QkE7VUFDQTtVQUNBO1VBQ0E7VUFDQSx5Q0FBeUMsd0NBQXdDO1VBQ2pGO1VBQ0E7VUFDQTs7Ozs7VUNQQTs7Ozs7VUNBQTtVQUNBO1VBQ0E7VUFDQSx1REFBdUQsaUJBQWlCO1VBQ3hFO1VBQ0EsZ0RBQWdELGFBQWE7VUFDN0Q7Ozs7Ozs7Ozs7Ozs7OztBQ0w0RDtBQUVyRCxNQUFNLFdBQVcsR0FBcUQ7SUFDNUUsV0FBVyxFQUFFLDBDQUF5QjtDQUN0QyxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vb3BlbmZpbi13b3Jrc3BhY2UtLWN1c3RvbWl6ZS13b3Jrc3BhY2UvLi9jbGllbnQvc3JjL21vZHVsZXMvaW5pdC1vcHRpb25zL2ludGVyb3AvaW5pdC1vcHRpb25zLnRzIiwid2VicGFjazovL29wZW5maW4td29ya3NwYWNlLS1jdXN0b21pemUtd29ya3NwYWNlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL29wZW5maW4td29ya3NwYWNlLS1jdXN0b21pemUtd29ya3NwYWNlL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9vcGVuZmluLXdvcmtzcGFjZS0tY3VzdG9taXplLXdvcmtzcGFjZS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL29wZW5maW4td29ya3NwYWNlLS1jdXN0b21pemUtd29ya3NwYWNlL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vb3BlbmZpbi13b3Jrc3BhY2UtLWN1c3RvbWl6ZS13b3Jrc3BhY2UvLi9jbGllbnQvc3JjL21vZHVsZXMvaW5pdC1vcHRpb25zL2ludGVyb3AvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBMb2dnZXIsIExvZ2dlckNyZWF0b3IgfSBmcm9tIFwiY3VzdG9taXplLXdvcmtzcGFjZS9zaGFwZXMvbG9nZ2VyLXNoYXBlc1wiO1xyXG5pbXBvcnQgdHlwZSB7IE1vZHVsZURlZmluaXRpb24sIE1vZHVsZUhlbHBlcnMgfSBmcm9tIFwiY3VzdG9taXplLXdvcmtzcGFjZS9zaGFwZXMvbW9kdWxlLXNoYXBlc1wiO1xyXG5cclxuaW50ZXJmYWNlIFJhaXNlSW50ZW50UGF5bG9hZCB7XHJcblx0bmFtZTogc3RyaW5nO1xyXG5cdGNvbnRleHQ6IE9wZW5GaW4uQ29udGV4dDtcclxufVxyXG5cclxuaW50ZXJmYWNlIFNoYXJlQ29udGV4dFBheWxvYWQge1xyXG5cdGNvbnRleHRHcm91cDogc3RyaW5nO1xyXG5cdGNvbnRleHQ6IE9wZW5GaW4uQ29udGV4dDtcclxufVxyXG5cclxubGV0IGxvZ2dlcjogTG9nZ2VyO1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gcmFpc2VJbnRlbnQocGF5bG9hZDogUmFpc2VJbnRlbnRQYXlsb2FkKSB7XHJcblx0Y29uc3QgYnJva2VyQ2xpZW50ID0gZmluLkludGVyb3AuY29ubmVjdFN5bmMoZmluLm1lLmlkZW50aXR5LnV1aWQsIHt9KTtcclxuXHRsb2dnZXIuaW5mbyhgUmVjZWl2ZWQgaW50ZW50IHRvIHJhaXNlLiBJbnRlbnQgUmVxdWVzdCAke0pTT04uc3RyaW5naWZ5KHBheWxvYWQsIG51bGwsIDQpfS5gKTtcclxuXHRhd2FpdCBicm9rZXJDbGllbnQuZmlyZUludGVudChwYXlsb2FkKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gc2hhcmVDb250ZXh0KHBheWxvYWQ6IFNoYXJlQ29udGV4dFBheWxvYWQpIHtcclxuXHRjb25zdCBicm9rZXJDbGllbnQgPSBmaW4uSW50ZXJvcC5jb25uZWN0U3luYyhmaW4ubWUuaWRlbnRpdHkudXVpZCwge30pO1xyXG5cdGNvbnN0IGNvbnRleHRHcm91cHMgPSBhd2FpdCBicm9rZXJDbGllbnQuZ2V0Q29udGV4dEdyb3VwcygpO1xyXG5cdGNvbnN0IHRhcmdldENvbnRleHRHcm91cCA9IGNvbnRleHRHcm91cHMuZmluZCgoZ3JvdXApID0+IGdyb3VwLmlkID09PSBwYXlsb2FkLmNvbnRleHRHcm91cCk7XHJcblx0aWYgKHRhcmdldENvbnRleHRHcm91cCAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRhd2FpdCBicm9rZXJDbGllbnQuam9pbkNvbnRleHRHcm91cCh0YXJnZXRDb250ZXh0R3JvdXAuaWQpO1xyXG5cdFx0bG9nZ2VyLmluZm8oXHJcblx0XHRcdGBSZWNlaXZlZCBjb250ZXh0IHRvIHNlbmQuIENvbnRleHQgR3JvdXAgJHt0YXJnZXRDb250ZXh0R3JvdXAuaWR9LiBDb250ZXh0OiAke0pTT04uc3RyaW5naWZ5KFxyXG5cdFx0XHRcdHBheWxvYWQuY29udGV4dCxcclxuXHRcdFx0XHRudWxsLFxyXG5cdFx0XHRcdDRcclxuXHRcdFx0KX1gXHJcblx0XHQpO1xyXG5cdFx0YXdhaXQgYnJva2VyQ2xpZW50LnNldENvbnRleHQocGF5bG9hZC5jb250ZXh0KTtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbml0aWFsaXplKFxyXG5cdGRlZmluaXRpb246IE1vZHVsZURlZmluaXRpb24sXHJcblx0Y3JlYXRlTG9nZ2VyOiBMb2dnZXJDcmVhdG9yLFxyXG5cdGhlbHBlcnM6IE1vZHVsZUhlbHBlcnNcclxuKSB7XHJcblx0bG9nZ2VyID0gY3JlYXRlTG9nZ2VyKFwiSW5pdE9wdGlvbnNJbnRlcm9wSGFuZGxlclwiKTtcclxuXHQvLyB0aGUgaW5pdCBmdW5jdGlvbiBjb3VsZCBiZSBwYXNzZWQgbGltaXRzIChlLmcuIG9ubHkgc3VwcG9ydCB0aGUgZm9sbG93aW5nIGludGVudHMgb3IgY29udGV4dHMuIE9ubHkgcHVibGlzaCB0byB0aGUgZm9sbG93aW5nIGNvbnRleHQgZ3JvdXBzIGV0Yy4pXHJcblx0bG9nZ2VyLmluZm8oXCJUaGUgaGFuZGxlciBoYXMgYmVlbiBsb2FkZWRcIik7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhY3Rpb24oXHJcblx0cmVxdWVzdGVkQWN0aW9uOiBzdHJpbmcsXHJcblx0cGF5bG9hZD86IFJhaXNlSW50ZW50UGF5bG9hZCB8IFNoYXJlQ29udGV4dFBheWxvYWRcclxuKTogUHJvbWlzZTx2b2lkPiB7XHJcblx0aWYgKHBheWxvYWQgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0bG9nZ2VyLndhcm4oXHJcblx0XHRcdGBBY3Rpb25zIHBhc3NlZCB0byB0aGUgbW9kdWxlIHJlcXVpcmUgYSBwYXlsb2FkIHRvIGJlIHBhc3NlZC4gUmVxdWVzdGVkIGFjdGlvbjogJHtyZXF1ZXN0ZWRBY3Rpb259IGNhbiBub3QgYmUgZnVsZmlsbGVkLmBcclxuXHRcdCk7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cdHRyeSB7XHJcblx0XHRzd2l0Y2ggKHJlcXVlc3RlZEFjdGlvbikge1xyXG5cdFx0XHRjYXNlIFwicmFpc2UtaW50ZW50XCI6IHtcclxuXHRcdFx0XHRhd2FpdCByYWlzZUludGVudChwYXlsb2FkIGFzIFJhaXNlSW50ZW50UGF5bG9hZCk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdFx0Y2FzZSBcInNoYXJlLWNvbnRleHRcIjoge1xyXG5cdFx0XHRcdGF3YWl0IHNoYXJlQ29udGV4dChwYXlsb2FkIGFzIFNoYXJlQ29udGV4dFBheWxvYWQpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSBjYXRjaCAoZXJyb3IpIHtcclxuXHRcdGxvZ2dlci5lcnJvcihgRXJyb3IgdHJ5aW5nIHRvIHBlcmZvcm0gYWN0aW9uICR7cmVxdWVzdGVkQWN0aW9ufS5gLCBlcnJvcik7XHJcblx0fVxyXG59XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHR5cGUgeyBNb2R1bGVJbXBsZW1lbnRhdGlvbiwgTW9kdWxlVHlwZXMgfSBmcm9tIFwiY3VzdG9taXplLXdvcmtzcGFjZS9zaGFwZXMvbW9kdWxlLXNoYXBlc1wiO1xyXG5pbXBvcnQgKiBhcyBpbml0T3B0aW9uc0ltcGxlbWVudGF0aW9uIGZyb20gXCIuL2luaXQtb3B0aW9uc1wiO1xyXG5cclxuZXhwb3J0IGNvbnN0IGVudHJ5UG9pbnRzOiB7IFt0eXBlIGluIE1vZHVsZVR5cGVzXT86IE1vZHVsZUltcGxlbWVudGF0aW9uIH0gPSB7XHJcblx0aW5pdE9wdGlvbnM6IGluaXRPcHRpb25zSW1wbGVtZW50YXRpb25cclxufTtcclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9