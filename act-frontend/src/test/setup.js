import '@testing-library/jest-dom'

// Mock global window functions that are not implemented in JSDOM
window.alert = () => {}
window.confirm = () => true
