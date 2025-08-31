import React, { useEffect, useState } from "react";
import { gapi } from "gapi-script";
import { Container, Button, Typography, ThemeProvider, createTheme } from "@mui/material";

import SignInScreen from "./components/SignInScreen.jsx";
import SpreadsheetSelector from "./components/SpreadsheetSelector.jsx";
import SheetSelector from "./components/SheetSelector.jsx";
import EntryForm from "./components/EntryForm.jsx";
import ConfirmationDialog from "./components/ConfirmationDialog.jsx";

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
    setSpreadsheetTitle("");
    setSheetsInSpreadsheet([]);
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
    if (!spreadsheetId) return;
    try {
      const res = await gapi.client.sheets.spreadsheets.get({ spreadsheetId });
      setSpreadsheetTitle(res.result.properties.title);
      setSheetsInSpreadsheet(res.result.sheets.map((s) => s.properties.title));
      setSelectedSheetName("");
    } catch (err) {
      console.error("❌ Error loading sheets in spreadsheet:", err);
    }
  };

  // スプレッドシート選択ハンドラ
  const handleSpreadsheetSelect = (id) => {
    setSelectedSpreadsheetId(id);
    loadSheetsInSpreadsheet(id);
  };
  
  // 入力変更
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // 次のID取得
  const getNextId = async () => {
    try {
      const res = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: selectedSpreadsheetId,
        range: `${selectedSheetName}!A:A`,
      });
      const rows = res.result.values || [];
      if (rows.length <= 1) return 1;
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
        resource: { values: [newRow] },
      });
      setMessage("送信成功！");
      setFormData({ date: "", income: "", expense: "", account: "", note: "" });
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
      <Container maxWidth={false} sx={{ px: 2, mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          家計簿アプリ
        </Typography>

        {!isSignedIn ? (
          <SignInScreen onSignIn={handleSignIn} />
        ) : (
          <>
            <Button variant="outlined" onClick={handleSignOut} fullWidth sx={{ mb: 2 }}>
              ログアウト
            </Button>

            <SpreadsheetSelector
              sheetsList={sheetsList}
              selectedSpreadsheetId={selectedSpreadsheetId}
              onSelect={handleSpreadsheetSelect}
            />

            {selectedSpreadsheetId && (
              <SheetSelector
                spreadsheetTitle={spreadsheetTitle}
                sheetsInSpreadsheet={sheetsInSpreadsheet}
                selectedSheetName={selectedSheetName}
                onSelect={setSelectedSheetName}
              />
            )}

            {selectedSheetName && (
              <EntryForm
                formData={formData}
                message={message}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onBack={handleBack}
              />
            )}

            <ConfirmationDialog
              open={openDialog}
              onClose={handleDialogClose}
            />
          </>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;