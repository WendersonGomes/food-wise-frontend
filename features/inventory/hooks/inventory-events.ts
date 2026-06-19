type InventoryInvalidationListener = () => void;
type InventoryInvalidationScope = "items" | "categories" | "dashboard";

const listeners = new Set<InventoryInvalidationListener>();
const clearListeners = new Set<InventoryInvalidationListener>();
const scopedListeners = new Map<
  InventoryInvalidationScope,
  Set<InventoryInvalidationListener>
>();

function subscribeScopedInventoryInvalidation(
  scope: InventoryInvalidationScope,
  listener: InventoryInvalidationListener,
) {
  let listenersForScope = scopedListeners.get(scope);

  if (!listenersForScope) {
    listenersForScope = new Set();
    scopedListeners.set(scope, listenersForScope);
  }

  listenersForScope.add(listener);

  return () => {
    listenersForScope?.delete(listener);

    if (listenersForScope?.size === 0) {
      scopedListeners.delete(scope);
    }
  };
}

function invalidateScopedInventoryQueries(scope: InventoryInvalidationScope) {
  scopedListeners.get(scope)?.forEach((listener) => listener());
}

export function subscribeInventoryInvalidation(
  listener: InventoryInvalidationListener,
) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function invalidateInventoryQueries() {
  listeners.forEach((listener) => listener());
  scopedListeners.forEach((listenersForScope) => {
    listenersForScope.forEach((listener) => listener());
  });
}

export function subscribeInventoryItemsInvalidation(
  listener: InventoryInvalidationListener,
) {
  return subscribeScopedInventoryInvalidation("items", listener);
}

export function subscribeInventoryCategoriesInvalidation(
  listener: InventoryInvalidationListener,
) {
  return subscribeScopedInventoryInvalidation("categories", listener);
}

export function subscribeInventoryDashboardInvalidation(
  listener: InventoryInvalidationListener,
) {
  return subscribeScopedInventoryInvalidation("dashboard", listener);
}

export function invalidateInventoryItems() {
  invalidateScopedInventoryQueries("items");
}

export function invalidateInventoryCategories() {
  invalidateScopedInventoryQueries("categories");
}

export function invalidateInventoryDashboard() {
  invalidateScopedInventoryQueries("dashboard");
}

export function subscribeInventoryClear(listener: InventoryInvalidationListener) {
  clearListeners.add(listener);

  return () => {
    clearListeners.delete(listener);
  };
}

export function clearInventoryClientCaches() {
  clearListeners.forEach((listener) => listener());
}
