/*

 * File Name: shadow.tsAuthor: Miguel Ángel Noel García*/
import { alpha } from "@mui/material";
export const createShadowVariants = (color = "#38414a") => {
  const color1 = alpha(color, 0.15);
  const color2 = alpha(color, 0.12);

  // prettier-ignore
  const shadows = ["none",
  // 0     No Shadow
  `0 1px 2px ${color1}`,
  // 1     Paper
  `0 2px 4px 0px ${color1}, 0 2px 4px 0 ${color2}`,
  // 2     Button - Normal
  `0 2px 6px 0 ${color1}, 0 3px 5px 0 ${color2}`,
  // 3
  `0 3px 6px -2px ${color1}, 0 4px 6px 0 ${color2}`,
  // 4     Button - Hover
  `0 3px 6px -2px  ${color1}, 0 5px 7px 0  ${color2}`,
  // 5
  `0 4px 6px -2px ${color1}, 0 6px 8px 0 ${color2}`,
  // 6     Button - Focus
  `0 4px 6px -2px  ${color1}, 0 7px 9px 0  ${color2}`,
  // 7
  `0 5px 6px -3px ${color1}, 0 8px 10px 1px ${color2}`,
  // 8     Button - Active
  `0 5px 6px -3px  ${color1}, 0 9px 11px 1px  ${color2}`,
  // 9
  `0 6px 7px -3px  ${color1}, 0 10px 13px 1px  ${color2}`,
  // 10
  `0 7px 7px -4px  ${color1}, 0 11px 14px 1px  ${color2}`,
  // 11
  `0 7px 8px -4px  ${color1}, 0 12px 16px 2px  ${color2}`,
  // 12
  `0 7px 9px -4px  ${color1}, 0 13px 16px 2px  ${color2}`,
  // 13
  `0 8px 9px -4px  ${color1}, 0 14px 17px 2px  ${color2}`,
  // 14
  `0 8px 10px -5px  ${color1}, 0 15px 18px 2px  ${color2}`,
  // 15
  `0 8px 11px -5px  ${color1}, 0 16px 19px 2px  ${color2}`,
  // 16
  `0 9px 11px -5px  ${color1}, 0 17px 22px 2px  ${color2}`,
  // 17
  `0 9px 11px -5px  ${color1}, 0 18px 22px 2px  ${color2}`,
  // 18
  `0 9px 12px -6px  ${color1}, 0 19px 23px 2px  ${color2}`,
  // 19
  `0 10px 12px -6px  ${color1}, 0 20px 25px 3px  ${color2}`,
  // 20
  `0 10px 13px -6px  ${color1}, 0 21px 26px 3px  ${color2}`,
  // 21
  `0 10px 14px -6px  ${color1}, 0 22px 28px 3px  ${color2}`,
  // 22
  `0 11px 14px -6px  ${color1}, 0 23px 29px 3px  ${color2}`,
  // 23
  `0 11px 15px -7px  ${color1}, 0 24px 32px 3px  ${color2}` // 24
  ];
  return shadows;
};
const shadowTheme = themeMode => {
  if (themeMode === "dark") {
    // return new Array(25).map(() => "none") as Shadows; // If you need to remove shadow in dark mode
    return createShadowVariants("rgba(0,0,0,0.5)");
  }
  return createShadowVariants();
};
export default shadowTheme;