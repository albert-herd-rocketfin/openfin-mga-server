/******/ var __webpack_modules__ = ({

/***/ "./client/src/modules/log/console/log.ts":
/*!***********************************************!*\
  !*** ./client/src/modules/log/console/log.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ConsoleLogProvider": () => (/* binding */ ConsoleLogProvider)
/* harmony export */ });
/**
 * Implement the log provider using the console.
 */
class ConsoleLogProvider {
    /**
     * Initialise the module.
     * @param definition The definition of the module from configuration include custom options.
     * @param loggerCreator For logging entries.
     * @param helpers Helper methods for the module to interact with the application core.
     * @returns Nothing.
     */
    async initialize(definition, loggerCreator, helpers) {
        this._includeLevels = definition.data?.includeLevels ?? ["info", "warn", "error", "debug", "trace"];
    }
    /**
     * Log data.
     * @param identity The identity sending the message.
     * @param group The group sending the log message.
     * @param level The level of the message to log.
     * @param message The message to log.
     * @param optionalParams Optional parameters for details.
     */
    log(identity, group, level, message, ...optionalParams) {
        if (this._includeLevels.includes(level)) {
            this.handleGroup(group, identity);
            console[level](message, ...optionalParams);
        }
    }
    /**
     * Convert a string to a color.
     * @param str The string to convert.
     * @returns The color.
     */
    stringToColor(str) {
        // eslint-disable-next-line no-bitwise
        const stringUniqueHash = [...str].reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
        return `hsl(${stringUniqueHash % 360}, 95%, 35%)`;
    }
    /**
     * Handle a group.
     * @param group The group.
     */
    handleGroup(group, identity) {
        const newGroupIdentity = `${group} ${identity}`;
        if (this._lastGroupIdentity !== newGroupIdentity) {
            this._lastGroupIdentity = newGroupIdentity;
            if (this._lastGroupIdentity) {
                console.groupEnd();
            }
            if (group.length > 0) {
                console.group(`%c${group}%c${identity}`, `color: #ffffff; background: ${this.stringToColor(group)}; font-size: 10px; font-weight: bold; padding: 2px 4px; border-radius: 5px`, `color: #ffffff; background: ${this.stringToColor(identity)}; font-size: 10px; font-weight: bold; padding: 2px 4px; margin-left: 4px; border-radius: 5px`);
            }
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
/*!*************************************************!*\
  !*** ./client/src/modules/log/console/index.ts ***!
  \*************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "entryPoints": () => (/* binding */ entryPoints)
/* harmony export */ });
/* harmony import */ var _log__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./log */ "./client/src/modules/log/console/log.ts");

const entryPoints = {
    log: new _log__WEBPACK_IMPORTED_MODULE_0__.ConsoleLogProvider()
};

})();

var __webpack_exports__entryPoints = __webpack_exports__.entryPoints;
export { __webpack_exports__entryPoints as entryPoints };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc29sZS5idW5kbGUuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBSUE7O0dBRUc7QUFDSSxNQUFNLGtCQUFrQjtJQVc5Qjs7Ozs7O09BTUc7SUFDSSxLQUFLLENBQUMsVUFBVSxDQUN0QixVQUErQyxFQUMvQyxhQUE0QixFQUM1QixPQUFzQjtRQUV0QixJQUFJLENBQUMsY0FBYyxHQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQUUsYUFBYSxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3JHLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0ksR0FBRyxDQUNULFFBQWdCLEVBQ2hCLEtBQWEsRUFDYixLQUFlLEVBQ2YsT0FBZ0IsRUFDaEIsR0FBRyxjQUF5QjtRQUU1QixJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3hDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ2xDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxjQUFjLENBQUMsQ0FBQztTQUMzQztJQUNGLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssYUFBYSxDQUFDLEdBQVc7UUFDaEMsc0NBQXNDO1FBQ3RDLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNwRyxPQUFPLE9BQU8sZ0JBQWdCLEdBQUcsR0FBRyxhQUFhLENBQUM7SUFDbkQsQ0FBQztJQUVEOzs7T0FHRztJQUNLLFdBQVcsQ0FBQyxLQUFhLEVBQUUsUUFBZ0I7UUFDbEQsTUFBTSxnQkFBZ0IsR0FBRyxHQUFHLEtBQUssSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUNoRCxJQUFJLElBQUksQ0FBQyxrQkFBa0IsS0FBSyxnQkFBZ0IsRUFBRTtZQUNqRCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsZ0JBQWdCLENBQUM7WUFDM0MsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7Z0JBQzVCLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNuQjtZQUNELElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3JCLE9BQU8sQ0FBQyxLQUFLLENBQ1osS0FBSyxLQUFLLEtBQUssUUFBUSxFQUFFLEVBQ3pCLCtCQUErQixJQUFJLENBQUMsYUFBYSxDQUNoRCxLQUFLLENBQ0wsNEVBQTRFLEVBQzdFLCtCQUErQixJQUFJLENBQUMsYUFBYSxDQUNoRCxRQUFRLENBQ1IsOEZBQThGLENBQy9GLENBQUM7YUFDRjtTQUNEO0lBQ0YsQ0FBQztDQUNEOzs7Ozs7O1NDekZEO1NBQ0E7O1NBRUE7U0FDQTtTQUNBO1NBQ0E7U0FDQTtTQUNBO1NBQ0E7U0FDQTtTQUNBO1NBQ0E7U0FDQTtTQUNBO1NBQ0E7O1NBRUE7U0FDQTs7U0FFQTtTQUNBO1NBQ0E7Ozs7O1VDdEJBO1VBQ0E7VUFDQTtVQUNBO1VBQ0EseUNBQXlDLHdDQUF3QztVQUNqRjtVQUNBO1VBQ0E7Ozs7O1VDUEE7Ozs7O1VDQUE7VUFDQTtVQUNBO1VBQ0EsdURBQXVELGlCQUFpQjtVQUN4RTtVQUNBLGdEQUFnRCxhQUFhO1VBQzdEOzs7Ozs7Ozs7Ozs7Ozs7QUNMMkM7QUFFcEMsTUFBTSxXQUFXLEdBQXFEO0lBQzVFLEdBQUcsRUFBRSxJQUFJLG9EQUFrQixFQUFFO0NBQzdCLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9vcGVuZmluLXdvcmtzcGFjZS0tY3VzdG9taXplLXdvcmtzcGFjZS8uL2NsaWVudC9zcmMvbW9kdWxlcy9sb2cvY29uc29sZS9sb2cudHMiLCJ3ZWJwYWNrOi8vb3BlbmZpbi13b3Jrc3BhY2UtLWN1c3RvbWl6ZS13b3Jrc3BhY2Uvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vb3BlbmZpbi13b3Jrc3BhY2UtLWN1c3RvbWl6ZS13b3Jrc3BhY2Uvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL29wZW5maW4td29ya3NwYWNlLS1jdXN0b21pemUtd29ya3NwYWNlL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vb3BlbmZpbi13b3Jrc3BhY2UtLWN1c3RvbWl6ZS13b3Jrc3BhY2Uvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9vcGVuZmluLXdvcmtzcGFjZS0tY3VzdG9taXplLXdvcmtzcGFjZS8uL2NsaWVudC9zcmMvbW9kdWxlcy9sb2cvY29uc29sZS9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IExvZ2dlckNyZWF0b3IsIExvZ0xldmVsLCBMb2dQcm92aWRlciB9IGZyb20gXCJjdXN0b21pemUtd29ya3NwYWNlL3NoYXBlcy9sb2dnZXItc2hhcGVzXCI7XHJcbmltcG9ydCB0eXBlIHsgTW9kdWxlRGVmaW5pdGlvbiwgTW9kdWxlSGVscGVycyB9IGZyb20gXCJjdXN0b21pemUtd29ya3NwYWNlL3NoYXBlcy9tb2R1bGUtc2hhcGVzXCI7XHJcbmltcG9ydCB0eXBlIHsgQ29uc29sZUxvZ09wdGlvbnMgfSBmcm9tIFwiLi9zaGFwZXNcIjtcclxuXHJcbi8qKlxyXG4gKiBJbXBsZW1lbnQgdGhlIGxvZyBwcm92aWRlciB1c2luZyB0aGUgY29uc29sZS5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBDb25zb2xlTG9nUHJvdmlkZXIgaW1wbGVtZW50cyBMb2dQcm92aWRlcjxDb25zb2xlTG9nT3B0aW9ucz4ge1xyXG5cdC8qKlxyXG5cdCAqIFRoZSBsZXZlbHMgb2YgbG9nZ2luZyB0byBpbmNsdWRlLlxyXG5cdCAqL1xyXG5cdHByaXZhdGUgX2luY2x1ZGVMZXZlbHM6IExvZ0xldmVsW107XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBsYXN0IGdyb3VwIGlkZW50aXR5IG91dHB1dC5cclxuXHQgKi9cclxuXHRwcml2YXRlIF9sYXN0R3JvdXBJZGVudGl0eTogc3RyaW5nO1xyXG5cclxuXHQvKipcclxuXHQgKiBJbml0aWFsaXNlIHRoZSBtb2R1bGUuXHJcblx0ICogQHBhcmFtIGRlZmluaXRpb24gVGhlIGRlZmluaXRpb24gb2YgdGhlIG1vZHVsZSBmcm9tIGNvbmZpZ3VyYXRpb24gaW5jbHVkZSBjdXN0b20gb3B0aW9ucy5cclxuXHQgKiBAcGFyYW0gbG9nZ2VyQ3JlYXRvciBGb3IgbG9nZ2luZyBlbnRyaWVzLlxyXG5cdCAqIEBwYXJhbSBoZWxwZXJzIEhlbHBlciBtZXRob2RzIGZvciB0aGUgbW9kdWxlIHRvIGludGVyYWN0IHdpdGggdGhlIGFwcGxpY2F0aW9uIGNvcmUuXHJcblx0ICogQHJldHVybnMgTm90aGluZy5cclxuXHQgKi9cclxuXHRwdWJsaWMgYXN5bmMgaW5pdGlhbGl6ZShcclxuXHRcdGRlZmluaXRpb246IE1vZHVsZURlZmluaXRpb248Q29uc29sZUxvZ09wdGlvbnM+LFxyXG5cdFx0bG9nZ2VyQ3JlYXRvcjogTG9nZ2VyQ3JlYXRvcixcclxuXHRcdGhlbHBlcnM6IE1vZHVsZUhlbHBlcnNcclxuXHQpOiBQcm9taXNlPHZvaWQ+IHtcclxuXHRcdHRoaXMuX2luY2x1ZGVMZXZlbHMgPSBkZWZpbml0aW9uLmRhdGE/LmluY2x1ZGVMZXZlbHMgPz8gW1wiaW5mb1wiLCBcIndhcm5cIiwgXCJlcnJvclwiLCBcImRlYnVnXCIsIFwidHJhY2VcIl07XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBMb2cgZGF0YS5cclxuXHQgKiBAcGFyYW0gaWRlbnRpdHkgVGhlIGlkZW50aXR5IHNlbmRpbmcgdGhlIG1lc3NhZ2UuXHJcblx0ICogQHBhcmFtIGdyb3VwIFRoZSBncm91cCBzZW5kaW5nIHRoZSBsb2cgbWVzc2FnZS5cclxuXHQgKiBAcGFyYW0gbGV2ZWwgVGhlIGxldmVsIG9mIHRoZSBtZXNzYWdlIHRvIGxvZy5cclxuXHQgKiBAcGFyYW0gbWVzc2FnZSBUaGUgbWVzc2FnZSB0byBsb2cuXHJcblx0ICogQHBhcmFtIG9wdGlvbmFsUGFyYW1zIE9wdGlvbmFsIHBhcmFtZXRlcnMgZm9yIGRldGFpbHMuXHJcblx0ICovXHJcblx0cHVibGljIGxvZyhcclxuXHRcdGlkZW50aXR5OiBzdHJpbmcsXHJcblx0XHRncm91cDogc3RyaW5nLFxyXG5cdFx0bGV2ZWw6IExvZ0xldmVsLFxyXG5cdFx0bWVzc2FnZTogdW5rbm93bixcclxuXHRcdC4uLm9wdGlvbmFsUGFyYW1zOiB1bmtub3duW11cclxuXHQpOiB2b2lkIHtcclxuXHRcdGlmICh0aGlzLl9pbmNsdWRlTGV2ZWxzLmluY2x1ZGVzKGxldmVsKSkge1xyXG5cdFx0XHR0aGlzLmhhbmRsZUdyb3VwKGdyb3VwLCBpZGVudGl0eSk7XHJcblx0XHRcdGNvbnNvbGVbbGV2ZWxdKG1lc3NhZ2UsIC4uLm9wdGlvbmFsUGFyYW1zKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENvbnZlcnQgYSBzdHJpbmcgdG8gYSBjb2xvci5cclxuXHQgKiBAcGFyYW0gc3RyIFRoZSBzdHJpbmcgdG8gY29udmVydC5cclxuXHQgKiBAcmV0dXJucyBUaGUgY29sb3IuXHJcblx0ICovXHJcblx0cHJpdmF0ZSBzdHJpbmdUb0NvbG9yKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1iaXR3aXNlXHJcblx0XHRjb25zdCBzdHJpbmdVbmlxdWVIYXNoID0gWy4uLnN0cl0ucmVkdWNlKChhY2MsIGNoYXIpID0+IGNoYXIuY2hhckNvZGVBdCgwKSArICgoYWNjIDw8IDUpIC0gYWNjKSwgMCk7XHJcblx0XHRyZXR1cm4gYGhzbCgke3N0cmluZ1VuaXF1ZUhhc2ggJSAzNjB9LCA5NSUsIDM1JSlgO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSGFuZGxlIGEgZ3JvdXAuXHJcblx0ICogQHBhcmFtIGdyb3VwIFRoZSBncm91cC5cclxuXHQgKi9cclxuXHRwcml2YXRlIGhhbmRsZUdyb3VwKGdyb3VwOiBzdHJpbmcsIGlkZW50aXR5OiBzdHJpbmcpOiB2b2lkIHtcclxuXHRcdGNvbnN0IG5ld0dyb3VwSWRlbnRpdHkgPSBgJHtncm91cH0gJHtpZGVudGl0eX1gO1xyXG5cdFx0aWYgKHRoaXMuX2xhc3RHcm91cElkZW50aXR5ICE9PSBuZXdHcm91cElkZW50aXR5KSB7XHJcblx0XHRcdHRoaXMuX2xhc3RHcm91cElkZW50aXR5ID0gbmV3R3JvdXBJZGVudGl0eTtcclxuXHRcdFx0aWYgKHRoaXMuX2xhc3RHcm91cElkZW50aXR5KSB7XHJcblx0XHRcdFx0Y29uc29sZS5ncm91cEVuZCgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChncm91cC5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0Y29uc29sZS5ncm91cChcclxuXHRcdFx0XHRcdGAlYyR7Z3JvdXB9JWMke2lkZW50aXR5fWAsXHJcblx0XHRcdFx0XHRgY29sb3I6ICNmZmZmZmY7IGJhY2tncm91bmQ6ICR7dGhpcy5zdHJpbmdUb0NvbG9yKFxyXG5cdFx0XHRcdFx0XHRncm91cFxyXG5cdFx0XHRcdFx0KX07IGZvbnQtc2l6ZTogMTBweDsgZm9udC13ZWlnaHQ6IGJvbGQ7IHBhZGRpbmc6IDJweCA0cHg7IGJvcmRlci1yYWRpdXM6IDVweGAsXHJcblx0XHRcdFx0XHRgY29sb3I6ICNmZmZmZmY7IGJhY2tncm91bmQ6ICR7dGhpcy5zdHJpbmdUb0NvbG9yKFxyXG5cdFx0XHRcdFx0XHRpZGVudGl0eVxyXG5cdFx0XHRcdFx0KX07IGZvbnQtc2l6ZTogMTBweDsgZm9udC13ZWlnaHQ6IGJvbGQ7IHBhZGRpbmc6IDJweCA0cHg7IG1hcmdpbi1sZWZ0OiA0cHg7IGJvcmRlci1yYWRpdXM6IDVweGBcclxuXHRcdFx0XHQpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG59XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHR5cGUgeyBNb2R1bGVJbXBsZW1lbnRhdGlvbiwgTW9kdWxlVHlwZXMgfSBmcm9tIFwiY3VzdG9taXplLXdvcmtzcGFjZS9zaGFwZXMvbW9kdWxlLXNoYXBlc1wiO1xyXG5pbXBvcnQgeyBDb25zb2xlTG9nUHJvdmlkZXIgfSBmcm9tIFwiLi9sb2dcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBlbnRyeVBvaW50czogeyBbdHlwZSBpbiBNb2R1bGVUeXBlc10/OiBNb2R1bGVJbXBsZW1lbnRhdGlvbiB9ID0ge1xyXG5cdGxvZzogbmV3IENvbnNvbGVMb2dQcm92aWRlcigpXHJcbn07XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==