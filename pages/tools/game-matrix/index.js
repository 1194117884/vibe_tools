import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';

const STORAGE_KEY = 'game_position_matrix_v1';

const DEFAULT_DATA = [
  {
    id: 'sudoku_classic_mobile_v0', name: '经典数独 v0', version: 'v0', category: '数独',
    platform: 'iOS / Android / Web', status: '概念验证',
    oneLine: '干净、少打断、输入舒服的每日数独', emotion: '放松 + 成就',
    productType: '工具型 + 内容型', audience: '25-45 岁碎片时间用户、轻度脑力训练用户',
    persona: '通勤、午休、睡前打开 5-10 分钟，希望放松但又感觉自己在训练大脑。',
    scenario: '通勤 / 午休 / 睡前', jtbd: '快速完成一局，获得脑力训练和轻微成就感。',
    sessionLength: '3-12 分钟', entryScore: 2, depthScore: 3, stickinessScore: 4,
    coreRule: '9x9，每行、每列、每宫 1-9 不重复，题目唯一解。', playComboCount: 1,
    variants: '经典 9x9；后续可加 4x4 / 6x6 / Killer',
    assistSystems: '笔记、撤销、重复高亮、错误检查、提示、自动保存',
    contentSystem: '生成题 + 每日挑战 + 统计',
    qualityRequirement: '唯一解；难度稳定；尽量避免需要猜测。',
    diffType: '体验差异', diffDetail: '不靠复杂玩法，先打输入体验、少广告打断、提示解释清楚。',
    notDoing: '不做剧情、不做复杂养成、不做强 PVP。', monetization: '广告 + 去广告内购',
    devScore: 2.5, contentScore: 3, opsScore: 3,
    techKeys: '数独生成器、求解器、难度评估、本地存档、每日题。',
    directCompetitors: 'Sudoku.com、Microsoft Sudoku、Good Sudoku',
    indirectCompetitors: 'Nonogram、2048、Number Match、填字游戏',
    publicData: '移动端数独大盘成熟，主流竞品靠每日挑战、题库、广告/IAP 留存。',
    badReviewKeywords: '广告打断、崩溃丢进度、难度不准、误触、奖励广告失败。',
    marketChance: '做更干净的输入体验和更温和的商业化。',
    changeSummary: '基础方案', changeImpact: '作为主线基准。',
    validationMetrics: 'D1/D7 留存、每日挑战完成率、平均局长、提示使用率、广告退出率。',
    positioningDamage: '低', fitsMainline: '是', notes: '适合第一版验证。'
  },
  {
    id: 'sudoku_coach_v1', name: '数独教练 v1', version: 'v1', category: '数独',
    platform: 'iOS / Android', status: '分支方案',
    oneLine: '让用户真正学会数独技巧的训练型数独', emotion: '成长 + 掌控感',
    productType: '教学型 + 工具型', audience: '初中级数独玩家、想提升技巧的人',
    persona: '会玩基础数独，但经常卡住，希望知道为什么这一步能填。',
    scenario: '晚上学习 / 周末练习 / 长局挑战', jtbd: '不是直接给答案，而是理解解题路径。',
    sessionLength: '8-25 分钟', entryScore: 3, depthScore: 5, stickinessScore: 4,
    coreRule: '经典数独 + 技巧路径解释。', playComboCount: 1,
    variants: '技巧训练关、错题复盘、导入题目',
    assistSystems: '分层提示、候选数解释、技巧标签、复盘报告',
    contentSystem: '技巧题库 + 生成题 + 训练计划',
    qualityRequirement: '每题需要可解释路径，难度按技巧分层。',
    diffType: '教学差异', diffDetail: '提示系统解释"为什么"，而不是直接填答案。',
    notDoing: '不做高频广告打断，不把学习体验做成刷题焦虑。',
    monetization: '买断 / 订阅 / 去广告', devScore: 4, contentScore: 4.5, opsScore: 3,
    techKeys: '求解步骤解释器、技巧分类、错题系统、训练计划。',
    directCompetitors: 'Good Sudoku、Cracking The Cryptic 类数独产品',
    indirectCompetitors: '脑力训练 App、逻辑训练 App',
    publicData: '高手向数独可用高质量提示、排行榜、导入题等形成差异。',
    badReviewKeywords: '提示太弱、教学不清楚、题太难、订阅价格敏感。',
    marketChance: '避开普通数独红海，切入"数独学习工具"。',
    changeSummary: '从经典数独升级为教学型产品。',
    changeImpact: '深度和粘性提升，但开发与内容难度明显上升。',
    validationMetrics: '提示点击后完成率、复盘打开率、技巧训练留存、付费转化。',
    positioningDamage: '中', fitsMainline: '是，但应作为独立模式', notes: '适合第二阶段，不建议第一版就做满。'
  },
  {
    id: 'sudoku_tower_defense_hybrid', name: '数独塔防', version: 'hybrid',
    category: '数独 + 塔防', platform: 'Steam / Web / 微信小游戏', status: '创意实验',
    oneLine: '用解数独获得资源，再布防抵御敌人', emotion: '思考 + 紧张 + 策略',
    productType: '混合玩法型', audience: '喜欢益智又喜欢策略的玩家',
    persona: '觉得纯数独太安静，想要一点战斗反馈，但不想变成重操作游戏。',
    scenario: '电脑前长局 / 微信小游戏挑战', jtbd: '通过解谜产生策略资源，再看到即时反馈。',
    sessionLength: '8-20 分钟', entryScore: 4, depthScore: 4, stickinessScore: 4,
    coreRule: '数独填数产生金币/能量/塔位，塔防阶段消耗资源。', playComboCount: 2,
    variants: '经典数独格 + 路线防守；或每填一区解锁塔位。',
    assistSystems: '慢速模式、提示、撤销、关卡预览、失败复盘',
    contentSystem: '关卡制 + 难度曲线 + 防御单位成长',
    qualityRequirement: '解谜压力不能破坏数独逻辑；塔防不能喧宾夺主。',
    diffType: '玩法融合', diffDetail: '把"填数正确性"转成塔防资源，让安静数独有外部反馈。',
    notDoing: '不做重氪养成、不做高频数值压迫。', monetization: '买断 / 激励广告 / 皮肤',
    devScore: 4.5, contentScore: 4, opsScore: 4,
    techKeys: '数独生成、战斗模拟、关卡编辑器、平衡性、状态同步。',
    directCompetitors: 'Puzzle + Defense 混合益智、Dungeon Puzzle 类',
    indirectCompetitors: '塔防、数字益智、Roguelike Puzzle',
    publicData: '混合玩法容易形成差异，但教育成本和调参成本高。',
    badReviewKeywords: '规则复杂、两边都不够爽、失败不公平、节奏割裂。',
    marketChance: '做成小体量 Steam 创意游戏或微信小游戏活动玩法。',
    changeSummary: '数独主线加入塔防反馈层。',
    changeImpact: '差异增强，但偏离经典数独；适合作为独立新游戏，不适合直接塞进经典数独。',
    validationMetrics: '新手教程完成率、首局失败率、二局率、关卡重复游玩率。',
    positioningDamage: '高', fitsMainline: '否，建议独立立项', notes: '好玩但不轻，不能用经典数独的产品逻辑管理。'
  },
  {
    id: 'tower_defense_casual', name: '轻量塔防', version: 'v0', category: '塔防',
    platform: '微信小游戏 / Android', status: '概念验证',
    oneLine: '3 分钟一局的轻量路线塔防', emotion: '防守成就 + 轻策略',
    productType: '关卡型 + 运营型', audience: '休闲策略玩家、微信碎片用户',
    persona: '想动脑但不想学习复杂系统，喜欢升级、合成、过关。',
    scenario: '排队 / 通勤 / 午休', jtbd: '快速布置、升级、看怪物被消灭。',
    sessionLength: '3-8 分钟', entryScore: 2, depthScore: 4, stickinessScore: 5,
    coreRule: '敌人沿路径前进，玩家放置/升级防御塔阻止通关。', playComboCount: 1,
    variants: '路线塔防、随机塔、合成塔、肉鸽塔防',
    assistSystems: '自动开始、倍速、推荐升级、失败提示',
    contentSystem: '关卡、每日挑战、塔升级、活动',
    qualityRequirement: '关卡节奏明确，失败原因可理解。',
    diffType: '节奏差异', diffDetail: '压缩成 3 分钟一局，适合微信小游戏和移动端。',
    notDoing: '不做复杂剧情，不做长线重肝系统。', monetization: '激励广告 + 皮肤 + 小额 IAP',
    devScore: 3.5, contentScore: 4, opsScore: 4.5,
    techKeys: '寻路、波次编辑器、塔/怪数值、关卡数据表。',
    directCompetitors: 'Kingdom Rush 类、随机塔防小游戏',
    indirectCompetitors: '合成、放置、肉鸽小游戏',
    publicData: '塔防适合关卡运营和激励广告，但数值调优要求较高。',
    badReviewKeywords: '卡关逼广告、数值失衡、重复刷、后期无聊。',
    marketChance: '做轻量节奏和清楚反馈，减少养成负担。',
    changeSummary: '塔防基础方案。', changeImpact: '作为塔防基准。',
    validationMetrics: '关卡通过率、失败后复玩率、激励广告观看率、D3 留存。',
    positioningDamage: '低', fitsMainline: '是', notes: '适合微信小游戏测试。'
  },
  {
    id: 'card_roguelike_puzzle', name: '轻肉鸽卡牌', version: 'v0', category: '卡牌',
    platform: 'Steam / Android', status: '概念验证',
    oneLine: '10 分钟一局的轻量构筑卡牌', emotion: '策略组合 + 发现感',
    productType: '策略型 + 内容型', audience: '喜欢 Slay the Spire 式构筑但想要更轻体验的人',
    persona: '愿意研究卡组组合，但不想每局玩 40 分钟。',
    scenario: 'PC 晚间 / 手机长碎片时间', jtbd: '通过选择和组合卡牌，打出一套自己的策略。',
    sessionLength: '10-25 分钟', entryScore: 4, depthScore: 5, stickinessScore: 5,
    coreRule: '每回合抽牌，使用资源打牌，战胜敌人后构筑牌组。', playComboCount: 2,
    variants: '卡牌战斗 + 路线选择 + 遗物组合',
    assistSystems: '关键词说明、推荐出牌、新手卡组、撤销预览',
    contentSystem: '卡牌池、敌人、事件、遗物、角色',
    qualityRequirement: '卡牌互相联动，避免无脑最优解。',
    diffType: '构筑深度', diffDetail: '降低单局时长，强调小卡组快速成型。',
    notDoing: '不做抽卡氪金，不做 PVP 平衡地狱。',
    monetization: 'Steam 买断 / 移动端买断或广告试玩', devScore: 4, contentScore: 5, opsScore: 3.5,
    techKeys: '战斗状态机、卡牌 DSL、敌人 AI、平衡测试、存档。',
    directCompetitors: 'Slay the Spire、Dawncaster、Pirates Outlaws',
    indirectCompetitors: '棋盘策略、回合制 RPG、肉鸽解谜',
    publicData: '卡牌构筑天花板高，但内容和平衡成本高。',
    badReviewKeywords: '卡牌少、套路单一、随机不公平、后期重复。',
    marketChance: '做更短单局、更清晰反馈、更低学习成本。',
    changeSummary: '卡牌大类基准。', changeImpact: '适合中长期项目，不适合作为极低成本首作。',
    validationMetrics: '首局完成率、平均局长、卡牌选择分布、胜率曲线、复玩率。',
    positioningDamage: '低', fitsMainline: '是', notes: '需要大量平衡和内容迭代。'
  },
  {
    id: 'match3_casual', name: '消消乐', version: 'v0', category: '消消乐',
    platform: '微信小游戏 / iOS / Android', status: '成熟品类',
    oneLine: '轻松上手、关卡驱动的三消游戏', emotion: '爽感 + 轻松 + 收集',
    productType: '关卡型 + 运营型', audience: '泛休闲用户、女性用户、中老年用户、碎片时间玩家',
    persona: '打开就能玩，喜欢颜色反馈、连锁爆炸和过关奖励。',
    scenario: '等车 / 看剧间隙 / 睡前', jtbd: '不用学习太多规则，快速获得消除爽感和过关反馈。',
    sessionLength: '1-5 分钟', entryScore: 1, depthScore: 3, stickinessScore: 5,
    coreRule: '交换相邻元素，三个及以上相同元素连线消除。', playComboCount: 1,
    variants: '关卡目标、障碍物、道具、限步、收集、剧情装修',
    assistSystems: '可行动提示、道具、复活、自动洗牌',
    contentSystem: '大量关卡、活动、赛季、道具经济',
    qualityRequirement: '关卡目标清楚，爽点密度高，难点可调。',
    diffType: '运营与主题', diffDetail: '品类极成熟，差异通常来自主题包装、关卡节奏和活动运营。',
    notDoing: '不直接硬拼海量关卡，不做过强付费墙。',
    monetization: '广告 + 道具 IAP + 体力', devScore: 3, contentScore: 5, opsScore: 5,
    techKeys: '棋盘消除逻辑、关卡编辑器、道具系统、活动系统。',
    directCompetitors: 'Candy Crush、开心消消乐、Royal Match',
    indirectCompetitors: '连连看、泡泡龙、合成类',
    publicData: '三消是超成熟大盘，核心竞争在内容量和运营。',
    badReviewKeywords: '卡关、逼氪、广告多、关卡重复、运气成分。',
    marketChance: '小团队更适合做垂直主题或轻量创新，不适合正面硬拼。',
    changeSummary: '消除大类基准。', changeImpact: '极易上手，粘性强，但内容和运营压力最大。',
    validationMetrics: '关卡失败率、道具使用率、卡关点、D7 留存、付费率。',
    positioningDamage: '低', fitsMainline: '是', notes: '不建议无差异进入红海。'
  },
  {
    id: 'link_match_classic', name: '连连看', version: 'v0', category: '连连看',
    platform: '微信小游戏 / Web / Android', status: '轻量方案',
    oneLine: '低压、怀旧、适合碎片时间的图案连接游戏', emotion: '怀旧 + 放松 + 清屏爽感',
    productType: '工具型 + 关卡型', audience: '轻度休闲玩家、中年用户、办公室碎片用户',
    persona: '喜欢简单规则，不喜欢复杂成长系统，追求清屏和时间挑战。',
    scenario: '午休 / 办公间隙 / 休闲网页', jtbd: '快速找相同图案，清空棋盘。',
    sessionLength: '2-6 分钟', entryScore: 1, depthScore: 2.5, stickinessScore: 3.5,
    coreRule: '两个相同图案之间连线转折不超过两次即可消除。', playComboCount: 1,
    variants: '限时、无限、主题图案、道具、关卡障碍',
    assistSystems: '提示、洗牌、撤销、剩余可消除检测',
    contentSystem: '主题图包 + 关卡 + 每日挑战',
    qualityRequirement: '始终有解或可洗牌；图案识别清楚。',
    diffType: '轻量体验', diffDetail: '做成打开即玩、字体大、图案清晰、低负担。',
    notDoing: '不做复杂数值养成，不做重广告。', monetization: '广告 + 皮肤主题',
    devScore: 2, contentScore: 2.5, opsScore: 2.5,
    techKeys: '连线判定、可解性检测、棋盘生成、主题资源。',
    directCompetitors: '各类 Onet / 连连看小游戏',
    indirectCompetitors: '消消乐、找茬、记忆翻牌',
    publicData: '连连看规则成熟，适合轻量入口和怀旧用户。',
    badReviewKeywords: '图案太小、广告太多、死局、误触。',
    marketChance: '做清晰图案和舒适操作，适配中老年和微信入口。',
    changeSummary: '连连看大类基准。', changeImpact: '开发轻、上手低，但差异和深度不足。',
    validationMetrics: '首局完成率、误触率、平均局长、提示使用率。',
    positioningDamage: '低', fitsMainline: '是', notes: '可作为低成本练手项目。'
  },
  {
    id: 'snake_modern', name: '现代贪吃蛇', version: 'v0', category: '贪吃蛇',
    platform: 'Web / 微信小游戏 / Steam', status: '创意小品',
    oneLine: '经典贪吃蛇加入任务、皮肤和轻度肉鸽变化', emotion: '紧张 + 成长 + 怀旧',
    productType: '街机型 + 轻肉鸽', audience: '怀旧玩家、短局街机玩家、小游戏用户',
    persona: '知道贪吃蛇规则，想玩一点更现代、更有目标的版本。',
    scenario: '网页短局 / 微信挑战 / Steam 小品', jtbd: '在简单控制里追求更高分和更长生存。',
    sessionLength: '1-8 分钟', entryScore: 1, depthScore: 3.5, stickinessScore: 3.5,
    coreRule: '控制蛇吃食物变长，避免撞墙、撞自己或障碍。', playComboCount: 1,
    variants: '任务目标、道具、障碍、Boss、肉鸽升级、多人竞速',
    assistSystems: '新手慢速、轨迹提示、暂停、复活',
    contentSystem: '地图、任务、皮肤、每日挑战',
    qualityRequirement: '控制响应必须准确，死亡原因必须公平。',
    diffType: '经典现代化', diffDetail: '加入目标和变化，但不能破坏贪吃蛇一秒懂的优势。',
    notDoing: '不做复杂技能堆叠，不让画面过乱。',
    monetization: '广告 + 皮肤 / Steam 买断', devScore: 2.5, contentScore: 3, opsScore: 3,
    techKeys: '网格移动、碰撞、道具系统、地图生成、排行榜。',
    directCompetitors: 'Snake.io、各类贪吃蛇小游戏',
    indirectCompetitors: '2048、Flappy Bird、街机小游戏',
    publicData: '经典规则认知成本极低，差异要靠节奏、反馈和排行榜。',
    badReviewKeywords: '广告多、延迟、判定不准、AI 不公平。',
    marketChance: '做精准控制和清爽视觉，加入轻目标驱动。',
    changeSummary: '贪吃蛇大类基准。', changeImpact: '适合独立开发低成本验证。',
    validationMetrics: '首局死亡时间、再来一局率、排行榜参与率、控制误触反馈。',
    positioningDamage: '低', fitsMainline: '是', notes: '非常适合做 Web Demo。'
  },
  {
    id: 'tetris_classic_plus', name: '俄罗斯方块 Plus', version: 'v0', category: '俄罗斯方块',
    platform: 'Web / Steam / Android', status: '规则敏感',
    oneLine: '经典方块堆叠的现代化练习与挑战版', emotion: '心流 + 压力 + 技巧成长',
    productType: '街机型 + 技巧训练', audience: '反应型玩家、经典街机玩家、技巧训练玩家',
    persona: '喜欢高速心流和不断突破分数，对操作延迟很敏感。',
    scenario: 'PC 长局 / 手机短局 / Web 练习', jtbd: '在高速压力下保持清晰操作，追求更高分。',
    sessionLength: '3-15 分钟', entryScore: 2, depthScore: 5, stickinessScore: 4,
    coreRule: '不同形状方块下落，旋转、移动、消行得分。', playComboCount: 1,
    variants: '马拉松、限时、挑战关、训练模式、特殊方块',
    assistSystems: '幽灵方块、保留方块、下一个预览、训练复盘',
    contentSystem: '模式、排行榜、成就、训练任务',
    qualityRequirement: '输入延迟低，旋转规则清晰，判定公平。',
    diffType: '技巧体验', diffDetail: '突出训练、复盘和低延迟手感，而不是乱加道具。',
    notDoing: '避免直接使用受保护品牌表达；不复制商业方块产品包装。',
    monetization: '买断 / 广告 + 皮肤', devScore: 3, contentScore: 2.5, opsScore: 3,
    techKeys: '旋转系统、碰撞、输入缓冲、排行榜、回放。',
    directCompetitors: 'Tetris 官方类产品、Puyo Puyo Tetris 类',
    indirectCompetitors: '节奏游戏、街机反应游戏、堆叠游戏',
    publicData: '核心规则认知高，但品牌与规则表达要谨慎。',
    badReviewKeywords: '延迟、旋转手感差、广告打断、判定不一致。',
    marketChance: '做训练工具或变体玩法，而不是直接硬刚官方产品。',
    changeSummary: '俄罗斯方块大类基准。', changeImpact: '高心流高深度，但手感和版权边界要注意。',
    validationMetrics: '输入延迟反馈、平均局长、再开局率、高分增长曲线。',
    positioningDamage: '低', fitsMainline: '是', notes: '命名和素材要避开官方商标。'
  },
  {
    id: 'number_match_casual', name: '数字配对', version: 'v0', category: '数字益智',
    platform: 'iOS / Android / 微信小游戏', status: '机会观察',
    oneLine: '比数独更轻的数字消除脑力游戏', emotion: '轻脑力 + 清理爽感',
    productType: '工具型 + 关卡型', audience: '喜欢数字但觉得数独太难的用户',
    persona: '想玩数字游戏，但不想做复杂推理。', scenario: '通勤 / 睡前 / 休息',
    jtbd: '通过简单规则清理数字棋盘。', sessionLength: '2-8 分钟',
    entryScore: 2, depthScore: 3, stickinessScore: 4,
    coreRule: '寻找相同数字或合计为特定值的数字对并消除。', playComboCount: 1,
    variants: '限步、限时、关卡目标、每日挑战',
    assistSystems: '提示、撤销、洗牌、可消除高亮',
    contentSystem: '关卡 + 每日挑战 + 主题',
    qualityRequirement: '始终有可行动作，避免无意义扫描。',
    diffType: '人群差异', diffDetail: '承接数独用户，但更轻、更快、更像休闲消除。',
    notDoing: '不做复杂公式，不做强推理。', monetization: '广告 + 去广告 + 道具',
    devScore: 2.5, contentScore: 3.5, opsScore: 3,
    techKeys: '棋盘生成、可解性检测、关卡目标、提示算法。',
    directCompetitors: 'Number Match、数字消除类游戏',
    indirectCompetitors: '数独、2048、连连看、消消乐',
    publicData: '数字益智常被包装成放松和脑力训练。',
    badReviewKeywords: '广告、重复、提示弱、后期乏味。',
    marketChance: '作为数独产品的轻量旁支，吸收更广泛用户。',
    changeSummary: '从数独向更轻数字消除扩展。',
    changeImpact: '降低入门，提高泛用户覆盖，但推理深度下降。',
    validationMetrics: '首局完成率、D1 留存、广告退出率、日挑战完成率。',
    positioningDamage: '中', fitsMainline: '待验证', notes: '适合作为矩阵里的相邻品类参考。'
  }
];

const FIELD_CONFIG = [
  ['name', '名称', 'text', true],
  ['version', '版本', 'text', false],
  ['category', '大分类', 'text', true],
  ['platform', '平台', 'text', true],
  ['status', '状态', 'text', false],
  ['oneLine', '一句话定位', 'textarea', true],
  ['emotion', '核心情绪', 'text', false],
  ['productType', '产品类型', 'text', false],
  ['audience', '面向人群', 'textarea', false],
  ['persona', '核心画像', 'textarea', false],
  ['scenario', '用户场景', 'text', false],
  ['jtbd', '用户任务 JTBD', 'textarea', false],
  ['sessionLength', '单局时长', 'text', false],
  ['entryScore', '入门门槛 1-5', 'number', false],
  ['depthScore', '深度上限 1-5', 'number', false],
  ['stickinessScore', '用户粘性 1-5', 'number', false],
  ['coreRule', '核心规则', 'textarea', false],
  ['playComboCount', '玩法组合数', 'number', false],
  ['variants', '玩法变体', 'textarea', false],
  ['assistSystems', '辅助系统', 'textarea', false],
  ['contentSystem', '内容系统', 'textarea', false],
  ['qualityRequirement', '题目/内容质量要求', 'textarea', false],
  ['diffType', '差异点类型', 'text', false],
  ['diffDetail', '具体差异点', 'textarea', false],
  ['notDoing', '不做什么', 'textarea', false],
  ['monetization', '商业模式', 'text', false],
  ['devScore', '开发难度 1-5', 'number', false],
  ['contentScore', '内容难度 1-5', 'number', false],
  ['opsScore', '运营难度 1-5', 'number', false],
  ['techKeys', '技术关键点', 'textarea', false],
  ['directCompetitors', '直接竞品', 'textarea', false],
  ['indirectCompetitors', '间接竞品', 'textarea', false],
  ['publicData', '竞品公开数据 / 市场证据', 'textarea', false],
  ['badReviewKeywords', '竞品差评关键词', 'textarea', false],
  ['marketChance', '市场机会', 'textarea', false],
  ['changeSummary', '本次变更', 'textarea', false],
  ['changeImpact', '影响判断', 'textarea', false],
  ['validationMetrics', '验证指标', 'textarea', false],
  ['positioningDamage', '原定位伤害', 'text', false],
  ['fitsMainline', '是否符合主线', 'text', false],
  ['notes', '备注', 'textarea', false],
];

/* --- placeholder hints for every field --- */
const PLACEHOLDER_MAP = {
  name: '例：经典数独 v0、轻肉鸽卡牌。给方案起一个能一眼看出是什么的名字。',
  version: '例：v0、v1、hybrid、copy。标识版本或分支。',
  category: '例：数独、塔防、卡牌。该方案所属的大品类，选择或新增。',
  platform: '例：iOS / Android / Web / Steam。目标发布平台，可多选。',
  status: '例：概念验证、分支方案、草稿。当前方案的研发阶段。',
  oneLine: '用一句话说清楚这款游戏是什么。例："干净、少打断、输入舒服的每日数独"。这是矩阵最关键的一句话。',
  emotion: '玩家玩这款游戏时的核心情绪体验。例：放松 + 成就、思考 + 紧张 + 策略。',
  productType: '产品形态分类。工具型=功能驱动，内容型=关卡/剧情驱动，关卡型=线性推进，运营型=活动/经济驱动，可多选。',
  audience: '目标用户画像。例："25-45 岁碎片时间用户、轻度脑力训练用户"。越具体越好。',
  persona: '一个具体的核心玩家形象。ta 在什么场景下打开游戏？ta 的动机和痛点是什么？用叙事方式写。',
  scenario: '典型使用场景。例：通勤 / 午休 / 睡前、PC 晚间 / 手机长碎片时间。',
  jtbd: 'Jobs-To-Be-Done：用户"雇佣"这款游戏要完成什么任务？不是功能列表，而是用户的心理目的。例："快速获得脑力训练和轻微成就感"。',
  sessionLength: '典型单局时长范围。例：3-12 分钟、10-25 分钟。',
  entryScore: '入门门槛 1-5。1=打开即懂无需学习，5=需要系统学习成本。',
  depthScore: '深度上限 1-5。1=很快玩腻重复，5=高手可长期研究和精进。',
  stickinessScore: '用户粘性 1-5。1=偶尔打开，5=每日必玩/社交驱动/成长体系强。',
  coreRule: '核心玩法规则描述。例："9×9，每行每列每宫 1-9 不重复"。解释玩家在做什么、怎么算赢。',
  playComboCount: '玩法组合数量。1=单一核心循环，2+=多个玩法层叠加（如战斗+构筑）。',
  variants: '该方案可以衍生出哪些玩法变体。例：经典 9×9 + 4×4 / 6×6 / Killer、关卡目标、道具、限步。',
  assistSystems: '帮助玩家理解和操作的系统。例：笔记、撤销、提示、错误检查、自动保存、训练复盘。',
  contentSystem: '内容生产和更新的系统。例：生成题+每日挑战+统计、关卡编辑器+难度曲线+防御单位成长。',
  qualityRequirement: '内容质量标准。例："唯一解；难度稳定；避免需要猜测"、"关卡节奏明确，失败原因可理解"。',
  diffType: '差异点类型，即你的差异化在哪个维度。例：体验差异、教学差异、玩法融合、节奏差异。',
  diffDetail: '具体说明你和竞品的差异是什么。不要说"我们更好"，要说"我们在 xx 维度做了 yy 不同"。',
  notDoing: '明确不做什么，防止范围蔓延。例："不做剧情、不做复杂养成、不做强 PVP"、"不做抽卡氪金、不做 PVP 平衡地狱"。',
  monetization: '商业模式。例：广告+去广告内购、买断/订阅、Steam买断/移动端广告试玩。',
  devScore: '开发难度 1-5。1=单人几周可完成，5=需多系统/多平台/强技术团队。',
  contentScore: '内容难度 1-5。1=少量固定内容即可，5=需大量关卡/卡牌/活动持续产出。',
  opsScore: '运营难度 1-5。1=无运营压力，5=需强活动运营/社区/客服/数据团队。',
  techKeys: '核心技术关键点。例：数独生成器+求解器+难度评估、战斗状态机+卡牌DSL+敌人AI。',
  directCompetitors: '直接竞品，即解决了同样用户任务的产品。例：Sudoku.com、Slay the Spire、Candy Crush。',
  indirectCompetitors: '间接竞品，即用户可能用其替代你的产品。例：数独对填字游戏、塔防对放置游戏。',
  publicData: '竞品的公开数据或市场证据。例：大盘数据、竞品收入、用户评价趋势、品类成熟度判断。',
  badReviewKeywords: '从竞品差评中提炼的关键词。例："广告打断"、"难度不准"、"误触"、"卡关逼氪"。',
  marketChance: '基于以上分析，你的市场机会在哪里？例："做更干净的输入体验和更温和的商业化"。',
  changeSummary: '本次方案相对于基准方案的变更摘要。例："从经典数独升级为教学型产品"。',
  changeImpact: '这次变更会产生什么影响？评估对人群、难度、粘性、开发复杂度的连锁影响。',
  validationMetrics: '上线后用什么指标验证方案是否成功？例：D1/D7留存、每日挑战完成率、首局完成率、复玩率。',
  positioningDamage: '此方案对原有产品定位的伤害程度。低=加强主线，中=部分偏移，高=严重偏离。',
  fitsMainline: '此方案是否符合主线产品方向。是/否/待验证。否不代表放弃，只是需要独立立项。',
  notes: '任何补充说明、风险提示、灵感备忘。自由书写。',
};

/* --- dynamic enum options persisted to localStorage --- */
const ENUM_STORAGE_KEY = 'game_matrix_enum_options_v1';

const DEFAULT_ENUM_OPTIONS = {
  category:           ['数独', '塔防', '卡牌', '消消乐', '连连看', '贪吃蛇', '俄罗斯方块', '数字益智', '数独 + 塔防', '未分类'],
  platform:           ['iOS', 'Android', 'Web', 'Steam', '微信小游戏'],
  status:             ['概念验证', '分支方案', '创意实验', '成熟品类', '轻量方案', '机会观察', '规则敏感', '微调方案', '草稿'],
  productType:        ['工具型', '内容型', '关卡型', '运营型', '教学型', '混合玩法型', '策略型', '街机型'],
  emotion:            ['放松', '成就', '挑战', '成长', '掌控感', '思考', '紧张', '策略', '爽感', '轻松', '收集', '怀旧', '清屏爽感', '心流', '压力', '技巧成长', '轻脑力', '清理爽感', '防守成就', '轻策略', '策略组合', '发现感'],
  diffType:           ['体验差异', '教学差异', '玩法融合', '节奏差异', '构筑深度', '运营与主题', '轻量体验', '经典现代化', '技巧体验', '人群差异'],
  monetization:       ['广告 + 去广告内购', '买断 / 订阅 / 去广告', '买断 / 激励广告 / 皮肤', '激励广告 + 皮肤 + 小额 IAP', '买断 / 移动端买断或广告试玩', '广告 + 道具 IAP + 体力', '广告 + 皮肤主题', '广告 + 皮肤 / Steam 买断', '广告 + 去广告 + 道具', '买断 / 广告 + 皮肤', '待定'],
  positioningDamage:  ['低', '中', '高', '待评估'],
  fitsMainline:       ['是', '否', '待验证'],
};

/* multi-select flag — static, not user-editable */
const ENUM_MULTI = new Set(['platform', 'productType', 'emotion']);

const SEPARATOR = ' / ';

/* --- helpers --- */
const uid = (prefix = 'row') =>
  `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const short = (value, len = 48) => {
  const s = String(value ?? '');
  return s.length > len ? s.slice(0, len) + '…' : s;
};

/* --- score bar --- */
function ScoreBar({ value }) {
  const n = Number(value || 0);
  const pct = Math.max(0, Math.min(100, (n / 5) * 100));
  return (
    <div className="flex items-center gap-1.5 min-w-[72px]">
      <span className="text-xs text-[var(--text)] tabular-nums w-7 text-right">
        {Number.isInteger(n) ? n : n.toFixed(1)}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, var(--primary), #2997ff)',
          }}
        />
      </div>
    </div>
  );
}

/* --- pill badge --- */
function Pill({ children, color = 'default' }) {
  const colors = {
    default: 'text-[var(--textMuted)] border-[var(--border)] bg-[var(--surfaceHover)]',
    blue: 'text-[#2997ff] border-[#2997ff]/30 bg-[#2997ff]/8',
    purple: 'text-[#a78bfa] border-[#a78bfa]/30 bg-[#a78bfa]/8',
    warm: 'text-[#f59e0b] border-[#f59e0b]/30 bg-[#f59e0b]/8',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-full px-2 py-0.5 text-[11px] leading-none ${colors[color] || colors.default}`}
    >
      {children}
    </span>
  );
}

/* --- stat display --- */
function Stat({ value, label }) {
  return (
    <div className="bg-[var(--surfaceHover)] border border-[var(--border)] rounded-xl px-3 py-2.5">
      <strong className="text-lg block text-[var(--text)]">{value}</strong>
      <span className="text-[11px] text-[var(--textMuted)]">{label}</span>
    </div>
  );
}

/* ====== MAIN COMPONENT ====== */
export default function GameMatrix() {
  const [rows, setRows] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [jsonMode, setJsonMode] = useState('export');
  const [jsonText, setJsonText] = useState('');
  const [search, setSearch] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [storageOk, setStorageOk] = useState(true);
  const [enumOptions, setEnumOptions] = useState(DEFAULT_ENUM_OPTIONS);
  const [addingEnum, setAddingEnum] = useState(null); // { key, value } or null

  const getEnumCfg = useCallback(
    (key) => {
      const options = enumOptions[key];
      if (!options) return null;
      return { options, multi: ENUM_MULTI.has(key) };
    },
    [enumOptions],
  );

  const addEnumOption = (key, newOption) => {
    const trimmed = newOption.trim();
    if (!trimmed || enumOptions[key].includes(trimmed)) return;
    const next = { ...enumOptions, [key]: [...enumOptions[key], trimmed] };
    try { localStorage.setItem(ENUM_STORAGE_KEY, JSON.stringify(next)); } catch {}
    setEnumOptions(next);
    setAddingEnum(null);
  };

  /* load */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setRows(raw ? JSON.parse(raw) : structuredClone(DEFAULT_DATA));
    } catch {
      setRows(structuredClone(DEFAULT_DATA));
      setStorageOk(false);
    }
    try {
      const raw = localStorage.getItem(ENUM_STORAGE_KEY);
      if (raw) setEnumOptions(JSON.parse(raw));
    } catch {}
  }, []);

  /* save */
  const saveData = useCallback(
    (data) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setStorageOk(true);
      } catch {
        setStorageOk(false);
      }
      setRows(data);
    },
    [],
  );

  /* --- derived --- */
  const uniqueValues = (key) =>
    [
      ...new Set(
        rows.flatMap((r) =>
          String(r[key] || '')
            .split('/')
            .map((x) => x.trim()),
        ).filter(Boolean),
      ),
    ].sort();

  const filtered = rows.filter((r) => {
    const hay = Object.values(r).join(' ').toLowerCase();
    return (
      (!search || hay.includes(search.toLowerCase())) &&
      (!filterPlatform || String(r.platform || '').includes(filterPlatform)) &&
      (!filterCategory || String(r.category || '').includes(filterCategory)) &&
      (!filterType || String(r.productType || '').includes(filterType))
    );
  });

  const avg = (key) =>
    filtered.length
      ? (filtered.reduce((s, r) => s + Number(r[key] || 0), 0) / filtered.length).toFixed(1)
      : '0';

  const selectedRow = rows.find((r) => r.id === selectedId);

  /* --- actions --- */
  const addRow = () => {
    const base = {
      id: uid('game'), name: '新游戏方案', version: 'v0', category: '未分类',
      platform: 'Web', status: '草稿',
      oneLine: '一句话说明这款游戏的核心定位', emotion: '放松 / 成就 / 挑战',
      productType: '工具型 / 内容型 / 关卡型', audience: '目标用户',
      persona: '核心用户画像', scenario: '用户场景',
      jtbd: '用户打开它是为了完成什么任务', sessionLength: '3-10 分钟',
      entryScore: 2, depthScore: 3, stickinessScore: 3,
      coreRule: '核心规则', playComboCount: 1, variants: '玩法变体',
      assistSystems: '辅助系统', contentSystem: '内容系统',
      qualityRequirement: '质量要求', diffType: '差异点类型',
      diffDetail: '具体差异点', notDoing: '不做什么', monetization: '待定',
      devScore: 2, contentScore: 2, opsScore: 2,
      techKeys: '技术关键点', directCompetitors: '直接竞品',
      indirectCompetitors: '间接竞品', publicData: '市场证据',
      badReviewKeywords: '差评关键词', marketChance: '市场机会',
      changeSummary: '新建方案', changeImpact: '待评估',
      validationMetrics: 'D1 留存、完成率、复玩率',
      positioningDamage: '待评估', fitsMainline: '待验证', notes: '',
    };
    const next = [base, ...rows];
    saveData(next);
    setSelectedId(base.id);
    setDrawerOpen(true);
  };

  const cloneRow = (id) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    const clone = structuredClone(row);
    clone.id = uid(row.category || 'clone');
    clone.name = row.name + ' - 微调版';
    clone.version = 'copy';
    clone.status = '微调方案';
    clone.changeSummary = '从"' + row.name + '"复制后微调';
    clone.changeImpact = '请填写：这次微调对人群、难度、粘性、开发复杂度的影响。';
    const next = [clone, ...rows];
    saveData(next);
    setSelectedId(clone.id);
    setDrawerOpen(true);
  };

  const deleteRow = () => {
    if (!selectedId) return;
    const row = rows.find((r) => r.id === selectedId);
    if (!row || !confirm(`确定删除「${row.name}」吗？`)) return;
    const next = rows.filter((r) => r.id !== selectedId);
    setCheckedIds((prev) => {
      const nextSet = new Set(prev);
      nextSet.delete(selectedId);
      return nextSet;
    });
    setSelectedId(null);
    setDrawerOpen(false);
    saveData(next);
  };

  const saveForm = (e) => {
    e.preventDefault();
    const row = rows.find((r) => r.id === selectedId);
    if (!row) return;
    const form = e.target;
    FIELD_CONFIG.forEach(([key, , type]) => {
      const enumCfg = getEnumCfg(key);

      // multi-select: collect checked checkboxes
      if (enumCfg && enumCfg.multi) {
        const checked = [];
        enumCfg.options.forEach(opt => {
          const cb = form.elements[`${key}_opt_${opt}`];
          if (cb && cb.checked) checked.push(cb.value);
        });
        row[key] = checked.join(SEPARATOR);
        return;
      }

      // single select
      if (enumCfg && !enumCfg.multi) {
        const sel = form.elements[key];
        if (sel) row[key] = sel.value;
        return;
      }

      // default
      const el = form.elements[key];
      if (!el) return;
      row[key] = type === 'number' ? Number(el.value || 0) : el.value.trim();
    });
    saveData([...rows]);
    setDrawerOpen(false);
    setSelectedId(null);
  };

  const toggleCheck = (id) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 2) {
          const first = next.values().next().value;
          next.delete(first);
        }
        next.add(id);
      }
      return next;
    });
  };

  const doCompare = () => {
    const ids = [...checkedIds];
    if (ids.length !== 2) {
      alert('请先勾选两行再对比。');
      return;
    }
    setCompareOpen(true);
  };

  const exportJson = () => {
    setJsonMode('export');
    setJsonText(JSON.stringify({ rows, enumOptions }, null, 2));
    setJsonOpen(true);
  };

  const importJson = () => {
    setJsonMode('import');
    setJsonText('');
    setJsonOpen(true);
  };

  const applyImport = () => {
    try {
      const parsed = JSON.parse(jsonText);
      // support old format (array-only) and new format ({ rows, enumOptions })
      let importedRows, importedEnums;
      if (Array.isArray(parsed)) {
        importedRows = parsed;
        importedEnums = null;
      } else if (parsed.rows && Array.isArray(parsed.rows)) {
        importedRows = parsed.rows;
        importedEnums = parsed.enumOptions || null;
      } else {
        throw new Error('JSON 格式错误：需要数组或 { rows: [...], enumOptions: {...} }');
      }
      const mapped = importedRows.map((r) => ({ id: r.id || uid('import'), ...r }));
      setCheckedIds(new Set());
      setSelectedId(null);
      setDrawerOpen(false);
      saveData(mapped);
      if (importedEnums) {
        setEnumOptions(importedEnums);
        try { localStorage.setItem(ENUM_STORAGE_KEY, JSON.stringify(importedEnums)); } catch {}
      }
      setJsonOpen(false);
    } catch (e) {
      alert('导入失败：' + e.message);
    }
  };

  const resetDemo = () => {
    if (!confirm('确定恢复 DEMO 数据吗？当前 localStorage 数据会被覆盖。')) return;
    setCheckedIds(new Set());
    setSelectedId(null);
    setDrawerOpen(false);
    setCompareOpen(false);
    saveData(structuredClone(DEFAULT_DATA));
    setEnumOptions(DEFAULT_ENUM_OPTIONS);
    try { localStorage.setItem(ENUM_STORAGE_KEY, JSON.stringify(DEFAULT_ENUM_OPTIONS)); } catch {}
  };

  const getCompareData = () => {
    const ids = Array.from(checkedIds);
    if (ids.length !== 2) return null;
    const a = rows.find((r) => r.id === ids[0]);
    const b = rows.find((r) => r.id === ids[1]);
    if (!a || !b) return null;
    const important = [
      ['name', '名称'], ['oneLine', '一句话定位'], ['category', '大分类'],
      ['platform', '平台'], ['audience', '核心用户'], ['scenario', '用户场景'],
      ['jtbd', '用户任务'], ['entryScore', '入门门槛'], ['depthScore', '深度上限'],
      ['stickinessScore', '用户粘性'], ['playComboCount', '玩法组合数'],
      ['variants', '玩法变体'], ['diffDetail', '具体差异点'],
      ['monetization', '商业模式'], ['devScore', '开发难度'],
      ['contentScore', '内容难度'], ['opsScore', '运营难度'],
      ['marketChance', '市场机会'], ['changeSummary', '本次变更'],
      ['changeImpact', '影响判断'], ['positioningDamage', '原定位伤害'],
      ['fitsMainline', '是否符合主线'], ['validationMetrics', '验证指标'],
    ];
    return { a, b, fields: important };
  };
  const compareData = getCompareData();

  /* ---- render ---- */
  return (
    <>
      <Head>
        <title>Game Matrix — Vibe Tools</title>
      </Head>

      <div className="flex flex-col h-full w-full overflow-hidden">
        {/* ---- toolbar ---- */}
        <div className="w-full px-4 py-2.5 border-b border-[var(--border)] bg-[var(--surface)] space-y-2">
          {/* Row 1: search + filters + actions */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              className="w-40 h-8 bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 text-xs text-[var(--text)] placeholder:text-[var(--textMuted)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 flex-shrink-0"
              placeholder="搜索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="h-8 bg-[var(--background)] border border-[var(--border)] rounded-lg px-2 text-xs text-[var(--text)] outline-none max-w-[120px]"
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
            >
              <option value="">全部平台</option>
              {uniqueValues('platform').map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <select
              className="h-8 bg-[var(--background)] border border-[var(--border)] rounded-lg px-2 text-xs text-[var(--text)] outline-none max-w-[110px]"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">全部分类</option>
              {uniqueValues('category').map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <select
              className="h-8 bg-[var(--background)] border border-[var(--border)] rounded-lg px-2 text-xs text-[var(--text)] outline-none max-w-[120px]"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">全部类型</option>
              {uniqueValues('productType').map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>

            <span className="w-px h-6 bg-[var(--border)] hidden sm:block" />

            <span className="text-xs text-[var(--textMuted)] tabular-nums">
              <strong className="text-[var(--text)]">{filtered.length}</strong> 行
            </span>
            <span className="text-xs text-[var(--textMuted)]">
              dev <strong className="text-[var(--text)]">{avg('devScore')}</strong>
            </span>
            <span className="text-xs text-[var(--textMuted)]">
              粘性 <strong className="text-[var(--text)]">{avg('stickinessScore')}</strong>
            </span>

            <span className="hidden sm:block flex-1" />

            <Button onClick={addRow} size="sm">+ 新增</Button>
            <Button variant="outline" size="sm" onClick={doCompare}>对比</Button>
            <Button variant="outline" size="sm" onClick={exportJson}>导出</Button>
            <Button variant="outline" size="sm" onClick={importJson}>导入</Button>
            <Button variant="outline" size="sm" onClick={resetDemo}>重置</Button>
          </div>

          {/* Row 2: pills */}
          <div className="flex items-center gap-1.5">
            <Pill color={storageOk ? 'blue' : 'warm'}>
              {storageOk ? 'localStorage' : '存储失败'}
            </Pill>
            <Pill color="purple">一行 = 一个定位/版本/竞品</Pill>
            <Pill color="warm">DEMO 数据仅作参考</Pill>
          </div>
        </div>

        {/* ---- compare panel ---- */}
        {compareOpen && compareData && (
          <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surfaceHover)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[var(--text)]">
                两行对比：看清"微调到底改了什么"
              </h3>
              <button
                onClick={() => setCompareOpen(false)}
                className="text-xs text-[var(--textMuted)] hover:text-[var(--text)]"
              >
                关闭对比
              </button>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Pill color="blue">{compareData.a.name}</Pill>
              <span className="text-[var(--textMuted)] text-xs">vs</span>
              <Pill color="purple">{compareData.b.name}</Pill>
            </div>
            <div className="grid border border-[var(--border)] rounded-xl overflow-hidden"
              style={{ gridTemplateColumns: '180px 1fr 1fr' }}>
              <div className="bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--textMuted)] border-b border-[var(--border)]">字段</div>
              <div className="bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--text)] border-b border-[var(--border)]">{compareData.a.name}</div>
              <div className="bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--text)] border-b border-[var(--border)]">{compareData.b.name}</div>
              {compareData.fields.map(([key, label]) => {
                const av = String(compareData.a[key] ?? '');
                const bv = String(compareData.b[key] ?? '');
                const changed = av !== bv;
                return (
                  <>
                    <div key={key + '-label'} className="px-3 py-2 text-xs text-[var(--textMuted)] border-b border-[var(--border)]">{label}</div>
                    <div key={key + '-a'} className={`px-3 py-2 text-xs border-b border-[var(--border)] bg-[var(--background)] ${changed ? 'text-[#f59e0b] font-semibold' : 'text-[var(--text)]'}`}>{av}</div>
                    <div key={key + '-b'} className={`px-3 py-2 text-xs border-b border-[var(--border)] bg-[var(--background)] ${changed ? 'text-[#f59e0b] font-semibold' : 'text-[var(--text)]'}`}>{bv}</div>
                  </>
                );
              })}
            </div>
          </div>
        )}

        {/* ---- table ---- */}
        <div className="flex-1 overflow-auto" style={{ background: 'var(--background)' }}>
          <table className="w-full border-separate border-spacing-0 text-xs min-w-[1650px]" style={{ background: 'var(--background)' }}>
            <thead>
              <tr>
                {[
                  '名称 / 定位', '选择', '大分类', '平台', '状态', '核心用户', '场景',
                  '单局', '入门', '深度', '粘性', '玩法组合', '差异点', '商业模式',
                  '开发', '内容', '运营', '竞品', '机会点', '变更影响', '操作',
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`text-left px-2.5 py-2.5 text-[11px] font-semibold text-[var(--textMuted)] border-b border-[var(--border)] bg-[var(--surface)] whitespace-nowrap ${
                      i === 0
                        ? 'sticky left-0 z-20 bg-[var(--surface)] min-w-[170px] max-w-[220px] shadow-[2px_0_4px_rgba(0,0,0,0.06)]'
                        : ''
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={21} className="text-center py-10 text-[var(--textMuted)] bg-[var(--background)]">
                    没有匹配数据。可以清空筛选，或新增一行。
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => { setSelectedId(r.id); setDrawerOpen(true); }}
                    className={`cursor-pointer transition-colors hover:bg-[var(--surfaceHover)] bg-[var(--background)] ${
                      r.id === selectedId ? 'ring-2 ring-inset ring-[var(--primary)] !bg-[var(--primary)]/5' : ''
                    }`}
                  >
                    <td className="sticky left-0 z-[5] bg-[var(--background)] px-2.5 py-2.5 border-b border-[var(--border)] min-w-[170px] max-w-[220px] shadow-[2px_0_4px_rgba(0,0,0,0.04)]">
                      <strong className="block text-sm text-[var(--text)] mb-1">{escapeHtml(r.name)}</strong>
                      <small className="block text-[11px] text-[var(--textMuted)] leading-tight">{escapeHtml(r.oneLine)}</small>
                    </td>
                    <td className="px-2.5 py-2.5 border-b border-[var(--border)]" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={checkedIds.has(r.id)}
                        onChange={() => toggleCheck(r.id)}
                        className="rounded accent-[var(--primary)]"
                      />
                    </td>
                    <td className="px-2.5 py-2.5 border-b border-[var(--border)]"><Pill color="blue">{escapeHtml(r.category)}</Pill></td>
                    <td className="px-2.5 py-2.5 border-b border-[var(--border)] text-[var(--textMuted)]">{escapeHtml(short(r.platform, 34))}</td>
                    <td className="px-2.5 py-2.5 border-b border-[var(--border)]"><Pill color="purple">{escapeHtml(r.status)}</Pill></td>
                    <td className="px-2.5 py-2.5 border-b border-[var(--border)] text-[var(--textMuted)]">{escapeHtml(short(r.audience, 62))}</td>
                    <td className="px-2.5 py-2.5 border-b border-[var(--border)] text-[var(--text)]">{escapeHtml(r.scenario)}</td>
                    <td className="px-2.5 py-2.5 border-b border-[var(--border)] text-[var(--text)]">{escapeHtml(r.sessionLength)}</td>
                    <td className="px-2.5 py-2.5 border-b border-[var(--border)]"><ScoreBar value={r.entryScore} /></td>
                    <td className="px-2.5 py-2.5 border-b border-[var(--border)]"><ScoreBar value={r.depthScore} /></td>
                    <td className="px-2.5 py-2.5 border-b border-[var(--border)]"><ScoreBar value={r.stickinessScore} /></td>
                    <td className="px-2.5 py-2.5 border-b border-[var(--border)] text-[var(--text)]">{escapeHtml(String(r.playComboCount))}</td>
                    <td className="px-2.5 py-2.5 border-b border-[var(--border)] text-[var(--textMuted)]">{escapeHtml(short(r.diffDetail, 70))}</td>
                    <td className="px-2.5 py-2.5 border-b border-[var(--border)] text-[var(--text)]">{escapeHtml(r.monetization)}</td>
                    <td className="px-2.5 py-2.5 border-b border-[var(--border)]"><ScoreBar value={r.devScore} /></td>
                    <td className="px-2.5 py-2.5 border-b border-[var(--border)]"><ScoreBar value={r.contentScore} /></td>
                    <td className="px-2.5 py-2.5 border-b border-[var(--border)]"><ScoreBar value={r.opsScore} /></td>
                    <td className="px-2.5 py-2.5 border-b border-[var(--border)] text-[var(--textMuted)]">{escapeHtml(short(r.directCompetitors, 56))}</td>
                    <td className="px-2.5 py-2.5 border-b border-[var(--border)] text-[var(--textMuted)]">{escapeHtml(short(r.marketChance, 70))}</td>
                    <td className="px-2.5 py-2.5 border-b border-[var(--border)] text-[var(--textMuted)]">{escapeHtml(short(r.changeImpact, 70))}</td>
                    <td className="px-2.5 py-2.5 border-b border-[var(--border)]" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <button
                          className="text-[11px] px-2 py-1 rounded-lg border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surfaceHover)] transition-colors"
                          onClick={() => { setSelectedId(r.id); setDrawerOpen(true); }}
                        >
                          编辑
                        </button>
                        <button
                          className="text-[11px] px-2 py-1 rounded-lg border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surfaceHover)] transition-colors"
                          onClick={() => cloneRow(r.id)}
                        >
                          复制
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ---- drawer overlay ---- */}
        {drawerOpen && (
          <div className="fixed inset-0 z-40 flex justify-end" onClick={() => { setDrawerOpen(false); setSelectedId(null); }}>
            <div className="absolute inset-0 bg-black/30" />
            <div
              className="relative w-full max-w-[760px] h-full bg-[var(--surface)] border-l border-[var(--border)] shadow-2xl flex flex-col animate-slide-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                <h2 className="text-base font-semibold text-[var(--text)]">
                  编辑：{selectedRow?.name}
                </h2>
                <div className="flex items-center gap-1.5">
                  <Button size="sm" variant="outline" onClick={() => selectedId && cloneRow(selectedId)}>
                    复制为新版本
                  </Button>
                  <Button size="sm" variant="outline" onClick={deleteRow}>
                    删除
                  </Button>
                  <button
                    className="text-[var(--textMuted)] hover:text-[var(--text)] p-1"
                    onClick={() => { setDrawerOpen(false); setSelectedId(null); }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto px-4 py-4">
                {selectedRow && (
                  <form id="editForm" onSubmit={saveForm}>
                    <div className="mb-3">
                      <label className="block text-[11px] text-[var(--textMuted)] mb-1">ID</label>
                      <input
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 py-2 text-sm text-[var(--textMuted)]"
                        value={selectedRow.id}
                        disabled
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {FIELD_CONFIG.map(([key, label, type, wide]) => {
                        const value = selectedRow[key] ?? '';
                        const wideClass = wide ? 'col-span-2' : '';
                        const enumCfg = getEnumCfg(key);

                        if (type === 'textarea') {
                          return (
                            <div key={key} className={`mb-1 ${wideClass}`}>
                              <label className="block text-[11px] text-[var(--textMuted)] mb-1">{label}</label>
                              <textarea
                                name={key}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 resize-y min-h-[80px]"
                                defaultValue={value}
                                placeholder={PLACEHOLDER_MAP[key] || ''}
                              />
                            </div>
                          );
                        }
                        if (type === 'number') {
                          return (
                            <div key={key} className={`mb-1 ${wideClass}`}>
                              <label className="block text-[11px] text-[var(--textMuted)] mb-1">{label}</label>
                              <input
                                type="number"
                                min="0"
                                max="5"
                                step="0.5"
                                name={key}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                                defaultValue={value}
                                placeholder={PLACEHOLDER_MAP[key] || ''}
                              />
                            </div>
                          );
                        }
                        // multi-select with checkboxes
                        if (enumCfg && enumCfg.multi) {
                          const selected = value ? value.split(SEPARATOR).map(s => s.trim()).filter(Boolean) : [];
                          const isAdding = addingEnum && addingEnum.key === key;
                          return (
                            <fieldset key={key} className={`mb-1 ${wideClass} border border-[var(--border)] rounded-lg p-2.5`}>
                              <div className="flex items-center gap-2 mb-1.5">
                                <legend className="text-[11px] text-[var(--textMuted)] px-1">{label}</legend>
                                {isAdding ? (
                                  <span className="flex items-center gap-1">
                                    <input
                                      className="w-24 h-5 bg-[var(--background)] border border-[var(--border)] rounded px-1.5 text-[11px] outline-none focus:border-[var(--primary)]"
                                      placeholder="新选项"
                                      defaultValue={addingEnum.value || ''}
                                      autoFocus
                                      id={`add_enum_input_${key}`}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') addEnumOption(key, e.target.value);
                                        if (e.key === 'Escape') setAddingEnum(null);
                                      }}
                                    />
                                    <button type="button" className="text-[11px] text-[var(--primary)] hover:underline"
                                      onClick={() => addEnumOption(key, document.getElementById(`add_enum_input_${key}`)?.value || '')}>确认</button>
                                    <button type="button" className="text-[11px] text-[var(--textMuted)] hover:text-[var(--text)]"
                                      onClick={() => setAddingEnum(null)}>取消</button>
                                  </span>
                                ) : (
                                  <button type="button" className="text-[11px] text-[var(--primary)] hover:underline"
                                    onClick={() => setAddingEnum({ key, value: '' })}>+ 新增</button>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 max-h-[120px] overflow-y-auto">
                                {enumCfg.options.map(opt => (
                                  <label key={opt} className="flex items-center gap-1 text-xs text-[var(--text)] cursor-pointer whitespace-nowrap">
                                    <input
                                      type="checkbox"
                                      name={`${key}_opt_${opt}`}
                                      defaultChecked={selected.includes(opt)}
                                      className="rounded accent-[var(--primary)]"
                                      value={opt}
                                    />
                                    {opt}
                                  </label>
                                ))}
                              </div>
                            </fieldset>
                          );
                        }
                        // single select
                        if (enumCfg && !enumCfg.multi) {
                          const isAdding = addingEnum && addingEnum.key === key;
                          return (
                            <div key={key} className={`mb-1 ${wideClass}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <label className="text-[11px] text-[var(--textMuted)]">{label}</label>
                                {isAdding ? (
                                  <span className="flex items-center gap-1">
                                    <input
                                      className="w-24 h-5 bg-[var(--background)] border border-[var(--border)] rounded px-1.5 text-[11px] outline-none focus:border-[var(--primary)]"
                                      placeholder="新选项"
                                      autoFocus
                                      id={`add_enum_input_${key}`}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') addEnumOption(key, e.target.value);
                                        if (e.key === 'Escape') setAddingEnum(null);
                                      }}
                                    />
                                    <button type="button" className="text-[11px] text-[var(--primary)] hover:underline"
                                      onClick={() => addEnumOption(key, document.getElementById(`add_enum_input_${key}`)?.value || '')}>确认</button>
                                    <button type="button" className="text-[11px] text-[var(--textMuted)] hover:text-[var(--text)]"
                                      onClick={() => setAddingEnum(null)}>取消</button>
                                  </span>
                                ) : (
                                  <button type="button" className="text-[11px] text-[var(--primary)] hover:underline"
                                    onClick={() => setAddingEnum({ key, value: '' })}>+ 新增</button>
                                )}
                              </div>
                              <select
                                name={key}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                                defaultValue={value}
                              >
                                <option value="">-- {label} --</option>
                                {enumCfg.options.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>
                          );
                        }
                        // default text input
                        return (
                          <div key={key} className={`mb-1 ${wideClass}`}>
                            <label className="block text-[11px] text-[var(--textMuted)] mb-1">{label}</label>
                            <input
                              name={key}
                              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
                              defaultValue={value}
                              placeholder={PLACEHOLDER_MAP[key] || ''}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button type="submit" onClick={(e) => { e.preventDefault(); saveForm(e); }}>
                        保存
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ---- JSON modal ---- */}
        {jsonOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-5" onClick={() => setJsonOpen(false)}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div
              className="relative w-full max-w-[980px] max-h-[90vh] flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                <h2 className="text-base font-semibold text-[var(--text)]">
                  {jsonMode === 'export' ? '导出 JSON' : '导入 JSON'}
                </h2>
                <button
                  className="text-[var(--textMuted)] hover:text-[var(--text)] p-1"
                  onClick={() => setJsonOpen(false)}
                >
                  ✕
                </button>
              </div>
              <textarea
                className="flex-1 min-h-[55vh] bg-[var(--background)] border-0 outline-none p-4 font-mono text-xs text-[var(--text)] resize-none"
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                readOnly={jsonMode === 'export'}
                placeholder={jsonMode === 'import' ? '粘贴 JSON 数组...' : ''}
              />
              <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[var(--border)]">
                {jsonMode === 'export' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(jsonText);
                    }}
                  >
                    复制
                  </Button>
                ) : (
                  <Button size="sm" onClick={applyImport}>
                    应用导入
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ---- scoring rubric hint ---- */}
        <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--surface)]">
          <details className="text-xs text-[var(--textMuted)]">
            <summary className="cursor-pointer font-semibold text-[var(--text)] mb-1">评分口径</summary>
            <ul className="space-y-0.5 mt-1 pl-4 list-disc">
              <li>入门门槛：1 打开即懂，5 需要学习成本。</li>
              <li>深度上限：1 很快玩腻，5 高手可长期研究。</li>
              <li>粘性：1 偶尔玩，5 每日/社交/成长驱动强。</li>
              <li>开发难度：1 很轻，5 多系统/多平台/强运营。</li>
            </ul>
          </details>
        </div>
      </div>
    </>
  );
}
