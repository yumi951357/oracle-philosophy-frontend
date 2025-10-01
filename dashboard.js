async function loadLogs() {
  const response = await fetch("https://oracle-backend.onrender.com/api/logs");
  const logs = await response.json();

  document.getElementById("logs").innerText =
    JSON.stringify(logs, null, 2);
}

// 自动刷新日志，每 5 秒更新一次
setInterval(loadLogs, 5000);