import "@testing-library/jest-dom/vitest";
import "vitest-axe/extend-expect";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false
  })
});

Object.defineProperty(Element.prototype, "hasPointerCapture", { value: () => false });
Object.defineProperty(Element.prototype, "setPointerCapture", { value: () => undefined });
Object.defineProperty(Element.prototype, "releasePointerCapture", { value: () => undefined });
Object.defineProperty(Element.prototype, "scrollIntoView", { value: () => undefined });

class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, "ResizeObserver", { writable: true, value: TestResizeObserver });
Object.defineProperty(globalThis, "ResizeObserver", { writable: true, value: TestResizeObserver });
Object.defineProperty(HTMLCanvasElement.prototype, "getContext", { value: () => null });
