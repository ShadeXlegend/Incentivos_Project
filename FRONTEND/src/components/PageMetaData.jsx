import { Helmet } from "react-helmet-async";
const PageMetaData = ({
  title
}) => {
  return <Helmet>
      <title> {title} | Universidad de Cartagena </title>
    </Helmet>;
};
export default PageMetaData;