async function askOracle() {
  const question = document.getElementById("question").value;

  const response = await fetch("https://oracle-backend.onrender.com/api/oracle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question })
  });

  const data = await response.json();

  document.getElementById("answer").innerText =
    Answer: ${data.answer}\nCertainty: ${data.certainty_index}\nType: ${data.response_type};
}