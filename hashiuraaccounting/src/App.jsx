import React, { useEffect, useState } from "react";
import { gapi } from "gapi-script";
import {
  Container,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ThemeProvider,
  createTheme,
} from "@mui/material";

// 環境変数
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_API_KEY;
const SCOPES = import.meta.env.VITE_SCOPES;

// MUI テーマ
const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    success: { main: "#2e7d32" },
    error: { main: "#d32f2f" },
  },
});

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [sheetsList, setSheetsList] = useState([]);
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState("");
  const [spreadsheetTitle, setSpreadsheetTitle] = useState("");
  const [sheetsInSpreadsheet, setSheetsInSpreadsheet] = useState([]);
  const [selectedSheetName, setSelectedSheetName] = useState("");
  const [newSpreadsheetName, setNewSpreadsheetName] = useState("");
  const [newSheetName, setNewSheetName] = useState("");
  const [formData, setFormData] = useState({
    date: "",
    income: "",
    expense: "",
    account: "",
    note: "",
  });
  const [message, setMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const [tokenClient, setTokenClient] = useState(null);

  // 初期化
  useEffect(() => {
    const initializeGapiClient = async () => {
      await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [
          "https://sheets.googleapis.com/$discovery/rest?version=v4",
          "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
        ],
      });
    };
    gapi.load("client", initializeGapiClient);

    const checkGoogle = setInterval(() => {
      if (window.google && window.google.accounts) {
        clearInterval(checkGoogle);

        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (resp) => {
            if (resp.error) {
              console.error("❌ Token Error", resp);
              return;
            }
            console.log("✅ Token acquired", resp);
            gapi.client.setToken(resp);
            setIsSignedIn(true);
            loadSheets();
          },
        });

        setTokenClient(client);
      }
    }, 500);
  }, []);

  // サインイン
  const handleSignIn = () => {
    if (tokenClient) {
      tokenClient.requestAccessToken({ prompt: "consent" });
    } else {
      console.error("❌ Token client not ready yet");
    }
  };

  // サインアウト
  const handleSignOut = () => {
    gapi.client.setToken(null);
    setIsSignedIn(false);
    setSheetsList([]);
    setSelectedSpreadsheetId("");
    setSelectedSheetName("");
  };

  // スプレッドシート一覧取得
  const loadSheets = async () => {
    try {
      const res = await gapi.client.drive.files.list({
        q: "mimeType='application/vnd.google-apps.spreadsheet'",
        fields: "files(id, name)",
        pageSize: 20,
      });
      setSheetsList(res.result.files || []);
    } catch (err) {
      console.error("❌ Error loading sheets:", err);
    }
  };

  // シート一覧取得
  const loadSheetsInSpreadsheet = async (spreadsheetId) => {
    try {
      const res = await gapi.client.sheets.spreadsheets.get({ spreadsheetId });
      setSpreadsheetTitle(res.result.properties.title);
      setSheetsInSpreadsheet(res.result.sheets.map((s) => s.properties.title));
    } catch (err) {
      console.error("❌ Error loading sheets in spreadsheet:", err);
    }
  };

  // 入力変更
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ヘッダー行を追加する関数
  const addHeaderRow = async (spreadsheetId, sheetName) => {
    try {
      await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1:F1`,
        valueInputOption: "RAW",
        resource: {
          values: [["ID", "日付", "収入", "支出", "勘定科目", "備考"]],
        },
      });
    } catch (err) {
      console.error("❌ Error adding header row:", err);
    }
  };

  // 新規スプレッドシート作成
  const createNewSpreadsheet = async () => {
    if (!newSpreadsheetName) return;
    try {
      const res = await gapi.client.sheets.spreadsheets.create({
        properties: { title: newSpreadsheetName },
      });
      const id = res.result.spreadsheetId;
      setSelectedSpreadsheetId(id);
      setSpreadsheetTitle(newSpreadsheetName);
      setSheetsInSpreadsheet(["シート1"]);
      setSelectedSheetName("シート1");
      setNewSpreadsheetName("");

      // ヘッダー行を追加
      await addHeaderRow(id, "シート1");

      loadSheets();
    } catch (err) {
      console.error("❌ Error creating spreadsheet:", err);
    }
  };

  // 新規シート作成
  const createNewSheet = async () => {
    if (!selectedSpreadsheetId || !newSheetName) return;
    try {
      await gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: selectedSpreadsheetId,
        requests: [{ addSheet: { properties: { title: newSheetName } } }],
      });
      setSheetsInSpreadsheet([...sheetsInSpreadsheet, newSheetName]);
      setSelectedSheetName(newSheetName);
      setNewSheetName("");

      // ヘッダー行を追加
      await addHeaderRow(selectedSpreadsheetId, newSheetName);
    } catch (err) {
      console.error("❌ Error creating new sheet:", err);
    }
  };

  // 現在のA列で一番大きい番号を取る
  const getNextId = async () => {
    try {
      const res = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: selectedSpreadsheetId,
        range: `${selectedSheetName}!A:A`,
      });
      const rows = res.result.values || [];

      if (rows.length <= 1) return 1; // ヘッダーのみなら1から
      const lastValue = rows[rows.length - 1][0];
      const lastId = Number(lastValue) || 0;
      return lastId + 1;
    } catch (err) {
      console.error("❌ Error getting next id:", err);
      return 1;
    }
  };

  // データ送信
  const handleSubmit = async () => {
    if (!selectedSpreadsheetId || !selectedSheetName) {
      setMessage("スプレッドシートとシートを選択してください");
      return;
    }
    try {
      const nextId = await getNextId();

      const newRow = [
        nextId,
        formData.date,
        formData.income,
        formData.expense,
        formData.account,
        formData.note,
      ];

      await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: selectedSpreadsheetId,
        range: `${selectedSheetName}!A1`,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        resource: {
          values: [newRow],
        },
      });

      setMessage("送信成功！");
      setFormData({
        date: "",
        income: "",
        expense: "",
        account: "",
        note: "",
      });
    } catch (error) {
      console.error(error);
      setMessage("送信失敗");
    }
  };

  const handleBack = () => setOpenDialog(true);
  const handleDialogClose = (save) => {
    setOpenDialog(false);
    if (save) handleSubmit();
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          家計簿アプリ
        </Typography>

        {!isSignedIn ? (
          <Button
            variant="contained"
            onClick={handleSignIn}
            fullWidth
            sx={{ mt: 4 }}
          >
            Googleでログイン
          </Button>
        ) : (
          <>
            <Button
              variant="outlined"
              onClick={handleSignOut}
              fullWidth
              sx={{ mb: 2 }}
            >
              ログアウト
            </Button>

            {/* スプレッドシート選択 */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6">スプレッドシートを選択</Typography>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>既存のスプレッドシート</InputLabel>
                  <Select
                    value={selectedSpreadsheetId}
                    onChange={(e) => {
                      setSelectedSpreadsheetId(e.target.value);
                      loadSheetsInSpreadsheet(e.target.value);
                    }}
                  >
                    {sheetsList.map((sheet) => (
                      <MenuItem key={sheet.id} value={sheet.id}>
                        {sheet.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="新しいスプレッドシート名"
                  value={newSpreadsheetName}
                  onChange={(e) => setNewSpreadsheetName(e.target.value)}
                  sx={{ mt: 2 }}
                />
                <Button
                  variant="outlined"
                  onClick={createNewSpreadsheet}
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  作成
                </Button>
              </CardContent>
            </Card>

            {/* シート選択 */}
            {selectedSpreadsheetId && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6">
                    {spreadsheetTitle} のシートを選択
                  </Typography>
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>既存のシート</InputLabel>
                    <Select
                      value={selectedSheetName}
                      onChange={(e) => setSelectedSheetName(e.target.value)}
                    >
                      {sheetsInSpreadsheet.map((name) => (
                        <MenuItem key={name} value={name}>
                          {name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="新しいシート名"
                    value={newSheetName}
                    onChange={(e) => setNewSheetName(e.target.value)}
                    sx={{ mt: 2 }}
                  />
                  <Button
                    variant="outlined"
                    onClick={createNewSheet}
                    fullWidth
                    sx={{ mt: 1 }}
                  >
                    作成
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* 入力フォーム */}
            {selectedSheetName && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    入力フォーム
                  </Typography>

                  <TextField
                    fullWidth
                    label="日付 (B列)"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="収入 (C列)"
                    name="income"
                    value={formData.income}
                    onChange={handleChange}
                    margin="normal"
                    color="success"
                  />
                  <TextField
                    fullWidth
                    label="支出 (D列)"
                    name="expense"
                    value={formData.expense}
                    onChange={handleChange}
                    margin="normal"
                    color="error"
                  />
                  <TextField
                    fullWidth
                    label="勘定科目 (E列)"
                    name="account"
                    value={formData.account}
                    onChange={handleChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="備考 (F列)"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    margin="normal"
                  />

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    送信
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    sx={{ mt: 1 }}
                    fullWidth
                  >
                    戻る
                  </Button>

                  {message && (
                    <Typography sx={{ mt: 2 }}>{message}</Typography>
                  )}
                </CardContent>
              </Card>
            )}

            <Dialog open={openDialog} onClose={() => handleDialogClose(false)}>
              <DialogTitle>保存確認</DialogTitle>
              <DialogContent>保存しますか？</DialogContent>
              <DialogActions>
                <Button onClick={() => handleDialogClose(false)}>No</Button>
                <Button onClick={() => handleDialogClose(true)}>Yes</Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;

