import type { AuthEmail } from "./auth-emails.ts";

/**
 * One page for copying the auth emails into the Supabase dashboard: per
 * template, its name in the dashboard, a copy button for the subject and one
 * for the body, and a preview. Open the written file in any browser.
 */

const DASHBOARD = "https://supabase.com/dashboard/project/cxnhkgndvzgyqhiwsvrr/auth/templates";

function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttribute(value: string): string {
  return escapeText(value).replace(/"/g, "&quot;");
}

function section(email: AuthEmail, index: number): string {
  return `<section>
<h2>${index + 1}. ${escapeText(email.dashboardName)}</h2>
<div class="row"><span class="label">Subject</span><textarea id="subject-${index}" rows="1" readonly>${escapeText(email.subject)}</textarea><button data-copy="subject-${index}">Copy subject</button></div>
<div class="row"><span class="label">Body</span><textarea id="body-${index}" rows="4" readonly>${escapeText(email.html)}</textarea><button data-copy="body-${index}">Copy body</button></div>
<details><summary>Preview</summary><iframe srcdoc="${escapeAttribute(email.html)}"></iframe></details>
</section>`;
}

export function pastePage(emails: AuthEmail[]): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Paste into Supabase</title>
<style>
body{font-family:Arial,Helvetica,sans-serif;background:#f2f0ed;color:#33302c;margin:0;padding:24px 16px}
main{max-width:760px;margin:0 auto}
h1{color:#0d0d0d;margin:0 0 8px}
ol.steps{line-height:1.6;padding-left:20px}
a{color:#0d0d0d}
section{background:#fff;border-left:4px solid #ff5a1f;padding:16px 20px;margin:20px 0}
h2{margin:0 0 12px;font-size:18px;color:#0d0d0d}
.row{display:flex;gap:8px;align-items:flex-start;margin:0 0 10px}
.label{width:64px;flex:none;padding-top:8px;font-size:12px;font-weight:bold;text-transform:uppercase;color:#77716a}
textarea{flex:1;min-width:0;font:12px monospace;border:1px solid #e6e2dc;padding:6px;resize:vertical}
button{flex:none;width:120px;background:#ff5a1f;color:#0d0d0d;border:0;padding:9px 0;font-weight:bold;cursor:pointer}
button.done{background:#0d0d0d;color:#fff}
iframe{width:100%;height:560px;border:1px solid #e6e2dc;margin-top:8px}
</style></head><body><main>
<h1>Paste the sign-in emails into Supabase</h1>
<ol class="steps">
<li>Open <a href="${DASHBOARD}" target="_blank" rel="noopener">Supabase &gt; Authentication &gt; Emails</a>.</li>
<li>For each email below, click its name in Supabase.</li>
<li>Copy the subject here, paste it into Subject heading. Copy the body, select everything in the Supabase body box, paste over it.</li>
<li>Click Save, then move to the next one.</li>
</ol>
${emails.map(section).join("\n")}
</main>
<script>
document.querySelectorAll("button[data-copy]").forEach(function (button) {
  button.addEventListener("click", function () {
    var field = document.getElementById(button.dataset.copy);
    field.select();
    document.execCommand("copy");
    var label = button.textContent;
    button.textContent = "Copied";
    button.classList.add("done");
    setTimeout(function () { button.textContent = label; button.classList.remove("done"); }, 1500);
  });
});
</script>
</body></html>`;
}
