
import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

// Final, curated list of Lordicons for the entire platform
const LORDICON_ICONS = {
  home: 'https://cdn.lordicon.com/wmwqvixz.json',
  compass: 'https://cdn.lordicon.com/pkmkagbw.json',
  search: 'https://cdn.lordicon.com/xfftupfv.json',
  menu: 'https://cdn.lordicon.com/msoeawqm.json',
  close: 'https://cdn.lordicon.com/nqtddedc.json',
  settings: 'https://cdn.lordicon.com/hursldrn.json',
  music: 'https://cdn.lordicon.com/wxnxiano.json',
  play: 'https://cdn.lordicon.com/akqsdstj.json',
  pause: 'https://cdn.lordicon.com/jNoLpGqi.json',
  headphones: 'https://cdn.lordicon.com/fkdzjznm.json',
  disc: 'https://cdn.lordicon.com/anpazikj.json',
  heart: 'https://cdn.lordicon.com/xyboiuok.json',
  users: 'https://cdn.lordicon.com/dxjqoygy.json',
  message: 'https://cdn.lordicon.com/fdxqrdfe.json',
  bell: 'https://cdn.lordicon.com/lznlxwtc.json',
  share: 'https://cdn.lordicon.com/udkacfhe.json',
  plus: 'https://cdn.lordicon.com/zrkkrrpl.json',
  edit: 'https://cdn.lordicon.com/wuvorxbv.json',
  trash: 'https://cdn.lordicon.com/wpyrrmcq.json',
  upload: 'https://cdn.lordicon.com/nxaaasqe.json',
  download: 'https://cdn.lordicon.com/qhviklyi.json',
  copy: 'https://cdn.lordicon.com/depeqmsz.json',
  check: 'https://cdn.lordicon.com/oqdmuxru.json',
  star: 'https://cdn.lordicon.com/zyzoecaw.json',
  loading: 'https://cdn.lordicon.com/xjovhxra.json',
  warning: 'https://cdn.lordicon.com/keaiyjcx.json',
  info: 'https://cdn.lordicon.com/nocovwne.json',
  chart: 'https://cdn.lordicon.com/qhgmphtg.json',
  trending: 'https://cdn.lordicon.com/gqzfzudq.json',
  activity: 'https://cdn.lordicon.com/pkmkagbw.json',
  eye: 'https://cdn.lordicon.com/vfczflna.json',
  arrowUp: 'https://cdn.lordicon.com/iifryyua.json',
  arrowDown: 'https://cdn.lordicon.com/rmjnvgsm.json',
  chevronLeft: 'https://cdn.lordicon.com/zmkotitn.json',
  chevronRight: 'https://cdn.lordicon.com/sbiheqdr.json',
  camera: 'https://cdn.lordicon.com/nkmsrxys.json',
  image: 'https://cdn.lordicon.com/tdrtiskw.json',
  calendar: 'https://cdn.lordicon.com/wmlleaaf.json',
  clock: 'https://cdn.lordicon.com/unukghxb.json',
  globe: 'https://cdn.lordicon.com/rgyftmhc.json',
  file: 'https://cdn.lordicon.com/uutnffgq.json',
  userPlus: 'https://cdn.lordicon.com/kthelypq.json',
  userCheck: 'https://cdn.lordicon.com/kthelypq.json',
  logout: 'https://cdn.lordicon.com/vduvxizq.json',
  shield: 'https://cdn.lordicon.com/kddyhlti.json',
  lightning: 'https://cdn.lordicon.com/kiynvdns.json',
  target: 'https://cdn.lordicon.com/bgebyztw.json',
  video: 'https://cdn.lordicon.com/mqdkoput.json',
  send: 'https://cdn.lordicon.com/whtfgdfm.json',
  flag: 'https://cdn.lordicon.com/xynjytpr.json',
  more: 'https://cdn.lordicon.com/rvuqcvqy.json',
  collaborate: 'https://cdn.lordicon.com/dxjqoygy.json',
  promote: 'https://cdn.lordicon.com/soseozvi.json',
  distribute: 'https://cdn.lordicon.com/rgyftmhc.json',
  analytics: 'https://cdn.lordicon.com/qhgmphtg.json',
  copyright: 'https://cdn.lordicon.com/wloilxuq.json',
  save: 'https://cdn.lordicon.com/oqdmuxru.json',
};

const LottieIcon = forwardRef(({ 
  type, 
  className, 
  size = 24, 
  trigger = 'hover',
  colors: colorOverride,
  ...props 
}, ref) => {
  const src = LORDICON_ICONS[type];

  if (!src) {
    console.warn(`Lordicon type "${type}" not found, using fallback.`);
    return <Star ref={ref} className={cn("text-yellow-400", className)} style={{ width: size, height: size }} {...props} />;
  }

  // Define color schemes based on icon type
  let colors;
  if (colorOverride) {
    colors = colorOverride;
  } else {
    switch (type) {
      case 'trash':
      case 'logout':
        colors = 'primary:#e83a3a,secondary:#c71f1f';
        break;
      case 'check':
      case 'save':
        colors = 'primary:#16a34a,secondary:#34d399';
        break;
      case 'warning':
        colors = 'primary:#f97316,secondary:#fb923c';
        break;
      default:
        colors = 'primary:#6366f1,secondary:#a5b4fc';
    }
  }

  return (
    <div
      ref={ref}
      className={cn("inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <lord-icon
        src={src}
        trigger={trigger}
        colors={colors}
        style={{ width: size, height: size }}
      >
      </lord-icon>
    </div>
  );
});

export default LottieIcon;
