(function () {
    window.AsciiWaterLoadingFixture = {
        ready: true,
        init(element) {
            element.textContent = 'OPTIONAL MODULE READY — shell entry remains unchanged';
            element.dataset.moduleReady = 'true';
        }
    };
})();
