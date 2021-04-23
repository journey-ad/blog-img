var 引流 = [
  "https://space.bilibili.com/672328094",
  "https://www.bilibili.com/video/BV1FZ4y1F7HH",
  "https://www.bilibili.com/video/BV1FX4y1g7u8",
  "https://www.bilibili.com/video/BV1aK4y1P7Cg",
  "https://www.bilibili.com/video/BV17A411V7Uh",
  "https://www.bilibili.com/video/BV1JV411b7Pc",
  "https://www.bilibili.com/video/BV1AV411v7er",

  "https://www.bilibili.com/video/BV1MX4y1N75X",
  "https://www.bilibili.com/video/BV17h411U71w",
  "https://www.bilibili.com/video/BV1ry4y1Y71t",
  "https://www.bilibili.com/video/BV1Sy4y1n7c4",
  "https://www.bilibili.com/video/BV15y4y177uk",
  "https://www.bilibili.com/video/BV1PN411X7QW"
]

function 加载圣·嘉然() {
  pio_reference = new Paul_Pio(
    {
      "mode": "fixed",
      "hidden": false,
      "content": {
        "link": 引流[Math.floor(Math.random() * 引流.length)],
        "welcome": ["Hi!"],
        "custom": [
          { "selector": ".comment-form", "text": "Content Tooltip" },
          { "selector": ".home-social a:last-child", "text": "Blog Tooltip" },
          { "selector": ".list .postname", "type": "read" },
          { "selector": ".post-content a, .page-content a, .post a", "type": "link" }
        ],
      },
      "night": "toggleNightMode()",
      "model": ["https://cdn.jsdelivr.net/gh/journey-ad/blog-img/live2d/Diana/Diana.model3.json"],
      "tips": true
    }
  )

  pio_alignment = "left"

  // Then apply style
  pio_refresh_style()
}


var pio_reference
window.onload = 加载圣·嘉然
