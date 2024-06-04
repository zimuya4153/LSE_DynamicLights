// LiteLoader-AIDS automatic generated
/// <reference path='d:\dts/dts/helperlib/src/index.d.ts'/> 

const CONFIG = new JsonConfigFile('./plugins/DynamicLights/Config.json', JSON.stringify({
    'enabled': true,// 开关
    'offhandItems': [// 可放副手物品
        'minecraft:torch',// 火把
        'minecraft:soul_torch',// 灵魂火把
    ],
    'lightItems': [// 可以发光的物品
        'minecraft:torch',// 火把
        'minecraft:soul_torch',// 灵魂火把
        'minecraft:glowstone',// 萤石
        'minecraft:lantern',// 灯笼
        'minecraft:soul_lantern',// 灵魂灯笼
        'minecraft:lit_pumpkin',// 南瓜灯
        'minecraft:sea_lantern',// 海晶灯
        'minecraft:campfire',// 营火
        'minecraft:soul_campfire',// 灵魂营火
        'minecraft:lava_bucket',// 岩浆桶
        'minecraft:light_block',// 光明方块
    ],
    'time': 0.25,// 刷新时间
}));

/** 光明方块的运行ID @type {Number} */
let lightBlockRuntimeId;
mc.listen('onServerStarted', () => lightBlockRuntimeId = ll.import('GMLIB_API', 'getBlockRuntimeId')('minecraft:light_block'));

/** 玩家被发包过的坐标 @type {Object.<string, IntPos>} */
let lightBlockPos = {};
/**
 * 恢复被发包过的方块
 * @param {Player} player 玩家对象
 */
function recoverPacketBlock(player) {
    const blockPos = lightBlockPos[player.uuid];
    if (!blockPos || !mc.getBlock(blockPos).isAir) return;
    player.sendUpdateBlockPacket(blockPos, 0);
    delete lightBlockPos[player.uuid];
}
if (CONFIG.get('enabled')) {
    mc.listen('onUseItem', (player, item) => {
        if (!(player.isSneaking && player.getOffHand().isNull() && CONFIG.get('offhandItems').includes(item.type))) return;
        player.getOffHand().set(item);
        player.getHand().setNull();
        player.refreshItems();
    });

    setInterval(() => {
        mc.getOnlinePlayers().forEach(player => {
            if (player.isSimulatedPlayer() || [null, true].includes(player.isLoading)) return;
            const /** 即将要发包的坐标 @type {IntPos} */ packetPos = player.blockPos.add(0, -1, 0);
            if (!CONFIG.get('lightItems').includes(player.getHand().type) && !CONFIG.get('lightItems').includes(player.getOffHand().type)) return recoverPacketBlock(player);// 物品没法发光
            for (let index = 0; index <= 3; index++) {// 搜索没有方块的坐标
                if (mc.getBlock(packetPos.add(0, 1, 0)).isAir) break;
                if (index === 3) return recoverPacketBlock(player);// 搜寻失败，放弃发包
            }
            if (packetPos.toString() === lightBlockPos[player.uuid]?.toString()) return;// 坐标一样，放弃发包，不重复发包
            recoverPacketBlock(player);
            lightBlockPos[player.uuid] = packetPos;
            setTimeout(() => player.sendUpdateBlockPacket(packetPos, lightBlockRuntimeId), 10);
        });
    }, CONFIG.get('time') * 1000);

    // 玩家退服和切换维度，删除发包数据，防止进服重新发包浪费性能
    mc.listen('onLeft', player => delete lightBlockPos[player.uuid]);
    mc.listen('onChangeDim', player => delete lightBlockPos[player.uuid]);
}

/* 添加快捷函数 */
IntPos.prototype.add =
    /**
     * 快捷偏移坐标函数
     * @param {Number} dx X轴添加的值
     * @param {Number} dy Y轴添加的值
     * @param {Number} dz Z轴添加的值
     * @returns 
     */
    function (dx, dy, dz) {
        this.x += dx, this.y += dy, this.z += dz;
        return this;
    }

LLSE_Player.prototype.sendUpdateBlockPacket =
    /**
     * 发送更新方块类型数据包
     * @param {IntPos} param0 坐标对象
     * @param {Number} runtimeId 方块的runtimeId
     * @param {Number} flag 
     * @param {Number} layer 
     */
    function ({ x, y, z }, runtimeId, flag = 3, layer = 0) {
        const bs = new BinaryStream();
        bs.writeVarInt(x);
        bs.writeUnsignedVarInt(y);
        bs.writeVarInt(z);
        bs.writeUnsignedVarInt(runtimeId);
        bs.writeUnsignedVarInt(flag);
        bs.writeUnsignedVarInt(layer);
        let pkt = bs.createPacket(0x15);
        this.sendPacket(pkt);
    }