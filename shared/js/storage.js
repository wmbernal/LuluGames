export function readStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn(`Could not read "${key}" from browser storage.`, error);
    return null;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Could not save "${key}" to browser storage.`, error);
    return false;
  }
}
