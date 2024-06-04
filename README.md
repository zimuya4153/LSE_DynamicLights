# LSE_DynamicLights
## 一句话，采用发包方式的LSE版移动光源插件
> 采用发包，并没有实际放置方块，客户端看到的是假方块，不会对存档造成损害
### 配置文件
```json
{
    "enabled": true,// 开关
    "offhandItems": [// 可放副手物品
        "minecraft:torch",// 火把
        "minecraft:soul_torch",// 灵魂火把
    ],
    "lightItems": [// 可以发光的物品
        "minecraft:torch",// 火把
        "minecraft:soul_torch",// 灵魂火把
        "minecraft:glowstone",// 萤石
        "minecraft:lantern",// 灯笼
        "minecraft:soul_lantern",// 灵魂灯笼
        "minecraft:lit_pumpkin",// 南瓜灯
        "minecraft:sea_lantern",// 海晶灯
        "minecraft:campfire",// 营火
        "minecraft:soul_campfire",// 灵魂营火
        "minecraft:lava_bucket",// 岩浆桶
        "minecraft:light_block",// 光明方块
    ],
    "time": 0.25,// 刷新时间
}
```

## 好了，内容就这么点，没了，别看了。