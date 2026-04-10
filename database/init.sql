-- FunReelRWA 短剧版权投资与交易平台 - 数据库初始化脚本 V14.0
-- 创建数据库
CREATE DATABASE IF NOT EXISTS funreelrwa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE funreelrwa;

-- 1. 用户与邀请相关表

CREATE TABLE users (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 phone VARCHAR(20),
 email VARCHAR(100),
 password_hash VARCHAR(255),
 wallet_address VARCHAR(100),
 nickname VARCHAR(50),
 avatar VARCHAR(255),
 kyc_level TINYINT DEFAULT 0,
 vip_level TINYINT DEFAULT 0,
 invite_code VARCHAR(20) UNIQUE NOT NULL,
 inviter_id BIGINT DEFAULT 0 COMMENT '邀请人 ID',
 language VARCHAR(10) DEFAULT 'en',
 timezone VARCHAR(50) DEFAULT 'UTC',
 status TINYINT DEFAULT 1,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY uk_phone (phone),
 UNIQUE KEY uk_email (email),
 UNIQUE KEY uk_wallet (wallet_address),
 INDEX idx_inviter (inviter_id),
 INDEX idx_invite_code (invite_code)
);

CREATE TABLE invite_records (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 inviter_id BIGINT NOT NULL,
 invitee_id BIGINT NOT NULL,
 level TINYINT NOT NULL COMMENT '1:直接 2:间接',
 event_type VARCHAR(50) NOT NULL COMMENT 'register, kyc, first_invest, ad_watch',
 reward_points INT DEFAULT 0,
 reward_token DECIMAL(20,8) DEFAULT 0,
 status TINYINT DEFAULT 0 COMMENT '0:待发放 1:已发放 2:已冻结',
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 INDEX idx_inviter (inviter_id),
 INDEX idx_invitee (invitee_id)
);

CREATE TABLE user_vouchers (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 user_id BIGINT NOT NULL,
 type TINYINT NOT NULL COMMENT '1:单日无限观看券',
 quantity INT NOT NULL,
 expire_time DATETIME NOT NULL,
 is_used TINYINT DEFAULT 0,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 INDEX idx_user_expire (user_id, expire_time)
);

CREATE TABLE daily_watch_counts (
 user_id BIGINT NOT NULL,
 watch_date DATE NOT NULL,
 free_count INT DEFAULT 0,
 voucher_count INT DEFAULT 0,
 PRIMARY KEY (user_id, watch_date)
);

-- 2. 广告与内容相关表

CREATE TABLE ad_placements (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 name VARCHAR(100) NOT NULL,
 sdk_provider VARCHAR(50) NOT NULL,
 placement_id VARCHAR(100) NOT NULL,
 status TINYINT DEFAULT 1,
 frequency_cap INT DEFAULT 1,
 priority INT DEFAULT 0,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ad_revenue_logs (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 user_id BIGINT,
 placement_id BIGINT,
 impression_time DATETIME,
 click_time DATETIME,
 estimated_revenue DECIMAL(10,6),
 currency VARCHAR(10) DEFAULT 'USD',
 sdk_response_data JSON,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. 短剧相关表（多语言 + 分区优化）

CREATE TABLE dramas (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 title JSON NOT NULL COMMENT '{"zh": "中文标题", "en": "English Title"}',
 description JSON COMMENT '{"zh": "中文描述...", "en": "English description..."}',
 tags JSON COMMENT '{"zh": ["标签1"], "en": ["Tag1"]}',
 cover_image VARCHAR(255) NOT NULL,
 category_id BIGINT,
 total_episodes INT DEFAULT 0,
 status TINYINT DEFAULT 1,
 vip_level TINYINT DEFAULT 0,
 release_date DATE,
 release_time DATETIME,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 INDEX idx_category (category_id)
);

CREATE TABLE drama_episodes (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 drama_id BIGINT NOT NULL,
 episode_num INT NOT NULL,
 title JSON NOT NULL COMMENT '{"zh": "第1集", "en": "Episode 1"}',
 video_url_encrypted VARCHAR(500) NOT NULL,
 drm_key_id VARCHAR(100),
 subtitles JSON COMMENT '{"zh-CN": "url_zh.srt", "en-US": "url_en.vtt"}',
 ad_break_points JSON COMMENT '[{"time": 30, "placement_id": 1}]',
 duration INT NOT NULL,
 sort_order INT DEFAULT 0,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 INDEX idx_drama_id (drama_id)
);

-- 观看记录表（按时间分区，避免写入热点）
CREATE TABLE watch_records (
 id BIGINT AUTO_INCREMENT,
 user_id BIGINT NOT NULL,
 drama_id BIGINT NOT NULL,
 episode_id BIGINT NOT NULL,
 watch_duration INT NOT NULL,
 is_completed TINYINT DEFAULT 0,
 has_interaction TINYINT DEFAULT 0,
 device_fingerprint VARCHAR(64),
 ip_address VARCHAR(45),
 risk_score INT DEFAULT 0,
 last_watch_time DATETIME NOT NULL,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY (id, last_watch_time),
 UNIQUE KEY uk_user_episode (user_id, episode_id, last_watch_time)
) PARTITION BY RANGE (TO_DAYS(last_watch_time)) (
 PARTITION p202603 VALUES LESS THAN (TO_DAYS('2026-04-01')),
 PARTITION p202604 VALUES LESS THAN (TO_DAYS('2026-05-01')),
 PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- 4. 资产与交易相关表

CREATE TABLE assets (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 name VARCHAR(100) NOT NULL,
 cover VARCHAR(255),
 video VARCHAR(500),
 description TEXT,
 target_amount DECIMAL(20,8),
 raised_amount DECIMAL(20,8) DEFAULT 0,
 apy DECIMAL(5,2),
 duration_days INT,
 status TINYINT DEFAULT 0,
 version INT DEFAULT 0 COMMENT '乐观锁版本号',
 start_time DATETIME,
 end_time DATETIME,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE positions (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 user_id BIGINT NOT NULL,
 asset_id BIGINT NOT NULL,
 amount DECIMAL(20,8) NOT NULL,
 cost_price DECIMAL(20,8),
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY uk_user_asset (user_id, asset_id)
);

CREATE TABLE orders (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 user_id BIGINT NOT NULL,
 asset_id BIGINT NOT NULL,
 type TINYINT NOT NULL COMMENT '1:买入 2:卖出',
 price DECIMAL(20,8) NOT NULL,
 amount DECIMAL(20,8) NOT NULL,
 status TINYINT DEFAULT 0,
 liquidity_source TINYINT DEFAULT 1 COMMENT '1:C2C 订单簿 2:AMM 底池',
 slippage_rate DECIMAL(5,4),
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 INDEX idx_user_id (user_id),
 INDEX idx_asset_id (asset_id)
);

-- AMM 池表
CREATE TABLE amm_pools (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 asset_id BIGINT NOT NULL,
 base_token VARCHAR(20) NOT NULL,
 reserve_ipt DECIMAL(20,8) NOT NULL,
 reserve_base DECIMAL(20,8) NOT NULL,
 fee_rate DECIMAL(5,4) DEFAULT 0.003,
 k_value DECIMAL(40,8) GENERATED ALWAYS AS (reserve_ipt * reserve_base) STORED,
 total_lp_tokens DECIMAL(20,8) DEFAULT 0,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE,
 UNIQUE KEY uk_asset_base (asset_id, base_token)
);

-- AMM 交易记录表
CREATE TABLE amm_swaps (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 pool_id BIGINT NOT NULL,
 user_id BIGINT NOT NULL,
 direction TINYINT NOT NULL COMMENT '1:买入IPT 2:卖出IPT',
 amount_in DECIMAL(20,8) NOT NULL,
 amount_out DECIMAL(20,8) NOT NULL,
 price DECIMAL(20,8) NOT NULL,
 fee DECIMAL(20,8) NOT NULL,
 slippage DECIMAL(5,4),
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 INDEX idx_pool (pool_id),
 INDEX idx_user (user_id)
);

-- 5. 积分与 PoE 相关表

CREATE TABLE user_points (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 user_id BIGINT NOT NULL,
 balance INT NOT NULL DEFAULT 0,
 total_earned INT NOT NULL DEFAULT 0,
 total_spent INT NOT NULL DEFAULT 0,
 updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE,
 UNIQUE KEY uk_user_id (user_id)
);

CREATE TABLE points_transactions (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 user_id BIGINT NOT NULL,
 type TINYINT NOT NULL COMMENT '1:观看视频 2:签到 3:广告 4:兑换 5:补签 6:任务奖励 7:活动奖励',
 amount INT NOT NULL,
 balance_after INT NOT NULL,
 source_id VARCHAR(64),
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 INDEX idx_user_id (user_id),
 INDEX idx_created_at (created_at)
);

CREATE TABLE sign_records (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 user_id BIGINT NOT NULL,
 sign_date DATE NOT NULL,
 points_earned INT NOT NULL,
 is_makeup TINYINT DEFAULT 0,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY uk_user_date (user_id, sign_date),
 INDEX idx_user_id (user_id)
);

CREATE TABLE poe_daily_records (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 user_id BIGINT NOT NULL,
 record_date DATE NOT NULL,
 total_points INT NOT NULL,
 global_total_points BIGINT NOT NULL,
 daily_pool_amount DECIMAL(20,8) NOT NULL,
 earned_reel DECIMAL(20,8) NOT NULL,
 is_capped TINYINT DEFAULT 0,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY uk_user_date (user_id, record_date)
);

-- 6. 积分商城相关表

CREATE TABLE shop_items (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 name VARCHAR(100) NOT NULL,
 type TINYINT NOT NULL COMMENT '1:代币 2:VIP 体验卡 3:补签卡 4:实物 5:抽奖券 6:道具',
 points INT NOT NULL,
 token_amount DECIMAL(20,8),
 vip_days INT,
 stock INT DEFAULT -1,
 daily_limit INT DEFAULT 0,
 status TINYINT DEFAULT 1,
 sort_order INT DEFAULT 0,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exchange_records (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 user_id BIGINT NOT NULL,
 item_id BIGINT NOT NULL,
 points_used INT NOT NULL,
 quantity INT NOT NULL,
 status TINYINT DEFAULT 0,
 token_sent DECIMAL(20,8),
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 INDEX idx_user_id (user_id)
);

-- 7. VIP 相关表

CREATE TABLE vip_users (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 user_id BIGINT NOT NULL,
 vip_level TINYINT NOT NULL,
 start_time DATETIME NOT NULL,
 end_time DATETIME NOT NULL,
 status TINYINT DEFAULT 1,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY uk_user_id (user_id),
 INDEX idx_end_time (end_time)
);

CREATE TABLE vip_orders (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 user_id BIGINT NOT NULL,
 vip_level TINYINT NOT NULL,
 duration_type TINYINT NOT NULL COMMENT '1:月卡 2:季卡 3:年卡 4:终身',
 duration_days INT NOT NULL,
 price_fiat DECIMAL(10,2),
 price_token DECIMAL(20,8),
 payment_method TINYINT NOT NULL,
 status TINYINT DEFAULT 0,
 pay_time DATETIME,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 INDEX idx_user_id (user_id)
);

-- 8. 质押相关表

CREATE TABLE stake_pools (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 name VARCHAR(50) NOT NULL,
 lock_days INT NOT NULL,
 base_apy DECIMAL(5,2) NOT NULL,
 max_stake DECIMAL(20,8) DEFAULT NULL,
 min_stake DECIMAL(20,8) DEFAULT 100,
 penalty_rate DECIMAL(5,2) DEFAULT 0,
 status TINYINT DEFAULT 1,
 sort_order INT DEFAULT 0,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stake_records (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 user_id BIGINT NOT NULL,
 pool_id BIGINT NOT NULL,
 amount DECIMAL(20,8) NOT NULL,
 vip_level_at_stake TINYINT,
 lock_end_time DATETIME,
 total_earned DECIMAL(20,8) DEFAULT 0,
 pending_earned DECIMAL(20,8) DEFAULT 0,
 auto_compound TINYINT DEFAULT 0,
 status TINYINT DEFAULT 1,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 INDEX idx_user_id (user_id),
 INDEX idx_status (status)
);

CREATE TABLE stake_earnings_periods (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 user_id BIGINT NOT NULL,
 stake_id BIGINT NOT NULL,
 start_time DATETIME NOT NULL,
 end_time DATETIME NOT NULL,
 applied_vip_level TINYINT,
 applied_apy DECIMAL(5,2),
 earned_amount DECIMAL(20,8) NOT NULL,
 is_settled TINYINT DEFAULT 0,
 event_trigger VARCHAR(20) COMMENT 'VIP_CHANGE / DEPOSIT / WITHDRAW',
 settled_at DATETIME,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 INDEX idx_stake_id (stake_id),
 INDEX idx_settled (is_settled)
);

-- 9. 代币相关表

CREATE TABLE user_tokens (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 user_id BIGINT NOT NULL,
 balance DECIMAL(20,8) DEFAULT 0,
 total_earned DECIMAL(20,8) DEFAULT 0,
 total_spent DECIMAL(20,8) DEFAULT 0,
 updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE,
 UNIQUE KEY uk_user_id (user_id)
);

CREATE TABLE token_transactions (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 user_id BIGINT NOT NULL,
 type TINYINT NOT NULL COMMENT '1:积分兑换 2:VIP 购买 3:质押收益 4:提现 5:空投',
 amount DECIMAL(20,8) NOT NULL,
 balance_after DECIMAL(20,8) NOT NULL,
 status TINYINT DEFAULT 1,
 tx_hash VARCHAR(100),
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 INDEX idx_user_id (user_id)
);

CREATE TABLE withdrawals (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 user_id BIGINT NOT NULL,
 address VARCHAR(100) NOT NULL,
 amount DECIMAL(20,8) NOT NULL,
 fee DECIMAL(20,8) NOT NULL,
 actual_amount DECIMAL(20,8) NOT NULL,
 tx_hash VARCHAR(100),
 status TINYINT DEFAULT 0 COMMENT '0:待处理 1:处理中 2:已完成 3:失败 4:风控拦截',
 kyc_level_snapshot TINYINT NOT NULL,
 risk_score INT DEFAULT 0,
 risk_check_result JSON COMMENT '{ip_risk, device_risk, behavior_risk}',
 audit_user_id BIGINT,
 audit_remark VARCHAR(255),
 reject_reason VARCHAR(255),
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE,
 INDEX idx_user_id (user_id),
 INDEX idx_status (status)
);

-- 10. 任务相关表

CREATE TABLE tasks (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 name VARCHAR(100) NOT NULL,
 type TINYINT NOT NULL COMMENT '1:新手 2:每日 3:每周 4:成就 5:限时',
 description VARCHAR(255),
 condition_type VARCHAR(50) NOT NULL,
 condition_value TEXT,
 reward_points INT NOT NULL,
 reward_token DECIMAL(20,8) DEFAULT 0,
 sort_order INT DEFAULT 0,
 status TINYINT DEFAULT 1,
 start_time DATETIME,
 end_time DATETIME,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_tasks (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 user_id BIGINT NOT NULL,
 task_id BIGINT NOT NULL,
 progress INT DEFAULT 0,
 target INT,
 status TINYINT DEFAULT 0,
 completed_at DATETIME,
 claimed_at DATETIME,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE,
 UNIQUE KEY uk_user_task (user_id, task_id),
 INDEX idx_user_id (user_id),
 INDEX idx_status (status)
);

CREATE TABLE task_completion_logs (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 user_id BIGINT NOT NULL,
 task_id BIGINT NOT NULL,
 reward_points INT NOT NULL,
 reward_token DECIMAL(20,8),
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 INDEX idx_user_id (user_id)
);

-- 11. 代币经济相关表

CREATE TABLE token_burns (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 amount DECIMAL(20,8) NOT NULL,
 source VARCHAR(50),
 tx_hash VARCHAR(100),
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reward_pools (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 name VARCHAR(50) NOT NULL,
 balance DECIMAL(20,8) NOT NULL,
 updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE
);

CREATE TABLE device_fingerprints (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 user_id BIGINT NOT NULL,
 fingerprint_hash VARCHAR(64) NOT NULL,
 first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
 last_seen DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE,
 risk_level TINYINT DEFAULT 0,
 INDEX idx_user_id (user_id),
 INDEX idx_fingerprint (fingerprint_hash)
);

-- 区块检查点表（用于链上事件监听可靠性）
CREATE TABLE block_checkpoint (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 chain_id INT NOT NULL,
 last_confirmed_height BIGINT NOT NULL,
 block_hash VARCHAR(66),
 updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE,
 UNIQUE KEY uk_chain_id (chain_id)
);

-- 初始化基础数据
-- 插入质押池基础数据
INSERT INTO stake_pools (name, lock_days, base_apy, max_stake, min_stake, penalty_rate, status) VALUES
('活期池', 0, 5.00, NULL, 100, 0, 1),
('30天定期', 30, 8.00, 5000000, 100, 50.00, 1),
('90天定期', 90, 12.00, 10000000, 100, 30.00, 1),
('180天定期', 180, 18.00, 20000000, 100, 20.00, 1);

-- 插入积分商城基础商品
INSERT INTO shop_items (name, type, points, token_amount, status) VALUES
('10 REEL 代币', 1, 10000, 10, 1),
('VIP1 体验卡 7天', 2, 2000, NULL, 1),
('补签卡', 3, 500, NULL, 1),
('抽奖券', 5, 500, NULL, 1);

-- 初始化奖励池
INSERT INTO reward_pools (name, balance) VALUES
('PoE Daily Pool', 10000),
('Staking Reward Pool', 5000000);

-- 创建完成
SELECT 'Database initialization completed successfully!' AS message;
