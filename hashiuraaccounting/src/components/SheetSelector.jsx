import React from "react";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Typography,
} from "@mui/material";

function SheetSelector({ spreadsheetTitle, sheetsInSpreadsheet, selectedSheetName, onSelect }) {
  return (
    <Card sx={{ mb: 3, width: "100%", maxWidth: 600, mx: "auto" }}>
      <CardContent>
        <Typography variant="h6">{spreadsheetTitle} のシートを選択</Typography>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>既存のシート</InputLabel>
          <Select
            value={selectedSheetName}
            onChange={(e) => onSelect(e.target.value)}
          >
            {sheetsInSpreadsheet.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </CardContent>
    </Card>
  );
}

export default SheetSelector;