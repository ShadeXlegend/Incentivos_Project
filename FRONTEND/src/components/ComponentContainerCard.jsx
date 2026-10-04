/*
 * Copyright (c) 2023.
 * File Name: ComponentContainerCard.tsx
 * Author: Coderthemes
 */

import { Card, CardContent, Stack, Typography } from "@mui/material";
const ComponentContainerCard = ({
  title,
  description,
  stackProps,
  sx,
  children
}) => {
  return <>
      <Card sx={sx}>
        <CardContent style={{
        paddingBottom: "16px"
      }}>
          <Typography variant="subtitle1" color={"text.primary"}>
            {title}
          </Typography>
          {description && <Typography variant="body2" component={"p"} color={"text.secondary"} marginBottom={"14px"}>
              {description}
            </Typography>}
          <Stack direction={stackProps?.direction ?? "row"} spacing={stackProps?.spacing ?? 2} flexWrap={stackProps?.flexWrap ?? "wrap"} useFlexGap={stackProps?.useFlexGap ?? true} {...stackProps}>
            {children}
          </Stack>
        </CardContent>
      </Card>
    </>;
};
export default ComponentContainerCard;