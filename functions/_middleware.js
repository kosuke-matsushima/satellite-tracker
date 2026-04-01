// Simple password protection middleware for Cloudflare Pages
const PASSWORD = "test";
const COOKIE_NAME = "sat_auth";

function getLoginPage() {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Satellite Tracker — Login</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{background:#000;color:#fff;font-family:'SF Mono','Fira Code',monospace;display:flex;align-items:center;justify-content:center;height:100vh;}
  .box{text-align:center;max-width:300px;}
  h1{font-size:14px;color:#7affc1;letter-spacing:2px;margin-bottom:20px;}
  input{background:#111;border:1px solid #333;color:#fff;padding:10px 14px;border-radius:6px;font-family:inherit;font-size:13px;width:100%;margin-bottom:12px;outline:none;}
  input:focus{border-color:#7affc1;}
  button{background:#7affc1;color:#000;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;font-family:inherit;font-size:13px;font-weight:bold;width:100%;}
  button:hover{background:#5fddaa;}
  .err{color:#ff6666;font-size:11px;margin-top:8px;display:none;}
</style>
</head>
<body>
<div class="box">
  <h1>SATELLITE TRACKER</h1>
  <form method="POST">
    <input type="password" name="password" placeholder="Password" autofocus>
    <button type="submit">Enter</button>
  </form>
  <div class="err" id="err">Incorrect password</div>
</div>
<script>if(location.search.includes('err'))document.getElementById('err').style.display='block';</script>
</body>
</html>`;
}

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  // Check if already authenticated via cookie
  const cookie = request.headers.get("Cookie") || "";
  if (cookie.includes(`${COOKIE_NAME}=authenticated`)) {
    return next();
  }

  // Handle POST (login attempt)
  if (request.method === "POST") {
    const formData = await request.formData();
    const password = formData.get("password");

    if (password === PASSWORD) {
      const response = new Response(null, {
        status: 302,
        headers: {
          "Location": url.pathname,
          "Set-Cookie": `${COOKIE_NAME}=authenticated; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
        },
      });
      return response;
    }

    // Wrong password — redirect back with error
    return new Response(null, {
      status: 302,
      headers: { "Location": url.pathname + "?err=1" },
    });
  }

  // Show login page
  return new Response(getLoginPage(), {
    headers: { "Content-Type": "text/html;charset=UTF-8" },
  });
}
