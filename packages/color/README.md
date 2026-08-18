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
import { brandThemeColors, generateColors, applyThemeColors } from '@yakit-libs/color'

const theme = 'light'
const colors = generateColors(theme)

// 可选：覆盖 Main 主色
// const colors = generateColors(theme, '#F17F30')

// 或使用预设品牌主题
const webColors = generateColors(theme, brandThemeColors.Web)
const goldColors = generateColors(theme, brandThemeColors.Gold)

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

### 动态颜色色阶 API

以下方法从 `@yakit-libs/color` 导入，用于在运行时解析颜色变量或生成自定义色阶。每组色阶都包含从 `10` 到 `100` 的十个 `--yakit-colors-*` 变量。

**1. 解析颜色变量**

`resolveColorVariable(variable, source)` 会递归解析严格以 `--Colors-Use-` 或 `--yakit-colors-` 开头的变量，返回最终的十六进制颜色。`variable` 可以是变量名，也可以是 `var(...)` 表达式；`source` 可以是变量对象，或提供 `getPropertyValue()` 的对象。

```typescript
import { resolveColorVariable } from '@yakit-libs/color'

const colors = {
  '--Colors-Use-Blue-Primary': 'var(--yakit-colors-Blue-60)',
  '--yakit-colors-Blue-60': '#2F87FF',
}

const hex = resolveColorVariable('--Colors-Use-Blue-Primary', colors)
// '#2F87FF'
```

无法解析的变量、循环引用、非十六进制最终值以及不支持的变量前缀会抛出 `TypeError`。

**2. 根据指定基色生成色阶**

`generateColorScales(items, mode)` 接收名称与基色数组，返回一个扁平的 CSS 变量对象。`mode` 默认为 `light`，也可以传入 `dark`。

```typescript
import { generateColorScales } from '@yakit-libs/color'

const colors = generateColorScales(
  [
    { name: 'blue', hex: '#0000FF' },
    { name: 'green', hex: '#00FF00' },
  ],
  'light',
)

colors['--yakit-colors-blue-10']
colors['--yakit-colors-blue-100']
colors['--yakit-colors-green-60']
```

名称或十六进制颜色无效、名称重复时会抛出 `TypeError`。

**3. 随机生成色阶**

`generateRandomColorScales(exclusions?, generateColorsNum?, mode?)` 默认生成 5 组色阶，名称依次为 `Random-1` 到 `Random-5`。传入 `generateColorsNum` 可以控制组数；该值必须是非负安全整数，并且不能超过排除指定颜色后剩余的 24-bit 可用颜色数量。

```typescript
import { generateRandomColorScales } from '@yakit-libs/color'

const colors = generateRandomColorScales(['#0000FF', '#0F0'], 3, 'dark')

colors['--yakit-colors-Random-1-10']
colors['--yakit-colors-Random-2-60']
colors['--yakit-colors-Random-3-100']
```

随机生成仅保证本次调用中的基色唯一，并按规范化后的十六进制值进行精确排除，例如 `#0F0` 与 `#00FF00` 视为同一颜色。它不保证颜色之间具有足够的感知色差，也不适用于密码学用途；当前 API 不支持 seed，因此不保证结果可复现。以上方法仅属于运行时颜色 API，不扩展 Preview、CLI、Node 或 CSS 入口。

仓库维护者可以直接运行源码示例，验证以上三个 API：

```bash
pnpm --filter @yakit-libs/color example:source-api
```

### 使用外部主题色生成静态 CSS（推荐用于生产环境）

消费项目可以在构建时传入 Main 主题色，生成同时包含 light/dark 变量的静态 CSS。颜色计算只在 Node.js 构建阶段执行，浏览器不需要加载颜色生成逻辑。

**1. 在消费项目中配置生成命令**

```json
{
  "scripts": {
    "generate:theme:web": "yakit-color-css --theme Web --out public/theme-web.css --hashed",
    "generate:theme:gold": "yakit-color-css --theme Gold --out public/theme-gold.css --hashed",
    "build": "npm run generate:theme:web && vite build"
  }
}
```

内置品牌主题：

| 名称 | Main 基础色 |
| --- | --- |
| `Main` | `#F17F30`（亮/暗一致） |
| `Web` | `#E76800`（亮/暗一致） |
| `Gold` | `#B49434`（亮/暗一致） |
| `Memfit` | 亮色 `#2E63B3` / 暗色 `#5E9DEA` |
| `Irify` | 亮色 `#6A44A9` / 暗色 `#B081FF` |

暗色模式下，以上主题的 `--Colors-Use-Main-Primary` 均映射到 `--yakit-colors-Main-60`。

仍可通过 `--main '#1677ff'` 传入自定义十六进制主色。

该命令会生成类似 `public/theme.a1b2c3d4e5f6.css` 的内容哈希文件，以及 `public/theme-manifest.json`：

```json
{
  "file": "theme.a1b2c3d4e5f6.css",
  "integrity": "sha256-..."
}
```

也可以通过 Node API 集成到自定义构建脚本：

```typescript
import { writeHashedThemeCss } from '@yakit-libs/color/node'

const result = writeHashedThemeCss({
  mainColor: process.env.MAIN_COLOR ?? '#1677ff',
  output: 'public/theme.css',
})

console.log(result.output, result.manifest)
```

如只需要 CSS 字符串，可使用不依赖 Node 文件系统的 API：

```typescript
import { generateThemeCss } from '@yakit-libs/color/css'

const css = generateThemeCss('Web')
// 或 generateThemeCss('#E76800')
```

**2. 通过静态资源加载 CSS**

在服务端模板或消费项目的 HTML 构建步骤中读取 manifest，将 `file` 和 `integrity` 写入标签：

```html
<link rel="stylesheet" href="/theme.a1b2c3d4e5f6.css" integrity="sha256-..." />
```

生成结果默认使用 `:root` 作为亮色主题，给根元素设置 `data-theme="dark"` 即可切换暗色主题：

```typescript
document.documentElement.dataset.theme = 'dark'
```

**3. 配置 HTTP 缓存**

从 npm 包 `import` 模块不会发起独立 CSS 请求。内容哈希保证文件名只在 CSS 内容改变时变化，因此可对哈希 CSS 设置长期强缓存：

```http
Cache-Control: public, max-age=31536000, immutable
```

缓存命中时浏览器不会发起条件请求，比 304 少一次网络往返。`theme-manifest.json` 或引用它的 HTML 不应使用 `immutable`，以便主题更新后及时指向新的哈希文件。如果仍需固定的 `theme.css` 文件名，可继续使用不带 `--hashed` 的 CLI，并由静态服务器通过 `ETag` 或 `Last-Modified` 返回 304。

### 导出模块

| 路径 | 说明 |
| --- | --- |
| `@yakit-libs/color` | 主入口，含 `generateColors`、`applyThemeColors` 等（运行时计算） |
| `@yakit-libs/color/preview` | **Preview 入口**，使用构建期预计算的亮/暗色变量，零运行时计算，性能更优 |
| `@yakit-libs/color/generator` | 基础色阶生成（`generateAllThemeColors` 等） |
| `@yakit-libs/color/component` | 语义色生成（`generateSemanticColors` 等） |
| `@yakit-libs/color/css` | 根据外部 Main 色生成 light/dark 静态 CSS 字符串 |
| `@yakit-libs/color/node` | 将动态主题 CSS 写入文件的 Node.js API |

### Preview 模式（默认固定主题）

默认入口会在运行时通过 JS 混合计算全部色阶，在大型项目中可能导致 3–4s 的初始化开销。Preview 入口在**库构建时**预计算好 light/dark 两套颜色，消费方直接读取静态对象，无运行时计算。

**用法（与主入口 API 兼容）：**

```typescript
import { getColors, generateColors, applyThemeColors, lightColors, darkColors } from '@yakit-libs/color/preview'

// 直接获取预计算结果（同一 mode 始终返回同一对象引用）
const colors = getColors('light')
// 或
const colors = generateColors('dark')

applyThemeColors('light', colors)

// 也可直接使用常量
console.log(lightColors['--yakit-colors-Main-60'])
```

> Preview 模式不支持 `mainColorOverride` 主色覆盖。如需动态覆盖 Main 主色，请继续使用 `@yakit-libs/color` 主入口。

**维护者：** 修改 `generator.ts` 或 `component.ts` 后，运行 `pnpm run generate`（或 `npm run build`）重新生成 `src/precomputed/colors.ts`。

### 贡献

我们欢迎所有形式的贡献！如果您有任何建议或发现问题，欢迎提交 Pull Request 或在 GitHub 上创建 Issue。
