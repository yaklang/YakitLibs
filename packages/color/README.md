<p align="center">
  @yakit-libs/color
</p>

一个纯 SCSS 方法生成的 var 颜色变量库

### 我们为什么创建这个项目？

在前端开发中，保持色彩的一致性既重要又耗时。我们设计这套颜色变量的目的，为了提供一个美观且实用的色彩方案，帮助快速实现视觉统一。

此项目通过纯 SCSS 生成一个 CSS 文件，其中包含了所有颜色变量。您可以直接在项目中引用这个 CSS 文件，然后通过标准的 CSS 变量（`var()`）来使用这些颜色，无需担心技术栈的限制。

### 如何使用

**1. 安装**

首先，通过 npm 将此项目添加到您的项目中：

```bash
npm install @yakit-libs/color
```

**2. 引用**

在您的主 CSS 或 SCSS 文件中，导入生成的 `index.css` 文件：

```css
@import "~@yakit-libs/color/dist/index.css";
```

**3. 使用**

现在，您就可以在项目的任何地方使用这些颜色变量了。变量命名遵循一致的规则，便于您快速找到需要的颜色。

```css
.my-button {
    background-color: var(--Colors-Use-Main-Bg);
    color: var(--Colors-Use-Neutral-Text-4-Help-text);
    border: 1px solid var(--Colors-Use-Neutral-Border);
}
```

### 贡献

我们欢迎所有形式的贡献！如果您有任何建议或发现问题，欢迎提交 Pull Request 或在 GitHub 上创建 Issue。
