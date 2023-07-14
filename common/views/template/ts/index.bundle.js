var __webpack_exports__ = {};
/*!********************************************!*\
  !*** ./client/src/views/template/index.ts ***!
  \********************************************/
async function init() {
    const ticker = document.querySelector("#ticker");
    const execute = document.querySelector("#execute");
    const result = document.querySelector("#result");
    result.textContent = "Not Set";
    execute.addEventListener("click", () => {
        const value = ticker.value;
        console.log(`Value ${value}`);
        result.textContent = ticker.value;
    });
}
document.addEventListener("DOMContentLoaded", async () => {
    try {
        await init();
    }
    catch (error) {
        console.error(error);
    }
});


//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7QUFBQSxLQUFLLFVBQVUsSUFBSTtJQUNsQixNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFtQixTQUFTLENBQUMsQ0FBQztJQUNuRSxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ25ELE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFakQsTUFBTSxDQUFDLFdBQVcsR0FBRyxTQUFTLENBQUM7SUFDL0IsT0FBTyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7UUFDdEMsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUMzQixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUM5QixNQUFNLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDbkMsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDO0FBRUQsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLEtBQUssSUFBSSxFQUFFO0lBQ3hELElBQUk7UUFDSCxNQUFNLElBQUksRUFBRSxDQUFDO0tBQ2I7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDckI7QUFDRixDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL29wZW5maW4td29ya3NwYWNlLS1jb21tb24vLi9jbGllbnQvc3JjL3ZpZXdzL3RlbXBsYXRlL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImFzeW5jIGZ1bmN0aW9uIGluaXQoKSB7XHJcblx0Y29uc3QgdGlja2VyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MSW5wdXRFbGVtZW50PihcIiN0aWNrZXJcIik7XHJcblx0Y29uc3QgZXhlY3V0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZXhlY3V0ZVwiKTtcclxuXHRjb25zdCByZXN1bHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Jlc3VsdFwiKTtcclxuXHJcblx0cmVzdWx0LnRleHRDb250ZW50ID0gXCJOb3QgU2V0XCI7XHJcblx0ZXhlY3V0ZS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG5cdFx0Y29uc3QgdmFsdWUgPSB0aWNrZXIudmFsdWU7XHJcblx0XHRjb25zb2xlLmxvZyhgVmFsdWUgJHt2YWx1ZX1gKTtcclxuXHRcdHJlc3VsdC50ZXh0Q29udGVudCA9IHRpY2tlci52YWx1ZTtcclxuXHR9KTtcclxufVxyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgYXN5bmMgKCkgPT4ge1xyXG5cdHRyeSB7XHJcblx0XHRhd2FpdCBpbml0KCk7XHJcblx0fSBjYXRjaCAoZXJyb3IpIHtcclxuXHRcdGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG5cdH1cclxufSk7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==