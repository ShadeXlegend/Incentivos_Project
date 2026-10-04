import { LinearProgress, styled } from "@mui/material";
import { Suspense, lazy } from "react";
const LeftSideBar = lazy(() => import("@src/layouts/LeftSideBar"));
const RightSideBar = lazy(() => import("@src/layouts/RightSideBar"));
const Topbar = lazy(() => import("@src/layouts/Topbar"));
const Footer = lazy(() => import("@src/layouts/Footer"));
const ContentWrapper = styled("div")(({
  theme
}) => {
  return {
    backgroundColor: theme.palette.background.default,
    padding: "24px",
    paddingTop: 0,
    height: "100%"
  };
});
const VerticalLayout = ({
  children
}) => {
  return <div style={{
    display: "flex"
  }}>
    <Suspense fallback={<div />}>
    
      <LeftSideBar />
    </Suspense>
    <div style={{
      flexDirection: "column",
      display: "flex",
      width: "100%"
    }}>
      <Suspense fallback={<div />}>
        <Topbar />
      </Suspense>

      <ContentWrapper>
        <Suspense fallback={<LinearProgress color="primary" sx={{
          width: '110%',
          marginLeft: -3
        }} />}>
          {children}
        </Suspense>
      </ContentWrapper>

      <Suspense fallback={<div />}>
        <Footer />
      </Suspense>

      <Suspense fallback={<div />}>
        <RightSideBar />
      </Suspense>
    </div>
  </div>;
};
export default VerticalLayout;