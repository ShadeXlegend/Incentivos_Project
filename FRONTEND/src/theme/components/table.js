/*

 * File Name: accordion.tsAuthor: Miguel Ángel Noel García*/

const getTableOverWrites = theme => {
  return {
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: theme.palette?.mode === "light" ? "#eee" : "#333"
        }
      }
    },
    // @ts-ignore
    MuiDataGrid: {
      styleOverrides: {
        cell: {
          borderColor: theme.palette?.mode === "light" ? "#eee" : "#333"
        }
      }
    }
  };
};
export default getTableOverWrites;