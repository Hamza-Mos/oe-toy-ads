"use client";

import React from "react";
import { Paper, Box, Typography, Button } from "@mui/material";
import Image from "next/image";
import { Creative } from "@/lib/ads/config";

export interface AdSlotProps {
  creative: Creative;
}

export const AdSlot: React.FC<AdSlotProps> = ({ creative }) => {
  return (
    <Paper
      elevation={4}
      sx={{
        p: 2,
        display: "flex",
        gap: 2,
        alignItems: "center",
        borderLeft: "4px solid #1976d2",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Image
          src={creative.logoUrl}
          alt={`${creative.sponsor} logo`}
          width={56}
          height={56}
        />
        <Box>
          <Typography variant="overline" sx={{ color: "text.secondary" }}>
            Ad
          </Typography>
          <Typography variant="h6">{creative.headline}</Typography>
          <Typography variant="body2" sx={{ my: 0.5 }}>
            {creative.body}
          </Typography>
          {creative.disclaimer && (
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block" }}
            >
              {creative.disclaimer}
            </Typography>
          )}
          <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              component={"a" as any}
              href={creative.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more
            </Button>
            <Button
              variant="text"
              color="secondary"
              size="small"
              component={"a" as any}
              href={creative.isiUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              ISI
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default AdSlot;
