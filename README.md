# LSE_DynamicLights
## 一句话，采用发包方式的LSE版移动光源插件
> 采用发包，并没有实际放置方块，客户端看到的是假方块，不会对存档造成损害

## 怎么切换物品到副手？
> 按住Shift键，然后右键/长按物品即可

## 命令
- light - 打开GUI面板(开关移动光源显示)

### 配置文件
```jsonc
{
    "enabled": true,// 开关
    "offhandItems": [// 可放副手物品
        "minecraft:torch",// 火把
        "minecraft:soul_torch",// 灵魂火把
    ],
    "lightItems": {// 可以发光的物品(数字是物品的光亮等级,需LRCA版本达到0.13.1才支持)
        "minecraft:torch": 14,// 火把
        "minecraft:soul_torch": 10,// 灵魂火把
        "minecraft:glowstone": 15,// 萤石
        "minecraft:lantern": 15,// 灯笼
        "minecraft:soul_lantern": 10,// 灵魂灯笼
        "minecraft:lit_pumpkin": 15,// 南瓜灯
        "minecraft:sea_lantern": 15,// 海晶灯
        "minecraft:campfire": 15,// 营火
        "minecraft:soul_campfire": 10,// 灵魂营火
        "minecraft:lava_bucket": 15,// 岩浆桶
        "minecraft:light_block": -1,// 光明方块(-1，代表获取手上物品的特殊值)
    },
    "time": 0.25,// 刷新时间
    "data": {} // 玩家数据(勿动)
}
```

## 好了，内容就这么点，没了，别看了。