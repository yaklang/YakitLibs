<p align="center">
  @yakit-libs/color
</p>

Yakit 主题色与语义色变量生成库，通过 JavaScript/TypeScript 在运行时生成 CSS 变量。

### 我们为什么创建这个项目？

在前端开发中，保持色彩的一致性既重要又耗时。我们设计这套颜色变量的目的，是为了提供一个美观且实用的色彩方案，帮助快速实现视觉统一。

此项目通过 JS 方法生成颜色变量对象，可在运行时注入到 `document.documentElement`，支持主题切换与主色覆盖，无需依赖 SCSS 编译。

### 如何使用

**1. 安装**

```bash
npm install @yakit-libs/color
```

**2. 生成并应用颜色变量**

```typescript
import { generateColors, applyThemeColors } from '@yakit-libs/color'

const theme = 'light'
const colors = generateColors(theme)

// 可选：覆盖 Main 主色
// const colors = generateColors(theme, '#F17F30')

applyThemeColors(theme, colors)
```

**3. 按需使用底层 API**

```typescript
import {
  generateAllThemeColors,
  generateAllSemanticColors,
  generateSemanticColors,
} from '@yakit-libs/color'

// 仅生成基础色阶（--yakit-colors-*）
const themeColors = generateAllThemeColors('dark', '#F17F30')

// 仅生成语义色（--Colors-Use-*）
const semanticColors = generateAllSemanticColors('light')

// 生成单个语义色组
const mainColors = generateSemanticColors('Main', 'light')
```

**4. 在 CSS 中使用**

变量注入后，即可在样式中通过 `var()` 引用：

```css
.my-button {
  background-color: var(--Colors-Use-Main-Bg);
  color: var(--Colors-Use-Neutral-Text-4-Help-text);
  border: 1px solid var(--Colors-Use-Neutral-Border);
}
```

### 导出模块

| 路径 | 说明 |
| --- | --- |
| `@yakit-libs/color` | 主入口，含 `generateColors`、`applyThemeColors` 等 |
| `@yakit-libs/color/generator` | 基础色阶生成（`generateAllThemeColors` 等） |
| `@yakit-libs/color/component` | 语义色生成（`generateSemanticColors` 等） |

### 贡献

我们欢迎所有形式的贡献！如果您有任何建议或发现问题，欢迎提交 Pull Request 或在 GitHub 上创建 Issue。
