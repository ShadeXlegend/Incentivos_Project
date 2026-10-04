import Dropzone from "react-dropzone";
import useFileUploader from "./useFileUploader";
import { Avatar, Box, IconButton, Typography } from "@mui/material";
import { LuX } from "react-icons/lu";
import { handleDismiss } from "../../helpers";
export const HorizontalFilePreview = ({
  file
}) => {
  const ext = file.name.substr(file.name.lastIndexOf(".") + 1);
  return <Box id={file.name} sx={{
    border: "1px solid",
    borderColor: "divider",
    borderRadius: "6px",
    p: "12px",
    display: "flex"
  }}>
      <Box sx={{
      display: "flex",
      alignItems: "center",
      gap: "12px"
    }}>
        {file.preview ? <Avatar variant="rounded" sx={{
        height: "48px",
        width: "48px",
        bgcolor: "white",
        objectFit: "cover"
      }} alt={file.name} src={file.preview} /> : <Typography component={"span"} sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "primary.main",
        fontWeight: 600,
        borderRadius: "6px",
        height: "48px",
        width: "48px",
        bgcolor: "#3e60d51a"
      }}>
            {ext.toUpperCase()}
          </Typography>}
        <Box>
          <Typography sx={{
          fontWeight: 600,
          color: "grey.700"
        }}>{file.name}</Typography>
          <Typography component={"p"} color={"grey.700"}>
            {file.formattedSize}
          </Typography>
        </Box>
      </Box>
      <IconButton sx={{
      marginLeft: "auto",
      my: "auto"
    }}>
        <LuX size={18} onClick={() => handleDismiss(file.name)} />
      </IconButton>
    </Box>;
};
const FileUploader = ({
  showPreview = true,
  onFileUpload,
  icon,
  text,
  iconSize
}) => {
  const {
    selectedFiles,
    handleAcceptedFiles,
    removeFile
  } = useFileUploader(showPreview);
  const Icon = icon;
  return <>
      <Dropzone onDrop={acceptedFiles => handleAcceptedFiles(acceptedFiles, onFileUpload)}>
        {({
        getRootProps,
        getInputProps
      }) => <Box sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        minHeight: "230px",
        bgcolor: "transparent",
        borderRadius: "6px",
        border: "2px dashed",
        borderColor: "divider"
      }}>
            <Box className="fallback">
              <input {...getInputProps()} name="file" type="file" multiple />
            </Box>
            <div className="dz-message needsclick" {...getRootProps()}>
              <Box sx={{
            display: "flex",
            justifyContent: "center",
            mb: "12px"
          }}>
                <Icon size={iconSize} />
              </Box>
              <Typography component={"h5"} sx={{
            fontSize: "18px",
            color: "grey.700"
          }}>
                {text}
              </Typography>
            </div>
          </Box>}
      </Dropzone>

      {showPreview && selectedFiles.length > 0 && (selectedFiles || []).map((file, idx) => {
      const ext = file.name.substr(file.name.lastIndexOf(".") + 1);
      return <Box sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "6px",
        p: "12px",
        width: "100%",
        display: "flex"
      }} key={idx}>
              <Box sx={{
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
                {file.preview ? <Avatar variant="rounded" sx={{
            height: "48px",
            minWidth: "48px",
            bgcolor: "white",
            objectFit: "cover"
          }} alt={file.name} src={file.preview} /> : <Typography component={"span"} sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "primary.main",
            fontWeight: 600,
            borderRadius: "6px",
            height: "48px",
            width: "48px",
            bgcolor: "#3e60d51a"
          }}>
                    {ext.toUpperCase()}
                  </Typography>}
                <Box>
                  <Typography sx={{
              fontWeight: 600,
              color: "grey.700",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical"
            }}>
                    {file.name}
                  </Typography>
                  <Typography component={"p"} color={"grey.700"}>
                    {file.formattedSize}
                  </Typography>
                </Box>
              </Box>
              <IconButton sx={{
          marginLeft: "auto",
          marginTop: "auto",
          marginBottom: "auto"
        }}>
                <LuX size={18} onClick={() => removeFile(file)} />
              </IconButton>
            </Box>;
    })}
    </>;
};
export { FileUploader };