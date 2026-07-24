const STATE_VERSION = 1;
const DEFAULT_STORAGE_KEY = "pitchiq_integrated_v1";

function clone(value) {
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value));
  }
}

function freezeSnapshot(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freezeSnapshot);
  return Object.freeze(value);
}

export class StateStore {
  constructor({
    storage = window.localStorage,
    key = DEFAULT_STORAGE_KEY,
    version = STATE_VERSION,
    defaults = {},
    normalize = value => value,
    migrations = {},
    eventTarget = window,
  } = {}) {
    this.storage = storage;
    this.key = key;
    this.version = version;
    this.defaults = clone(defaults);
    this.normalize = normalize;
    this.migrations = migrations;
    this.eventTarget = eventTarget;
    this.state = null;
  }

  load() {
    let envelope = null;
    try {
      const raw = this.storage.getItem(this.key);
      envelope = raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn("[PitchIQ StateStore] Corrupt state recovered", error);
      this.storage.removeItem(this.key);
    }

    const migrated = this.#migrateEnvelope(envelope);
    const normalized = this.normalize(clone(migrated.data));
    this.state = normalized;
    return this.getSnapshot();
  }

  getSnapshot() {
    if (!this.state) this.load();
    return freezeSnapshot(clone(this.state));
  }

  replace(nextState, { source = "replace", persist = true } = {}) {
    const previous = this.getSnapshot();
    this.state = this.normalize(clone(nextState));
    if (persist) this.#persist();
    const snapshot = this.getSnapshot();
    this.#emit(previous, snapshot, source);
    return snapshot;
  }

  update(mutator, { source = "update", persist = true } = {}) {
    if (typeof mutator !== "function") throw new TypeError("StateStore.update requires a mutator function");
    const draft = clone(this.getSnapshot());
    const result = mutator(draft);
    return this.replace(result === undefined ? draft : result, { source, persist });
  }

  reset({ source = "reset" } = {}) {
    const previous = this.getSnapshot();
    this.storage.removeItem(this.key);
    this.state = this.normalize(clone(this.defaults));
    const snapshot = this.getSnapshot();
    this.#emit(previous, snapshot, source);
    return snapshot;
  }

  #migrateEnvelope(envelope) {
    if (!envelope || typeof envelope !== "object") {
      return { version: this.version, data: clone(this.defaults) };
    }

    let currentVersion = Number(envelope.version || 0);
    let data = envelope.data && typeof envelope.data === "object" ? clone(envelope.data) : clone(envelope);

    while (currentVersion < this.version) {
      const migrate = this.migrations[currentVersion + 1];
      if (typeof migrate === "function") data = migrate(clone(data));
      currentVersion += 1;
    }

    return { version: this.version, data };
  }

  #persist() {
    try {
      this.storage.setItem(this.key, JSON.stringify({ version: this.version, data: this.state }));
    } catch (error) {
      console.warn("[PitchIQ StateStore] Save failed", error);
    }
  }

  #emit(previous, current, source) {
    this.eventTarget?.dispatchEvent?.(new CustomEvent("pitchiq:state-change", {
      detail: { previous, current, source, version: this.version },
    }));
  }
}

export { DEFAULT_STORAGE_KEY, STATE_VERSION };
