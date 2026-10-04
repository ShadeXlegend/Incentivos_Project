import { Box, Breadcrumbs, Link, Typography } from "@mui/material";
import PageMetaData from "./PageMetaData";
import { LuChevronRight } from "react-icons/lu";

const PageBreadcrumb = ({ title, subName }) => {
  const breadcrumbItems = [
    <Link
      key="1"
      color="inherit"
      variant="subtitle2"
      underline="none"
      href="/inicio"
      sx={{
        fontWeight: 600,
        fontSize: { xs: "13px", sm: "15px" },
      }}
    >
      Universidad de Cartagena
    </Link>,
    <Link
      key="2"
      color="inherit"
      variant="body2"
      underline="none"
      href=""
      sx={{
        fontSize: { xs: "12px", sm: "14px" },
      }}
    >
      {subName}
    </Link>,
    <Typography
      key="3"
      variant="body2"
      sx={{
        fontSize: { xs: "12px", sm: "14px" },
        color: "text.primary",
      }}
    >
      {title}
    </Typography>,
  ];

  return (
    <>
      <PageMetaData title={title} />

      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        gap={1}
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 1, sm: 2 },
          mb: { xs: 2, sm: 3 },
          mt: { xs: 2, sm: 3 },

        }}
      >
        <Typography
          variant="h5"
          color="text.primary"
          sx={{
            fontWeight: 900,
            fontSize: { sm: "24px" },
            display: { xs: "none", sm: "block" }, // 🔹 Oculta en XS, muestra en SM+
            textAlign: "left",
          }}
        >
          {title}
        </Typography>


        <Breadcrumbs
          separator={<LuChevronRight size={14} />}
          aria-label="breadcrumb"
          sx={{
            mt: { xs: 1, sm: 0 },
            "& ol": {
              flexWrap: "wrap",
              justifyContent: { xs: "flex-start", sm: "flex-start" },
              fontSize: { xs: "12px", sm: "14px" },
            },
          }}
        >
          {breadcrumbItems}
        </Breadcrumbs>
      </Box>
    </>
  );
};

export default PageBreadcrumb;
