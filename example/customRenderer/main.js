import { createRenderer } from "../../lib/diy-vue.esm.js";
import { App } from "./App.js";

const game = new PIXI.Application({
  width: 500,
  height: 500,
});

document.body.append(game.view);

const renderer = createRenderer({
  createElement(type) {
    if (type === "rect") {
      const rect = new PIXI.Graphics();
      rect.beginFill(0xff0000); // 颜色
      rect.drawRect(0, 0, 1, 1); // x, y, width, height (位置、宽高)
      rect.endFill();

      return rect;
    }
  },
  patchProp(el, key, prevVal, nextVal) {
    el[key] = nextVal;
  },
  insert(el, parent) {
    parent.addChild(el);
  },
});

renderer.createApp(App).mount(game.stage);
