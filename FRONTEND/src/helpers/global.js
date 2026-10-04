/*

 * File Name: global.tsAuthor: Miguel Ángel Noel García*/

export const deepMergeObjects = list => {
  let object = {};
  list.forEach(l => {
    object = {
      ...object,
      ...l
    };
  });
  return object;
};