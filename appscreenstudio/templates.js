// 模板定义：背景、装饰、配色、设备边框、默认布局、字体
// layout: top 文字在上/设备底部溢出, bottom 文字在下/设备顶部溢出, tilt 倾斜设备, full 完整设备
const FP = typeof I18N_FONT === 'string' ? I18N_FONT : '';
const FALLBACK_CJK = '"Hiragino Sans","Apple SD Gothic Neo","Thonburi","Malgun Gothic","Leelawadee UI","Noto Sans CJK SC"';
const FONTS = {
  sans: FP + '"PingFang SC","Microsoft YaHei","Noto Sans SC",' + FALLBACK_CJK + ',Helvetica,Arial,sans-serif',
  serif: FP + '"Songti SC","Noto Serif SC","Source Han Serif SC","Hiragino Mincho ProN","AppleMyungjo","Georgia",serif',
  cond: FP + '"Impact","Haettenschweiler","Arial Narrow Bold","PingFang SC","Microsoft YaHei",' + FALLBACK_CJK + ',sans-serif',
  hand: '"Bradley Hand","Segoe Script","Marker Felt","Comic Sans MS",cursive',
  round: FP + '"Yuanti SC","PingFang SC","Arial Rounded MT Bold","Microsoft YaHei",' + FALLBACK_CJK + ',sans-serif',
};

const TEMPLATES = [
  { id: 'aurora', name: '极光', tags: ['渐变', '科技'], angle: 155, stops: ['#6a5cff', '#22d3ee'],
    deco: 'blobs', decoColor: 'rgba(255,255,255,.14)', title: '#ffffff', sub: 'rgba(255,255,255,.82)',
    frame: '#0f1020', accent: '#6a5cff', layout: 'top', font: 'sans', align: 'center' },
  { id: 'sunset', name: '日落', tags: ['渐变', '活泼'], angle: 160, stops: ['#ff7a59', '#ffb347'],
    deco: 'rings', decoColor: 'rgba(255,255,255,.22)', title: '#ffffff', sub: 'rgba(255,255,255,.88)',
    frame: '#2b1710', accent: '#ff7a59', layout: 'tilt', font: 'round', align: 'left' },
  { id: 'ocean', name: '深海', tags: ['渐变', '深色'], angle: 170, stops: ['#0b3a6f', '#0f8ea8'],
    deco: 'rings', decoColor: 'rgba(255,255,255,.1)', title: '#ffffff', sub: 'rgba(214,244,255,.85)',
    frame: '#06182c', accent: '#0f8ea8', layout: 'bottom', font: 'sans', align: 'center' },
  { id: 'mint', name: '薄荷', tags: ['清新', '浅色'], angle: 150, stops: ['#d9fbe9', '#aee9ff'],
    deco: 'dots', decoColor: 'rgba(16,120,100,.16)', title: '#0b4a3e', sub: 'rgba(11,74,62,.72)',
    frame: '#10332c', accent: '#14b88c', layout: 'top', font: 'round', align: 'center' },
  { id: 'midnight', name: '午夜', tags: ['深色', '科技'], angle: 180, stops: ['#0a0b14', '#1d1f3a'],
    deco: 'glow', decoColor: 'rgba(124,92,255,.55)', title: '#ffffff', sub: 'rgba(255,255,255,.66)',
    frame: '#2a2c46', accent: '#7c5cff', layout: 'full', font: 'sans', align: 'center' },
  { id: 'candy', name: '糖果', tags: ['活泼', '渐变'], angle: 140, stops: ['#ff8ad8', '#8a7bff'],
    deco: 'blobs', decoColor: 'rgba(255,255,255,.2)', title: '#ffffff', sub: 'rgba(255,255,255,.88)',
    frame: '#2a1148', accent: '#ff5fc4', layout: 'tilt', font: 'round', align: 'center' },
  { id: 'mono', name: '极简黑白', tags: ['简约', '浅色'], angle: 180, stops: ['#f6f6f4', '#e9e9e5'],
    deco: 'none', decoColor: 'rgba(0,0,0,.06)', title: '#111111', sub: 'rgba(0,0,0,.55)',
    frame: '#111111', accent: '#111111', layout: 'top', font: 'sans', align: 'left' },
  { id: 'sand', name: '沙丘', tags: ['简约', '浅色'], angle: 165, stops: ['#f7e7d0', '#efc9a0'],
    deco: 'stripes', decoColor: 'rgba(120,70,20,.08)', title: '#4a2a10', sub: 'rgba(74,42,16,.7)',
    frame: '#3a2210', accent: '#d9822b', layout: 'bottom', font: 'serif', align: 'left' },
  { id: 'neon', name: '霓虹', tags: ['深色', '活泼'], angle: 200, stops: ['#12001f', '#3b0a5c'],
    deco: 'glow', decoColor: 'rgba(255,45,170,.5)', title: '#ffe94d', sub: 'rgba(255,255,255,.8)',
    frame: '#ff2daa', accent: '#ff2daa', layout: 'tilt', font: 'round', align: 'center' },
  { id: 'forest', name: '森林', tags: ['清新', '深色'], angle: 165, stops: ['#0f3d2e', '#2f7d4f'],
    deco: 'blobs', decoColor: 'rgba(200,255,200,.1)', title: '#f1ffe9', sub: 'rgba(241,255,233,.75)',
    frame: '#0a2219', accent: '#2f7d4f', layout: 'top', font: 'serif', align: 'center' },
  { id: 'royal', name: '皇家蓝', tags: ['商务', '渐变'], angle: 160, stops: ['#1f3fff', '#5b8bff'],
    deco: 'stripes', decoColor: 'rgba(255,255,255,.08)', title: '#ffffff', sub: 'rgba(255,255,255,.8)',
    frame: '#0b1a66', accent: '#1f3fff', layout: 'full', font: 'sans', align: 'left' },
  { id: 'peach', name: '蜜桃', tags: ['清新', '浅色'], angle: 150, stops: ['#ffe3e0', '#ffc2b8'],
    deco: 'dots', decoColor: 'rgba(255,90,90,.16)', title: '#7a1f2b', sub: 'rgba(122,31,43,.7)',
    frame: '#5a1520', accent: '#ff6b6b', layout: 'bottom', font: 'round', align: 'center' },
];

// Google Play 常用尺寸（devAspect 为设备高/宽）
const SIZES = [
  { id: 'phone', name: '手机 1080×1920', w: 1080, h: 1920, devAspect: 2.08, devW: 0.76 },
  { id: 'tab7', name: '7 英寸平板 1200×1920', w: 1200, h: 1920, devAspect: 1.55, devW: 0.82 },
  { id: 'tab10', name: '10 英寸平板 1600×2560', w: 1600, h: 2560, devAspect: 1.45, devW: 0.84 },
  { id: 'feature', name: '特色图片 1024×500', w: 1024, h: 500, devAspect: 2.08, devW: 0.3 },
];

const SAMPLE_SLIDES = [
  { title: '一键搞定\n所有日常事务', sub: '简洁高效，轻松上手' },
  { title: '智能提醒\n不再错过重要时刻', sub: '按你的节奏安排每一天' },
  { title: '数据同步\n多设备无缝切换', sub: '云端备份，安全可靠' },
  { title: '个性主题\n打造专属界面', sub: '多种配色，随心切换' },
  { title: '现在就下载\n开启全新体验', sub: '免费使用，无需注册' },
];
