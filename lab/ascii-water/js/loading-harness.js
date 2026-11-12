(function () {
    const parameters = new URLSearchParams(location.search);
    const scenario = parameters.get('scenario') || 'delay';
    const state = {
        status: 'idle',
        attempt: 0,
        pending: false,
        ready: false,
        entryCount: 0,
        fixtureBytes: 0,
        error: '',
        trigger: '',
        events: []
    };
    let modulePromise = null;
    const moduleState = document.getElementById('module-state');
    const entryState = document.getElementById('entry-state');
    const moduleElement = document.getElementById('module');
    const eventLog = document.getElementById('event-log');

    function record(type, details) {
        state.events.push({ type, details, at: performance.now() });
        eventLog.textContent = state.events.map(event => event.at.toFixed(1) + ' ' + event.type + (event.details ? ' — ' + event.details : '')).join('\n');
        moduleState.textContent = 'Module ' + state.status + ' · attempt ' + state.attempt;
        entryState.textContent = 'Entries completed: ' + state.entryCount;
    }

    function loadModule(trigger) {
        if (state.ready) return Promise.resolve(window.AsciiWaterLoadingFixture);
        if (modulePromise) {
            record('cache-join', trigger);
            return modulePromise;
        }
        state.attempt++;
        state.pending = true;
        state.status = 'loading';
        state.error = '';
        state.trigger = trigger;
        record('load', trigger);
        const attempt = state.attempt;
        const script = document.createElement('script');
        script.dataset.waterModule = String(attempt);
        script.async = true;
        script.src = 'loading-fixture.js?scenario=' + encodeURIComponent(scenario) + '&attempt=' + attempt;
        const currentPromise = new Promise((resolve, reject) => {
            function fail(error) {
                script.remove();
                state.pending = false;
                state.ready = false;
                state.status = 'error';
                state.error = error.message;
                modulePromise = null;
                moduleElement.textContent = 'Optional module unavailable — shell remains usable.';
                record('error', error.message);
                reject(error);
            }
            script.onload = () => {
                const fixture = window.AsciiWaterLoadingFixture;
                if (!fixture || !fixture.ready) {
                    fail(new Error('Module did not initialize'));
                    return;
                }
                state.pending = false;
                state.ready = true;
                state.status = 'ready';
                const resource = performance.getEntriesByType('resource').find(entry => entry.name.includes('loading-fixture.js') && entry.name.includes('attempt=' + attempt));
                state.fixtureBytes = resource ? resource.transferSize || resource.encodedBodySize : 0;
                fixture.init(moduleElement);
                record('ready', trigger);
                resolve(fixture);
            };
            script.onerror = () => fail(new Error('Module request failed'));
            document.head.appendChild(script);
        });
        modulePromise = currentPromise;
        return currentPromise;
    }

    function entry(source) {
        state.entryCount++;
        record('entry', source + ' · moduleReady=' + state.ready);
        if (state.status === 'idle') loadModule(source);
        return true;
    }

    document.getElementById('entry').addEventListener('click', () => entry('button'));
    document.getElementById('cover').addEventListener('pointerdown', event => {
        if (event.target.closest('button')) return;
        entry('pointer-intent');
    });
    document.getElementById('retry').addEventListener('click', () => {
        loadModule('deliberate-retry').catch(() => null);
    });

    if (parameters.get('manual') !== '1') {
        const schedule = window.requestIdleCallback || (callback => setTimeout(callback, 250));
        schedule(() => {
            if (state.status === 'idle') loadModule('idle').catch(() => null);
        }, { timeout: 250 });
    }

    window.loadingHarness = {
        load: trigger => loadModule(trigger || 'probe'),
        entry,
        getState() {
            return Object.assign({}, state, {
                scriptCount: document.querySelectorAll('script[data-water-module]').length,
                promiseCached: Boolean(modulePromise),
                events: state.events.slice()
            });
        }
    };
    record('interactive', 'shell ready before module');
})();
