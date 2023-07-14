/******/ var __webpack_modules__ = ({

/***/ "./client/src/modules/analytics/console/analytics.ts":
/*!***********************************************************!*\
  !*** ./client/src/modules/analytics/console/analytics.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ConsoleAnalyticsModule": () => (/* binding */ ConsoleAnalyticsModule)
/* harmony export */ });
/**
 * Implement the analytics module using the console.
 */
class ConsoleAnalyticsModule {
    /**
     * Initialize the module.
     * @param definition The definition of the module from configuration include custom options.
     * @param loggerCreator For logging entries.
     * @param helpers Helper methods for the module to interact with the application core.
     * @returns Nothing.
     */
    async initialize(definition, loggerCreator, helpers) {
        this._logger = loggerCreator("ConsoleAnalyticsModule");
        this._logger.info("Initialized");
        this._logger.info("Session Id: ", helpers.sessionId);
        const logLevel = definition?.data?.eventLogLevel === "trace" ? "debug" : definition?.data?.eventLogLevel ?? "info";
        this._logEvent = (message, events) => {
            // we don't want to trace the function so we log it as debug/verbose
            this._logger[logLevel](message, JSON.stringify(events));
        };
    }
    /**
     * Handle Analytics. This example module simple console logs the events. You could batch the events and pass settings (number to batch etc, destination to send events) via the module definition.
     * @param events one of more analytic events.
     */
    async handleAnalytics(events) {
        this._logEvent("Received the following analytics events", events);
    }
    /**
     * Closedown the module. If this module had any cached events it needed to process it could try and flush them here.
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
/*!*******************************************************!*\
  !*** ./client/src/modules/analytics/console/index.ts ***!
  \*******************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "entryPoints": () => (/* binding */ entryPoints)
/* harmony export */ });
/* harmony import */ var _analytics__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./analytics */ "./client/src/modules/analytics/console/analytics.ts");

const entryPoints = {
    analytics: new _analytics__WEBPACK_IMPORTED_MODULE_0__.ConsoleAnalyticsModule()
};

})();

var __webpack_exports__entryPoints = __webpack_exports__.entryPoints;
export { __webpack_exports__entryPoints as entryPoints };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc29sZS5idW5kbGUuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBS0E7O0dBRUc7QUFDSSxNQUFNLHNCQUFzQjtJQUtsQzs7Ozs7O09BTUc7SUFDSSxLQUFLLENBQUMsVUFBVSxDQUN0QixVQUFxRCxFQUNyRCxhQUE0QixFQUM1QixPQUFzQjtRQUV0QixJQUFJLENBQUMsT0FBTyxHQUFHLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDckQsTUFBTSxRQUFRLEdBQ2IsVUFBVSxFQUFFLElBQUksRUFBRSxhQUFhLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsYUFBYSxJQUFJLE1BQU0sQ0FBQztRQUNuRyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ3BDLG9FQUFvRTtZQUNwRSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDekQsQ0FBQyxDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7T0FHRztJQUNJLEtBQUssQ0FBQyxlQUFlLENBQUMsTUFBZ0M7UUFDNUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyx5Q0FBeUMsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBRUQ7O09BRUc7SUFDSSxLQUFLLENBQUMsU0FBUztRQUNyQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUNuQyxDQUFDO0NBQ0Q7Ozs7Ozs7U0NsREQ7U0FDQTs7U0FFQTtTQUNBO1NBQ0E7U0FDQTtTQUNBO1NBQ0E7U0FDQTtTQUNBO1NBQ0E7U0FDQTtTQUNBO1NBQ0E7U0FDQTs7U0FFQTtTQUNBOztTQUVBO1NBQ0E7U0FDQTs7Ozs7VUN0QkE7VUFDQTtVQUNBO1VBQ0E7VUFDQSx5Q0FBeUMsd0NBQXdDO1VBQ2pGO1VBQ0E7VUFDQTs7Ozs7VUNQQTs7Ozs7VUNBQTtVQUNBO1VBQ0E7VUFDQSx1REFBdUQsaUJBQWlCO1VBQ3hFO1VBQ0EsZ0RBQWdELGFBQWE7VUFDN0Q7Ozs7Ozs7Ozs7Ozs7OztBQ0xxRDtBQUU5QyxNQUFNLFdBQVcsR0FBcUQ7SUFDNUUsU0FBUyxFQUFFLElBQUksOERBQXNCLEVBQUU7Q0FDdkMsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL29wZW5maW4td29ya3NwYWNlLS1jdXN0b21pemUtd29ya3NwYWNlLy4vY2xpZW50L3NyYy9tb2R1bGVzL2FuYWx5dGljcy9jb25zb2xlL2FuYWx5dGljcy50cyIsIndlYnBhY2s6Ly9vcGVuZmluLXdvcmtzcGFjZS0tY3VzdG9taXplLXdvcmtzcGFjZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9vcGVuZmluLXdvcmtzcGFjZS0tY3VzdG9taXplLXdvcmtzcGFjZS93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vb3BlbmZpbi13b3Jrc3BhY2UtLWN1c3RvbWl6ZS13b3Jrc3BhY2Uvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9vcGVuZmluLXdvcmtzcGFjZS0tY3VzdG9taXplLXdvcmtzcGFjZS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL29wZW5maW4td29ya3NwYWNlLS1jdXN0b21pemUtd29ya3NwYWNlLy4vY2xpZW50L3NyYy9tb2R1bGVzL2FuYWx5dGljcy9jb25zb2xlL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgTG9nZ2VyLCBMb2dnZXJDcmVhdG9yIH0gZnJvbSBcImN1c3RvbWl6ZS13b3Jrc3BhY2Uvc2hhcGVzXCI7XHJcbmltcG9ydCB0eXBlIHsgQW5hbHl0aWNzTW9kdWxlLCBQbGF0Zm9ybUFuYWx5dGljc0V2ZW50IH0gZnJvbSBcImN1c3RvbWl6ZS13b3Jrc3BhY2Uvc2hhcGVzL2FuYWx5dGljcy1zaGFwZXNcIjtcclxuaW1wb3J0IHR5cGUgeyBNb2R1bGVEZWZpbml0aW9uLCBNb2R1bGVIZWxwZXJzIH0gZnJvbSBcImN1c3RvbWl6ZS13b3Jrc3BhY2Uvc2hhcGVzL21vZHVsZS1zaGFwZXNcIjtcclxuaW1wb3J0IHR5cGUgeyBDb25zb2xlQW5hbHl0aWNzT3B0aW9ucyB9IGZyb20gXCIuL3NoYXBlc1wiO1xyXG5cclxuLyoqXHJcbiAqIEltcGxlbWVudCB0aGUgYW5hbHl0aWNzIG1vZHVsZSB1c2luZyB0aGUgY29uc29sZS5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBDb25zb2xlQW5hbHl0aWNzTW9kdWxlIGltcGxlbWVudHMgQW5hbHl0aWNzTW9kdWxlPENvbnNvbGVBbmFseXRpY3NPcHRpb25zPiB7XHJcblx0cHJpdmF0ZSBfbG9nZ2VyOiBMb2dnZXI7XHJcblxyXG5cdHByaXZhdGUgX2xvZ0V2ZW50OiAobWVzc2FnZTogc3RyaW5nLCBldmVudHM6IFBsYXRmb3JtQW5hbHl0aWNzRXZlbnRbXSkgPT4gdm9pZDtcclxuXHJcblx0LyoqXHJcblx0ICogSW5pdGlhbGl6ZSB0aGUgbW9kdWxlLlxyXG5cdCAqIEBwYXJhbSBkZWZpbml0aW9uIFRoZSBkZWZpbml0aW9uIG9mIHRoZSBtb2R1bGUgZnJvbSBjb25maWd1cmF0aW9uIGluY2x1ZGUgY3VzdG9tIG9wdGlvbnMuXHJcblx0ICogQHBhcmFtIGxvZ2dlckNyZWF0b3IgRm9yIGxvZ2dpbmcgZW50cmllcy5cclxuXHQgKiBAcGFyYW0gaGVscGVycyBIZWxwZXIgbWV0aG9kcyBmb3IgdGhlIG1vZHVsZSB0byBpbnRlcmFjdCB3aXRoIHRoZSBhcHBsaWNhdGlvbiBjb3JlLlxyXG5cdCAqIEByZXR1cm5zIE5vdGhpbmcuXHJcblx0ICovXHJcblx0cHVibGljIGFzeW5jIGluaXRpYWxpemUoXHJcblx0XHRkZWZpbml0aW9uOiBNb2R1bGVEZWZpbml0aW9uPENvbnNvbGVBbmFseXRpY3NPcHRpb25zPixcclxuXHRcdGxvZ2dlckNyZWF0b3I6IExvZ2dlckNyZWF0b3IsXHJcblx0XHRoZWxwZXJzOiBNb2R1bGVIZWxwZXJzXHJcblx0KTogUHJvbWlzZTx2b2lkPiB7XHJcblx0XHR0aGlzLl9sb2dnZXIgPSBsb2dnZXJDcmVhdG9yKFwiQ29uc29sZUFuYWx5dGljc01vZHVsZVwiKTtcclxuXHRcdHRoaXMuX2xvZ2dlci5pbmZvKFwiSW5pdGlhbGl6ZWRcIik7XHJcblx0XHR0aGlzLl9sb2dnZXIuaW5mbyhcIlNlc3Npb24gSWQ6IFwiLCBoZWxwZXJzLnNlc3Npb25JZCk7XHJcblx0XHRjb25zdCBsb2dMZXZlbCA9XHJcblx0XHRcdGRlZmluaXRpb24/LmRhdGE/LmV2ZW50TG9nTGV2ZWwgPT09IFwidHJhY2VcIiA/IFwiZGVidWdcIiA6IGRlZmluaXRpb24/LmRhdGE/LmV2ZW50TG9nTGV2ZWwgPz8gXCJpbmZvXCI7XHJcblx0XHR0aGlzLl9sb2dFdmVudCA9IChtZXNzYWdlLCBldmVudHMpID0+IHtcclxuXHRcdFx0Ly8gd2UgZG9uJ3Qgd2FudCB0byB0cmFjZSB0aGUgZnVuY3Rpb24gc28gd2UgbG9nIGl0IGFzIGRlYnVnL3ZlcmJvc2VcclxuXHRcdFx0dGhpcy5fbG9nZ2VyW2xvZ0xldmVsXShtZXNzYWdlLCBKU09OLnN0cmluZ2lmeShldmVudHMpKTtcclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBIYW5kbGUgQW5hbHl0aWNzLiBUaGlzIGV4YW1wbGUgbW9kdWxlIHNpbXBsZSBjb25zb2xlIGxvZ3MgdGhlIGV2ZW50cy4gWW91IGNvdWxkIGJhdGNoIHRoZSBldmVudHMgYW5kIHBhc3Mgc2V0dGluZ3MgKG51bWJlciB0byBiYXRjaCBldGMsIGRlc3RpbmF0aW9uIHRvIHNlbmQgZXZlbnRzKSB2aWEgdGhlIG1vZHVsZSBkZWZpbml0aW9uLlxyXG5cdCAqIEBwYXJhbSBldmVudHMgb25lIG9mIG1vcmUgYW5hbHl0aWMgZXZlbnRzLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhc3luYyBoYW5kbGVBbmFseXRpY3MoZXZlbnRzOiBQbGF0Zm9ybUFuYWx5dGljc0V2ZW50W10pOiBQcm9taXNlPHZvaWQ+IHtcclxuXHRcdHRoaXMuX2xvZ0V2ZW50KFwiUmVjZWl2ZWQgdGhlIGZvbGxvd2luZyBhbmFseXRpY3MgZXZlbnRzXCIsIGV2ZW50cyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDbG9zZWRvd24gdGhlIG1vZHVsZS4gSWYgdGhpcyBtb2R1bGUgaGFkIGFueSBjYWNoZWQgZXZlbnRzIGl0IG5lZWRlZCB0byBwcm9jZXNzIGl0IGNvdWxkIHRyeSBhbmQgZmx1c2ggdGhlbSBoZXJlLlxyXG5cdCAqL1xyXG5cdHB1YmxpYyBhc3luYyBjbG9zZWRvd24/KCk6IFByb21pc2U8dm9pZD4ge1xyXG5cdFx0dGhpcy5fbG9nZ2VyLmluZm8oXCJjbG9zaW5nIGRvd25cIik7XHJcblx0fVxyXG59XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHR5cGUgeyBNb2R1bGVJbXBsZW1lbnRhdGlvbiwgTW9kdWxlVHlwZXMgfSBmcm9tIFwiY3VzdG9taXplLXdvcmtzcGFjZS9zaGFwZXMvbW9kdWxlLXNoYXBlc1wiO1xyXG5pbXBvcnQgeyBDb25zb2xlQW5hbHl0aWNzTW9kdWxlIH0gZnJvbSBcIi4vYW5hbHl0aWNzXCI7XHJcblxyXG5leHBvcnQgY29uc3QgZW50cnlQb2ludHM6IHsgW3R5cGUgaW4gTW9kdWxlVHlwZXNdPzogTW9kdWxlSW1wbGVtZW50YXRpb24gfSA9IHtcclxuXHRhbmFseXRpY3M6IG5ldyBDb25zb2xlQW5hbHl0aWNzTW9kdWxlKClcclxufTtcclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9