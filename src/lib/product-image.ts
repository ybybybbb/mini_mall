/**
 * 根据商品名称和分类生成卡通风格 SVG 图片的 Data URI。
 * 每个商品有独立的手绘卡通插画，风格统一：柔和渐变背景 + 圆润几何图形。
 */

function svgToDataUri(svg: string): string {
  // 将所有连续空白替换为单个空格，然后压缩标签间空白，确保属性间有空格分隔
  const cleaned = svg.replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
  return `data:image/svg+xml,${encodeURIComponent(cleaned)}`;
}

// -- 渐变色预设 -----------------------------------------------------------
const gradients = {
  blue:    { start: "#667eea", end: "#764ba2" },
  teal:    { start: "#4facfe", end: "#00f2fe" },
  orange:  { start: "#f093fb", end: "#f5576c" },
  green:   { start: "#43e97b", end: "#38f9d7" },
  purple:  { start: "#a18cd1", end: "#fbc2eb" },
  pink:    { start: "#fad0c4", end: "#ff9a9e" },
  yellow:  { start: "#ffecd2", end: "#fcb69f" },
  dark:    { start: "#434343", end: "#000000" },
  cyan:    { start: "#89f7fe", end: "#66a6ff" },
  lime:    { start: "#d4fc79", end: "#96e6a1" },
  rose:    { start: "#f9f586", end: "#f5576c" },
  indigo:  { start: "#c3cfe2", end: "#9b8fd9" },
};

function grad(id: string): string {
  return `url(#${id})`;
}

function defs(gradients: { id: string; start: string; end: string }[]): string {
  return `
    <defs>
      ${gradients.map(g =>
        `<linearGradient id="${g.id}" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%" stop-color="${g.start}" />
           <stop offset="100%" stop-color="${g.end}" />
         </linearGradient>`
      ).join("")}
    </defs>`;
}

// -- 各个商品的卡通 SVG ---------------------------------------------------

function iphoneSvg(): string {
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
      ${defs([
        { id: "g1", start: "#667eea", end: "#764ba2" },
        { id: "g2", start: "#FFD93D", end: "#FF6B6B" },
        { id: "g3", start: "#4ECDC4", end: "#44B09E" },
      ])}
      <rect width="400" height="400" rx="30" fill="${grad("g1")}"/>
      <rect x="145" y="55" width="110" height="280" rx="18" fill="#2C2C54"/>
      <rect x="155" y="70" width="90" height="230" rx="8" fill="${grad("g2")}"/>
      <circle cx="200" cy="320" r="10" fill="#444"/>
      <rect x="185" y="330" width="30" height="4" rx="2" fill="#555"/>
      <circle cx="200" cy="50" r="4" fill="#333"/>
      <rect x="170" y="100" width="60" height="18" rx="4" fill="#fff" opacity="0.9"/>
      <rect x="175" y="130" width="50" height="12" rx="3" fill="#fff" opacity="0.6"/>
      <circle cx="180" cy="180" r="14" fill="${grad("g3")}"/>
      <rect x="200" y="172" width="28" height="16" rx="4" fill="#fff" opacity="0.5"/>
      <circle cx="220" cy="220" r="12" fill="#FF6B6B" opacity="0.8"/>
      <rect x="195" y="250" width="30" height="14" rx="3" fill="#fff" opacity="0.5"/>
    </svg>`);
}

function huaweiSvg(): string {
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
      ${defs([
        { id: "g1", start: "#0f0c29", end: "#302b63" },
        { id: "g2", start: "#FF416C", end: "#FF4B2B" },
      ])}
      <rect width="400" height="400" rx="30" fill="${grad("g1")}"/>
      <circle cx="200" cy="130" r="60" fill="none" stroke="${grad("g2")}" stroke-width="3" opacity="0.6"/>
      <circle cx="200" cy="130" r="40" fill="none" stroke="#fff" stroke-width="2" opacity="0.4"/>
      <circle cx="200" cy="130" r="20" fill="${grad("g2")}"/>
      <rect x="135" y="210" width="130" height="150" rx="20" fill="#1a1832"/>
      <rect x="148" y="225" width="104" height="100" rx="8" fill="${grad("g2")}" opacity="0.8"/>
      <rect x="160" y="240" width="80" height="50" rx="6" fill="#fff" opacity="0.9"/>
      <rect x="165" y="260" width="70" height="12" rx="3" fill="#1a1832" opacity="0.3"/>
      <circle cx="200" cy="375" r="6" fill="#555"/>
      <circle cx="200" cy="343" r="5" fill="${grad("g2")}"/>
    </svg>`);
}

function macbookSvg(): string {
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
      ${defs([
        { id: "g1", start: "#e0c3fc", end: "#8ec5fc" },
        { id: "g2", start: "#D3D3D3", end: "#A9A9A9" },
      ])}
      <rect width="400" height="400" rx="30" fill="${grad("g1")}"/>
      <rect x="60" y="80" width="280" height="190" rx="12" fill="#2d2d2d"/>
      <rect x="70" y="90" width="260" height="155" rx="6" fill="#1e1e1e"/>
      <rect x="90" y="105" width="220" height="125" rx="4" fill="${grad("g2")}" opacity="0.3"/>
      <rect x="110" y="120" width="180" height="95" rx="3" fill="#fff" opacity="0.9"/>
      <rect x="120" y="135" width="50" height="30" rx="3" fill="#FF6B6B"/>
      <rect x="180" y="140" width="80" height="8" rx="2" fill="#4ECDC4" opacity="0.7"/>
      <rect x="180" y="155" width="60" height="8" rx="2" fill="#FFD93D" opacity="0.6"/>
      <circle cx="200" cy="280" r="3" fill="#555"/>
      <rect x="30" y="270" width="340" height="20" rx="4" fill="#D3D3D3"/>
      <rect x="130" y="290" width="140" height="12" rx="3" fill="#C0C0C0"/>
    </svg>`);
}

function thinkpadSvg(): string {
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
      ${defs([
        { id: "g1", start: "#1F1C2C", end: "#928DAB" },
      ])}
      <rect width="400" height="400" rx="30" fill="${grad("g1")}"/>
      <rect x="55" y="75" width="290" height="195" rx="14" fill="#111"/>
      <rect x="68" y="88" width="264" height="154" rx="8" fill="#1a1a1a"/>
      <rect x="84" y="100" width="232" height="128" rx="5" fill="#222"/>
      <rect x="100" y="112" width="200" height="100" rx="3" fill="#333"/>
      <rect x="115" y="125" width="80" height="35" rx="3" fill="#E53935"/>
      <rect x="210" y="130" width="70" height="10" rx="2" fill="#66BB6A" opacity="0.6"/>
      <circle cx="200" cy="260" r="4" fill="#E53935"/>
      <rect x="25" y="265" width="350" height="22" rx="5" fill="#222"/>
      <rect x="150" y="290" width="100" height="12" rx="3" fill="#444"/>
      <rect x="162" y="315" width="76" height="24" rx="5" fill="#E53935" opacity="0.8"/>
    </svg>`);
}

function dysonSvg(): string {
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
      ${defs([
        { id: "g1", start: "#FFE53B", end: "#FF2525" },
        { id: "g2", start: "#636363", end: "#2C2C54" },
      ])}
      <rect width="400" height="400" rx="30" fill="${grad("g1")}"/>
      <rect x="80" y="100" width="60" height="180" rx="20" fill="${grad("g2")}"/>
      <circle cx="110" cy="100" r="35" fill="#555"/>
      <circle cx="110" cy="100" r="20" fill="#FF2525"/>
      <rect x="120" y="280" width="120" height="30" rx="10" fill="#444"/>
      <rect x="220" y="260" width="100" height="18" rx="6" fill="#555"/>
      <rect x="300" y="230" width="30" height="50" rx="8" fill="#666"/>
      <rect x="310" y="150" width="50" height="80" rx="10" fill="#777"/>
      <rect x="100" y="125" width="20" height="50" rx="8" fill="#888"/>
      <circle cx="200" cy="310" r="8" fill="#FF2525"/>
      <circle cx="240" cy="310" r="8" fill="#FF2525"/>
      <circle cx="280" cy="310" r="8" fill="#FF2525"/>
    </svg>`);
}

function tvSvg(): string {
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
      ${defs([
        { id: "g1", start: "#4facfe", end: "#00f2fe" },
        { id: "g2", start: "#0f0c29", end: "#302b63" },
      ])}
      <rect width="400" height="400" rx="30" fill="${grad("g1")}"/>
      <rect x="50" y="60" width="300" height="200" rx="12" fill="${grad("g2")}"/>
      <rect x="60" y="70" width="280" height="170" rx="6" fill="#111"/>
      <rect x="75" y="85" width="250" height="140" rx="4" fill="${grad("g1")}" opacity="0.6"/>
      <circle cx="200" cy="155" r="50" fill="#fff" opacity="0.2"/>
      <rect x="175" y="120" width="50" height="10" rx="3" fill="#fff" opacity="0.5"/>
      <rect x="180" y="170" width="40" height="8" rx="2" fill="#fff" opacity="0.4"/>
      <rect x="185" y="270" width="30" height="8" rx="3" fill="#bbb"/>
      <rect x="150" y="280" width="100" height="35" rx="8" fill="#555"/>
      <rect x="170" y="315" width="60" height="10" rx="3" fill="#999"/>
    </svg>`);
}

function nikeSvg(): string {
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
      ${defs([
        { id: "g1", start: "#fad0c4", end: "#ff9a9e" },
        { id: "g2", start: "#434343", end: "#000000" },
      ])}
      <rect width="400" height="400" rx="30" fill="${grad("g1")}"/>
      <ellipse cx="200" cy="260" rx="140" ry="30" fill="#ddd" opacity="0.5"/>
      <path d="M80,200 Q100,120 180,110 Q250,100 300,130 L310,150 Q260,120 200,130 Q120,140 100,210 Z"
            fill="${grad("g2")}"/>
      <path d="M90,210 Q110,150 180,140 Q240,132 280,155 L290,170 Q250,150 200,158 Q130,168 110,220 Z"
            fill="#555" opacity="0.5"/>
      <path d="M100,260 C120,220 300,170 320,180"
            stroke="${grad("g2")}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M105,275 C125,240 290,195 310,200"
            stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.8"/>
      <ellipse cx="200" cy="280" rx="100" ry="12" fill="#000" opacity="0.1"/>
    </svg>`);
}

function uniqloSvg(): string {
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
      ${defs([
        { id: "g1", start: "#a18cd1", end: "#fbc2eb" },
        { id: "g2", start: "#4ECDC4", end: "#44B09E" },
      ])}
      <rect width="400" height="400" rx="30" fill="${grad("g1")}"/>
      <path d="M140,80 L140,250 Q140,330 200,340 Q260,330 260,250 L260,80"
            fill="${grad("g2")}" opacity="0.8"/>
      <path d="M120,80 L150,80 L150,90 L140,100 L110,90 Z" fill="#fff" opacity="0.8"/>
      <path d="M280,80 L250,80 L250,90 L260,100 L290,90 Z" fill="#fff" opacity="0.8"/>
      <rect x="155" y="80" width="90" height="12" rx="4" fill="#fff" opacity="0.7"/>
      <line x1="200" y1="100" x2="200" y2="320" stroke="#fff" stroke-width="2" opacity="0.5"/>
      <rect x="170" y="130" width="60" height="8" rx="3" fill="#fff" opacity="0.6"/>
      <rect x="175" y="150" width="50" height="8" rx="3" fill="#fff" opacity="0.4"/>
      <rect x="165" y="250" width="70" height="15" rx="5" fill="#fff" opacity="0.5"/>
      <rect x="165" y="275" width="70" height="15" rx="5" fill="#fff" opacity="0.5"/>
    </svg>`);
}

function cherrySvg(): string {
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
      ${defs([
        { id: "g1", start: "#ffe259", end: "#ffa751" },
        { id: "g2", start: "#fc4a1a", end: "#f7b733" },
      ])}
      <rect width="400" height="400" rx="30" fill="${grad("g1")}"/>
      <path d="M180,80 Q200,110 200,140" stroke="#5D8A3C" stroke-width="4" fill="none"/>
      <path d="M200,140 Q220,120 250,140" stroke="#5D8A3C" stroke-width="3" fill="none"/>
      <path d="M200,140 Q180,160 150,160" stroke="#5D8A3C" stroke-width="3" fill="none"/>
      <circle cx="250" cy="170" r="70" fill="${grad("g2")}"/>
      <circle cx="250" cy="165" r="15" fill="#fff" opacity="0.4"/>
      <circle cx="150" cy="190" r="70" fill="${grad("g2")}"/>
      <circle cx="145" cy="185" r="15" fill="#fff" opacity="0.4"/>
      <ellipse cx="200" cy="290" rx="100" ry="15" fill="#5D8A3C" opacity="0.3"/>
    </svg>`);
}

function nutsSvg(): string {
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
      ${defs([
        { id: "g1", start: "#8B5E3C", end: "#D2A679" },
        { id: "g2", start: "#F4A460", end: "#D2691E" },
      ])}
      <rect width="400" height="400" rx="30" fill="#FFF5E6"/>
      <ellipse cx="140" cy="200" rx="40" ry="55" fill="${grad("g1")}" transform="rotate(-15,140,200)"/>
      <ellipse cx="140" cy="195" rx="30" ry="45" fill="${grad("g2")}" transform="rotate(-15,140,195)"/>
      <ellipse cx="260" cy="180" rx="35" ry="50" fill="${grad("g1")}" transform="rotate(20,260,180)"/>
      <ellipse cx="260" cy="175" rx="27" ry="42" fill="${grad("g2")}" transform="rotate(20,260,175)"/>
      <ellipse cx="200" cy="240" rx="38" ry="48" fill="${grad("g1")}" transform="rotate(5,200,240)"/>
      <ellipse cx="200" cy="235" rx="28" ry="40" fill="${grad("g2")}" transform="rotate(5,200,235)"/>
      <text x="200" y="360" text-anchor="middle" font-size="28" fill="#8B5E3C" font-family="sans-serif">🥜</text>
    </svg>`);
}

function bookCsappSvg(): string {
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
      ${defs([
        { id: "g1", start: "#13547a", end: "#80d0c7" },
      ])}
      <rect width="400" height="400" rx="30" fill="${grad("g1")}"/>
      <rect x="100" y="70" width="180" height="260" rx="6" fill="#1a3a4a"/>
      <rect x="110" y="75" width="160" height="250" rx="4" fill="#2c5f7c"/>
      <rect x="110" y="75" width="20" height="250" rx="2" fill="#1a3a4a" opacity="0.5"/>
      <rect x="130" y="95" width="120" height="30" rx="3" fill="#fff" opacity="0.9"/>
      <rect x="135" y="100" width="110" height="18" rx="2" fill="#1a3a4a" opacity="0.5"/>
      <rect x="130" y="145" width="120" height="8" rx="2" fill="#fff" opacity="0.4"/>
      <rect x="135" y="165" width="110" height="8" rx="2" fill="#fff" opacity="0.3"/>
      <rect x="140" y="185" width="100" height="8" rx="2" fill="#fff" opacity="0.3"/>
      <rect x="145" y="205" width="90" height="8" rx="2" fill="#fff" opacity="0.3"/>
      <rect x="130" y="240" width="120" height="25" rx="3" fill="#fff" opacity="0.2"/>
      <circle cx="170" cy="130" r="6" fill="#fff" opacity="0.3"/>
    </svg>`);
}

function booksSantiSvg(): string {
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
      ${defs([
        { id: "g1", start: "#0f0c29", end: "#302b63" },
      ])}
      <rect width="400" height="400" rx="30" fill="${grad("g1")}"/>
      <rect x="100" y="80" width="180" height="70" rx="5" fill="#e74c3c"/>
      <rect x="105" y="85" width="15" height="60" rx="2" fill="#c0392b" opacity="0.5"/>
      <rect x="130" y="95" width="130" height="10" rx="2" fill="#fff" opacity="0.8"/>
      <rect x="135" y="115" width="110" height="6" rx="2" fill="#fff" opacity="0.4"/>
      <rect x="140" y="130" width="90" height="6" rx="2" fill="#fff" opacity="0.3"/>
      <rect x="110" y="160" width="180" height="70" rx="5" fill="#2ecc71"/>
      <rect x="115" y="165" width="15" height="60" rx="2" fill="#27ae60" opacity="0.5"/>
      <rect x="140" y="175" width="130" height="10" rx="2" fill="#fff" opacity="0.8"/>
      <rect x="145" y="195" width="110" height="6" rx="2" fill="#fff" opacity="0.4"/>
      <rect x="150" y="210" width="90" height="6" rx="2" fill="#fff" opacity="0.3"/>
      <rect x="120" y="240" width="180" height="70" rx="5" fill="#3498db"/>
      <rect x="125" y="245" width="15" height="60" rx="2" fill="#2980b9" opacity="0.5"/>
      <rect x="150" y="255" width="130" height="10" rx="2" fill="#fff" opacity="0.8"/>
      <rect x="155" y="275" width="110" height="6" rx="2" fill="#fff" opacity="0.4"/>
      <rect x="160" y="290" width="90" height="6" rx="2" fill="#fff" opacity="0.3"/>
      <ellipse cx="200" cy="340" rx="80" ry="8" fill="#fff" opacity="0.1"/>
    </svg>`);
}

// -- 公开的映射函数 -------------------------------------------------------

export function getProductImageUrl(productName: string, categoryName: string): string {
  const p = productName.toLowerCase();
  const c = categoryName;

  // 手机数码
  if (c === "手机数码") {
    if (p.includes("iphone")) return iphoneSvg();
    if (p.includes("华为") || p.includes("huawei") || p.includes("mate")) return huaweiSvg();
    return iphoneSvg();
  }

  // 电脑办公
  if (c === "电脑办公") {
    if (p.includes("macbook") || p.includes("mac")) return macbookSvg();
    if (p.includes("thinkpad") || p.includes("x1")) return thinkpadSvg();
    return macbookSvg();
  }

  // 家用电器
  if (c === "家用电器") {
    if (p.includes("戴森") || p.includes("dyson") || p.includes("吸尘器")) return dysonSvg();
    if (p.includes("电视") || p.includes("tv")) return tvSvg();
    return dysonSvg();
  }

  // 服装鞋帽
  if (c === "服装鞋帽") {
    if (p.includes("nike") || p.includes("air") || p.includes("鞋") || p.includes("max")) return nikeSvg();
    if (p.includes("优衣库") || p.includes("uniqlo") || p.includes("羽绒") || p.includes("服")) return uniqloSvg();
    return nikeSvg();
  }

  // 食品生鲜
  if (c === "食品生鲜") {
    if (p.includes("车厘子") || p.includes("cherry") || p.includes("水果")) return cherrySvg();
    if (p.includes("坚果") || p.includes("nuts") || p.includes("松鼠")) return nutsSvg();
    return cherrySvg();
  }

  // 图书音像
  if (c === "图书音像") {
    if (p.includes("计算机") || p.includes("csapp") || p.includes("系统")) return bookCsappSvg();
    if (p.includes("三体") || p.includes("santi") || p.includes("全集")) return booksSantiSvg();
    return bookCsappSvg();
  }

  // 默认返回通用购物袋图标
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
      ${defs([{ id: "g1", start: "#667eea", end: "#764ba2" }])}
      <rect width="400" height="400" rx="30" fill="${grad("g1")}"/>
      <text x="200" y="220" text-anchor="middle" font-size="120" fill="#fff" opacity="0.3">🛍</text>
    </svg>`);
}
