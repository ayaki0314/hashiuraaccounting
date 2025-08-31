import React from "react";
import {
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
} from "@mui/material";

function EntryForm({ formData, message, onChange, onSubmit, onBack }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>入力フォーム</Typography>
        <TextField fullWidth label="日付 ex)1日→1" name="date" value={formData.date} onChange={onChange} margin="normal" />
        <TextField fullWidth label="収入 ex)割り勘は収入に1入れ支出に-1入れる" name="income" value={formData.income} onChange={onChange} margin="normal" color="success" />
        <TextField fullWidth label="支出 ex)100円→100" name="expense" value={formData.expense} onChange={onChange} margin="normal" color="error" />
        <FormControl fullWidth margin="normal">
          <InputLabel>勘定科目 ▼で選択</InputLabel>
          <Select name="account" value={formData.account} onChange={onChange}>
            <MenuItem value="食費">食費</MenuItem>
            <MenuItem value="交際費">交際費</MenuItem>
            <MenuItem value="交通費">交通費</MenuItem>
            <MenuItem value="雑費">雑費</MenuItem>
            <MenuItem value="趣味費">趣味費</MenuItem>
            <MenuItem value="家賃">家賃</MenuItem>
            <MenuItem value="光熱費">光熱費</MenuItem>
            <MenuItem value="保険料">保険料</MenuItem>
          </Select>
        </FormControl>
        <TextField fullWidth label="備考 ex)ご飯等..." name="note" value={formData.note} onChange={onChange} margin="normal" />
        <Button variant="contained" color="primary" onClick={onSubmit} sx={{ mt: 2 }} fullWidth>送信</Button>
        <Button variant="outlined" onClick={onBack} sx={{ mt: 1 }} fullWidth>戻る</Button>
        {message && <Typography sx={{ mt: 2 }}>{message}</Typography>}
      </CardContent>
    </Card>
  );
}

export default EntryForm;