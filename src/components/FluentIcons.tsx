import React from 'react';
import { useSettings, SearchIconTreatment } from '../hooks/useSettings';

export const SPARKLE_SEARCH_ICON_URL = 'https://static.wikia.nocookie.net/ep-deo/images/6/6c/Search_sparkle.png/revision/latest/scale-to-width-down/1000?cb=20261015133722';
export const GLOBE_SEARCH_ICON_URL = 'https://static.wikia.nocookie.net/ftv/images/5/5b/Ic_fluent_globe_search_24_regular.png/revision/latest?cb=20260508150432&path-prefix=vi';

export const MAIL_TAB_ICON_URL = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-w08Tu7AUdI6LLJeWquYKJiNuuzCnVN.png';
export const CALENDAR_TAB_ICON_URL = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-EOTmadFpTcD8ViTHEiYhPMCbFvwgFn.png';

export const APP_TAB_ICON_URLS = {
  mail: MAIL_TAB_ICON_URL,
  calendar: CALENDAR_TAB_ICON_URL,
  home: 'https://www.elevenforum.com/data/attachments/30/30188-c9f25938bd40f9c2e3af267cc96b3e28.jpg?hash=yfJZOL1A-c',
  taskManager: 'https://winaero.com/blog/wp-content/uploads/2021/05/taskmgr-task-manager-fluent-modern-icon.png',
  bank: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/icons8-dollar-bag-96-VS47W4Ne5wDfcYmkNYfhA4QnNrQtXK.png',
  social: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/icons8-google-chat-96-ciTkuoafHNKIjmnY0bljKs26z9mreM.png',
  articles: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1cDnOYLe4OqU4bObf5RNScKEBnWTYu.png',
  updates: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/icons8-windows-update-96-4mcypPrTOJSBRugr5X89FWjNiQtrEx.png',
  widgets: 'https://www.elevenforum.com/data/attachments/151/151773-6032f62cef01cd41415c88a760f59b31.jpg?hash=MN8WMBUfR7',
  people: 'https://static.wikia.nocookie.net/logopedia/images/0/05/People.png/revision/latest/scale-to-width-down/200?cb=20200711202510',
  edge: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Microsoft_Edge_logo_%282019%29.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original',
  fileExplorer: 'https://static.wikia.nocookie.net/logopedia/images/5/51/File_Explorer.png/revision/latest?cb=20210615232646',
  watch: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e3/Microsoft_Clipchamp_%282025%E2%80%93present%29.svg/1280px-Microsoft_Clipchamp_%282025%E2%80%93present%29.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail',
  notes: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/post-it-paper-sticky-notes-22390_256-Ck6XAzV1mJhbLfqUSd5fxMeOSMhq0B.png',
  gallery: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/icons8-photo-gallery-96-4tJhaieXrtShrMFtc7m5dgGWBP98BO.png',
  camera: 'https://static.wikia.nocookie.net/logopedia/images/3/38/Camera_Win10X.svg/revision/latest/scale-to-width-down/200?cb=20221230185750',
  paint: 'https://winaero.com/blog/wp-content/uploads/2020/04/colorful-fluent-Paint-3D-icon-big.png',
  inkCanvas: 'https://store-images.s-microsoft.com/image/apps.35459.13942044577806852.30d26a11-3c35-4481-a6ad-4a6d8171eea3.33745dc3-f2ab-4774-a56a-f539701253bd?h=210',
  calculator: 'https://static.wikia.nocookie.net/logopedia/images/5/54/Calculator_9.svg/revision/latest/scale-to-width-down/150?cb=20200623110053',
  snippingTool: 'data:image/gif;base64,R0lGODlhAQABAIABAAAAAP///yH5BAEAAAEALAAAAAABAAEAQAICTAEAOw%3D%3D',
  feedback: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Windows_Feedback_Hub_Icon.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original',
  settings: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Windows_Settings_icon.svg/3840px-Windows_Settings_icon.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail',
} as const;

export type AppTabIconName = keyof typeof APP_TAB_ICON_URLS;

export const AppTabIcon: React.FC<{ name: AppTabIconName; className?: string; alt?: string }> = ({ name, className = 'size-5', alt = '' }) => (
  <img
    src={APP_TAB_ICON_URLS[name]}
    alt={alt}
    aria-hidden={alt ? undefined : true}
    referrerPolicy="no-referrer"
    className={`shrink-0 object-contain ${className}`}
  />
);

export const FLUENT_ICON_URLS = {
  home: 'https://raw.githubusercontent.com/microsoft/fluentui-system-icons/main/assets/Home/SVG/ic_fluent_home_48_regular.svg',
  watch: 'https://raw.githubusercontent.com/microsoft/fluentui-system-icons/refs/heads/main/assets/Movies%20and%20TV/SVG/ic_fluent_movies_and_tv_24_regular.svg',
  liveTv: 'https://raw.githubusercontent.com/microsoft/fluentui-system-icons/refs/heads/main/assets/Movies%20and%20TV/SVG/ic_fluent_movies_and_tv_24_regular.svg',
  news: 'https://raw.githubusercontent.com/microsoft/fluentui-system-icons/refs/heads/main/assets/New/SVG/ic_fluent_new_24_regular.svg',
  articles: 'https://raw.githubusercontent.com/microsoft/fluentui-system-icons/refs/heads/main/assets/New/SVG/ic_fluent_new_24_regular.svg',
  notes: 'https://raw.githubusercontent.com/microsoft/fluentui-system-icons/refs/heads/main/assets/Document%20Edit/SVG/ic_fluent_document_edit_24_regular.svg',
  settings: 'https://raw.githubusercontent.com/microsoft/fluentui-system-icons/refs/heads/main/assets/Settings/SVG/ic_fluent_settings_48_regular.svg',
  user: 'https://raw.githubusercontent.com/microsoft/fluentui-system-icons/refs/heads/main/assets/Person/SVG/ic_fluent_person_48_regular.svg',
  personDelete: 'https://raw.githubusercontent.com/microsoft/fluentui-system-icons/refs/heads/main/assets/Person%20Delete/SVG/ic_fluent_person_delete_24_regular.svg',
  search: 'https://raw.githubusercontent.com/microsoft/fluentui-system-icons/refs/heads/main/assets/Search/SVG/ic_fluent_search_48_regular.svg'
};

export const FluentHomeIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M21.6062 5.85517C23.0048 4.71494 24.9952 4.71494 26.3938 5.85517L39.5688 16.5966C40.4736 17.3342 41 18.4492 41 19.628V39.1134C41 41.2599 39.2875 43 37.175 43H31.825C29.7125 43 28 41.2599 28 39.1134V29.8866C28 29.1711 27.4292 28.5911 26.725 28.5911H21.275C20.5708 28.5911 20 29.1711 20 29.8866V39.1134C20 41.2599 18.2875 43 16.175 43H10.825C8.71251 43 7 41.2599 7 39.1134V19.628C7 18.4493 7.52645 17.3342 8.43124 16.5966L21.6062 5.85517ZM24.7979 7.87612C24.3317 7.49604 23.6683 7.49604 23.2021 7.87612L10.0271 18.6175C9.72548 18.8634 9.55 19.2351 9.55 19.628V39.1134C9.55 39.8289 10.1208 40.4089 10.825 40.4089H16.175C16.8792 40.4089 17.45 39.8289 17.45 39.1134V29.8866C17.45 27.7401 19.1625 26 21.275 26H26.725C28.8375 26 30.55 27.7401 30.55 29.8866V39.1134C30.55 39.8289 31.1208 40.4089 31.825 40.4089H37.175C37.8792 40.4089 38.45 39.8289 38.45 39.1134V19.628C38.45 19.2351 38.2745 18.8634 37.9729 18.6175L24.7979 7.87612Z" fill="currentColor"/>
  </svg>
);

export const FluentWatchIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M19.7289 3.91704L19.7799 4.07669L20.3312 5.99921C20.4359 6.3642 20.2512 6.74361 19.9129 6.89226L19.817 6.92689L9.09009 10.002L20.2492 10.0029C20.6289 10.0029 20.9426 10.2851 20.9923 10.6512L20.9992 10.7529V19.2509C20.9992 20.7135 19.8575 21.9093 18.4167 21.9959L18.2492 22.0009H5.7503C4.28777 22.0009 3.0919 20.8592 3.00532 19.4185L3.0003 19.2509L3.00009 10.859L2.47833 9.03785C2.07521 7.63197 2.84305 6.16773 4.20415 5.68738L4.3638 5.63638L16.3785 2.19122C17.7844 1.7881 19.2486 2.55595 19.7289 3.91704ZM19.4983 11.502H4.5003V19.2509C4.5003 19.855 4.92878 20.359 5.49838 20.4755L5.62249 20.4945L5.7503 20.5009H18.2492C18.8964 20.5009 19.4287 20.0091 19.4927 19.3787L19.4992 19.2509L19.4983 11.502ZM6.27298 6.64938L4.77726 7.07827C4.15512 7.25666 3.77896 7.87622 3.89116 8.49977L3.92018 8.6244L4.26452 9.82525L4.5596 9.74039L6.27298 6.64938ZM11.0293 5.28552L8.31182 6.06475L6.59844 9.15576L9.31593 8.37653L11.0293 5.28552ZM15.7866 3.92139L13.0691 4.70062L11.3557 7.79163L14.0723 7.01268L15.7866 3.92139ZM17.6338 3.68784L16.113 6.4275L18.6815 5.69124L18.3381 4.49015C18.2309 4.11643 17.9645 3.83149 17.6338 3.68784Z" fill="currentColor"/>
  </svg>
);

export const FluentLiveTvIcon = FluentWatchIcon;

export const FluentArticlesIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M18.25 4C18.6642 4 19 4.33579 19 4.75V13.25C19 13.6642 18.6642 14 18.25 14C17.8358 14 17.5 13.6642 17.5 13.25V4.75C17.5 4.33579 17.8358 4 18.25 4ZM4 18.25C4 17.8358 4.33579 17.5 4.75 17.5H13.25C13.6642 17.5 14 17.8358 14 18.25C14 18.6642 13.6642 19 13.25 19H4.75C4.33579 19 4 18.6642 4 18.25ZM8.28033 7.21967C7.98744 6.92678 7.51256 6.92678 7.21967 7.21967C6.92678 7.51256 6.92678 7.98744 7.21967 8.28033L13.7197 14.7803C14.0126 15.0732 14.4874 15.0732 14.7803 14.7803C15.0732 14.4874 15.0732 14.0126 14.7803 13.7197L8.28033 7.21967Z" fill="currentColor"/>
  </svg>
);

export const FluentNewsIcon = FluentArticlesIcon;

export const FluentNotesIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-4 h-4', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M6.25 3.5C5.83579 3.5 5.5 3.83579 5.5 4.25V19.75C5.5 20.1642 5.83579 20.5 6.25 20.5H10.0293C9.92216 21.0483 10.0375 21.5732 10.3007 22H6.25C5.00736 22 4 20.9926 4 19.75V4.25C4 3.00736 5.00736 2 6.25 2H12.3358C12.7999 2 13.245 2.18437 13.5732 2.51256L19.4874 8.42678C19.8156 8.75497 20 9.20009 20 9.66421V10H14C12.8954 10 12 9.10457 12 8V3.5H6.25ZM13.5 4.56066V8C13.5 8.27614 13.7239 8.5 14 8.5H17.4393L13.5 4.56066ZM19.7133 11H19.7154C20.3 11.0003 20.8845 11.2234 21.3305 11.6695C22.2231 12.5621 22.2231 14.0093 21.3305 14.9019L15.4281 20.8043C15.084 21.1485 14.6528 21.3926 14.1806 21.5106L12.3499 21.9683C11.5538 22.1674 10.8326 21.4462 11.0317 20.6501L11.4894 18.8194C11.6074 18.3472 11.8515 17.916 12.1957 17.5719L18.0981 11.6695C18.5441 11.2234 19.1287 11.0003 19.7133 11Z" fill="currentColor"/>
  </svg>
);

export const FluentUserIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-4 h-4', style }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M24 4C18.4772 4 14 8.47715 14 14C14 19.5228 18.4772 24 24 24C29.5228 24 34 19.5228 34 14C34 8.47715 29.5228 4 24 4ZM16.5 14C16.5 9.85786 19.8579 6.5 24 6.5C28.1421 6.5 31.5 9.85786 31.5 14C31.5 18.1421 28.1421 21.5 24 21.5C19.8579 21.5 16.5 18.1421 16.5 14ZM12.2499 28C9.90326 28 8.00002 29.9013 8 32.2489L8 33C8 36.7555 9.94167 39.5669 12.9202 41.3802C15.8491 43.1633 19.7861 44 24 44C28.2139 44 32.1509 43.1633 35.0798 41.3802C38.0583 39.5669 40 36.7555 40 33L40 32.2487C40 29.9011 38.0967 28 35.7502 28H12.2499ZM10.5 32.2489C10.5 31.283 11.283 30.5 12.2499 30.5H35.7502C36.7171 30.5 37.5 31.2829 37.5 32.2488L37.5 33C37.5 35.7444 36.1398 37.8081 33.7798 39.2448C31.3703 40.7117 27.9323 41.5 24 41.5C20.0677 41.5 16.6297 40.7117 14.2202 39.2448C11.8602 37.8081 10.5 35.7444 10.5 33L10.5 32.2489Z" fill="currentColor"/>
  </svg>
);

export const FluentPersonDeleteIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-4 h-4', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M17.5004 12.0003C20.5379 12.0003 23.0004 14.4627 23.0004 17.5003C23.0004 20.5378 20.5379 23.0003 17.5004 23.0003C14.4628 23.0003 12.0004 20.5378 12.0004 17.5003C12.0004 14.4627 14.4628 12.0003 17.5004 12.0003ZM12.0226 13.9996C11.7259 14.4629 11.4864 14.9663 11.314 15.4999L4.25391 15.5002C3.83969 15.5002 3.50391 15.836 3.50391 16.2502V17.1575C3.50391 17.8132 3.7899 18.4362 4.28707 18.8636C5.54516 19.9453 7.44117 20.5013 10.0004 20.5013C10.5992 20.5013 11.1618 20.4709 11.6885 20.4104C11.9374 20.9105 12.2512 21.3743 12.6175 21.7908C11.8153 21.9315 10.9423 22.0013 10.0004 22.0013C7.11087 22.0013 4.87205 21.3447 3.30918 20.001C2.48056 19.2887 2.00391 18.2503 2.00391 17.1575V16.2502C2.00391 15.0075 3.01127 14.0002 4.25391 14.0002L12.0226 13.9996ZM15.0934 14.9665L15.0242 15.0244L14.9663 15.0936C14.8482 15.2642 14.8482 15.4917 14.9663 15.6623L15.0242 15.7315L16.7937 17.5009L15.0268 19.2677L14.9689 19.337C14.8508 19.5075 14.8508 19.7351 14.9689 19.9056L15.0268 19.9749L15.096 20.0327C15.2665 20.1508 15.4941 20.1508 15.6646 20.0327L15.7339 19.9749L17.5007 18.2079L19.2698 19.9771L19.339 20.035C19.5095 20.1531 19.7371 20.1531 19.9076 20.035L19.9769 19.9771L20.0347 19.9079C20.1528 19.7373 20.1528 19.5097 20.0347 19.3392L19.9769 19.27L18.2077 17.5009L19.9796 15.7316L20.0375 15.6623C20.1556 15.4918 20.1556 15.2642 20.0375 15.0937L19.9796 15.0244L19.9104 14.9666C19.7399 14.8485 19.5123 14.8485 19.3418 14.9666L19.2725 15.0244L17.5007 16.794L15.7313 15.0244L15.662 14.9665C15.5159 14.8653 15.3278 14.8508 15.1696 14.9231L15.0934 14.9665ZM10.0004 2.00488C12.7618 2.00488 15.0004 4.24346 15.0004 7.00488C15.0004 9.76631 12.7618 12.0049 10.0004 12.0049C7.23894 12.0049 5.00036 9.76631 5.00036 7.00488C5.00036 4.24346 7.23894 2.00488 10.0004 2.00488ZM10.0004 3.50488C8.06737 3.50488 6.50036 5.07189 6.50036 7.00488C6.50036 8.93788 8.06737 10.5049 10.0004 10.5049C11.9334 10.5049 13.5004 8.93788 13.5004 7.00488C13.5004 5.07189 11.9334 3.50488 10.0004 3.50488Z" fill="currentColor"/>
  </svg>
);

export interface FluentSearchIconProps {
  className?: string;
  style?: React.CSSProperties;
  treatment?: SearchIconTreatment;
}

export const FluentSearchIcon: React.FC<FluentSearchIconProps> = ({ 
  className = 'w-5 h-5', 
  style, 
  treatment 
}) => {
  const { draftSettings, settings } = useSettings();
  const activeTreatment = treatment || draftSettings.searchIconTreatment || settings.searchIconTreatment || 'default';

  if (activeTreatment === 'sparkle') {
    return (
      <img
        src={SPARKLE_SEARCH_ICON_URL}
        alt="Search"
        referrerPolicy="no-referrer"
        className={`${className} object-contain shrink-0 select-none inline-block`}
        style={style}
      />
    );
  }

  if (activeTreatment === 'globe') {
    return (
      <img
        src={GLOBE_SEARCH_ICON_URL}
        alt="Search"
        referrerPolicy="no-referrer"
        className={`${className} object-contain shrink-0 select-none inline-block brightness-0 dark:brightness-0 dark:invert`}
        style={style}
      />
    );
  }

  return (
    <svg 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={`${className} ${activeTreatment === 'flipped' ? 'scale-x-[-1]' : ''}`} 
      style={style}
    >
      <path d="M31.3975 33.1615C28.601 35.5546 24.9693 37 21 37C12.1634 37 5 29.8366 5 21C5 12.1634 12.1634 5 21 5C29.8366 5 37 12.1634 37 21C37 24.9674 35.556 28.5975 33.1649 31.3934L42.6376 40.8661C43.1257 41.3542 43.1257 42.1457 42.6376 42.6338C42.1494 43.122 41.3579 43.122 40.8698 42.6338L31.3975 33.1615ZM34.5 21C34.5 13.5442 28.4558 7.5 21 7.5C13.5442 7.5 7.5 13.5442 7.5 21C7.5 28.4558 13.5442 34.5 21 34.5C28.4558 34.5 34.5 28.4558 34.5 21Z" fill="currentColor"/>
    </svg>
  );
};

export const FluentSettingsIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M24 16.4999C19.8579 16.4999 16.5 19.8578 16.5 23.9999C16.5 28.1421 19.8579 31.4999 24 31.4999C28.1421 31.4999 31.5 28.1421 31.5 23.9999C31.5 19.8578 28.1421 16.4999 24 16.4999ZM19 23.9999C19 21.2385 21.2386 18.9999 24 18.9999C26.7614 18.9999 29 21.2385 29 23.9999C29 26.7614 26.7614 28.9999 24 28.9999C21.2386 28.9999 19 26.7614 19 23.9999ZM19.4943 43.468C20.9727 43.8208 22.4874 43.999 24.0073 43.999C25.524 43.9974 27.0353 43.8182 28.5103 43.465C28.898 43.3716 29.2476 43.161 29.5114 42.8618C29.7751 42.5626 29.9402 42.1894 29.9843 41.793L30.3223 38.722C30.3794 38.1728 30.6307 37.662 31.0309 37.2816C31.4311 36.9012 31.9539 36.6762 32.5053 36.647C32.8719 36.6311 33.2372 36.6995 33.5732 36.847L36.3803 38.078C36.6243 38.1877 36.8886 38.2452 37.1562 38.2469C37.4238 38.2487 37.6888 38.1945 37.9343 38.088C38.1807 37.9827 38.4022 37.8266 38.5843 37.63C40.6483 35.4053 42.1891 32.7475 43.0943 29.851C43.2128 29.4667 43.2091 29.0552 43.0837 28.6731C42.9583 28.291 42.7174 27.9573 42.3943 27.718L39.9003 25.878C39.6032 25.6622 39.3614 25.3793 39.1947 25.0522C39.028 24.7251 38.9411 24.3631 38.9411 23.996C38.9411 23.6289 39.028 23.2669 39.1947 22.9398C39.3614 22.6127 39.6032 22.3297 39.9003 22.114L42.3863 20.278C42.7104 20.0383 42.9519 19.7038 43.0774 19.3207C43.2028 18.9376 43.2059 18.5249 43.0863 18.14C42.1808 15.243 40.6381 12.5857 38.5713 10.363C38.2974 10.0703 37.9395 9.86982 37.5469 9.78922C37.1542 9.70861 36.7463 9.75187 36.3793 9.91299L33.5732 11.149C33.2821 11.2802 32.9666 11.3483 32.6473 11.349C32.0711 11.3481 31.5155 11.1345 31.0872 10.7491C30.6588 10.3638 30.3879 9.83385 30.3263 9.26099L29.9863 6.20099C29.9428 5.79937 29.7748 5.42138 29.5058 5.11996C29.2368 4.81855 28.8804 4.60878 28.4863 4.51999C27.019 4.19242 25.5216 4.01847 24.0183 4.00098C22.5043 4.01846 20.9963 4.19274 19.5183 4.521C19.1246 4.60928 18.7684 4.81836 18.4995 5.11905C18.2305 5.41974 18.0623 5.79699 18.0183 6.198L17.6773 9.25998C17.6134 9.83345 17.3403 10.3632 16.9103 10.748C16.471 11.1211 15.9174 11.3328 15.3413 11.348C15.0235 11.3478 14.7092 11.2817 14.4183 11.154L11.6183 9.918C11.25 9.75542 10.8403 9.71157 10.4461 9.79257C10.0518 9.87358 9.69255 10.0754 9.41827 10.37C7.35399 12.5931 5.81275 15.2495 4.90726 18.145C4.78769 18.5298 4.79083 18.9423 4.91627 19.3252C5.0417 19.7081 5.2832 20.0425 5.60726 20.282L8.09626 22.118C8.39089 22.3355 8.63046 22.6191 8.79578 22.9459C8.9611 23.2727 9.04758 23.6337 9.04827 24C9.0486 24.3669 8.9626 24.7286 8.79722 25.0561C8.63183 25.3836 8.3917 25.6675 8.09626 25.885L5.60627 27.724C5.2826 27.9633 5.04136 28.2974 4.91595 28.6799C4.79053 29.0624 4.78714 29.4745 4.90626 29.859C5.80978 32.7571 7.35083 35.4162 9.41627 37.641C9.59569 37.8352 9.81367 37.9898 10.0563 38.095C10.301 38.2026 10.5654 38.2581 10.8328 38.2581C11.1001 38.2581 11.3645 38.2026 11.6093 38.095L14.4283 36.858C14.7191 36.7298 15.0335 36.6637 15.3513 36.664H15.3593C15.9331 36.6647 16.4866 36.8765 16.9144 37.2589C17.3422 37.6414 17.6145 38.1678 17.6793 38.738L18.0173 41.795C18.0614 42.1919 18.227 42.5656 18.4913 42.865C18.7556 43.1644 19.1059 43.375 19.4943 43.468ZM27.5583 41.123C25.2181 41.6234 22.7985 41.6234 20.4583 41.123L20.1543 38.461C20.0221 37.2798 19.4597 36.1886 18.5744 35.3955C17.6891 34.6024 16.5429 34.1629 15.3543 34.161H15.3443C14.6814 34.1583 14.0253 34.2945 13.4183 34.561L10.9723 35.634C9.38518 33.8444 8.17417 31.754 7.41126 29.487L9.57726 27.887C10.1874 27.4371 10.6833 26.8502 11.025 26.1736C11.3668 25.497 11.5449 24.7495 11.5449 23.9915C11.5449 23.2334 11.3668 22.486 11.025 21.8094C10.6833 21.1328 10.1874 20.5459 9.57726 20.096L7.41326 18.496C8.17734 16.2316 9.38828 14.1437 10.9743 12.356L13.4063 13.428C14.0144 13.6972 14.6722 13.8358 15.3373 13.835H15.3473C16.5387 13.8327 17.6877 13.3919 18.5748 12.5966C19.462 11.8012 20.0253 10.7071 20.1573 9.52298L20.4573 6.86298C21.6304 6.6279 22.8229 6.50205 24.0193 6.487C25.2063 6.50208 26.3894 6.62762 27.5533 6.862L27.8533 9.521C27.9816 10.705 28.5424 11.8 29.4281 12.596C30.3139 13.3921 31.4623 13.8333 32.6533 13.835C33.3249 13.8509 33.9911 13.7105 34.5993 13.425L37.0293 12.354C38.6163 14.1415 39.8276 16.2299 40.5913 18.495L38.4343 20.088C37.8198 20.5358 37.3199 21.1226 36.9752 21.8003C36.6305 22.478 36.4508 23.2276 36.4508 23.988C36.4508 24.7483 36.6305 25.4979 36.9752 26.1757C37.3199 26.8534 37.8198 27.4401 38.4343 27.888L40.5993 29.488C39.8348 31.752 38.6243 33.8398 37.0393 35.628L34.5983 34.558C33.9037 34.2496 33.146 34.1098 32.3872 34.1501C31.6283 34.1905 30.8897 34.4098 30.2318 34.7901C29.5738 35.1704 29.0152 35.701 28.6014 36.3384C28.1877 36.9759 27.9307 37.7022 27.8513 38.458L27.5583 41.123Z" fill="currentColor"/>
  </svg>
);

export const FluentCraftmineIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M12 2.25L3.75 6.75V17.25L12 21.75L20.25 17.25V6.75L12 2.25Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 2.25V11.25M12 11.25L3.75 6.75M12 11.25L20.25 6.75M12 11.25V21.75" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.5 4.5L16.5 9.5M7.5 19.5V14M16.5 19.5V14" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1.5 2"/>
  </svg>
);

export const FluentUpdatesIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    {/* Upper arrow with wide separation */}
    <path d="M4 8.5C5.8 4.8 9.5 2.5 14 2.5C17.8 2.5 20.8 4.5 22 7.5" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round"/>
    <path d="M17.5 8H22V3.5" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Lower arrow with wide separation */}
    <path d="M20 15.5C18.2 19.2 14.5 21.5 10 21.5C6.2 21.5 3.2 19.5 2 16.5" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round"/>
    <path d="M6.5 16H2V20.5" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const FluentTaskManagerIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M3.75 4.5C3.75 3.67157 4.42157 3 5.25 3H18.75C19.5784 3 20.25 3.67157 20.25 4.5V19.5C20.25 20.3284 19.5784 21 18.75 21H5.25C4.42157 21 3.75 20.3284 3.75 19.5V4.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.75 8.25H20.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.5 5.75H7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M9.5 5.75H10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M6 14.5H8.25L9.75 11.25L12 17.5L13.75 13.25L15 15.25H18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const FluentWidgetsIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <rect x="3.5" y="3.5" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    <rect x="13.5" y="3.5" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    <rect x="3.5" y="15.5" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    <rect x="13.5" y="11.5" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export const FluentFileExplorerIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M2.5 5.5C2.5 4.39543 3.39543 3.5 4.5 3.5H9.17157C9.70201 3.5 10.2107 3.71071 10.5858 4.08579L12.5 6H19.5C20.6046 6 21.5 6.89543 21.5 8V18.5C21.5 19.6046 20.6046 20.5 19.5 20.5H4.5C3.39543 20.5 2.5 19.6046 2.5 18.5V5.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    <path d="M2.5 9.5H21.5" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M6 13.5H10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

export const FluentPaintIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M12 2.5C6.75 2.5 2.5 6.75 2.5 12C2.5 15.48 4.45 18.51 7.33 20.1C7.82 20.37 8.44 20.18 8.63 19.65C8.83 19.11 8.69 18.5 8.37 18.04C7.97 17.48 7.75 16.8 7.75 16.05C7.75 14.35 9.13 12.98 10.83 12.98H12C16.14 12.98 19.5 9.62 19.5 5.48C19.5 3.83 18.17 2.5 16.52 2.5H12Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    <circle cx="6.5" cy="11.5" r="1.25" fill="currentColor"/>
    <circle cx="9.5" cy="7.5" r="1.25" fill="currentColor"/>
    <circle cx="14.5" cy="6.5" r="1.25" fill="currentColor"/>
    <path d="M17.5 11.5L21.5 15.5M16 21L19.5 17.5M16 21L14 21.5L14.5 19.5L18 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const FluentPhotosIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.6"/>
    <circle cx="8.5" cy="8.5" r="1.75" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M3.5 16.5L7.79 12.21C8.18 11.82 8.82 11.82 9.21 12.21L14.5 17.5M13.5 15.5L15.79 13.21C16.18 12.82 16.82 12.82 17.21 13.21L20.5 16.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const FluentPhotosColorIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-4 h-4', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <defs>
      <linearGradient id="fluentPhotosGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0078D4" />
        <stop offset="0.55" stopColor="#00B294" />
        <stop offset="1" stopColor="#107C41" />
      </linearGradient>
      <radialGradient id="fluentPhotosSun" cx="7.5" cy="7.5" r="3.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFD800" />
        <stop offset="1" stopColor="#FF8C00" />
      </radialGradient>
    </defs>
    <rect x="2.5" y="2.5" width="19" height="19" rx="4" fill="url(#fluentPhotosGradient)" />
    <circle cx="7.5" cy="7.5" r="2.2" fill="url(#fluentPhotosSun)" />
    <path d="M3 18.5L8.5 13C9 12.5 9.8 12.5 10.3 13L15.5 18.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.5 16.5L14.8 14.2C15.3 13.7 16.1 13.7 16.6 14.2L21 18.5" stroke="#E1DFDD" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const FluentCameraIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M4 7C2.89543 7 2 7.89543 2 9V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V9C22 7.89543 21.1046 7 20 7H16.8284L15.4142 4.58579C15.0391 4.21071 14.5304 4 14 4H10C9.46957 4 8.96086 4.21071 8.58579 4.58579L7.17157 7H4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    <circle cx="12" cy="13.5" r="3.75" stroke="currentColor" strokeWidth="1.6"/>
    <circle cx="18.5" cy="10" r="1" fill="currentColor"/>
  </svg>
);

export const FluentEdgeIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <img
    src="https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b8/Microsoft_Edge_logo_%282015%E2%80%932019%29.svg/960px-Microsoft_Edge_logo_%282015%E2%80%932019%29.svg.png?utm_source=vi.wikipedia.org&utm_campaign=index&utm_content=thumbnail"
    alt="Microsoft Edge"
    className={`fluent-edge-icon object-contain inline-block shrink-0 transition-[filter] select-none dark:brightness-0 dark:invert ${className}`}
    style={style}
    loading="eager"
    draggable={false}
  />
);

export const FluentDirectCutIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    {/* Clapperboard / Timeline scissors video editing pro icon */}
    <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.6" />
    <path d="M3 9.5H21" stroke="currentColor" strokeWidth="1.6" />
    <path d="M7 4L5.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 4L10.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M17 4L15.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Scissors cut symbol */}
    <circle cx="8" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="8" cy="17" r="1.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M9.5 15.5L16.5 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M9.5 16.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M13.5 13.5L16.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const FluentDirectCutColorIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <defs>
      <linearGradient id="fluentDirectCutGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366F1" />
        <stop offset="0.5" stopColor="#8B5CF6" />
        <stop offset="1" stopColor="#EC4899" />
      </linearGradient>
      <linearGradient id="fluentDirectCutCyan" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#38BDF8" />
        <stop offset="1" stopColor="#0284C7" />
      </linearGradient>
    </defs>
    <rect x="2.5" y="2.5" width="19" height="19" rx="4.5" fill="url(#fluentDirectCutGrad)" />
    <path d="M3 8.5H21" stroke="white" strokeWidth="1.4" strokeOpacity="0.7" />
    <path d="M7 3L5.5 8.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.8" />
    <path d="M12 3L10.5 8.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.8" />
    <path d="M17 3L15.5 8.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.8" />
    {/* Center play / timeline cut */}
    <circle cx="8" cy="14.5" r="1.6" stroke="white" strokeWidth="1.4" />
    <circle cx="8" cy="17.5" r="1.6" stroke="white" strokeWidth="1.4" />
    <path d="M9.5 15L16.5 16.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M9.5 17L14 13.5L16.5 15" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const FluentSwiftBankIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    {/* Bank Columns / Building & Shield with Swift Lightning */}
    <path d="M2.5 8.5L12 3L21.5 8.5H2.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M4 19H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M3 21H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M6 10V17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M10 10V17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M14 10V17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M18 10V17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const FluentSwiftBankColorIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <defs>
      <linearGradient id="swiftBankNavyGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0F172A" />
        <stop offset="0.6" stopColor="#1E3A8A" />
        <stop offset="1" stopColor="#0284C7" />
      </linearGradient>
      <linearGradient id="swiftBankGoldGrad" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#F59E0B" />
        <stop offset="1" stopColor="#FCD34D" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="4.5" fill="url(#swiftBankNavyGrad)" />
    {/* Roof */}
    <path d="M4.5 8.5L12 4.5L19.5 8.5H4.5Z" fill="url(#swiftBankGoldGrad)" />
    {/* Columns */}
    <rect x="6" y="10" width="1.8" height="6.5" rx="0.5" fill="white" />
    <rect x="9.6" y="10" width="1.8" height="6.5" rx="0.5" fill="white" />
    <rect x="13.2" y="10" width="1.8" height="6.5" rx="0.5" fill="white" />
    <rect x="16.8" y="10" width="1.8" height="6.5" rx="0.5" fill="white" />
    {/* Base */}
    <rect x="4.5" y="17.5" width="15" height="1.8" rx="0.5" fill="url(#swiftBankGoldGrad)" />
  </svg>
);

export const FluentClockIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 7V12L15.5 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const FluentClockColorIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <defs>
      <linearGradient id="fluentClockGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0078D4" />
        <stop offset="1" stopColor="#004E8C" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#fluentClockGrad)" />
    <circle cx="12" cy="12" r="7.5" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5" />
    <path d="M12 7.5V12L15 13.8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="1.2" fill="white" />
  </svg>
);

/* VLC Media Player Icon (Traffic Cone Outline) */
export const FluentVlcIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    {/* Base plate */}
    <path d="M3 20.5H21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    {/* Traffic Cone Body */}
    <path d="M5.5 19.5L10.5 4.5C10.8 3.6 11.4 3 12 3C12.6 3 13.2 3.6 13.5 4.5L18.5 19.5H5.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none" />
    {/* Top reflective stripe */}
    <path d="M9.5 11H14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Bottom reflective stripe */}
    <path d="M7.5 15.5H16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const FluentVlcColorIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <defs>
      <linearGradient id="vlcOrangeGrad" x1="12" y1="3" x2="12" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF8A00" />
        <stop offset="0.6" stopColor="#FF6600" />
        <stop offset="1" stopColor="#E65100" />
      </linearGradient>
      <filter id="vlcGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#E65100" floodOpacity="0.3" />
      </filter>
    </defs>
    {/* Base Plate */}
    <rect x="2.5" y="18.5" width="19" height="3" rx="1.5" fill="#E65100" />
    <rect x="4" y="18" width="16" height="2" rx="1" fill="#FF8A00" />
    {/* Cone Main Shape */}
    <path d="M6 18.5L10.6 4.3C10.9 3.4 11.4 2.8 12 2.8C12.6 2.8 13.1 3.4 13.4 4.3L18 18.5H6Z" fill="url(#vlcOrangeGrad)" filter="url(#vlcGlow)" />
    {/* White Stripes */}
    {/* Upper Stripe */}
    <path d="M9.6 10.8L10.3 8.5H13.7L14.4 10.8H9.6Z" fill="#FFFFFF" fillOpacity="0.95" />
    {/* Lower Stripe */}
    <path d="M8 15.5L8.9 12.8H15.1L16 15.5H8Z" fill="#FFFFFF" fillOpacity="0.95" />
    {/* Cone Tip */}
    <ellipse cx="12" cy="4.2" rx="1.5" ry="1.2" fill="#FFA726" />
  </svg>
);

/* Photopea Icon (P with Photo Pea emblem Outline) */
export const FluentPhotopeaIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <rect x="3" y="3" width="18" height="18" rx="4.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
    <path d="M8.5 7H13.2C15.2 7 16.5 8.2 16.5 10C16.5 11.8 15.2 13 13.2 13H10.5V17H8.5V7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none" />
    <circle cx="12.5" cy="10" r="1.2" stroke="currentColor" strokeWidth="1.3" fill="none" />
  </svg>
);

export const FluentPhotopeaColorIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <defs>
      <linearGradient id="photopeaGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0F383D" />
        <stop offset="0.5" stopColor="#146067" />
        <stop offset="1" stopColor="#18A096" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#photopeaGrad)" />
    {/* White & Turquoise Pea Stylized Letter P */}
    <path d="M7.5 6.5H13C15.5 6.5 17 8 17 10.2C17 12.4 15.5 13.9 13 13.9H10.2V17.5H7.5V6.5Z" fill="white" />
    <path d="M10.2 8.7V11.7H12.8C13.8 11.7 14.5 11.1 14.5 10.2C14.5 9.3 13.8 8.7 12.8 8.7H10.2Z" fill="#146067" />
    <circle cx="12.6" cy="10.2" r="1" fill="#4ade80" />
  </svg>
);

/* Schedule / Lịch phát sóng TV Guide Icon */
export const FluentScheduleIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <rect x="3" y="4" width="18" height="17" rx="3.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
    <path d="M3 9H21" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8 2.5V5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M16 2.5V5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="8" cy="13" r="1.1" stroke="currentColor" strokeWidth="1.2" fill="none" />
    <circle cx="12" cy="13" r="1.1" stroke="currentColor" strokeWidth="1.2" fill="none" />
    <circle cx="16" cy="13" r="1.1" stroke="currentColor" strokeWidth="1.2" fill="none" />
    <circle cx="8" cy="17" r="1.1" stroke="currentColor" strokeWidth="1.2" fill="none" />
    <circle cx="12" cy="17" r="1.1" stroke="currentColor" strokeWidth="1.2" fill="none" />
  </svg>
);

export const FluentScheduleColorIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <defs>
      <linearGradient id="scheduleGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0284C7" />
        <stop offset="0.6" stopColor="#0369A1" />
        <stop offset="1" stopColor="#075985" />
      </linearGradient>
    </defs>
    <rect x="2" y="3" width="20" height="18.5" rx="4.5" fill="url(#scheduleGrad)" />
    <path d="M2 8.5H22" stroke="white" strokeWidth="1.4" strokeOpacity="0.4" />
    <rect x="6.5" y="1.5" width="2.5" height="4.5" rx="1.2" fill="#38BDF8" />
    <rect x="15" y="1.5" width="2.5" height="4.5" rx="1.2" fill="#38BDF8" />
    <circle cx="7" cy="12.5" r="1.3" fill="white" />
    <circle cx="12" cy="12.5" r="1.3" fill="#38BDF8" />
    <circle cx="17" cy="12.5" r="1.3" fill="white" />
    <circle cx="7" cy="16.5" r="1.3" fill="white" />
    <circle cx="12" cy="16.5" r="1.3" fill="white" />
    <path d="M15.5 16.5H18.5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* Cookbook Icon (Chef Hat & Open Recipe Book Outline) */
export const FluentCookbookIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M4 19.5C4 18.1193 5.11929 17 6.5 17H20V4H6.5C5.11929 4 4 5.11929 4 6.5V19.5ZM4 19.5C4 20.8807 5.11929 22 6.5 22H20V17H6.5C5.11929 17 4 18.1193 4 19.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none" />
    <path d="M8.5 7.5H15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8.5 11H13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M15 15L18.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="18.5" cy="11.5" r="1.5" stroke="currentColor" strokeWidth="1.3" fill="none" />
  </svg>
);

export const FluentCookbookColorIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <defs>
      <linearGradient id="cookbookGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F97316" />
        <stop offset="0.5" stopColor="#EA580C" />
        <stop offset="1" stopColor="#C2410C" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#cookbookGrad)" />
    {/* Book Pages */}
    <path d="M6 6H18C18.6 6 19 6.4 19 7V17C19 17.6 18.6 18 18 18H6.5C5.7 18 5 17.3 5 16.5V7.5C5 6.7 5.7 6 6 6Z" fill="white" />
    <path d="M5 16.5C5 15.7 5.7 15 6.5 15H19V18H6.5C5.7 18 5 17.3 5 16.5Z" fill="#FDBA74" />
    {/* Chef Fork & Spoon Icon in gold */}
    <path d="M9 9H15" stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M9 12H13" stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="15.5" cy="12" r="1.5" fill="#EA580C" />
  </svg>
);

/* Swift Social Network Icon (Combined Bird / Spark / Bubble Outline) */
export const FluentSwiftSocialIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.55 3.38 17L2.5 21.5L7.2 20.67C8.6 21.5 10.25 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none" />
    {/* Swift Lightning Bolt Outline */}
    <path d="M13.5 6L7.5 13H12L10.5 18L16.5 11H12L13.5 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" fill="none" />
  </svg>
);

export const FluentSwiftSocialColorIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <defs>
      <linearGradient id="swiftSocialGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366F1" />
        <stop offset="0.3" stopColor="#8B5CF6" />
        <stop offset="0.7" stopColor="#EC4899" />
        <stop offset="1" stopColor="#F43F5E" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5.5" fill="url(#swiftSocialGrad)" />
    {/* Lightning Bolt */}
    <path d="M13.5 5.5L7 13.5H12L10.5 18.5L17 10.5H12L13.5 5.5Z" fill="white" />
  </svg>
);

/* Friends / Community Icon (100 Users Outline) */
export const FluentFriendsIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" fill="none" />
    <path d="M3 18C3 15 5.7 13 9 13C12.3 13 15 15 15 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    <circle cx="16.5" cy="7.5" r="2.2" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M15 13.5C16.8 13.8 19.5 14.8 20 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

export const FluentFriendsColorIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <defs>
      <linearGradient id="friendsGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#10B981" />
        <stop offset="0.6" stopColor="#059669" />
        <stop offset="1" stopColor="#047857" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#friendsGrad)" />
    {/* Main friend circle */}
    <circle cx="10" cy="8" r="3" fill="white" />
    <path d="M4 17.5C4 14.5 6.8 13 10 13C13.2 13 16 14.5 16 17.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="white" fillOpacity="0.2" />
    {/* Second friend */}
    <circle cx="16" cy="7.5" r="2" fill="#A7F3D0" />
    <path d="M15.5 13.5C17.2 13.8 19 14.8 19.5 17" stroke="#A7F3D0" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/* MSN Feed Icon (Fluent Butterfly Outline) */
export const FluentMsnIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    {/* Upper wings */}
    <path d="M12 7.5C10.5 4 6.5 3 4 5.5C2 7.5 3 11.5 7 13C8.5 13.5 10.5 13 12 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M12 7.5C13.5 4 17.5 3 20 5.5C22 7.5 21 11.5 17 13C15.5 13.5 13.5 13 12 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    {/* Lower wings */}
    <path d="M11 12.5C9.5 14 6.5 15.5 5.5 18C4.5 20.5 7.5 21.5 9.5 20C11 19 11.5 16.5 12 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M13 12.5C14.5 14 17.5 15.5 18.5 18C19.5 20.5 16.5 21.5 14.5 20C13 19 12.5 16.5 12 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    {/* Center subtle antennae */}
    <circle cx="12" cy="7" r="0.75" stroke="currentColor" strokeWidth="1.2" fill="none" />
  </svg>
);

export const FluentMsnColorIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <defs>
      <linearGradient id="msnBlueGrad" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#0078D4" />
        <stop offset="1" stopColor="#005A9E" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5" fill="#0078D4" />
    <path d="M11.5 8C10.2 4.5 6.8 3.5 4.5 5.8C2.8 7.5 3.5 11 7 12.5C8.3 13 10.2 12.6 11.5 11.2" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <path d="M12.5 8C13.8 4.5 17.2 3.5 19.5 5.8C21.2 7.5 20.5 11 17 12.5C15.7 13 13.8 12.6 12.5 11.2" stroke="#FFB900" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <path d="M11 12C9.5 13.5 6.8 15 5.8 17.2C4.8 19.5 7.5 20.5 9.5 19C11 18 11.5 15.8 12 14.5" stroke="#107C41" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <path d="M13 12C14.5 13.5 17.2 15 18.2 17.2C19.2 19.5 16.5 20.5 14.5 19C13 18 12.5 15.8 12 14.5" stroke="#D83B01" strokeWidth="1.8" strokeLinecap="round" fill="none" />
  </svg>
);

/* Outline Microphone Icons (Microsoft Fluent Regular Outline) */
export const FluentMicOutlineIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-4 h-4', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} mic-outline-icon`} style={style}>
    {/* Capsule */}
    <rect x="8.5" y="2" width="7" height="12" rx="3.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
    {/* Cradle */}
    <path d="M4.5 10.5C4.5 14.64 7.86 18 12 18C16.14 18 19.5 14.64 19.5 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    {/* Stand & Base */}
    <path d="M12 18V22M8 22H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const FluentMicOffOutlineIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-4 h-4', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} mic-outline-icon`} style={style}>
    {/* Slashed line */}
    <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    {/* Capsule parts */}
    <path d="M8.5 9.5V10.5C8.5 12.43 10.07 14 12 14C12.87 14 13.67 13.68 14.28 13.15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    <path d="M15.5 9.5V5.5C15.5 3.57 13.93 2 12 2C10.6 2 9.4 2.82 8.85 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    {/* Cradle parts */}
    <path d="M4.5 10.5C4.5 14.64 7.86 18 12 18C13.2 18 14.33 17.72 15.33 17.22M18.8 13.5C19.25 12.6 19.5 11.6 19.5 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    {/* Stand */}
    <path d="M12 18V22M8 22H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/* Logos Fandom Outline Icon */
export const FluentLogosFandomIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    {/* Shield outline */}
    <path d="M12 2.5L4.5 5.8V11.5C4.5 16.2 7.8 20.2 12 21.5C16.2 20.2 19.5 16.2 19.5 11.5V5.8L12 2.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none" />
    {/* Stylized L / Logo glyph */}
    <path d="M9 7.5V16.5H15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="15" cy="11.5" r="1.2" stroke="currentColor" strokeWidth="1.3" fill="none" />
  </svg>
);

/* Minecraft Wiki Outline Icon (Isometric Grass Block Cube) */
export const FluentMinecraftWikiIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    {/* Isometric cube outline */}
    <path d="M12 2.5L20 7.2V16.8L12 21.5L4 16.8V7.2L12 2.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none" />
    <path d="M12 2.5V21.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 12L20 7.2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 12L4 7.2" stroke="currentColor" strokeWidth="1.5" />
    {/* Stepped pixel block pattern */}
    <path d="M6 13L8 14.2L10 13L12 14.2L14 13L16 14.2L18 13" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none" />
  </svg>
);

/* Games Category Icon (Fluent Gamepad) */
export const FluentGamesIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M6.5 6H17.5C19.9853 6 22 8.01472 22 10.5C22 12.9853 19.9853 15 17.5 15H17.382C16.9248 15 16.5186 15.2893 16.3475 15.7171L15.3475 18.2171C14.9754 19.1473 13.9113 19.6469 12.9463 19.3409C12.3396 19.1485 11.6604 19.1485 11.0537 19.3409C10.0887 19.6469 9.02462 19.1473 8.65251 18.2171L7.65251 15.7171C7.48141 15.2893 7.07521 15 6.61799 15H6.5C4.01472 15 2 12.9853 2 10.5C2 8.01472 4.01472 6 6.5 6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    {/* D-Pad */}
    <path d="M7.5 9V12M6 10.5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Action Buttons */}
    <circle cx="16" cy="9.5" r="0.9" fill="currentColor" />
    <circle cx="18" cy="11.5" r="0.9" fill="currentColor" />
  </svg>
);

/* Wheel of Fortune Icon (Rotating Lucky Wheel) */
export const FluentWheelIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 3V9.5M12 14.5V21M3 12H9.5M14.5 12H21" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M5.636 5.636L10.232 10.232M13.768 13.768L18.364 18.364M5.636 18.364L10.232 13.768M13.768 10.232L18.364 5.636" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    {/* Arrow Indicator Top */}
    <path d="M12 1L14 3.5H10L12 1Z" fill="#4cc2ff" />
  </svg>
);

/* Tic-Tac-Toe Grid Icon */
export const FluentTicTacToeIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    {/* Grid Lines */}
    <path d="M8.5 3V21M15.5 3V21M3 8.5H21M3 15.5H21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    {/* X mark */}
    <path d="M4.5 4.5L7 7M7 4.5L4.5 7" stroke="#4cc2ff" strokeWidth="1.4" strokeLinecap="round" />
    {/* O mark */}
    <circle cx="18.5" cy="18.5" r="1.6" stroke="#f43f5e" strokeWidth="1.4" />
  </svg>
);

/* Rock Paper Scissors Icon */
export const FluentRpsIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    {/* Scissors blades */}
    <circle cx="6" cy="18" r="2.2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="18" cy="18" r="2.2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7.6 16.4L16.5 4M16.4 16.4L7.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="10" r="1.2" fill="currentColor" />
  </svg>
);

/* Draw Logos From Memory Icon */
export const FluentDrawLogosIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    {/* Palette frame */}
    <path d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C13.24 21 14 20.24 14 19C14 18.42 13.78 17.89 13.43 17.5C13.09 17.12 12.87 16.62 12.87 16.06C12.87 14.93 13.8 14 14.93 14H16.5C18.98 14 21 11.98 21 9.5C21 5.91 16.97 3 12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <circle cx="7.5" cy="9.5" r="1.3" fill="#4cc2ff" />
    <circle cx="11.5" cy="7.5" r="1.3" fill="#f59e0b" />
    <circle cx="16.5" cy="9.5" r="1.3" fill="#ec4899" />
  </svg>
);

/* Windows 11 Fluent Calculator Icon */
export const FluentCalculatorIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <rect x="4" y="2.5" width="16" height="19" rx="3" stroke="currentColor" strokeWidth="1.6" />
    {/* Display Screen */}
    <rect x="6.5" y="5" width="11" height="3.5" rx="1" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.2" />
    {/* Buttons Grid */}
    <circle cx="8" cy="11.5" r="1" fill="currentColor" />
    <circle cx="12" cy="11.5" r="1" fill="currentColor" />
    <circle cx="16" cy="11.5" r="1" fill="currentColor" />
    <circle cx="8" cy="15" r="1" fill="currentColor" />
    <circle cx="12" cy="15" r="1" fill="currentColor" />
    <circle cx="16" cy="15" r="1" fill="currentColor" />
    <circle cx="8" cy="18.5" r="1" fill="currentColor" />
    <rect x="11" y="17.75" width="6" height="1.5" rx="0.75" fill="#4cc2ff" />
  </svg>
);

export const FluentCalculatorColorIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <defs>
      <linearGradient id="calcGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0078D4" />
        <stop offset="1" stopColor="#005A9E" />
      </linearGradient>
    </defs>
    <rect x="3.5" y="2" width="17" height="20" rx="3.5" fill="url(#calcGrad)" />
    <rect x="6" y="4.5" width="12" height="4" rx="1.5" fill="#003D6B" />
    <rect x="6.5" y="5" width="11" height="3" rx="1" fill="#E1DFDD" fillOpacity="0.95" />
    <circle cx="8" cy="11.5" r="1.3" fill="white" />
    <circle cx="12" cy="11.5" r="1.3" fill="white" />
    <circle cx="16" cy="11.5" r="1.3" fill="#6bd0ff" />
    <circle cx="8" cy="15" r="1.3" fill="white" />
    <circle cx="12" cy="15" r="1.3" fill="white" />
    <circle cx="16" cy="15" r="1.3" fill="#6bd0ff" />
    <circle cx="8" cy="18.5" r="1.3" fill="white" />
    <rect x="10.8" y="17.2" width="6.4" height="2.6" rx="1.3" fill="#FFB900" />
  </svg>
);

/* Windows 11 Fluent Snipping Tool Icon */
export const FluentSnippingToolIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    {/* Dashed crop frame */}
    <rect x="3" y="3" width="18" height="18" rx="2.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
    {/* Scissors Blades */}
    <path d="M7 16L17 7M7 8L17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="6" cy="17" r="1.8" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="6" cy="7" r="1.8" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

export const FluentSnippingToolColorIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <defs>
      <linearGradient id="snipGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#68768A" />
        <stop offset="1" stopColor="#323130" />
      </linearGradient>
    </defs>
    <rect x="2.5" y="2.5" width="19" height="19" rx="4" fill="url(#snipGrad)" stroke="#68768A" strokeWidth="1.2" strokeDasharray="3.5 2" />
    <circle cx="6.5" cy="7" r="2" fill="#4cc2ff" stroke="white" strokeWidth="1.2" />
    <circle cx="6.5" cy="17" r="2" fill="#4cc2ff" stroke="white" strokeWidth="1.2" />
    <path d="M8 8L17.5 16.5M8 16L17.5 7.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="12" r="1.5" fill="#f59e0b" />
  </svg>
);

/* Windows 11 Fluent Feedback Hub Icon */
export const FluentFeedbackHubIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M4 4.5C4 3.67157 4.67157 3 5.5 3H18.5C19.3284 3 20 3.67157 20 4.5V15.5C20 16.3284 19.3284 17 18.5 17H8.5L4.5 20.5V4.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    {/* Smiley Face */}
    <circle cx="9" cy="8.5" r="1" fill="currentColor" />
    <circle cx="15" cy="8.5" r="1" fill="currentColor" />
    <path d="M9 12C10 13.5 14 13.5 15 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const FluentFeedbackHubColorIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <defs>
      <linearGradient id="feedGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0078D4" />
        <stop offset="1" stopColor="#8764B8" />
      </linearGradient>
    </defs>
    <path d="M3 4.5C3 3.12 4.12 2 5.5 2H18.5C19.88 2 21 3.12 21 4.5V15.5C21 16.88 19.88 18 18.5 18H8L3.5 21.8V4.5Z" fill="url(#feedGrad)" />
    <circle cx="8.5" cy="8.5" r="1.3" fill="white" />
    <circle cx="15.5" cy="8.5" r="1.3" fill="white" />
    <path d="M8.5 12.5C9.8 14.5 14.2 14.5 15.5 12.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

