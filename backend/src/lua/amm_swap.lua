-- AMM 恒定乘积兑换撮合 Lua 脚本
-- 保证原子性操作，高并发下无锁竞争
-- 参数说明：
-- KEYS[1]: 池子储备哈希键 (amm:pool:{pool_id}:reserves)
-- ARGV[1]: direction (buy_ipt / sell_ipt)
-- ARGV[2]: amount_in (输入数量)
-- ARGV[3]: min_out (最小输出数量，滑点保护)
-- ARGV[4]: fee_rate (手续费率，如 0.003)
-- ARGV[5]: tx_id 交易ID
-- ARGV[6]: user_id 用户ID

local pool_key = KEYS[1]
local direction = ARGV[1]
local amount_in = tonumber(ARGV[2])
local min_out = tonumber(ARGV[3])
local fee_rate = tonumber(ARGV[4])
local tx_id = ARGV[5]
local user_id = ARGV[6]

-- 获取当前储备量
local reserves = redis.call('HGETALL', pool_key)
if #reserves == 0 then
    return cjson.encode({status = "ERROR", error = "POOL_NOT_FOUND"})
end

-- 转换为map
local reserve_map = {}
for i = 1, #reserves, 2 do
    reserve_map[reserves[i]] = tonumber(reserves[i+1])
end

local reserve_ipt = reserve_map['ipt']
local reserve_base = reserve_map['base']
local amount_in_after_fee = amount_in * (1 - fee_rate)
local fee = amount_in - amount_in_after_fee
local amount_out
local new_reserve_ipt, new_reserve_base

-- 根据方向计算兑换输出
if direction == "buy_ipt" then
    -- 用 base 买 ipt
    amount_out = (reserve_ipt * amount_in_after_fee) / (reserve_base + amount_in_after_fee)
    new_reserve_base = reserve_base + amount_in
    new_reserve_ipt = reserve_ipt - amount_out
elseif direction == "sell_ipt" then
    -- 卖 ipt 换 base
    amount_out = (reserve_base * amount_in_after_fee) / (reserve_ipt + amount_in_after_fee)
    new_reserve_ipt = reserve_ipt + amount_in
    new_reserve_base = reserve_base - amount_out
else
    return cjson.encode({status = "ERROR", error = "INVALID_DIRECTION"})
end

-- 滑点检查
if amount_out < min_out then
    return cjson.encode({
        status = "ERROR",
        error = "SLIPPAGE_TOO_HIGH",
        expected = min_out,
        got = amount_out
    })
end

-- 储备检查
if new_reserve_ipt < 0 or new_reserve_base < 0 then
    return cjson.encode({status = "ERROR", error = "INSUFFICIENT_RESERVES"})
end

-- 更新储备量
redis.call('HSET', pool_key, 'ipt', tostring(new_reserve_ipt), 'base', tostring(new_reserve_base))
redis.call('HSET', pool_key, 'k', tostring(new_reserve_ipt * new_reserve_base))

-- 计算成交价格
local price = (direction == "buy_ipt") and (amount_in / amount_out) or (amount_out / amount_in)

-- 将交易写入流用于异步持久化
local msg_fields = {
    'tx_id', tx_id,
    'user_id', user_id,
    'pool_id', string.match(pool_key, "amm:pool:(%d+):reserves"),
    'direction', direction,
    'amount_in', tostring(amount_in),
    'amount_out', tostring(amount_out),
    'price', tostring(price),
    'fee', tostring(fee),
    'timestamp', tostring(redis.call('TIME')[1])
}
redis.call('XADD', 'amm:swap:queue', '*', unpack(msg_fields))

-- 返回结果
return cjson.encode({
    status = "SUCCESS",
    amount_out = tostring(amount_out),
    fee = tostring(fee),
    new_ipt = tostring(new_reserve_ipt),
    new_base = tostring(new_reserve_base),
    price = tostring(price)
})
