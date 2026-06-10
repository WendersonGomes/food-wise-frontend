type InventoryInvalidationListener = () => void;

const listeners = new Set<InventoryInvalidationListener>();

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
}
