/*

 * File Name: index.tsAuthor: Miguel Ángel Noel García*/

import { deepMergeObjects } from "../../helpers/global";
import getTableOverWrites from "./table";
import getTooltipOverWrites from "./tooltip";
const componentOverrides = theme => {
  return deepMergeObjects([getTableOverWrites(theme), getTooltipOverWrites(theme)]);
};
export default componentOverrides;