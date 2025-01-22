## DIY Vue
本项目从零逐步重写一个涵盖 Vue3 核心逻辑的的微模型，遵循真实的 Vue3 代码结构，但不会包含所有的优化以及非必要的功能，主要包括三大核心模块: reactivity（响应系统）、runtime（渲染器）、compiler（编译器），以此来深入学习理解 Vue3 源码。

项目主要参考《Vue.js 设计与实现》与 [mini-vue](https://github.com/cuixiaorui/mini-vue)

## 项目特点
1. 剔除源码中边界处理的相关代码，聚焦于核心逻辑的流程。
2. 保持代码命名与源码一致，便于两者的对照学习。 

## 渐进式实现的功能
- 项目初始化：集成 jest 测试环境
- 实现 effect、reactive、依赖收集、依赖触发
- 实现 effect 返回 runner
- 实现 effect 的 scheduler （调度器）
- 实现 stop
- 实现 readonly
- 重构 reative 和 readonly
- 现实 isReactive 和 isReadonly
- 优化 stop
- 实现 reactive 和 readonly（嵌套对象转换）
- 实现 shallowReadonly
- 实现 isProxy
- 实现 ref
- 实现 isRef 和 unRef
- 实现 computed
- 使用 rollup（打包库）
- 实现 初始化 component 和 element 的主流程
- 实现 组件代理对象（setup 中 this 的指向）
- 实现 shapeFlags（描述虚拟节点的类型）
- 实现 事件注册
- 实现 组件 props
- 实现 组件 emit
- 实现 组件 slots
- 实现 Fragment 和 Text 类型节点
- 实现 getCurrentInstance
- 实现 provide/inject
- 实现 自定义渲染器
- 实现 element 更新（基于 children 和 props）
- 实现 简单 Diff 算法
- 实现 双端 Diff 算法
- 实现 快速 Diff 算法
- 实现 组件更新
- 实现 视图异步更新和 nextTick
- 优化 computed
- 实现 watch 和 watchEffct
- 实现 生命周期钩子: onBeforeMount、onMounted、onBeforeUpdate、onUpdated

## jest 用法
[jest 官网](https://jestjs.io/zh-Hans/docs/getting-started)
```
yarn test # 测试所有文件
yarn test ./src/compiler-core/tests/parse.spec.ts # 测试指定文件
yarn test --watch # 监视有改动的测试
```
