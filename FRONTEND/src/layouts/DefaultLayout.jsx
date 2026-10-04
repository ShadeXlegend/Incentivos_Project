import { Suspense } from "react";
const DefaultLayout = ({
  children
}) => {
  return <Suspense fallback={<div />}>
      {children}
    </Suspense>;
};
export default DefaultLayout;