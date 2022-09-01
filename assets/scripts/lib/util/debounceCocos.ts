import { Component } from 'cc';

export function debounceCocos(component: Component, fn: Function, timeout = 1) {
  let lastFn: Function;
  return (...args: any[]) => {
    component.unschedule(lastFn);
    lastFn = () => fn.call(component, ...args);
    component.scheduleOnce(lastFn, timeout);
  };
}
