/// <reference path='d:\dts/dts/helperlib/src/index.d.ts'/> 

const defaultConfig = {
    'enabled': true,// 开关
    'offhandItems': [// 可放副手物品
        'minecraft:torch',// 火把
        'minecraft:soul_torch',// 灵魂火把
    ],
    'lightItems': {// 可以发光的物品
        'minecraft:torch': 14,// 火把
        'minecraft:soul_torch': 10,// 灵魂火把
        'minecraft:glowstone': 15,// 萤石
        'minecraft:lantern': 15,// 灯笼
        'minecraft:soul_lantern': 10,// 灵魂灯笼
        'minecraft:lit_pumpkin': 15,// 南瓜灯
        'minecraft:sea_lantern': 15,// 海晶灯
        'minecraft:campfire': 15,// 营火
        'minecraft:soul_campfire': 10,// 灵魂营火
        'minecraft:lava_bucket': 15,// 岩浆桶
        'minecraft:light_block': -1,// 光明方块(-1，代表获取手上物品的特殊值)
    },
    'time': 0.25,// 刷新时间
    'data': {}
};
const CONFIG = new JsonConfigFile('./plugins/DynamicLights/Config.json', JSON.stringify(defaultConfig));
if (CONFIG.get('lightItems') instanceof Array) CONFIG.set('lightItems', defaultConfig.lightItems); // 兼容旧配置

if (!ll.hasExported('GMLIB_API', 'getBlockRuntimeId'))
    throw new Error('GMLIB-LegacyRemoteCallApi接口未导出！');

CONFIG.get('enabled')
    && (() => {
        /** 光明方块的运行ID @type {Array.<number>} */
        let lightBlockRuntimeIds;
        mc.listen('onServerStarted', () => {
            const /** @type {function(string,number):number|function(string):number} */ getBlockRuntimeId = ll.import('GMLIB_API', 'getBlockRuntimeId');
            lightBlockRuntimeIds = [...Array(16).keys()].map(level => getBlockRuntimeId('minecraft:light_block', level) || getBlockRuntimeId('minecraft:light_block'));
        });

        // 切换物品到副手
        mc.listen('onUseItem', (player, item) => {
            if (!player.isSneaking || !player.getOffHand().isNull() || !CONFIG.get('offhandItems').includes(item.type)) return;
            player.getOffHand().set(item);
            player.getHand().setNull();
            player.refreshItems();
        });

        // 命令开关
        mc.regPlayerCmd('light', '移动光源开关', player => {
            const form = mc.newCustomForm();
            form.setTitle('移动光源开关');
            form.addLabel([
                "此开关是移动光源的控制开关。",
                "关闭后你将不会显示移动光源的光。",
                "§c但是其他人依旧看得到你手上光源散发的光。"
            ].join('\n'));
            form.addSwitch('开关', CONFIG.get('data', {})[player.uuid] ?? true);
            player.sendForm(form, (player, data) => {
                if (data == null) return;
                CONFIG.set('data', Object.assign({}, CONFIG.get('data'), { [player.uuid]: data[1] }));
                recoverPacketBlock(player);
            });
        });

        /** 被发过包的坐标 @type {IntPos[]} */
        let lightBlockPos = [];

        /**
         * 发包恢复被发包过的方块
         * @param {Player} player 玩家对象
         */
        function recoverPacketBlock(player) {
            if (
                player.isSimulatedPlayer() // 假人
                || !(player.isLoading === false) // 强类型比较，防null
            ) return;
            lightBlockPos.forEach(pos => {
                if (!mc.getBlock(pos)?.isAir) return;
                player.sendUpdateBlockPacket(pos, 0);
            });
        }

        setInterval(() => {
            const players = mc.getOnlinePlayers().filter(player =>
                (CONFIG.get('data', {})[player.uuid] ?? true) // 开关
            );
            players.forEach(player => recoverPacketBlock(player)); // 先恢复方块
            lightBlockPos.length = 0; // 清除已发过的坐标
            players.forEach(player => {
                /** 获取物品光亮等级 @type {function(Item):number} */
                const getItemLevel = item => {
                    if (CONFIG.get('lightItems')[item.type] === -1)
                        return item.aux;
                    return CONFIG.get('lightItems')[item.type] ?? 0;
                }
                let /** @type {number} */lightLevel = getItemLevel(player.getHand());
                if (lightLevel < getItemLevel(player.getOffHand())) lightLevel = getItemLevel(player.getOffHand());
                // let /** @type {number} */lightLevel = getItemLevel(player.getHand()) > getItemLevel(player.getOffHand()) ? getItemLevel(player.getHand()) : getItemLevel(player.getOffHand());
                if (!lightLevel) return;
                const /** 即将要发包的坐标 @type {IntPos} */ packetPos = player.blockPos.add(0, -1, 0);
                for (let index = 0; index <= 3; index++) {// 搜索没有方块的坐标
                    if (!!mc.getBlock(packetPos.add(0, 1, 0))?.isAir) break;
                    if (index === 3) return;// 搜寻失败，放弃发包
                }
                players.forEach(player => player.sendUpdateBlockPacket(packetPos, lightBlockRuntimeIds[lightLevel])); // 发包
                lightBlockPos.push(packetPos); // 记录已发包的坐标
            });
        }, CONFIG.get('time') * 1000);
    })();

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
     * 发送更新方块数据包
     * @param {IntPos|FloatPos} pos 方块坐标
     * @param {number} runtimeId 方块的runtimeId或命名空间ID
     * @param {number} [layer=0] 方块数据层
     * @param {number} [updateFlags=0] 更新类型
     */
    function (
        pos,
        runtimeId,
        layer =/* UpdateBlockPacket::BlockLayer::Standard */0,
        updateFlags =/* BlockUpdateFlag::None */0
    ) {
        if (pos.toIntPos) pos = pos.toIntPos();
        const bs = new BinaryStream();
        bs.writeVarInt(pos.x);
        bs.writeUnsignedVarInt(pos.y);
        bs.writeVarInt(pos.z);
        bs.writeUnsignedVarInt(Number(runtimeId));
        bs.writeUnsignedVarInt(Number(layer));
        bs.writeUnsignedVarInt(Number(updateFlags));
        this.sendPacket(bs.createPacket(/* MinecraftPacketIds::UpdateBlock */0x15));
    }

FloatPos.prototype.toIntPos = function () {
    return new IntPos(Math.floor(this.x), Math.ceil(this.y), Math.floor(this.z), this.dimid);
}