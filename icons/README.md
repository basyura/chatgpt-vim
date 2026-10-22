# アイコン

組み込みの image_gen ツールで生成した、緑の吹き出しと白い V のアイコンです。
`icon-source.png` が生成原本で、16・32・48・128 px の PNG を拡張に使用します。

## 生成プロンプト

以下は初回生成時のプロンプトです。

```text
Use case: logo-brand. Asset type: Chrome extension icon for ChatGPT Vim. Create one polished square icon: a solid deep emerald rounded speech bubble containing a bold white geometric V, expressing chat plus Vim keyboard navigation. Flat vector-like raster design, very thick simple shapes, strong contrast, recognizable at 16 pixels. Centered symbol fills 85 percent of square canvas, small speech tail bottom left. Transparent outside the bubble. No gradients, no shadows, no borders, no tiny details, no other text, no OpenAI knot, no mockup or multiple variants.
```

## 修正プロンプト

緑の黒いムラを取り除き、輪郭を明瞭にして V を縮小しました。組み込みの image_gen に原本を渡して編集しています。

```text
Use case: precise-object-edit. Edit the provided Chrome extension icon. Keep the rounded green speech bubble silhouette and transparent exterior. Replace ALL mottled, cloudy, dark, black, shaded or textured green areas with an absolutely uniform solid opaque emerald green #00875A fill. Pure flat 2D graphic, clean hard precise vector-like edges, no blur, no glow, no gradient, no texture, no shadow anywhere. Make the white V substantially smaller: 65 percent of its original width and height, centered within the rectangular body of the speech bubble, with generous green space on all four sides. V is pure opaque white with crisp straight edges and bold strokes. Preserve square image and actual transparent alpha outside speech bubble. Only two solid colors plus transparency; antialiasing only at shape boundaries.
```
