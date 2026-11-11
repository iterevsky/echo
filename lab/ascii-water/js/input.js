(function () {
    const root = window.AsciiWater = window.AsciiWater || {};
    const TAP_DISTANCE = 8;
    const TAP_DURATION = 250;
    const MAX_POINTERS = 3;
    const HOVER_INTERVAL = 40;
    const DRAG_INTERVAL = 24;
    const MAX_VELOCITY = 4000;
    const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

    class InputController {
        constructor(canvas, renderer, options) {
            this.canvas = canvas;
            this.renderer = renderer;
            this.onTap = options && options.onTap || null;
            this.moduleState = options && options.moduleState || (() => 'ready');
            this.queueImpulse = options && options.queueImpulse || null;
            this.pointers = new Map();
            this.taps = [];
            this.entrySignals = [];
            this.effects = [];
            this.listeners = [];
            this.lastHoverTime = -Infinity;
            this.destroyed = false;
            this.pointerDown = this.pointerDown.bind(this);
            this.pointerMove = this.pointerMove.bind(this);
            this.pointerUp = this.pointerUp.bind(this);
            this.pointerCancel = this.pointerCancel.bind(this);
            this.lostPointerCapture = this.lostPointerCapture.bind(this);
            this.pointerLeave = this.pointerLeave.bind(this);
            this.keyboardEntry = this.keyboardEntry.bind(this);
            this.cancelAll = this.cancelAll.bind(this);
            this.visibilityChange = this.visibilityChange.bind(this);
            this.listen(canvas, 'pointerdown', this.pointerDown);
            this.listen(canvas, 'pointermove', this.pointerMove);
            this.listen(canvas, 'pointerup', this.pointerUp);
            this.listen(canvas, 'pointercancel', this.pointerCancel);
            this.listen(canvas, 'lostpointercapture', this.lostPointerCapture);
            this.listen(canvas, 'pointerleave', this.pointerLeave);
            this.listen(canvas, 'keydown', this.keyboardEntry);
            this.listen(window, 'blur', this.cancelAll);
            this.listen(document, 'visibilitychange', this.visibilityChange);
        }

        listen(target, type, handler) {
            target.addEventListener(type, handler);
            this.listeners.push([target, type, handler]);
        }

        eventTime(event) {
            return Number.isFinite(event.timeStamp) ? event.timeStamp : performance.now();
        }

        prevent(event) {
            if (event.cancelable !== false && event.preventDefault) event.preventDefault();
        }

        toGrid(clientX, clientY) {
            const bounds = this.canvas.getBoundingClientRect();
            const cssX = clamp(clientX - bounds.left, 0, bounds.width);
            const cssY = clamp(clientY - bounds.top, 0, bounds.height);
            return {
                x: clamp(cssX / this.renderer.cellWidth, 0, Math.max(0, this.renderer.cols - 1)),
                y: clamp(cssY / this.renderer.cellHeight, 0, Math.max(0, this.renderer.rows - 1)),
                normalizedX: this.renderer.cols > 1 ? cssX / bounds.width : 0,
                normalizedY: this.renderer.rows > 1 ? cssY / bounds.height : 0,
                cssX,
                cssY,
                dpr: this.renderer.dpr,
                cellPx: this.renderer.cellPx
            };
        }

        log(mapping, event, point, extra) {
            const entry = Object.assign({
                mapping,
                pointerId: event.pointerId,
                pointerType: event.pointerType,
                eventTime: this.eventTime(event),
                x: point ? point.x : null,
                y: point ? point.y : null
            }, extra || {});
            this.effects.push(entry);
            if (this.effects.length > 200) this.effects.shift();
            return entry;
        }

        emit(mapping, event, point, strength, radius, velocity) {
            if (this.moduleState() !== 'ready') {
                this.log('impulse-discarded', event, point, { strength, radius, moduleState: this.moduleState() });
                return null;
            }
            const sourceId = this.renderer.drop(point.x, point.y, strength, radius);
            const source = this.renderer.waves.sources.find(item => item.id === sourceId);
            if (source) {
                source.input = true;
                source.inputPointerId = event.pointerId;
                source.mapping = mapping;
            }
            const effect = this.log(mapping, event, point, { sourceId, strength, radius, velocity });
            const metrics = this.renderer.metrics;
            if (metrics && metrics.recordInput) metrics.recordInput(this.eventTime(event), mapping);
            return effect;
        }

        retirePointerSources(pointerId) {
            const sources = this.renderer.waves.sources;
            for (let i = sources.length - 1; i >= 0; i--) {
                if (sources[i].input && pointerId !== null && sources[i].inputPointerId === pointerId) sources.splice(i, 1);
                else if (sources[i].input && pointerId === null) sources.splice(i, 1);
            }
        }

        pointerDown(event) {
            if (this.destroyed || event.isPrimary === false && event.pointerType === 'mouse') return;
            if (event.pointerType === 'mouse' && event.button !== 0) return;
            if (this.pointers.has(event.pointerId)) this.pointerCancel(event);
            if (this.pointers.size >= MAX_POINTERS) {
                this.log('cap-reject', event, this.toGrid(event.clientX, event.clientY));
                return;
            }
            this.prevent(event);
            const time = this.eventTime(event);
            this.pointers.set(event.pointerId, {
                id: event.pointerId,
                pointerType: event.pointerType,
                state: 'pending',
                startTime: time,
                startClientX: event.clientX,
                startClientY: event.clientY,
                lastMoveTime: time,
                lastX: event.clientX,
                lastY: event.clientY,
                lastImpulseTime: -Infinity
            });
            try { this.canvas.setPointerCapture(event.pointerId); } catch (error) { /* Synthetic lab events may not own native capture. */ }
            this.log('pending', event, this.toGrid(event.clientX, event.clientY));
        }

        pointerMove(event) {
            if (this.destroyed) return;
            const pointer = this.pointers.get(event.pointerId);
            if (!pointer) {
                if (event.pointerType === 'mouse' && event.buttons === 0) this.hover(event);
                return;
            }
            this.prevent(event);
            const time = this.eventTime(event);
            const dx = event.clientX - pointer.startClientX;
            const dy = event.clientY - pointer.startClientY;
            const distance = Math.hypot(dx, dy);
            if (pointer.state === 'pending' && distance >= TAP_DISTANCE) pointer.state = 'drag';
            const moveSeconds = Math.max(0.001, (time - pointer.lastMoveTime) / 1000);
            const moveDistance = Math.hypot(event.clientX - pointer.lastX, event.clientY - pointer.lastY);
            const velocity = clamp(moveDistance / moveSeconds, 0, MAX_VELOCITY);
            pointer.lastMoveTime = time;
            pointer.lastX = event.clientX;
            pointer.lastY = event.clientY;
            if (pointer.state !== 'drag' || time - pointer.lastImpulseTime < DRAG_INTERVAL) return;
            const strength = clamp(0.12 + velocity / 2000 * 0.53, 0.12, 0.65);
            this.emit((pointer.pointerType === 'mouse' ? 'mouse' : pointer.pointerType) + '-drag', event, this.toGrid(event.clientX, event.clientY), strength, 2, velocity);
            pointer.lastImpulseTime = time;
        }

        hover(event) {
            const time = this.eventTime(event);
            if (time - this.lastHoverTime < HOVER_INTERVAL) return;
            const previousX = this.hoverX === undefined ? event.clientX : this.hoverX;
            const previousY = this.hoverY === undefined ? event.clientY : this.hoverY;
            const previousTime = this.hoverTime === undefined ? time - 16 : this.hoverTime;
            const seconds = Math.max(0.001, (time - previousTime) / 1000);
            const velocity = clamp(Math.hypot(event.clientX - previousX, event.clientY - previousY) / seconds, 0, MAX_VELOCITY);
            const strength = clamp(0.035 + velocity / 2500 * 0.045, 0.035, 0.08);
            this.emit('mouse-hover', event, this.toGrid(event.clientX, event.clientY), strength, 2, velocity);
            this.lastHoverTime = time;
            this.hoverTime = time;
            this.hoverX = event.clientX;
            this.hoverY = event.clientY;
        }

        pointerUp(event) {
            if (this.destroyed) return;
            const pointer = this.pointers.get(event.pointerId);
            if (!pointer) return;
            this.prevent(event);
            const time = this.eventTime(event);
            const duration = time - pointer.startTime;
            const distance = Math.hypot(event.clientX - pointer.startClientX, event.clientY - pointer.startClientY);
            if (pointer.state === 'pending' && distance >= TAP_DISTANCE) pointer.state = 'drag';
            if (pointer.state === 'pending' && distance < TAP_DISTANCE && duration < TAP_DURATION) {
                this.triggerTap(event, this.toGrid(pointer.startClientX, pointer.startClientY), pointer.id, pointer.pointerType, duration, pointer.startClientX, pointer.startClientY);
            } else {
                const point = this.toGrid(pointer.startClientX, pointer.startClientY);
                this.log(pointer.state === 'drag' ? 'drag-end' : 'long-press-end', event, point, { duration });
            }
            this.pointers.delete(event.pointerId);
            try { this.canvas.releasePointerCapture(event.pointerId); } catch (error) { /* Synthetic lab events may not own native capture. */ }
        }

        triggerTap(event, point, pointerId, pointerType, duration, clientX, clientY) {
            const mouse = pointerType === 'mouse';
            const keyboard = pointerType === 'keyboard';
            const strength = mouse ? 1.1 : 0.65;
            const readiness = this.moduleState();
            if (readiness === 'ready') {
                this.emit(keyboard ? 'keyboard-entry' : mouse ? 'mouse-click' : pointerType + '-tap', event, point, strength, 3, 0);
            } else if (readiness === 'loading' && this.queueImpulse) {
                const queuedId = this.queueImpulse({ x: point.x, y: point.y, strength, radius: 3, pointerId, pointerType, eventTime: this.eventTime(event) });
                this.log('queued-impulse', event, point, { strength, radius: 3, queuedId });
            } else {
                this.log('impulse-discarded', event, point, { strength, radius: 3, moduleState: readiness });
            }
            const tap = {
                pointerId,
                pointerType,
                eventTime: this.eventTime(event),
                duration,
                clientX,
                clientY,
                x: point.x,
                y: point.y,
                normalizedX: point.normalizedX,
                normalizedY: point.normalizedY,
                dpr: point.dpr,
                cellPx: point.cellPx,
                moduleState: readiness
            };
            this.taps.push(tap);
            this.entrySignals.push(tap);
            if (this.taps.length > 100) this.taps.shift();
            if (this.entrySignals.length > 100) this.entrySignals.shift();
            this.log('tap-callback', event, point, { duration, moduleState: readiness });
            if (this.onTap) this.onTap(tap);
        }

        keyboardEntry(event) {
            if (this.destroyed || event.repeat || event.key !== 'Enter' && event.key !== ' ') return;
            this.prevent(event);
            const bounds = this.canvas.getBoundingClientRect();
            const clientX = bounds.left + bounds.width / 2;
            const clientY = bounds.top + bounds.height / 2;
            this.triggerTap(event, this.toGrid(clientX, clientY), 'keyboard', 'keyboard', 0, clientX, clientY);
        }

        pointerCancel(event) {
            if (!this.pointers.has(event.pointerId)) return;
            this.cancelPointer(event.pointerId, 'pointercancel', event);
        }

        cancelPointer(pointerId, reason, event) {
            const pointer = this.pointers.get(pointerId);
            if (!pointer) return;
            this.pointers.delete(pointerId);
            this.retirePointerSources(pointerId);
            this.log(reason, event || { pointerId, pointerType: pointer.pointerType, timeStamp: performance.now() }, null);
            try { this.canvas.releasePointerCapture(pointerId); } catch (error) { /* Capture may already be released. */ }
        }

        lostPointerCapture(event) {
            if (this.pointers.has(event.pointerId)) this.cancelPointer(event.pointerId, 'lostpointercapture', event);
        }

        pointerLeave(event) {
            if (!this.pointers.has(event.pointerId)) {
                this.lastHoverTime = -Infinity;
                this.hoverTime = undefined;
            }
        }

        cancelAll() {
            for (const pointer of this.pointers.values()) {
                this.retirePointerSources(pointer.id);
                this.log('blur-cancel', { pointerId: pointer.id, pointerType: pointer.pointerType, timeStamp: performance.now() }, null);
            }
            this.pointers.clear();
            this.retirePointerSources(null);
            this.lastHoverTime = -Infinity;
            this.hoverTime = undefined;
        }

        visibilityChange() {
            if (document.hidden) this.cancelAll();
        }

        destroy() {
            if (this.destroyed) return;
            this.cancelAll();
            for (const [target, type, handler] of this.listeners) target.removeEventListener(type, handler);
            this.listeners.length = 0;
            this.destroyed = true;
        }
    }

    class EntryImpulseGateway {
        constructor(renderer, onDrop) {
            this.renderer = renderer;
            this.onDrop = onDrop;
            this.state = 'ready';
            this.visible = true;
            this.pending = null;
            this.sequence = 0;
        }

        setLoading() {
            this.state = 'loading';
            this.visible = true;
            this.pending = null;
        }

        ready() {
            if (this.state === 'failed' || !this.visible) return null;
            this.state = 'ready';
            const pending = this.pending;
            this.pending = null;
            if (pending && this.visible) {
                this.onDrop(pending);
                return pending;
            }
            return null;
        }

        fail() {
            this.state = 'failed';
            this.visible = false;
            this.pending = null;
        }

        cover() {
            this.visible = false;
            this.pending = null;
        }

        queue(impulse) {
            if (this.state !== 'loading' || !this.visible) return null;
            this.pending = Object.assign({}, impulse, { id: ++this.sequence });
            return this.pending.id;
        }

        getState() {
            return { state: this.state, visible: this.visible, pending: this.pending };
        }
    }

    root.InputController = InputController;
    root.EntryImpulseGateway = EntryImpulseGateway;
})();
