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

function SpreadsheetSelector({ sheetsList, selectedSpreadsheetId, onSelect }) {
  return (
    <Card sx={{ mb: 3, width: "100%", maxWidth: 600, mx: "auto" }}>
      <CardContent>
        <Typography variant="h6">スプレッドシートを選択</Typography>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>既存のスプレッドシート</InputLabel>
          <Select
            value={selectedSpreadsheetId}
            onChange={(e) => onSelect(e.target.value)}
          >
            {sheetsList.map((sheet) => (
              <MenuItem key={sheet.id} value={sheet.id}>
                {sheet.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedSpreadsheetId && (
          <Typography sx={{ mt: 2 }}>
            <a
              href={`https://docs.google.com/spreadsheets/d/${selectedSpreadsheetId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              📄 選択したスプレッドシートを開く
            </a>
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default SpreadsheetSelector;