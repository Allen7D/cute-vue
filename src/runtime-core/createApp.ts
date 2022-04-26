export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      rootContainer.innerHTML = rootComponent;
    },
  };
}
