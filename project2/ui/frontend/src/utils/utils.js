export function getLocalStorageItem (name) {
    const item = window.localStorage.getItem(name)
    return JSON.parse(item)
}

export function setLocalStorageItem (name, value) {
    window.localStorage.setItem(name, JSON.stringify(value))
}

export function removeLocalStorageItem (name) {
    window.localStorage.removeItem(name)
}
