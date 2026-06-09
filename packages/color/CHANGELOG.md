# @yakit-libs/color

## 1.2.0

### Minor Changes

- 重构为 JS/TypeScript API，移除 SCSS 静态 CSS 构建
- 新增 `generateColors`、`applyThemeColors`、`generateAllSemanticColors` 等运行时方法
- 支持按需从 `@yakit-libs/color/generator` 与 `@yakit-libs/color/component` 子路径导入

## 1.1.2

### Minor Changes

- 同步 Yakit 主题色生成逻辑：Purple 深浅色模式基色覆盖、Main-0 由混色结果动态推导 8% 透明度
- 修正暗色模式语义色：Neutral Bg 使用 Neutral-10，Basic Background 使用 Neutral-0

## 1.0.2

### Patch Changes

- 9334f78: add readme, modify package.json

## 1.0.1

### Patch Changes

- a681561: fix repository qs
