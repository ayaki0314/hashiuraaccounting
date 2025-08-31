import React from "react";
import { Button, Typography, Card, CardContent } from "@mui/material";

function SignInScreen({ onSignIn }) {
  return (
    <>
      <Button
        variant="contained"
        onClick={onSignIn}
        fullWidth
        sx={{ mt: 4, textTransform: "none" }}
      >
        Googleでログイン
      </Button>

      <Card sx={{ mt: 6, p: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>目的：</Typography>
          <Typography paragraph>
            ユーザーは当アプリで気軽に家計簿を付けることができ、私生活の支出を管理することで日々の支出を可視化できます。<br />
            普段、様々な場面で支払いが発生することでうやむやになる金銭感覚も、当アプリで気軽にデータ入力し自動で管理され可視化することで節約など様々なことを見直すキッカケになるかと思います。
          </Typography>
          <Typography variant="h6" gutterBottom>
            開始方法：
          </Typography>
          <Typography paragraph>
            ①Googleアカウントを新規で取得します。すでに所持している方は次に進みます。<br />
            ②管理者から当アプリ専用のスプレッドシートを受領し、当アプリを開始します。<br />
            ※専用のスプレッドシートは使用するGoogleアカウントのメールアドレスに送らせていただきます。
          </Typography>

          <Typography variant="h6" gutterBottom>
            使用方法：
          </Typography>
          <Typography paragraph>
            ①ユーザーのGoogleアカウントでログイン<br />
            ②ログインしたアカウントのGoogleドライブにあるスプレッドシートをすべて選択できるようになるので、ユーザーが支出管理したい年度のスプレッドシートを選択します。<br />
            ③月単位で分かれているシートがあるので、該当月のシートを選択します。<br />
            ※シートは「○月_in」を選択します。そのシートにデータを入れ、「○月_out」で集計を確認できます。<br />
            ④項目毎に分かれているので、記載通りに入力することでスプレッドシートにデータが追加されます。日毎に入力する仕様になっています。<br />
          </Typography>

          <Typography variant="h6" gutterBottom>
            注意点：
          </Typography>
          <Typography paragraph>
            ・一度入力されたデータは画面上から削除することができないので、スプレッドシート選択した後に出てくるリンクをタッチし、実際のスプレッドシートを操作して不要なデータを消してください。<br />
            ・現在システムの仕様上、ブラウザを更新する度にGoogleアカウントにログインしなければいけない状態です。近日中にログイン保持の処理を実装し、同端末からのアクセスの場合一ヶ月ログインを保持するようにします。<br />
            ・専用のスプレッドシートについて。シートの追加や削除と、シート内に関数が入れてあるので行や列の追加削除を行わないでください。
          </Typography>
        </CardContent>
      </Card>
    </>
  );
}

export default SignInScreen;